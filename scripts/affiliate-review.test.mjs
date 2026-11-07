import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { reviewStatus, readOfferWindows } from "./affiliate-review.mjs";

const fixture = 'export const affiliateOffers: readonly AffiliateOffer[] = [' +
  '{ id: "one", verifiedOn: "2026-10-09", reviewBy: "2026-11-08", approved: true },' +
  '{ id: "two", verifiedOn: "2026-10-09", reviewBy: "2026-10-31", approved: false },' +
  '];';

describe("read-only affiliate deadline audit", () => {
  it("parses literal metadata and never executes affiliate links", () => {
    expect(readOfferWindows(fixture)).toEqual([
      { id: "one", verifiedOn: "2026-10-09", reviewBy: "2026-11-08", approved: true },
      { id: "two", verifiedOn: "2026-10-09", reviewBy: "2026-10-31", approved: false },
    ]);
  });
  it("warns seven days before a deadline without treating unapproved as active", () => {
    const rows = reviewStatus(readOfferWindows(fixture), "2026-11-01");
    expect(rows[0]).toMatchObject({ status: "due-soon", daysLeft: 7 });
    expect(rows[1]).toMatchObject({ status: "unapproved", daysLeft: -1 });
  });
  it("keeps the deadline inclusive and expires one day later", () => {
    const offers = readOfferWindows(fixture);
    expect(reviewStatus(offers, "2026-11-08")[0].status).toBe("due-soon");
    expect(reviewStatus(offers, "2026-11-09")[0].status).toBe("expired");
  });
  it("distinguishes future verification from current approval", () => {
    const offers = readOfferWindows(fixture).slice(0, 1);
    expect(reviewStatus(offers, "2026-10-01")[0].status).toBe("not-yet-verified");
    expect(reviewStatus(offers, "2026-10-10", 7)[0].status).toBe("current");
  });
  it("rejects bad dates, duplicates and impossible audit dates", () => {
    expect(() => readOfferWindows(fixture.replace("2026-11-08", "2026-02-30"))).toThrow("Invalid");
    const offers = readOfferWindows(fixture).slice(0, 1);
    expect(() => reviewStatus([...offers, ...offers], "2026-11-01")).toThrow("Duplicate");
    expect(() => reviewStatus(offers, "2026-11-00")).toThrow("asOf");
  });
  it("reads the actual source registry and reports its review deadlines", () => {
    const source = readFileSync(new URL("../src/features/commerce/offers.ts", import.meta.url), "utf8");
    const offers = readOfferWindows(source);
    expect(offers.length).toBeGreaterThan(0);
    expect(reviewStatus(offers, "2026-11-01")).toHaveLength(offers.length);
  });
});
