import { describe, expect, it } from "vitest";
import { affiliateOffers, findAffiliateOffer, usableOffer, type AffiliateOffer } from "./offers";
const offer: AffiliateOffer = {
  id: "fixture-only", partner: "Test fixture", label: "View details", href: "https://example.com/product",
  approved: true, allowedHost: "example.com", verifiedOn: "2026-10-01", reviewBy: "2026-10-31", disclosure: "Test disclosure",
};
describe("affiliate activation guards", () => {
  it("ships no invented commercial relationships", () => {
    expect(affiliateOffers).toHaveLength(0);
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
