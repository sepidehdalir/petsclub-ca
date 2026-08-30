import { describe, expect, it } from "vitest";

import { isActivePath } from "@/components/layout/nav-link";
import { initialsFromName } from "@/components/ui/avatar";
import { formatCount, formatElapsed, formatRelativeTime } from "@/lib/utils/format";
import { isValidSlug, joinPath, slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Dog Food & Nutrition")).toBe("dog-food-nutrition");
    expect(slugify("Best pet insurance in Canada?")).toBe("best-pet-insurance-in-canada");
  });

  it("folds accented Latin characters instead of dropping them", () => {
    expect(slugify("Élevage québécois")).toBe("elevage-quebecois");
  });

  it("collapses separators and trims stray hyphens", () => {
    expect(slugify("  --- Lost   &&&  Found --- ")).toBe("lost-found");
  });

  it("never produces a trailing hyphen, even when truncating", () => {
    const slug = slugify("a".repeat(78) + " tail");
    expect(slug.endsWith("-")).toBe(false);
    expect(slug.length).toBeLessThanOrEqual(80);
  });

  it("produces output that satisfies the database CHECK constraint", () => {
    const inputs = [
      "Travelling With Pets",
      "Pet-Friendly Canada",
      "My puppy suddenly stopped eating kibble!",
      "Cat behaviour: 101",
    ];

    for (const input of inputs) {
      expect(isValidSlug(slugify(input)), `slugify(${input})`).toBe(true);
    }
  });
});

describe("isValidSlug", () => {
  it("accepts canonical slugs", () => {
    expect(isValidSlug("dogs")).toBe(true);
    expect(isValidSlug("dog-food-and-nutrition")).toBe(true);
  });

  it("rejects non-canonical forms", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("Dogs")).toBe(false);
    expect(isValidSlug("-dogs")).toBe(false);
    expect(isValidSlug("dogs-")).toBe(false);
    expect(isValidSlug("dog--food")).toBe(false);
    expect(isValidSlug("dog food")).toBe(false);
    expect(isValidSlug("a".repeat(81))).toBe(false);
  });
});

describe("joinPath", () => {
  it("joins segments with single slashes", () => {
    expect(joinPath("community", "dog-health")).toBe("/community/dog-health");
    expect(joinPath("/community/", "/dog-health/")).toBe("/community/dog-health");
  });

  it("skips empty segments", () => {
    expect(joinPath("community", "", "dog-health")).toBe("/community/dog-health");
  });
});

describe("formatElapsed", () => {
  it("reads as 'just now' under a minute", () => {
    expect(formatElapsed(0)).toBe("just now");
    expect(formatElapsed(59)).toBe("just now");
  });

  it("singularises exactly one unit", () => {
    expect(formatElapsed(60)).toBe("1 minute ago");
    expect(formatElapsed(3600)).toBe("1 hour ago");
    expect(formatElapsed(86_400)).toBe("1 day ago");
  });

  it("pluralises beyond one unit", () => {
    expect(formatElapsed(7200)).toBe("2 hours ago");
    expect(formatElapsed(86_400 * 3)).toBe("3 days ago");
    expect(formatElapsed(86_400 * 14)).toBe("2 weeks ago");
  });

  it("never produces a negative label for a future timestamp", () => {
    expect(formatElapsed(-5000)).toBe("just now");
  });
});

describe("formatRelativeTime", () => {
  it("measures against the supplied reference time", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    expect(formatRelativeTime("2026-08-30T10:00:00.000Z", now)).toBe("2 hours ago");
    expect(formatRelativeTime("2026-08-28T12:00:00.000Z", now)).toBe("2 days ago");
  });
});

describe("formatCount", () => {
  it("formats compactly", () => {
    expect(formatCount(24)).toBe("24");
    expect(formatCount(1200)).toBe("1.2K");
  });
});

describe("initialsFromName", () => {
  it("takes the first and last initial", () => {
    expect(initialsFromName("Sam Rivard")).toBe("SR");
    expect(initialsFromName("Marie-Claude Tremblay Roy")).toBe("MR");
  });

  it("handles a single word", () => {
    expect(initialsFromName("Sam")).toBe("S");
  });

  it("degrades gracefully on empty input", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("   ")).toBe("?");
  });
});

describe("isActivePath", () => {
  it("matches the exact path", () => {
    expect(isActivePath("/dogs", "/dogs")).toBe(true);
  });

  it("matches descendants so a section stays highlighted", () => {
    expect(isActivePath("/community/dog-health", "/community")).toBe(true);
  });

  it("does not match a path that merely shares a prefix", () => {
    // The bug this guards against: /cats lighting up on /catsomething.
    expect(isActivePath("/catsomething", "/cats")).toBe(false);
    expect(isActivePath("/community-guidelines", "/community")).toBe(false);
  });

  it("only matches the homepage exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/dogs", "/")).toBe(false);
  });
});
