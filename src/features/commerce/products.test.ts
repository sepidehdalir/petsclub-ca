import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { approvedProductImage, products, type LicensedProductImage } from "./products";
import { ProductCard, ProductComparison } from "./product-components";

describe("public product examples", () => {
  it("rejects incomplete permission records and wrong-model photographs", () => {
    const product = products[0]!;
    const image: LicensedProductImage = { productId: product.id, src: { src: "/test-only-licensed-model.webp", width: 800, height: 600 }, alt: "Exact product photograph", permissionReference: "test-only written permission", sourceUrl: "https://www.catit.com/products/toys/senses-digger/" };
    expect(approvedProductImage({ ...product, image })).toEqual(image);
    for (const invalid of [{ ...image, productId: "catit-wave" }, { ...image, permissionReference: " " }, { ...image, alt: " " }, { ...image, sourceUrl: "http://www.catit.com/" }, { ...image, sourceUrl: "https://m.media-amazon.com/example.jpg" }, { ...image, src: { ...image.src, width: 0 } }]) {
      expect(approvedProductImage({ ...product, image: invalid })).toBeUndefined();
    }
    expect(products.every(item => approvedProductImage(item) === undefined)).toBe(true);
  });
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
