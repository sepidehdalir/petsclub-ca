import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { isPublicProductionDeployment } from "@/lib/seo/deployment-crawl";
import { absoluteUrl } from "@/lib/seo/urls";

/**
 * robots.txt
 *
 * Only genuinely non-indexable surfaces are disallowed: authenticated account
 * pages, the auth callback endpoints, and search result URLs, which have no
 * stable content of their own and would otherwise compete with the pages they
 * point at.
 *
 * Preview and development deployments are blocked even if they inherit the
 * production canonical URL. Robots disallow is a crawl directive, not proof
 * of Google index removal; preview access controls remain advisable.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isPublicProductionDeployment(siteConfig.url, siteConfig.domain, process.env.VERCEL_ENV)) {
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
