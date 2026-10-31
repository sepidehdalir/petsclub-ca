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
  it("finds the same guides when a query includes question marks or quotes", () => {
    const plain = searchPublishedGuides("dog boots").map((article) => article.slug);
    expect(plain.length).toBeGreaterThan(0);
    for (const query of ["dog boots?", "dog boots?!", '“dog boots”', '"dog boots"', "dog—boots", "dog-boots"])
      expect(searchPublishedGuides(query).map((article) => article.slug)).toEqual(plain);
  });
  it("treats straight and curly apostrophes consistently", () => {
    expect(searchPublishedGuides("dog’s care").map((article) => article.slug))
      .toEqual(searchPublishedGuides("dog's care").map((article) => article.slug));
  });
  it("does not return the catalogue for punctuation-only input", () => {
    for (const query of ["???", "—…!", '“”', "💛"]) expect(searchPublishedGuides(query)).toEqual([]);
  });
  it("still requires every normalized term and keeps the result bound", () => {
    expect(searchPublishedGuides("dog boots? nonexistentword")).toEqual([]);
    expect(searchPublishedGuides("Canada!", 2).length).toBeLessThanOrEqual(2);
  });
  it("normalizes compatible Unicode text without dropping letters", () => {
    expect(searchPublishedGuides("ｄｏｇ ｂｏｏｔｓ？").map((article) => article.slug))
      .toEqual(searchPublishedGuides("dog boots").map((article) => article.slug));
  });
  it("enforces result bounds", () => {
    expect(searchPublishedGuides("canada", 2).length).toBeLessThanOrEqual(2);
  });
});
