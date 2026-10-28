import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articlePublicationDates, articleRobotsPolicy, findArticle } from "@/features/editorial/articles";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

const slug = "pet-emergency-preparedness-canada";
const article = findArticle(slug)!;
const body = readFileSync(fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)), "utf8");

describe("October 28 emergency-planning refresh", () => {
  it("preserves the existing URL and publication while dating the substantive update", () => {
    expect(article.status).toBe("published");
    expect(articlePublicationDates(article)).toEqual({ datePublished: "2026-10-09", dateModified: "2026-10-28" });
    expect(articleRobotsPolicy(article)).toBe("index");
    expect(article.reviewerId).toBeUndefined();
    expect(article.veterinaryNotice).toBe(true);
    expect(buildSitemapEntries().filter(e => new URL(e.url).pathname === `/guides/${slug}`)).toHaveLength(1);
  });
  it("replaces the migrated source and qualifies regional supply guidance", () => {
    expect(body).not.toContain("getprepared.gc.ca/cnt/plns/ptsndsrvcnmls-eng.aspx");
    expect(body).toContain("7 to 14 days");
    expect(body).toContain("two to four weeks");
    expect(body).toContain("not a Canada-wide rule");
    expect(body).toContain("do not change a prescription");
    for (const source of article.sources!) expect(body).toContain(source.url);
  });
  it("offers a private worksheet without rescue, clinical or product-testing promises", () => {
    expect(body).toContain("Copy a household pet-evacuation worksheet");
    expect(body).toContain("editorial planning worksheet, not an official registration form");
    expect(body).toContain("does not authorize entry into a closed area");
    expect(body).toContain("No veterinarian has reviewed this guide");
    expect(body).toContain("/guides/choosing-a-cat-carrier-in-canada");
    expect(body).toContain("/guides/choosing-a-dog-harness-in-canada");
    expect(body).not.toMatch(/<AffiliateOffer|<ProductCard|[?&]tag=/);
  });
});
