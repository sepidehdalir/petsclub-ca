import { siteConfig } from "@/config/site";

/**
 * Canonical URL helpers.
 *
 * Every canonical/OG URL in the application flows through here so the
 * production origin is applied consistently and localhost can never leak into
 * production metadata.
 */

/** Normalises a path to a leading-slash, no-trailing-slash form. */
export function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

/** Builds a fully-qualified URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? siteConfig.url : `${siteConfig.url}${normalized}`;
}

/**
 * Canonical URL for a page.
 *
 * Query strings are deliberately dropped: filtered and paginated variants
 * should point back at the clean resource URL.
 */
export function canonicalUrl(path = "/"): string {
  const [pathnameOnly = "/"] = normalizePath(path).split("?");
  return absoluteUrl(pathnameOnly);
}
