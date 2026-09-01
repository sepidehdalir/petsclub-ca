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
  /**
   * A share image with its own dimensions and description.
   *
   * Editorial articles share their own lead photograph rather than the generic
   * site card, which is the difference between a link that looks like a page
   * and one that looks like a story. Takes precedence over `imagePath`.
   */
  image?: { url: string; width: number; height: number; alt: string };
  /** Article publication and revision dates, for `og:article` metadata. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Byline, for `og:article:author`. */
  authors?: readonly string[];
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
  image,
  publishedTime,
  modifiedTime,
  authors,
}: CreateMetadataOptions = {}): Metadata {
  const url = canonicalUrl(path);
  const resolvedTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;

  const shareImage = image ?? {
    url: imagePath,
    width: 1200,
    height: 630,
    alt: siteConfig.name,
  };

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
      images: [shareImage],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: authors ? [...authors] : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [shareImage.url],
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
