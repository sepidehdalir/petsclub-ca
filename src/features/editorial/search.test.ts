import { describe, expect, it } from "vitest";
import { publishedArticles } from "@/features/editorial/articles";
import { searchPublishedGuides } from "@/features/editorial/search";

describe("published guide search", () => {
  it("finds a relevant live guide by title keywords", () => {
    const results = searchPublishedGuides("puppy vaccination");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((article) => article.title.toLowerCase().includes("vaccination"))).toBe(true);
  });
  it("never returns draft or in-review content", () => {
    for (const article of searchPublishedGuides("canada", 50)) {
      expect(article.status).toBe("published");
    }
    expect(searchPublishedGuides("canada", 50).length).toBeLessThanOrEqual(publishedArticles().length);
  });
  it("is case insensitive and treats whitespace as a single separator", () => {
    expect(searchPublishedGuides("  PET  Insurance  ").map((article) => article.slug))
      .toEqual(searchPublishedGuides("pet insurance").map((article) => article.slug));
  });
  it("does not list every article for an empty search", () => {
    expect(searchPublishedGuides("   ")).toEqual([]);
  });
  it("enforces result bounds", () => {
    expect(searchPublishedGuides("canada", 2).length).toBeLessThanOrEqual(2);
  });
});
