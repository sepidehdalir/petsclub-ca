import { describe, expect, it } from "vitest";
import { recipes, findRecipe } from "./recipes";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
describe("Pet Kitchen editorial guardrails", () => {
  it("publishes exactly four distinct supplemental methods", () => {
    expect(recipes).toHaveLength(4);
    expect(new Set(recipes.map(recipe => recipe.slug)).size).toBe(4);
    for (const recipe of recipes) {
      expect(findRecipe(recipe.slug)).toBe(recipe);
      expect(recipe.ingredients).toHaveLength(recipe.ingredientCount);
      expect(recipe.steps).toHaveLength(4);
      expect(recipe.serving).toContain("below 10%");
      expect(recipe.serving).toContain("not a target");
      expect(recipe.storage).toContain("within two hours");
      expect(recipe.imageAlt).toMatch(/^AI illustration/);
      expect(recipe.sources.every(source => source.href.startsWith("https://"))).toBe(true);
    }
  });
  it("does not label vegetable methods for cats", () => {
    expect(recipes.filter(recipe => recipe.species.includes("Cats")).map(recipe => recipe.slug)).toEqual(["plain-poached-chicken-for-dogs-and-cats", "plain-egg-crumbles-for-dogs-and-cats"]);
    for (const recipe of recipes.filter(recipe => recipe.species.includes("Cats"))) expect(recipe.steps.join(" ")).toContain("74°C");
  });
  it("includes the hub and every recipe in the canonical sitemap", () => {
    const paths = buildSitemapEntries().map(entry => new URL(entry.url).pathname);
    expect(paths).toContain("/kitchen");
    for (const recipe of recipes) expect(paths).toContain(`/kitchen/${recipe.slug}`);
    expect(findRecipe("invented-recipe")).toBeUndefined();
  });
});
