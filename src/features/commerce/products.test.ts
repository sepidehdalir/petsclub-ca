import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { products } from "./products";
import { ProductCard, ProductComparison } from "./product-components";

describe("public product examples", () => {
  it("keeps real specifications separate from approval and prices", () => {
    expect(products.map((item) => item.id)).toEqual(["catit-digger", "catit-wave"]);
    for (const item of products) {
      expect(new URL(item.source).hostname).toBe("www.homesalive.ca");
      expect(item.features).toHaveLength(3);
      expect(new Set(item.features).size).toBe(3);
      expect(item.offerId).toBe("amazon-" + item.id);
    }
  });
  it("hides unknown product IDs and incomplete comparisons", () => {
    expect(renderToStaticMarkup(createElement(ProductCard, { productId: "unknown" }))).toBe("");
    expect(renderToStaticMarkup(createElement(ProductComparison, { productIds: ["catit-digger", "catit-digger", "unknown"] }))).toBe("");
  });
  it("discloses affiliate links and renders accessible comparison semantics", () => {
    const html = renderToStaticMarkup(createElement(ProductComparison, { productIds: products.map((item) => item.id) }));
    expect(html).toContain("have not tested these products");
    expect(html).toContain("As an Amazon Associate I earn from qualifying purchases.");
    expect(html).toContain('scope="row"');
    expect(html).toContain('scope="col"');
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).not.toContain("aggregateRating");
    expect(html).not.toContain(">Affiliate link<");
    expect(html.match(/As an Amazon Associate/g)).toHaveLength(1);
    expect(html.match(/Product photograph awaiting licensed asset/g)).toHaveLength(2);
    expect(html.match(/tag=thepetclub09-20/g)).toHaveLength(2);
    expect(html).not.toContain("club-product-number");
  });
});
