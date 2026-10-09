import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  allArticleSections,
  articles,
  articlesForSurface,
  publishedArticles,
  relatedArticles,
  type Article,
} from "@/features/editorial/articles";
import {
  publishedArticlesForSurface,
  publishedRelatedArticles,
  selectPublishedArticles,
} from "@/features/editorial/published-discovery";

type Candidate = Pick<Article, "status" | "indexable" | "slug">;

const draft: Candidate = Object.freeze({
  slug: "in-review-guide",
  status: "in-review",
  indexable: true,
});
const published: Candidate = Object.freeze({
  slug: "published-guide",
  status: "published",
  indexable: true,
});
const publicNoindex: Candidate = Object.freeze({
  slug: "published-search-hold",
  status: "published",
  indexable: false,
});

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

describe("published discovery selection", () => {
  it("excludes drafts even when their indexable flag is true", () => {
    expect(selectPublishedArticles([draft, published])).toEqual([published]);
  });

  it("keeps published public-noindex guides in the public link graph", () => {
    expect(selectPublishedArticles([publicNoindex])).toEqual([publicNoindex]);
  });

  it("preserves editorial order without mutating the source list", () => {
    const input = Object.freeze([publicNoindex, draft, published]);
    const result = selectPublishedArticles(input);

    expect(result).toEqual([publicNoindex, published]);
    expect(result).not.toBe(input);
    expect(input).toEqual([publicNoindex, draft, published]);
  });

  it("filters before applying a preview limit", () => {
    expect(selectPublishedArticles([draft, published, publicNoindex], 1)).toEqual([
      published,
    ]);
  });

  it("returns all eligible records when no limit is supplied", () => {
    expect(selectPublishedArticles([draft, published, publicNoindex])).toEqual([
      published,
      publicNoindex,
    ]);
  });

  it("supports a limit larger than the available library", () => {
    expect(selectPublishedArticles([published], 10)).toEqual([published]);
  });

  it("returns no records for a zero limit", () => {
    expect(selectPublishedArticles([published], 0)).toEqual([]);
  });

  it("handles empty and entirely in-review libraries", () => {
    expect(selectPublishedArticles([])).toEqual([]);
    expect(selectPublishedArticles([draft])).toEqual([]);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid preview limit %s",
    (limit) => {
      expect(() => selectPublishedArticles([published], limit)).toThrow(RangeError);
    },
  );
});

describe("published discovery against the real registry", () => {
  it("lists exactly the published library on /guides", () => {
    expect(publishedArticlesForSurface("/guides")).toEqual(publishedArticles());
  });

  it("preserves the topic assignment while excluding in-review guides", () => {
    for (const section of allArticleSections) {
      expect(publishedArticlesForSurface(section.surfacePath)).toEqual(
        articlesForSurface(section.surfacePath).filter(
          (article) => article.status === "published",
        ),
      );
    }
  });

  it("limits the homepage preview to three published guides in editorial order", () => {
    expect(publishedArticlesForSurface("/guides", 3)).toEqual(
      publishedArticles().slice(0, 3),
    );
  });

  it("does not invent a library for an unknown surface", () => {
    expect(publishedArticlesForSurface("/not-a-real-surface")).toEqual([]);
  });

  it("never promotes an in-review or self-referential related-reading card", () => {
    for (const article of articles) {
      const related = publishedRelatedArticles(article);
      expect(related).toEqual(
        relatedArticles(article).filter((item) => item.status === "published"),
      );
      expect(related.every((item) => item.status === "published")).toBe(true);
      expect(related.some((item) => item.slug === article.slug)).toBe(false);
    }
  });
});

describe("public components use the publication gate", () => {
  it("wires the shared listing to the gated selector", () => {
    const listing = source("./components/article-list-section.tsx");
    expect(listing).toContain("publishedArticlesForSurface(surfacePath, limit)");
    expect(listing).not.toMatch(/\barticlesForSurface\s*\(/);
  });

  it("wires related-reading cards to the gated selector", () => {
    const page = source("./components/article-page.tsx");
    expect(page).toContain("publishedRelatedArticles(article)");
    expect(page).not.toMatch(/\brelatedArticles\s*\(/);
  });

  it("shows a bounded real guide preview instead of the obsolete launch placeholder", () => {
    const home = source("../../app/page.tsx");
    expect(home).toContain("<ArticleListSection");
    expect(home).toContain('surfacePath="/guides"');
    expect(home).toContain("limit={3}");
    expect(home).toContain('href="/guides"');
    expect(home).not.toContain("no article has been published yet");
    expect(home).not.toContain("plannedGuides");
    expect(home).not.toContain("See the guide plan");
  });
});
