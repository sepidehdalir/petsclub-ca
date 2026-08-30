import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/urls";

/**
 * robots.txt
 *
 * Only genuinely non-indexable surfaces are disallowed: authenticated account
 * pages, the auth callback endpoints, and search result URLs, which have no
 * stable content of their own and would otherwise compete with the pages they
 * point at.
 *
 * Preview deployments are blocked entirely so a `*.vercel.app` copy of the
 * site cannot be indexed alongside the production domain.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = siteConfig.url === `https://${siteConfig.domain}`;

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/auth/", "/search?"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
