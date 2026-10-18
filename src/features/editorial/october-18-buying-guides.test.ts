import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articlePublicationDates, articleRobotsPolicy, findArticle } from "@/features/editorial/articles";
import { publishedArticlesForSurface } from "@/features/editorial/published-discovery";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { getMediaAsset } from "@/media/manifest";

const newGuides = [
  { slug: "choosing-dog-boots-in-canada", surface: "/dogs" },
  { slug: "choosing-a-cat-scratching-post-in-canada", surface: "/cats" },
] as const;

function body(slug: string): string {
  return readFileSync(fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)), "utf8");
}

describe("October 18 buying guides", () => {
  for (const { slug, surface } of newGuides) {
    it(`${slug} has a canonical published route and honest byline`, () => {
      const article = findArticle(slug)!;
      expect(article).not.toBeNull();
      expect(article.status).toBe("published");
      expect(articlePublicationDates(article)).toEqual({ datePublished: "2026-10-18", dateModified: "2026-10-18" });
      expect(articleRobotsPolicy(article)).toBe("index");
      expect(article.reviewerId).toBeUndefined();
      expect(article.veterinaryNotice).toBe(true);
      expect(publishedArticlesForSurface(surface)).toContain(article);
      expect(publishedArticlesForSurface("/guides")).toContain(article);
      expect(buildSitemapEntries().filter((entry) => new URL(entry.url).pathname === `/guides/${slug}`)).toHaveLength(1);
    });

    it(`${slug} keeps evidence, shopping limits and licensed editorial imagery`, () => {
      const article = findArticle(slug)!;
      const content = body(slug);
      expect(article.sources!.length).toBeGreaterThanOrEqual(3);
      for (const source of article.sources!) {
        expect(source.url).toMatch(/^https:\/\//);
        expect(content).toContain(source.url);
      }
      expect(content).toContain("No veterinarian has reviewed this guide");
      expect(content).toMatch(/has not tested/);
      expect(content).toMatch(/ordinary,? non-affiliate|ordinary, non-affiliate/);
      expect(content).not.toMatch(/<AffiliateOffer|<ProductCard|<ProductComparison|[?&]tag=/);
      expect(content).not.toMatch(/^# /m);
      expect(content).not.toMatch(/^\|/m);
      expect(content).toContain("editorial photograph");
      const asset = getMediaAsset(article.mediaId);
      expect(asset.source).toBe("Pexels");
      expect(asset.licence.url).toMatch(/^https:\/\//);
      expect(article.mediaAlt).toBeTruthy();
    });
  }

  it("keeps boot measurements and use restrictions model-specific", () => {
    const content = body(newGuides[0].slug);
    expect(content).toContain("widest part of the paw");
    expect(content).toContain("longest toenail");
    expect(content).toContain("outdoor use only");
    expect(content).toContain("four boots per package");
    expect(content).toContain("/guides/winter-dog-care-in-canada");
    expect(content).toContain("<ScheduleTable");
  });

  it("preserves the scratcher dimension discrepancy and separately sold accessories", () => {
    const content = body(newGuides[1].slug);
    expect(content).toContain("32-inch");
    expect(content).toContain("32.5 inches");
    expect(content).toContain("confirm the fully assembled height");
    expect(content).toContain("sold separately");
    expect(content).toContain("https://pioneerpet.com/product/3832-ultimate-scratching-post/");
    expect(content).toContain("/guides/indoor-cat-enrichment-canadian-homes");
    expect(content).toContain('<th scope="row"');
    expect(content).toContain("<caption");
  });

  it("links both new guides from relevant existing prose", () => {
    expect(body("winter-dog-care-in-canada")).toContain(`/guides/${newGuides[0].slug}`);
    expect(body("indoor-cat-enrichment-canadian-homes")).toContain(`/guides/${newGuides[1].slug}`);
  });

  it("dates the narrow winter correction without rewriting its original publication", () => {
    const article = findArticle("winter-dog-care-in-canada")!;
    const content = body(article.slug);
    expect(articlePublicationDates(article)).toEqual({ datePublished: "2026-09-06", dateModified: "2026-10-18" });
    expect(content).toContain("Correction — October 18, 2026");
    expect(content).toContain("This update is not a veterinary review");
    expect(content).toContain("https://www.canadianveterinarians.net/related-resources/cold-weather-and-pets");
    expect(content).not.toMatch(/only complete answer to salt|Most boot failures are training failures|Dry −20 °C|single most common winter problem/);
    expect(article.keyTakeaways!.join(" ")).not.toContain("most common urban winter problem");
  });
});
