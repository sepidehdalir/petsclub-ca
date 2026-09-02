import type { ReactElement } from "react";

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
 * Three rules are enforced structurally rather than by convention.
 *
 *  - **A review credit cannot be rendered without a reviewer on record.** The
 *    reviewer is resolved through `findReviewer`, which reads a register of
 *    reviews that actually happened. There is no prop, and no string, that
 *    makes this component print "vet reviewed".
 *  - **A draft neither claims nor denies a publication date.** A date is a
 *    claim about when a piece was published, so an article that has not been
 *    published carries none — it shows the byline and the reading time and
 *    stops. It never labels itself with its internal workflow state, which is
 *    editorial information and not the reader's business. Once `status` is
 *    `published` the date appears, labelled truthfully, with a revision date
 *    beside it if there is one.
 *  - **The byline says one thing once.** The author's name already carries
 *    that this is the publication's own team; appending a role to it read as
 *    "The Pet Club Editorial Team · Editorial team". What the team is, and is
 *    not, is stated properly in the author box at the foot of the article.
 */
export function ArticleByline({ article, className }: ArticleBylineProps) {
  const author = getAuthor(article.authorId);
  const reviewer = article.reviewerId ? findReviewer(article.reviewerId) : null;

  const isPublished = article.status === "published";
  const isRevised = article.updatedAt !== article.publishedAt;

  // Built as a list so the separators fall between whatever is actually
  // present, rather than each item having to know what precedes it.
  const meta = [
    isPublished ? (
      <>
        Published{" "}
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </>
    ) : null,
    isPublished && isRevised ? (
      <>
        Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
      </>
    ) : null,
    <>{article.readingMinutes} min read</>,
  ].filter((item): item is ReactElement => item !== null);

  return (
    <div className={cn("font-sans text-body-sm text-foreground-muted", className)}>
      <p>
        By <span className="font-medium text-foreground">{author.name}</span>
      </p>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {meta.map((item, index) => (
          <span key={index} className="flex items-center gap-x-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-ink-300">
                ·
              </span>
            ) : null}
            {item}
          </span>
        ))}
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
