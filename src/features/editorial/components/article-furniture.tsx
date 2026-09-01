import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import type { Article } from "@/features/editorial/articles";
import { getAuthor } from "@/features/editorial/authors";
import {
  communityCategoryPath,
  findCommunityCategory,
} from "@/features/community/taxonomy";

/**
 * The furniture around an article body: takeaways, status, sources, author box
 * and the links out.
 *
 * Grouped in one file because none of these is independently reusable — they
 * exist to be assembled by `article-page.tsx` in a fixed order, and reading
 * them together is how you see the shape of the page.
 */

export interface KeyTakeawaysProps {
  items: readonly string[];
}

/**
 * The quick answer, above the body.
 *
 * Rendered before the article rather than after it because a reader who came
 * from a search for "is it too cold to walk my dog" should be able to leave
 * satisfied in fifteen seconds. Every item is a claim the article then
 * supports — it is a summary, never a teaser.
 */
export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  return (
    <section
      aria-labelledby="key-takeaways-heading"
      className="rounded-card border border-border bg-surface px-5 py-5 sm:px-7 sm:py-6"
    >
      <h2
        id="key-takeaways-heading"
        className="font-sans text-label uppercase text-pine-700"
      >
        Key takeaways
      </h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="relative pl-6 text-body-sm text-foreground-reading">
            <span
              aria-hidden="true"
              className="absolute left-1 top-[0.6em] h-1.5 w-1.5 rounded-full bg-pine-500"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface ArticleStatusNoticeProps {
  article: Article;
}

/**
 * States, plainly, that an article has not been published yet.
 *
 * `/editorial-policy` promises readers that every published guide is written
 * and reviewed by a person who is accountable for it. An article that has been
 * drafted but not yet signed off has not met that promise, and the honest
 * thing is to say so on the page rather than to publish quietly and hope.
 *
 * Returns nothing once `status` is `published`, so removing this notice is a
 * one-field change made by the person who did the review.
 */
export function ArticleStatusNotice({ article }: ArticleStatusNoticeProps) {
  if (article.status === "published") {
    return null;
  }

  return (
    <div
      role="note"
      className="rounded-card border border-clay-200 bg-clay-50 px-5 py-4 sm:px-6"
    >
      <h2 className="font-sans text-body-sm font-semibold text-clay-700">
        Editorial draft — not yet published
      </h2>
      <p className="mt-1.5 text-body-sm text-clay-700/90">
        This guide has been drafted but has not completed editorial review, so it is not
        indexed and should not be treated as final. Any claim still being checked is listed
        at the end of the article.
      </p>
    </div>
  );
}

/**
 * The standing distinction between general information and veterinary advice.
 *
 * Sits after the body on any article that touches health, symptoms or
 * medication. The inline `<VetNote>` callout marks the specific moment in an
 * article where a reader should stop and phone someone; this closes the page.
 */
export function VeterinaryBoundary() {
  return (
    <section
      aria-labelledby="veterinary-boundary-heading"
      className="border-t border-border pt-6"
    >
      <h2
        id="veterinary-boundary-heading"
        className="font-sans text-label uppercase text-foreground-subtle"
      >
        General information, not veterinary advice
      </h2>
      <p className="mt-2 text-body-sm text-foreground-muted">
        The Pet Club is written by researchers and writers, not veterinarians. This article
        describes what to look for and when to seek help. It does not diagnose, it does not
        recommend treatment, and it is not a substitute for examining your animal — only a
        licensed veterinarian who has seen your pet can do that. If something is wrong, or
        you are unsure, call your veterinary practice or your nearest emergency clinic.
      </p>
    </section>
  );
}

export interface ArticleSourcesProps {
  article: Article;
}

/**
 * Sources, and the claims still being checked.
 *
 * The second list is the unusual one and it is the point. Where a fact would
 * have strengthened the article but could not be confirmed against a primary
 * source, it is written conservatively in the body and flagged here rather
 * than filled in with a confident-sounding guess. Showing readers the open
 * questions costs a little polish and buys the only thing that matters.
 */
export function ArticleSources({ article }: ArticleSourcesProps) {
  const sources = article.sources ?? [];
  const pending = article.needsVerification ?? [];

  if (sources.length === 0 && pending.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="article-sources-heading"
      className="border-t border-border pt-6"
    >
      <h2
        id="article-sources-heading"
        className="font-sans text-label uppercase text-foreground-subtle"
      >
        Sources and open questions
      </h2>

      {sources.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {sources.map((source) => (
            <li key={source.url} className="text-body-sm text-foreground-muted">
              <a
                href={source.url}
                rel="noreferrer"
                className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
              >
                {source.label}
              </a>{" "}
              — {source.publisher}
            </li>
          ))}
        </ul>
      ) : null}

      {pending.length > 0 ? (
        <div className="mt-5">
          <h3 className="font-sans text-body-sm font-semibold text-foreground">
            Flagged for verification before publication
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {pending.map((item) => (
              <li key={item} className="text-body-sm text-foreground-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export interface ArticleAuthorCardProps {
  article: Article;
}

/** Who wrote this, and what they are and are not. */
export function ArticleAuthorCard({ article }: ArticleAuthorCardProps) {
  const author = getAuthor(article.authorId);

  return (
    <Card>
      <CardBody className="sm:p-6">
        <p className="font-sans text-label uppercase text-foreground-subtle">
          About the author
        </p>
        <h2 className="mt-2 text-title-3 text-foreground">{author.name}</h2>
        <p className="mt-2 text-body-sm text-foreground-muted">{author.bio}</p>
        <p className="mt-3 text-body-sm">
          <Link
            href="/editorial-policy"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            How we research, review and correct our guides
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

export interface RelatedDiscussionProps {
  categorySlugs: readonly string[];
}

/**
 * Links from an article into the forum categories that discuss it.
 *
 * The half of ADR 0005 that is easy to forget: guides bring people in from
 * search, and the community is what brings them back. A reader who has just
 * finished a winter care guide is exactly the person with a follow-up question.
 */
export function RelatedDiscussion({ categorySlugs }: RelatedDiscussionProps) {
  const categories = categorySlugs
    .map((slug) => findCommunityCategory(slug))
    .filter((match): match is NonNullable<typeof match> => match !== null);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-discussion-heading"
      className="border-t border-border pt-6"
    >
      <h2
        id="related-discussion-heading"
        className="font-sans text-label uppercase text-foreground-subtle"
      >
        Ask the community
      </h2>
      <p className="mt-2 text-body-sm text-foreground-muted">
        Questions this guide does not answer are the ones worth asking other Canadian owners.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {categories.map(({ category }) => (
          <li key={category.slug}>
            <Link
              href={communityCategoryPath(category.slug)}
              className="text-body-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
