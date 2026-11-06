import { describe, expect, it } from "vitest";

import { isPublicProductionDeployment } from "@/lib/seo/deployment-crawl";

describe("deployment crawler access", () => {
  it.each([
    ["Vercel production", "https://thepetclub.ca", "production", true],
    ["canonical non-Vercel production", "https://thepetclub.ca", undefined, true],
    ["Vercel preview inheriting production URL", "https://thepetclub.ca", "preview", false],
    ["Vercel development inheriting production URL", "https://thepetclub.ca", "development", false],
    ["preview hostname", "https://petsclub-ca-git-main.vercel.app", "preview", false],
    ["unexpected Vercel environment", "https://thepetclub.ca", "staging", false],
    ["localhost", "http://localhost:3000", undefined, false],
  ] as const)("%s", (_description, origin, environment, expected) => {
    expect(isPublicProductionDeployment(origin, "thepetclub.ca", environment)).toBe(expected);
  });
});
