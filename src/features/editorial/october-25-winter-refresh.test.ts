import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findArticle } from "./articles";

const body = readFileSync("src/content/articles/winter-dog-care-in-canada.mdx", "utf8");
describe("October 25 winter guide safety refresh", () => {
  it("keeps the existing intent owner and original publication date", () => {
    const article = findArticle("winter-dog-care-in-canada")!;
    expect(article.publishedAt).toBe("2026-09-06");
    expect(article.updatedAt).toBe("2026-10-25");
    expect(article.indexable).toBe(true);
    expect(body).toContain("Updated — October 25, 2026");
    expect(body).toContain("This update is not a veterinary review");
    expect(body).toContain("/guides/choosing-dog-boots-in-canada");
    expect(body).toContain("/guides/emergency-vet-visits-in-canada");
  });
  it("avoids unsupported laws, diagnostic shortcuts and exercise equivalence", () => {
    expect(body).not.toMatch(/not a regulated claim|no labelling requirements|disproportionately tiring|worth a lot of walking|winter allergies|Summer.*more dangerous|soaked coat is worse/);
    expect(body).toContain("There is no reliable conversion");
    expect(body).toContain("the season does not diagnose the cause");
    expect(body).toContain("rather than waiting for signs");
    expect(body).toContain("https://www.aspca.org/news/keeping-pets-safe-during-winter-dangers-ice-melts");
  });
});
