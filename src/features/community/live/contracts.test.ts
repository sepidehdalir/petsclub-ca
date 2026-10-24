import { describe, expect, it } from "vitest";
import { communityMutationSchema, pageNumber } from "./contracts";
const requestId = "10000000-0000-4000-8000-000000000001";
const target = "10000000-0000-4000-8000-000000000002";
describe("community mutation validation", () => {
  it("accepts a plain-text thread without HTML interpretation", () =>
    expect(
      communityMutationSchema.safeParse({
        requestId,
        operation: "thread",
        category: "cats",
        title: "A question",
        body: "<script>not evaluated</script>",
      }).success,
    ).toBe(true));
  it.each([
    "reply",
    "edit_thread",
    "edit_post",
    "delete_thread",
    "delete_post",
    "report_thread",
    "report_post",
    "moderate_thread",
    "moderate_post",
    "resolve_report",
  ])("requires target for %s", (operation) =>
    expect(
      communityMutationSchema.safeParse({
        requestId,
        operation,
        body: "Question",
        title: "A title",
        reason: "Review this",
        status: "hidden",
      }).success,
    ).toBe(false),
  );
  it.each(["thread", "reply", "edit_thread", "edit_post"])(
    "rejects blank and oversize body for %s",
    (operation) => {
      for (const body of [" ", "x".repeat(20001)])
        expect(
          communityMutationSchema.safeParse({
            requestId,
            operation,
            target,
            category: "cats",
            title: "A title",
            body,
          }).success,
        ).toBe(false);
    },
  );
  it("requires reason and status for moderation", () =>
    expect(
      communityMutationSchema.safeParse({
        requestId,
        operation: "moderate_thread",
        target,
      }).success,
    ).toBe(false));
  it("rejects forged request IDs and unknown operations", () => {
    expect(
      communityMutationSchema.safeParse({
        requestId: "no",
        operation: "reply",
        target,
        body: "hi",
      }).success,
    ).toBe(false);
    expect(
      communityMutationSchema.safeParse({
        requestId,
        operation: "grant_admin",
        target,
      }).success,
    ).toBe(false);
  });
  it("bounds page offsets", () => {
    for (const n of ["-1", "1.5", "10001", "NaN", ["2"]])
      expect(pageNumber(n)).toBe(1);
    expect(pageNumber("2")).toBe(2);
  });
});
