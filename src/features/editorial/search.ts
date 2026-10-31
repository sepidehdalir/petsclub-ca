import {
  articleDescription,
  getArticleSection,
  publishedArticles,
  type Article,
} from "@/features/editorial/articles";

/** Treat punctuation as word boundaries without discarding Unicode letters/numbers. */
function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-CA")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/**
 * Lightweight server-side search of the existing, editorially approved article
 * registry. A query never surfaces an unpublished draft.
 *
 * This is intentionally a useful first-stage search, not a claim that the
 * planned full-text/community search service has shipped.
 */
export function searchPublishedGuides(rawQuery: string, limit = 24): Article[] {
  const query = normalizeSearchText(rawQuery.trim().slice(0, 120));
  const terms = [...new Set(query.split(/\s+/).filter(Boolean))];

  if (terms.length === 0) return [];

  return publishedArticles()
    .map((article) => {
      const title = normalizeSearchText(article.title);
      const deck = normalizeSearchText(articleDescription(article));
      const tags = normalizeSearchText(article.tags.join(" "));
      const section = normalizeSearchText(getArticleSection(article.section).name);
      const categories = normalizeSearchText((article.relatedCategorySlugs ?? []).join(" "));
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
