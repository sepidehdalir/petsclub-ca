import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { FONT_SIZE_STEPS, cn } from "@/lib/utils/cn";

/**
 * The type scale is declared in CSS and consumed by TypeScript, so nothing in
 * the compiler connects the two. These tests are that connection.
 */
const globalsCss = readFileSync(
  fileURLToPath(new URL("../../app/globals.css", import.meta.url)),
  "utf8",
);

/** Every `--text-<name>` in `@theme`, excluding the paired sub-properties. */
function declaredFontSizeSteps(): string[] {
  const steps = new Set<string>();

  for (const [, name] of globalsCss.matchAll(/^\s*--text-([a-z0-9-]+):/gm)) {
    // `--text-display-1--line-height` captures `display-1--line-height`.
    if (name && !name.includes("--")) {
      steps.add(name);
    }
  }

  return [...steps].sort();
}

describe("font size steps", () => {
  it("registers every step declared in globals.css with tailwind-merge", () => {
    expect(declaredFontSizeSteps()).toEqual([...FONT_SIZE_STEPS].sort());
  });
});

describe("cn", () => {
  it("keeps a custom size alongside a text colour", () => {
    // The regression this guards: tailwind-merge reads an unknown `text-*` as
    // a colour, decides it conflicts, and drops the size.
    for (const step of FONT_SIZE_STEPS) {
      const result = cn(`text-${step}`, "text-foreground-muted");
      expect(result, `text-${step} was dropped`).toContain(`text-${step}`);
      expect(result).toContain("text-foreground-muted");
    }
  });

  it("still lets a later size override an earlier one", () => {
    expect(cn("text-title-3", "text-title-1")).toBe("text-title-1");
    expect(cn("text-body", "text-lg")).toBe("text-lg");
    expect(cn("text-xl", "text-display-1")).toBe("text-display-1");
  });

  it("still resolves ordinary conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-foreground", "text-pine-700")).toBe("text-pine-700");
  });
});
