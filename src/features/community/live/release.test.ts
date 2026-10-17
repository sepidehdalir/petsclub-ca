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
