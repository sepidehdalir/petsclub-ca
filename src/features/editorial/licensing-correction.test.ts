import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articlePath, articleRobotsPolicy, findArticle } from "./articles";

const slug = "pet-licensing-across-canada";
const article = findArticle(slug)!;
const body = readFileSync(
  fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)),
  "utf8",
);

describe("Pet licensing factual correction", () => {
  it("preserves the published canonical page and dates the correction transparently", () => {
    expect(article.status).toBe("published");
    expect(article.publishedAt).toBe("2026-09-06");
    expect(article.updatedAt).toBe("2026-11-04");
    expect(articleRobotsPolicy(article)).toBe("index");
    expect(articlePath(slug)).toBe(`/guides/${slug}`);
    expect(body).toContain("**Correction, November 4, 2026:**");
    expect(body).toContain("**Update, October 21, 2026:**");
  });

  it("separates Ottawa vaccination age from registration without inventing a minimum age", () => {
    expect(body).toContain("three-month **rabies-vaccination** requirement");
    expect(body).toContain("not be treated as a documented licence-registration age threshold");
    expect(body).not.toMatch(/three months in Calgary, Ottawa and Vancouver/i);
    expect(body).not.toContain("vaccination a condition — as Ottawa has");
    expect(body).toContain("Ottawa sets out registration and rabies-immunisation requirements separately");
    expect((article.keyTakeaways ?? []).join(" ")).toContain("does not establish a registration age");
  });

  it("recognizes Quebec provincial obligations in prose, metadata and sources", () => {
    expect(body).toContain("register the dog annually with their municipality");
    expect(body).toContain("/animaux-compagnie/identification");
    expect(article.deck).toContain("province-wide dog-registration requirement");
    expect(article.metaDescription).toContain("Quebec");
    expect(article.metaDescription).not.toContain("not provincial");
    expect(article.sources?.some((source) => source.publisher === "Government of Quebec")).toBe(true);
  });
});
