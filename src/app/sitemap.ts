import type { MetadataRoute } from "next";

import { buildSitemapEntries } from "@/lib/seo/sitemap";

/**
 * XML sitemap.
 *
 * The entry list is built by a pure, unit-tested function so that a route
 * added to navigation or to the taxonomy cannot be silently omitted here.
 * Milestone 2 will extend `buildSitemapEntries` with published threads, and
 * split into indexed sitemaps via `generateSitemaps` once the URL count
 * approaches the 50,000-entry limit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
