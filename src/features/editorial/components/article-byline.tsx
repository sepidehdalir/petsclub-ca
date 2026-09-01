import type { Article } from "@/features/editorial/articles";
import { findReviewer, getAuthor } from "@/features/editorial/authors";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface ArticleBylineProps {
  article: Article;
  className?: string;
}

/**
 * Byline, dates and reading time.
 *
 * Set in the interface sans rather than the editorial serif: this is metadata
 * about the article, not part of it.
 *
 * Two rules are enforced structurally rather than by convention.
 *
 *  - **A review credit cannot be rendered without a reviewer on record.** The
 *    reviewer is resolved through `findReviewer`, which reads a register of
 *    reviews that actually happened. There is no prop, and no string, that
 *    makes this component print "vet reviewed".
 *  - **A draft does not claim to be published.** While an article is
 *    `in-review` the date is labelled "Drafted", because it has not been
 *    published yet and saying otherwise would be the first false thing on the
 *    page.
 */
export function ArticleByline({ article, className }: ArticleBylineProps) {
  const author = getAuthor(article.authorId);
  const reviewer = article.reviewerId ? findReviewer(article.reviewerId) : null;

  const isRevised = article.updatedAt !== article.publishedAt;
  const dateLabel = article.status === "published" ? "Published" : "Drafted";

  return (
    <div className={cn("font-sans text-body-sm text-foreground-muted", className)}>
      <p>
        By{" "}
        <span className="font-medium text-foreground">{author.name}</span>
        <span className="text-foreground-subtle"> · {author.role}</span>
      </p>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          {dateLabel}{" "}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </span>

        {isRevised ? (
          <>
            <span aria-hidden="true" className="text-ink-300">
              ·
            </span>
            <span>
              Updated{" "}
              <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
            </span>
          </>
        ) : null}

        <span aria-hidden="true" className="text-ink-300">
          ·
        </span>
        <span>{article.readingMinutes} min read</span>
      </p>

      {reviewer ? (
        <p className="mt-1">
          Reviewed by{" "}
          <span className="font-medium text-foreground">
            {reviewer.name}, {reviewer.credentials}
          </span>{" "}
          on <time dateTime={reviewer.reviewedOn}>{formatDate(reviewer.reviewedOn)}</time> ·{" "}
          {reviewer.college} #{reviewer.registrationNumber}
        </p>
      ) : null}
    </div>
  );
}
