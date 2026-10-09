import { siteConfig } from "@/config/site";
import { findArticle, type Article } from "@/features/editorial/articles";

/** Only publication state is relevant; a published noindex guide is linkable. */
export type ArticlePublicationLookup = (
  slug: string,
) => Pick<Article, "status"> | null;

/**
 * Recognise a normal Markdown link to a registered, in-review guide.
 *
 * The public MDX renderer keeps the link's words but omits its anchor until
 * the destination is published. Registry metadata, source prose and routes
 * are not changed. This is discovery policy, not access control or an HTML
 * sanitizer; unknown destinations stay visible to the broken-link audit.
 *
 * Only root-relative or HTTP(S) links can identify a guide unambiguously
 * without knowing the current document path. External sites, fragment-only
 * links and other application routes are left alone.
 */
export function isInReviewGuideLink(
  href: string | undefined,
  lookup: ArticlePublicationLookup = findArticle,
): boolean {
  if (!href || (!href.startsWith("/") && !/^https?:\/\//i.test(href))) {
    return false;
  }

  try {
    const url = new URL(href, `https://${siteConfig.domain}`);
    const isSiteHost =
      url.hostname === siteConfig.domain ||
      url.hostname === `www.${siteConfig.domain}`;

    if (!isSiteHost || !["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    // Ignore a query/fragment and accept a trailing slash, but not a deeper
    // route. Decode the segment only after establishing the site's host.
    const match = /^\/guides\/([^/]+)\/?$/.exec(url.pathname);
    const segment = match?.[1];
    if (!segment) {
      return false;
    }

    return lookup(decodeURIComponent(segment))?.status === "in-review";
  } catch {
    // Invalid URLs or percent escapes must not crash rendering. They remain
    // unchanged so the ordinary link validation can report them separately.
    return false;
  }
}
