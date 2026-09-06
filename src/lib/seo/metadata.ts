import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { canonicalUrl } from "@/lib/seo/urls";

/**
 * What a page is, as far as search engines are concerned.
 *
 * - `index` — public content we want found. `index, follow`.
 * - `public-noindex` — real published content deliberately kept out of the
 *   index (cannibalisation, a stage held back from a launch wave). It is still
 *   a page people navigate, so its links stay crawlable: `noindex, follow`.
 * - `private-noindex` — not a search surface at all: application state, auth,
 *   search results, 404s, and content still in review. Nothing here should be
 *   indexed and nothing should be followed out of it: `noindex, nofollow`.
 *
 * The distinction that matters is the middle one. Collapsing it into
 * `private-noindex` strands the internal links on any page held back from a
 * launch wave, which is how a strategic index decision quietly becomes a
 * crawl-graph defect.
 */
export type RobotsPolicy = "index" | "public-noindex" | "private-noindex";

export interface CreateMetadataOptions {
  /** Page title, without the site suffix. Omit on the homepage. */
  title?: string;
  /** Meta description. Falls back to the site description. */
  description?: string;
  /** Site-relative path used for the canonical and Open Graph URLs. */
  path?: string;
  /** Open Graph type. `article` is reserved for editorial content. */
  type?: "website" | "article";
  /**
   * How this page should be treated by search engines.
   *
   * A boolean was not enough. `noIndex: true` answered "should this rank?" but
   * had no way to answer "should its links still be followed?", and it silently
   * assumed no — which is right for a search results page and wrong for a real
   * published page held out of the index on editorial grounds. The three states
   * are named after the reason, not the header they emit.
   */
  robots?: RobotsPolicy;
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
  robots = "index",
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
    robots: robotsFor(robots),
  };
}

/** The one place a `RobotsPolicy` becomes an actual robots directive. */
function robotsFor(policy: RobotsPolicy): NonNullable<Metadata["robots"]> {
  if (policy === "private-noindex") {
    return { index: false, follow: false, googleBot: { index: false, follow: false } };
  }

  if (policy === "public-noindex") {
    // Followable on purpose: the page is published and people move through it.
    return { index: false, follow: true, googleBot: { index: false, follow: true } };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}
