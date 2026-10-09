import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articles, type Article } from "@/features/editorial/articles";
import {
  isInReviewGuideLink,
  type ArticlePublicationLookup,
} from "@/features/editorial/inline-guide-links";

const draft: Pick<Article, "status" | "indexable"> = {
  status: "in-review",
  indexable: true,
};
const publishedHold: Pick<Article, "status" | "indexable"> = {
  status: "published",
  indexable: false,
};
const lookup: ArticlePublicationLookup = (slug) => {
  if (slug === "review-guide") return draft;
  if (slug === "search-held-guide") return publishedHold;
  return null;
};

describe("inline guide discovery", () => {
  it.each([
    "/guides/review-guide",
    "/guides/review-guide/",
    "/guides/review-guide#section",
    "/guides/review-guide?source=guide#section",
    "https://thepetclub.ca/guides/review-guide",
    "http://thepetclub.ca/guides/review-guide",
    "https://www.thepetclub.ca/guides/review-guide",
    "//thepetclub.ca/guides/review-guide",
    "/guides/%72eview-guide",
  ])("recognises an in-review destination: %s", (href) => {
    expect(isInReviewGuideLink(href, lookup)).toBe(true);
  });

  it("keeps a published guide linkable even when deliberately noindex", () => {
    expect(isInReviewGuideLink("/guides/search-held-guide", lookup)).toBe(false);
  });

  it.each([
    undefined,
    "",
    "#section",
    "?source=guide",
    "review-guide",
    "/guides",
    "/guides/unknown-guide",
    "/guides/review-guide/another-page",
    "/community/pet-insurance",
    "/puppy/3-months",
    "mailto:hello@thepetclub.ca",
    "https://example.com/guides/review-guide",
    "//example.com/guides/review-guide",
    "https://thepetclub.ca.example.com/guides/review-guide",
    "https://thepetclub.ca@example.com/guides/review-guide",
    "https://[invalid/guides/review-guide",
    "/guides/%E0%A4%A",
  ])("leaves other or unresolvable destinations unchanged: %s", (href) => {
    expect(isInReviewGuideLink(href, lookup)).toBe(false);
  });

  it("tracks the real registry rather than a hand-maintained draft list", () => {
    for (const article of articles) {
      expect(isInReviewGuideLink(`/guides/${article.slug}`)).toBe(
        article.status === "in-review",
      );
      expect(isInReviewGuideLink(`/guides/${article.slug}?from=article#read`)).toBe(
        article.status === "in-review",
      );
    }
  });

  it("restores the same href automatically when review is completed", () => {
    const href = "/guides/review-guide";
    expect(isInReviewGuideLink(href, () => ({ status: "in-review" }))).toBe(true);
    expect(isInReviewGuideLink(href, () => ({ status: "published" }))).toBe(false);
  });

  it("gates the MDX anchor before internal or external link rendering", () => {
    const path = fileURLToPath(new URL("../../mdx-components.tsx", import.meta.url));
    const source = readFileSync(path, "utf8");
    const gate = source.indexOf("if (isInReviewGuideLink(href))");
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(source.indexOf("const isInternal"));
    expect(source).toMatch(
      /if \(isInReviewGuideLink\(href\)\)\s*\{\s*return <>\{children\}<\/>;/,
    );
  });
});
