import type { MetadataRoute } from "next";

import { informationalRoutes, topicRoutes } from "@/config/navigation";
import {
  COMMUNITY_BASE_PATH,
  allCommunityCategories,
  communityCategoryPath,
} from "@/features/community/taxonomy";
import { articlePath, publishedArticles } from "@/features/editorial/articles";
import { indexableJourneyPaths } from "@/features/puppy/stages";
import { absoluteUrl } from "@/lib/seo/urls";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

interface RouteGroup {
  paths: readonly string[];
  priority: number;
  changeFrequency: ChangeFrequency;
}

/**
 * Route groups, ordered by priority.
 *
 * Priorities are relative hints within this site, not absolute rankings: the
 * homepage and the community hub are the primary entry points, topic sections
 * sit below them, and static policy pages are lowest.
 */
const ROUTE_GROUPS: readonly RouteGroup[] = [
  { paths: ["/"], priority: 1, changeFrequency: "daily" },
  { paths: [COMMUNITY_BASE_PATH], priority: 0.9, changeFrequency: "daily" },
  { paths: topicRoutes, priority: 0.8, changeFrequency: "weekly" },
  {
    // Only articles that have completed editorial review. A draft is rendered
    // `noindex` by `/guides/[slug]`, and advertising it here would contradict
    // that — so this list is empty until an article is marked `published`.
    paths: publishedArticles().map((article) => articlePath(article.slug)),
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    // The Puppy Journey, on the same terms as the articles above: a route
    // appears only when its stage is published *and* approved for indexing, so
    // sitemap membership and the page's own `noindex` are driven by one
    // predicate and cannot drift apart. The list is empty while every stage is
    // in review. `/my-puppy`, the two retired redirect sources and every
    // query-string state are excluded by construction — `indexableJourneyPaths`
    // cannot emit them.
    paths: indexableJourneyPaths(),
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    paths: allCommunityCategories.map((category) => communityCategoryPath(category.slug)),
    priority: 0.7,
    changeFrequency: "daily",
  },
  { paths: informationalRoutes, priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Builds every indexable URL on the site.
 *
 * Pure and deterministic — no clock read, so a rebuild does not churn every
 * `lastModified` value and the output is directly unit-testable. Routes that
 * are `noIndex` (search, auth, account) are excluded by construction rather
 * than filtered out afterwards.
 */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  return ROUTE_GROUPS.flatMap(({ paths, priority, changeFrequency }) =>
    paths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })),
  );
}
