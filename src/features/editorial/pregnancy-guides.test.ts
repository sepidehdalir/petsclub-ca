import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articlePublicationDates, articleRobotsPolicy, findArticle } from "@/features/editorial/articles";
import { publishedArticlesForSurface } from "@/features/editorial/published-discovery";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { getMediaAsset } from "@/media/manifest";

function body(slug: string): string {
  return readFileSync(fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)), "utf8");
}

describe("species-specific pregnancy guides", () => {
  for (const [species, surface] of [["cat", "/cats"], ["dog", "/dogs"]] as const) {
    const slug = `${species}-pregnancy-signs-and-tests`;
    it(`${species}: published discovery, sitemap and honest health metadata`, () => {
      const article = findArticle(slug)!;
      expect(article.status).toBe("published");
      expect(articlePublicationDates(article)).toEqual({ datePublished: "2026-10-25", dateModified: "2026-10-29" });
      expect(articleRobotsPolicy(article)).toBe("index");
      expect(article.reviewerId).toBeUndefined();
      expect(article.veterinaryNotice).toBe(true);
      expect(publishedArticlesForSurface(surface)).toContain(article);
      expect(publishedArticlesForSurface("/guides")).toContain(article);
      expect(buildSitemapEntries().filter(e => new URL(e.url).pathname === `/guides/${slug}`)).toHaveLength(1);
      expect(getMediaAsset(article.mediaId).source).toBe("Pexels");
    });
    it(`${species}: supports evidence and safe next actions without product promotion`, () => {
      const content = body(slug);
      expect(content).toContain("No veterinarian has reviewed this guide");
      expect(content).toContain("editorial photograph");
      expect(content).toContain("false pregnancy");
      expect(content).toContain("without visible discharge");
      expect(content).toContain("/guides/finding-a-veterinarian-in-canada");
      expect(content).toContain("/guides/emergency-vet-visits-in-canada");
      expect(content).toContain("https://tvmdl.tamu.edu/tests/relaxin-lateral-flow/");
      expect(content).not.toMatch(/<AffiliateOffer|<ProductCard|[?&]tag=/);
      for (const source of findArticle(slug)!.sources!) expect(content).toContain(source.url);
    });
  }
  it("does not conflate canine ovulation with mating or erase feline blood tests", () => {
    expect(body("dog-pregnancy-signs-and-tests")).toContain("ovulation");
    expect(body("dog-pregnancy-signs-and-tests")).toContain("small litter");
    expect(body("cat-pregnancy-signs-and-tests")).toContain("not correct to say that no blood test exists");
    expect(body("cat-pregnancy-signs-and-tests")).toContain("not something to try at home");
  });
});
