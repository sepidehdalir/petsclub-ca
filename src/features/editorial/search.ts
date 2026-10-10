import {
  articleDescription,
  getArticleSection,
  publishedArticles,
  type Article,
} from "@/features/editorial/articles";

/**
 * Lightweight server-side search of the existing, editorially approved article
 * registry. A query never surfaces an unpublished draft.
 *
 * This is intentionally a useful first-stage search, not a claim that the
 * planned full-text/community search service has shipped.
 */
export function searchPublishedGuides(rawQuery: string, limit = 24): Article[] {
  const query = rawQuery.trim().slice(0, 120).toLocaleLowerCase("en-CA");
  const terms = [...new Set(query.split(/\s+/).filter(Boolean))];

  if (terms.length === 0) return [];

  return publishedArticles()
    .map((article) => {
      const title = article.title.toLocaleLowerCase("en-CA");
      const deck = articleDescription(article).toLocaleLowerCase("en-CA");
      const tags = article.tags.join(" ").replaceAll("-", " ").toLocaleLowerCase("en-CA");
      const section = getArticleSection(article.section).name.toLocaleLowerCase("en-CA");
      const categories = (article.relatedCategorySlugs ?? [])
        .join(" ")
        .replaceAll("-", " ")
        .toLocaleLowerCase("en-CA");
      const searchable = [title, deck, tags, section, categories].join(" ");
      if (!terms.every((term) => searchable.includes(term))) return null;
      const score = terms.reduce(
        (sum, term) =>
          sum +
          (title.includes(term) ? 8 : 0) +
          (tags.includes(term) ? 4 : 0) +
          (categories.includes(term) ? 3 : 0) +
          (deck.includes(term) ? 2 : 0),
        0,
      );
      return { article, score };
    })
    .filter((match): match is { article: Article; score: number } => match !== null)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
    .slice(0, Math.max(0, Math.min(limit, 50)))
    .map(({ article }) => article);
}
