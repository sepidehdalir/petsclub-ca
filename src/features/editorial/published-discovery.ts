import {
  articlesForSurface,
  relatedArticles,
  type Article,
} from "@/features/editorial/articles";

/**
 * Public discovery is gated by publication, not by search indexability.
 *
 * The registry selectors also serve editorial tooling and include drafts.
 * Public listing components must use these selectors instead. A published
 * article deliberately held out of search remains a valid link destination;
 * an in-review article must not be promoted as a finished guide.
 */
export function selectPublishedArticles<T extends Pick<Article, "status">>(
  candidates: readonly T[],
  limit?: number,
): readonly T[] {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
    throw new RangeError("Article discovery limit must be a non-negative integer.");
  }

  const published = candidates.filter((article) => article.status === "published");

  // Filter before limiting: an in-review record must not consume a preview
  // slot. Preserve the editor's registry order and never mutate the input.
  return limit === undefined ? published : published.slice(0, limit);
}

/** Finished guides on a public hub or topic surface, optionally a short preview. */
export function publishedArticlesForSurface(
  surfacePath: string,
  limit?: number,
): readonly Article[] {
  return selectPublishedArticles(articlesForSurface(surfacePath), limit);
}

/** Related-reading cards may only send readers to finished guides. */
export function publishedRelatedArticles(article: Article): readonly Article[] {
  return selectPublishedArticles(relatedArticles(article));
}
