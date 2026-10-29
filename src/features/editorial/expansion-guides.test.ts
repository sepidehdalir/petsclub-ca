import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { articles, findArticle, articleRobotsPolicy, articlePublicationDates } from "./articles";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

const body = (slug: string) => readFileSync(new URL(`../../content/articles/${slug}.mdx`, import.meta.url), "utf8");
const expansion = ["cat-pregnancy-signs-and-tests", "dog-pregnancy-signs-and-tests", "spaying-and-neutering-in-canada", "dog-trainers-greater-vancouver", "raw-pet-food-canada-risks-nutrition"] as const;

describe("October 28 evidence-led expansion", () => {
  it("opts in only the five requested pages to the homepage brand style", () => {
    expect(articles.filter(a => a.visualStyle === "unleashed").map(a => a.slug).sort()).toEqual([...expansion].sort());
    for (const slug of expansion) expect(findArticle(slug)?.reviewerId).toBeUndefined();
  });
  it("publishes only the approved new directories with actual release dates", () => {
    for (const slug of expansion.slice(3)) {
      const article = findArticle(slug)!;
      expect(article.status).toBe("published");
      expect(articleRobotsPolicy(article)).toBe("index");
      expect(articlePublicationDates(article)).toEqual({ datePublished: "2026-10-29", dateModified: "2026-10-29" });
      expect(buildSitemapEntries().some(entry => new URL(entry.url).pathname === `/guides/${slug}`)).toBe(true);
    }
  });
  it("retains existing reproductive URLs and original publication dates", () => {
    for (const slug of expansion.slice(0, 3)) {
      expect(findArticle(slug)?.status).toBe("published");
      expect(findArticle(slug)?.updatedAt).toBe("2026-10-29");
    }
    expect(findArticle(expansion[0])?.publishedAt).toBe("2026-10-25");
    expect(findArticle(expansion[1])?.publishedAt).toBe("2026-10-25");
    expect(findArticle(expansion[2])?.publishedAt).toBe("2026-09-06");
  });
  it("retains exactly the seven unrelated clinical holds", () => {
    expect(articles.filter(a => a.status === "in-review").map(a => a.slug).sort()).toEqual(["arthritis-and-mobility-in-dogs-and-cats", "cat-urinary-blockage-flutd", "end-of-life-care-for-pets", "kitten-vaccination-schedule-in-canada", "litter-box-problems-in-cats", "senior-dogs-and-cats", "separation-anxiety-in-dogs"]);
  });
  it("distinguishes pregnancy signs from diagnosis and adds care planning", () => {
    for (const slug of expansion.slice(0, 2)) {
      expect(body(slug)).toMatch(/complete.*balanced/i);
      expect(body(slug)).toContain("No veterinarian has reviewed this guide");
      expect(body(slug)).toContain("/guides/spaying-and-neutering-in-canada");
      expect(body(slug)).toMatch(/emergency/i);
    }
    expect(body(expansion[2])).toContain("five months");
    expect(body(expansion[2])).toContain("individual");
    expect(body(expansion[2])).toContain("canadianveterinarians.net");
  });
  it("dates five real Maps observations without inventing endorsements", () => {
    const text = body(expansion[3]);
    expect((text.match(/\*\*Google Maps:/g) ?? [])).toHaveLength(5);
    for (const count of ["167", "210", "106", "78", "39"]) expect(text).toContain(`from ${count} reviews`);
    expect(text).toContain("October 28, 2026");
    expect(text).toContain("not a ranking");
    expect(text).toContain("in-home");
    expect(text).toContain("Life Skills group class specifically excludes");
    expect(text).not.toMatch(/AggregateRating|ratingValue|<AffiliateOffer/);
  });
  it("places raw-food risks before directory links and separates commercial status", () => {
    const text = body(expansion[4]);
    const risks = text.indexOf("## Household exposure matters");
    const directory = text.indexOf("## Canadian manufacturer directory");
    expect(risks).toBeGreaterThanOrEqual(0);
    expect(directory).toBeGreaterThanOrEqual(0);
    expect(risks).toBeLessThan(directory);
    for (const province of ["British Columbia", "Alberta", "Saskatchewan", "Ontario", "Quebec"]) expect(text).toContain(`### ${province}`);
    expect(text).toContain("not tracked affiliate links");
    expect(text).toContain("cooked");
    expect(text).toContain("nutritional");
    expect(text).not.toMatch(/<AffiliateOffer|[?&]tag=/);
  });
});
