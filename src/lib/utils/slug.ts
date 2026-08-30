/**
 * URL slug helpers.
 *
 * Slugs are part of the public URL surface and are mirrored by a database
 * CHECK constraint (`^[a-z0-9]+(-[a-z0-9]+)*$`), so the rules implemented here
 * must stay in step with `supabase/migrations`.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_SLUG_LENGTH = 80;

/**
 * Converts arbitrary human text into a safe, lowercase, hyphenated slug.
 *
 * Accented Latin characters are folded to their base form so that Canadian
 * French input ("Élevage") produces a readable slug rather than being stripped.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining diacritical marks left behind by NFKD.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

/** Returns true when `value` is already a valid canonical slug. */
export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(value);
}

/** Joins path segments into a clean, single-slashed absolute path. */
export function joinPath(...segments: string[]): string {
  const path = segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter((segment) => segment.length > 0)
    .join("/");

  return `/${path}`;
}
