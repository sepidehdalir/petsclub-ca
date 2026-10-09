import { describe, expect, it } from "vitest";
import { analyticsHostAllowed, publicPageLocation, validMeasurementId } from "./policy";
describe("analytics privacy boundary", () => {
  it("rejects missing, malformed IDs and other deployment hosts", () => {
    expect(validMeasurementId(undefined)).toBe(false);
    expect(validMeasurementId("G-EXAMPLE?email=private")).toBe(false);
    expect(validMeasurementId("G-1234567890")).toBe(true); // Test-only identifier; never configured.
    expect(analyticsHostAllowed("localhost")).toBe(false);
    expect(analyticsHostAllowed("preview.vercel.app")).toBe(false);
    expect(analyticsHostAllowed("thepetclub.ca.attacker.invalid")).toBe(false);
    expect(analyticsHostAllowed("thepetclub.ca")).toBe(true);
  });
  it("limits page locations to exact public paths with no private queries", () => {
    const paths = ["/", "/contact", "/guides/pet-insurance-in-canada"];
    expect(publicPageLocation("/contact", paths)).toBe("https://thepetclub.ca/contact");
    for (const path of ["/contact?email=private", "/account", "/search/private", "/community/person-name", "https://other.invalid", "/contact#private"]) expect(publicPageLocation(path, paths)).toBeNull();
  });
});
