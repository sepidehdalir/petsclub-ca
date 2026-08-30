import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/urls";

export interface CreateMetadataOptions {
  /** Page title, without the site suffix. Omit on the homepage. */
  title?: string;
  /** Meta description. Falls back to the site description. */
  description?: string;
  /** Site-relative path used for the canonical and Open Graph URLs. */
  path?: string;
  /** Open Graph type. `article` is reserved for editorial content. */
  type?: "website" | "article";
  /** Set for utility pages (search results, auth screens) that must not rank. */
  noIndex?: boolean;
  /** Overrides the default social share image. */
  imagePath?: string;
}

/**
 * Builds a complete, canonical-aware `Metadata` object for a route.
 *
 * Centralising this guarantees that every page ships a canonical URL, a
 * consistent title template, and valid Open Graph / Twitter cards, instead of
 * relying on each route to remember them.
 */
export function createMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  type = "website",
  noIndex = false,
  imagePath = siteConfig.ogImagePath,
}: CreateMetadataOptions = {}): Metadata {
  const url = canonicalUrl(path);
  const resolvedTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title: title ?? { absolute: resolvedTitle },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      locale: siteConfig.locale,
      images: [{ url: imagePath, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [imagePath],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
