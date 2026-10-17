import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
describe("community release safety", () => {
  it("stays closed without explicit release and never uses admin client", () => {
    const server = readFileSync(
      "src/features/community/live/server.ts",
      "utf8",
    );
    expect(server).toContain('process.env.COMMUNITY_ENABLED === "true"');
    expect(server).not.toContain("supabase/admin");
    expect(
      readFileSync("src/features/community/live/actions.ts", "utf8"),
    ).not.toContain("ServiceRole");
  });
  it("uses a serialized server request ID without generating randomness during hydration", () => {
    const form = readFileSync("src/features/community/live/form.tsx", "utf8");
    expect(form).toContain("useState(initialRequestId)");
    expect(form).not.toContain("crypto.randomUUID");
    for (const path of ["src/features/community/live/category-discussions.tsx", "src/app/community/discussions/[threadId]/page.tsx", "src/app/community/moderation/page.tsx"]) {
      const source = readFileSync(path, "utf8");
      expect((source.match(/<CommunityForm/g) ?? []).length).toBe((source.match(/requestId=\{crypto.randomUUID\(\)\}/g) ?? []).length);
    }
  });
  it("keeps the proposed SQL outside automatic migrations", () => {
    expect(existsSync("supabase/migrations/community_text_release.sql")).toBe(
      false,
    );
    const sql = readFileSync(
      "supabase/drafts/community_text_release.sql",
      "utf8",
    );
    expect(sql).toContain("values (true, false)");
    expect(sql).toContain("is distinct from actor");
    expect(sql).toContain("revoke insert, update, delete");
  });
});
