/**
 * Single source of truth for brand-level constants.
 *
 * Anything that appears in metadata, structured data or the application shell
 * should read from here rather than hard-coding strings, so that a brand or
 * domain change is a one-file change.
 */

/**
 * Resolves the canonical origin of the current deployment.
 *
 * Priority:
 *  1. `NEXT_PUBLIC_SITE_URL` — set explicitly per environment.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's stable production hostname.
 *  3. Localhost — development fallback only.
 *
 * Production metadata must never point at localhost, which is why the
 * production domain is the documented default in `.env.example`.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl}`;
  }

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "The Pet Club",
  legalName: "ThePetClub.ca",
  domain: "thepetclub.ca",
  tagline: "Canada's community for pet parents.",
  description:
    "Ask questions, share experiences, and discover trusted pet advice from across Canada.",
  url: resolveSiteUrl(),
  locale: "en_CA",
  language: "en-CA",
  country: "CA",
  /** Used for Open Graph / Twitter cards and the default social image. */
  ogImagePath: "/opengraph-image",
  /** Contact address surfaced on the contact page. Update before launch. */
  contactEmail: "hello@thepetclub.ca",
} as const;

export type SiteConfig = typeof siteConfig;
