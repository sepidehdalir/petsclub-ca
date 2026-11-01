import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { articlePath, articleRobotsPolicy, findArticle } from "./articles";

const licensingSlug = "pet-licensing-across-canada";
const carrierSlug = "choosing-a-cat-carrier-in-canada";
const licensing = findArticle(licensingSlug)!;
const carrier = findArticle(carrierSlug)!;

function readBody(slug: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)),
    "utf8",
  );
}

describe("GSC evidence-led content changes stay within review boundaries", () => {
  it("keeps publication states, dates, robots and canonical route ownership intact", () => {
    expect(licensing.status).toBe("published");
    expect(licensing.publishedAt).toBe("2026-09-06");
    expect(licensing.updatedAt).toBe("2026-10-21");
    expect(carrier.status).toBe("published");
    expect(carrier.publishedAt).toBe("2026-10-17");
    expect(carrier.updatedAt).toBeUndefined();

    for (const article of [licensing, carrier]) {
      expect(articleRobotsPolicy(article)).toBe("index");
      expect(articlePath(article.slug)).toBe(`/guides/${article.slug}`);
    }
  });

  it("distinguishes Quebec's province-wide dog-registration rule from municipal execution", () => {
    const body = readBody(licensingSlug);
    expect(body).toContain("Quebec is an important exception");
    expect(body).toContain("register the dog annually with their municipality");
    expect(body).toContain(
      "https://www.quebec.ca/agriculture-environnement-et-ressources-naturelles/sante-animale/animaux-compagnie/encadrement-chiens",
    );
    expect(licensing.sources?.some((source) => source.publisher === "Government of Quebec"))
      .toBe(true);
    expect(licensing.keyTakeaways.join(" ")).toContain("Quebec");
  });

  it("does not present Ottawa's rabies-vaccination age as a licence-registration threshold", () => {
    const body = readBody(licensingSlug);
    expect(body).toContain("three-month **rabies-vaccination** requirement");
    expect(body).toContain("not be treated as a documented licence-registration age threshold");
    expect(body).not.toContain("Three months in Calgary, Ottawa and Vancouver");
    expect(licensing.keyTakeaways.join(" ")).not.toContain("three months in Calgary, Ottawa");
  });

  it("adds an actionable non-ranked cat carrier decision worksheet without inventing tests or offers", () => {
    const body = readBody(carrierSlug);
    expect(body).toContain("## Hard or soft cat carrier? A quick decision grid");
    expect(body).toContain("<ScheduleTable");
    expect(body).toContain("<Checklist title=\"Record these details before selecting a carrier\">");
    expect(body).toContain("The airline requires a flexible, soft-sided carrier.");
    expect(body).toContain("We have not tested these products");
    expect(body).toContain("No affiliate relationship or hands-on product testing is claimed");
    expect(body).not.toMatch(/amzn\\.to|[?&]tag=/);
  });
});
