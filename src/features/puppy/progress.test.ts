import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";
import { checklistScope, cleanCardName, clearChecklistProgress, parseChecklistProgress,
  publicJourneyShareUrl, readChecklistRaw, SHAREABLE_STAGES, writeChecklistProgress } from "./progress";
import { emitJourneyEvent } from "./growth-events";

/** These are unit tests; browser, full-build and release checks are separate. */
afterEach(() => vi.unstubAllGlobals());

function installStorage() {
  const data = new Map<string, string>();
  const dispatchEvent = vi.fn();
  const localStorage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
    removeItem: vi.fn((key: string) => { data.delete(key); }),
  };
  vi.stubGlobal("window", { localStorage, dispatchEvent });
  return { data, localStorage, dispatchEvent };
}

test.each([null, "{", "null", "42", "[]", '{"version":2,"done":["a"]}', '{"version":1,"done":"a"}'])(
  "rejects invalid or unsupported saved state: %s", (raw) => {
    assert.deepEqual(parseChecklistProgress(raw, ["a"]), []);
  },
);
test("only allowed, distinct checklist IDs are counted", () => {
  assert.deepEqual(parseChecklistProgress('{"version":1,"done":["a","a","old",null,42,"b"]}', ["a","b"]), ["a","b"]);
});
test("large state is rejected", () => {
  assert.deepEqual(parseChecklistProgress("x".repeat(20001), ["a"]), []);
});
test("public and personalised scopes remain separate", () => {
  assert.notEqual(checklistScope("12-weeks"), checklistScope("12-weeks", "2026-06-18"));
  assert.notEqual(checklistScope("8-weeks", "2026-06-18"), checklistScope("12-weeks", "2026-06-18"));
});
test("round trip persists ticks, not a false success on quota failure", () => {
  const storage = installStorage();
  assert.equal(writeChecklistProgress("12-weeks:guide", ["a"]), true);
  assert.deepEqual(parseChecklistProgress(readChecklistRaw("12-weeks:guide"), ["a"]), ["a"]);
  storage.localStorage.setItem.mockImplementation(() => { throw new Error("quota"); });
  const prior = storage.dispatchEvent.mock.calls.length;
  assert.equal(writeChecklistProgress("12-weeks:guide", ["b"]), false);
  assert.equal(storage.dispatchEvent.mock.calls.length, prior);
});
test("reset only removes this stage and preserves existing puppy details", () => {
  const storage = installStorage();
  storage.data.set("petclub.puppy.v1", '{"dob":"2026-06-18"}');
  writeChecklistProgress("12-weeks:guide", ["a"]);
  writeChecklistProgress("8-weeks:guide", ["b"]);
  assert.equal(clearChecklistProgress("12-weeks:guide"), true);
  assert.equal(readChecklistRaw("12-weeks:guide"), null);
  assert.notEqual(readChecklistRaw("8-weeks:guide"), null);
  assert.equal(storage.data.has("petclub.puppy.v1"), true);
});
test("all shared routes are public and use the canonical host", () => {
  for (const stage of SHAREABLE_STAGES) {
    const url = new URL(publicJourneyShareUrl(stage));
    assert.equal(url.origin, "https://thepetclub.ca");
    assert.equal(url.pathname, `/puppy/${stage}`);
    assert.equal(url.searchParams.get("utm_medium"), "referral");
  }
  for (const invalid of ["/my-puppy?dob=SECRET", "../account", "11-weeks", "//example.com"]) {
    const url = new URL(publicJourneyShareUrl(invalid));
    assert.equal(url.pathname, "/puppy");
    assert.equal(url.toString().includes("SECRET"), false);
  }
});
test("card names do not split Unicode and remove direction overrides", () => {
  assert.equal(Array.from(cleanCardName("🐶".repeat(60))).length, 40);
  assert.equal(cleanCardName("Mi\ncky\u202e"), "Micky");
});
test("event hooks contain only bounded, explicitly allowed fields", () => {
  const storage = installStorage();
  emitJourneyEvent("checklist_item_checked", { stageSlug: "/my-puppy?dob=SECRET", checkedCount: 999 });
  const event = storage.dispatchEvent.mock.calls[0][0] as CustomEvent;
  assert.deepEqual(event.detail, { name: "checklist_item_checked", checkedCount: 100 });
  assert.equal(storage.data.size, 0);
});
