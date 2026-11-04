import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articlePath, articleRobotsPolicy, findArticle } from "./articles";

const source = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const carrier = findArticle("choosing-a-cat-carrier-in-canada")!;
const body = source("../../content/articles/choosing-a-cat-carrier-in-canada.mdx");

describe("verified November copy release", () => {
  it("offers browsing rather than promising community posting from the Guides hub", () => {
    const hub = source("../../app/guides/page.tsx");
    expect(hub).toContain('href="/community"');
    expect(hub).toContain("Browse Community Topics");
    expect(hub).not.toContain("Ask the Community");
    expect(hub).toContain("with cited sources and practical Canadian context.");
    expect(hub).not.toContain("researched and reviewed by the Pet Club editorial team");
    expect(hub).toContain('path: "/guides"');
  });

  it("names the compared products in the H1 while retaining limited review claims", () => {
    const comparison = source("../../app/compare/catit-digger-vs-wave-circuit/page.tsx");
    expect(comparison).toContain("<h1>Catit Digger vs<br />Wave Circuit</h1>");
    expect(comparison).toContain("Food puzzle or ball track? Two ways to make room for play.");
    expect(comparison).toContain("We have not tested either product");
    expect(comparison).toContain('path: "/compare/catit-digger-vs-wave-circuit"');
  });

  it("keeps the carrier page published at its original canonical with a truthful revision date", () => {
    expect(carrier.status).toBe("published");
    expect(carrier.publishedAt).toBe("2026-10-17");
    expect(carrier.updatedAt).toBe("2026-11-04");
    expect(articleRobotsPolicy(carrier)).toBe("index");
    expect(articlePath(carrier.slug)).toBe("/guides/choosing-a-cat-carrier-in-canada");
    expect(body).toContain("As checked on 4 November 2026");
  });

  it("adds a non-ranked worksheet and explicit manufacturer flight exclusion", () => {
    expect(body).toContain("**not suitable for airplane travel**");
    expect(body).toContain("## Hard or soft cat carrier? A quick decision grid");
    expect(body).toContain("<ScheduleTable");
    expect(body).toContain('<Checklist title="Record these details before selecting a carrier">');
    expect(body).toContain("verification worksheet");
    expect(body).toContain("not an independent crash test or a product ranking");
    expect(body).toContain("The airline requires a flexible, soft-sided carrier.");
    expect(body).toContain("intended maximum cat weight of 6 kg");
    expect(body).toContain("maximum cat height of 30 cm");
  });

  it("does not invent affiliate offers or hands-on testing", () => {
    expect(body).toContain("We have not tested these products");
    expect(body).toContain("No affiliate relationship or hands-on product testing is claimed");
    expect(body).not.toMatch(/amzn[.]to|[?&]tag=/);
    expect(carrier.reviewerId).toBeUndefined();
  });
});
