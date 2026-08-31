import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

/**
 * Brand-constant drift guards.
 *
 * The `thepetclub.ca` rename changed `name`, `legalName` and `domain` but not
 * the two hand-written copies of the wordmark, so the header shipped reading
 * "The PetClub.ca" and every generated social card still read "PetsClub.ca".
 * TypeScript cannot catch that — these assertions can, and they fail loudly on
 * the next rename instead of letting a stale brand reach production.
 */
describe("wordmark", () => {
  const { lead, accent, suffix } = siteConfig.wordmark;
  const spoken = `${lead}${accent}`;
  const full = `${spoken}${suffix}`;

  it("composes to the brand name", () => {
    expect(spoken).toBe(siteConfig.name);
  });

  it("composes to the legal name once spacing is removed", () => {
    expect(full.replace(/\s+/g, "")).toBe(siteConfig.legalName);
  });

  it("composes to the domain", () => {
    expect(full.replace(/\s+/g, "").toLowerCase()).toBe(siteConfig.domain);
  });

  it("keeps the separating space in `lead`, not at a call site", () => {
    // Both consumers concatenate the parts directly. If the space moves out of
    // `lead`, the lockup silently closes up to "The PetClub".
    expect(lead.endsWith(" ")).toBe(true);
    expect(accent.trim()).toBe(accent);
  });

  it("starts the suffix with a dot so the lockup reads as a domain", () => {
    expect(suffix.startsWith(".")).toBe(true);
  });
});
