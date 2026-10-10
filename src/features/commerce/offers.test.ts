import { describe, expect, it } from "vitest";
import { affiliateOffers, findAffiliateOffer, usableOffer, type AffiliateOffer } from "./offers";
const offer: AffiliateOffer = {
  id: "fixture-only", partner: "Test fixture", label: "View details", href: "https://example.com/product",
  approved: true, allowedHost: "example.com", verifiedOn: "2026-10-01", reviewBy: "2026-10-31", disclosure: "Test disclosure",
};
describe("affiliate activation guards", () => {
  it("ships only reviewed Amazon links for the verified account", () => {
    expect(affiliateOffers).toHaveLength(2);
    for (const entry of affiliateOffers) {
      const url = new URL(entry.href);
      expect(url.hostname).toBe("www.amazon.ca");
      expect(url.searchParams.get("tag")).toBe("thepetclub09-20");
      expect(url.pathname).toMatch(/\/dp\/[A-Z0-9]{10}$/);
      expect(entry.disclosure).toContain("As an Amazon Associate I earn from qualifying purchases.");
      expect(usableOffer(entry, "2026-10-09")).toBe(true);
    }
    expect(findAffiliateOffer("unknown")).toBeUndefined();
  });
  it("accepts a reviewed offer only during its verification window", () => {
    expect(usableOffer(offer, "2026-10-09")).toBe(true);
    expect(usableOffer(offer, "2026-11-01")).toBe(false);
    expect(usableOffer(offer, "2026-09-01")).toBe(false);
  });
  it.each([
    { approved: false }, { href: "javascript:alert(1)" }, { href: "http://example.com/product" },
    { href: "https://example.com.attacker.invalid/product" }, { href: "https://user:pass@example.com" },
    { href: "https://example.com:444/product" }, { disclosure: " " }, { verifiedOn: "2026-02-30" },
    { reviewBy: "invalid" }, { id: "contains private data?" },
  ])("rejects unsafe or unverified offer %j", (patch) => {
    expect(usableOffer({ ...offer, ...patch }, "2026-10-09")).toBe(false);
  });
});
