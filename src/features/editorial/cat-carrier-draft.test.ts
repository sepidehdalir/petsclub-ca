import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articleRobotsPolicy, findArticle, publishedArticles } from "./articles";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

const slug = "choosing-a-cat-carrier-in-canada";
const article = findArticle(slug)!;
const body = readFileSync(
  fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)),
  "utf8",
);

describe("cat-carrier buying guide publication", () => {
  it("publishes only this guide on 17 October and includes its canonical in discovery", () => {
    expect(article.status).toBe("published");
    expect(article.publishedAt).toBe("2026-10-17");
    expect(article.updatedAt).toBeUndefined();
    expect(articleRobotsPolicy(article)).toBe("index");
    expect(publishedArticles().map((item) => item.slug)).toContain(slug);
    expect(buildSitemapEntries().map((item) => item.url)).toContain(`https://thepetclub.ca/guides/${slug}`);
  });

  it("uses primary guidance and distinguishes intended capacity from a safety margin", () => {
    expect(article.sources).toHaveLength(5);
    expect(article.sources?.some((source) => source.publisher === "Air Canada")).toBe(true);
    expect(body).toMatch(/intended maximum cat weight of 6 kg/);
    expect(body).toMatch(/maximum cat height of 30 cm/);
    expect(body).toContain("higher safety margin");
    expect(body).toContain("flexible, soft-sided carriers");
  });

  it("makes no testing or professional-review claim and uses ordinary Canadian retail links", () => {
    expect(article.reviewerId).toBeUndefined();
    expect(body).toContain("We have not tested these products");
    expect(body).toContain("No affiliate relationship or hands-on product testing is claimed");
    expect(body).toContain("https://www.petvalu.ca/product/catit-pixi-mio-cat-bed-and-carrier/SCM15822");
    expect(body).toContain("https://www.petsmart.ca/");
    expect(body).not.toMatch(/amzn\.to|[?&]tag=/);
  });
});
