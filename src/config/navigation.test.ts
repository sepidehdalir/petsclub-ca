import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  footerNavigation,
  headerNavigation,
  primaryNavigation,
  secondaryNavigation,
} from "@/config/navigation";

/**
 * The masthead must not promise a page that is not there.
 *
 * A navigation heading is the most load-bearing link on the site: readers use
 * it to decide what the publication covers, and a dead one costs more trust
 * than a missing feature. These assertions make an unbacked destination a
 * failing build rather than a 404 someone finds in production.
 */
describe("header navigation", () => {
  it("points every destination at a route that exists", () => {
    for (const item of headerNavigation) {
      expect(item.href, `${item.label}: must be an absolute path`).toMatch(/^\/[a-z0-9-]/);

      const page = fileURLToPath(new URL(`../app${item.href}/page.tsx`, import.meta.url));
      expect(existsSync(page), `${item.label} -> ${item.href} has no page behind it`).toBe(
        true,
      );
    }
  });

  it("names every destination", () => {
    for (const item of headerNavigation) {
      expect(item.label.trim().length, `${item.href}: label`).toBeGreaterThan(0);
    }
  });

  it("lists each destination once across the two groups", () => {
    const hrefs = headerNavigation.map((item) => item.href);
    expect(new Set(hrefs).size, `duplicate destination in ${hrefs.join(", ")}`).toBe(
      hrefs.length,
    );
  });

  it("keeps the masthead to the editorial sections", () => {
    // Six is the number that fits the desktop row without crowding, and the
    // number the drawer can set large without scrolling at 390px. If a
    // seventh section is genuinely needed, the layout needs revisiting with
    // it — not a silent squeeze.
    expect(primaryNavigation).toHaveLength(6);
    expect(secondaryNavigation.map((item) => item.href)).toEqual([
      "/community",
      "/lost-found",
    ]);
  });

  it("keeps every footer destination pointing somewhere real", () => {
    // Community category links are covered against the taxonomy elsewhere;
    // this checks the static pages the footer promises.
    const staticLinks = footerNavigation
      .flatMap((group) => group.items)
      .filter((item) => !item.href.startsWith("/community/"));

    for (const item of staticLinks) {
      const page = fileURLToPath(new URL(`../app${item.href}/page.tsx`, import.meta.url));
      expect(existsSync(page), `footer: ${item.label} -> ${item.href} has no page`).toBe(true);
    }
  });
});
