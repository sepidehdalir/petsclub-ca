import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AffiliateLink } from "./affiliate-link";
import type { AffiliateOffer } from "./offers";

const fixture: AffiliateOffer = {
  id: "fixture-only", partner: "Fixture", label: "View details", href: "https://example.com/item",
  approved: true, allowedHost: "example.com", verifiedOn: "2026-01-01", reviewBy: "2099-12-31", disclosure: "Fixture disclosure",
};

describe("cached affiliate markup", () => {
  it.each([
    ["currently valid", fixture],
    ["expired", { ...fixture, reviewBy: "2026-11-08" }],
    ["unapproved", { ...fixture, approved: false }],
    ["unsafe URL", { ...fixture, href: "javascript:alert(1)" }],
  ])("never prerenders an actionable %s affiliate destination", (_name, offer) => {
    const html = renderToStaticMarkup(createElement(AffiliateLink, { offer }));
    expect(html).not.toContain("href=");
    expect(html).not.toContain("<a");
    expect(html).not.toContain(offer.href);
    expect(html).toContain("current review status can be confirmed");
  });
});
