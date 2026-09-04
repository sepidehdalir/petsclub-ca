import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import type { Article, ArticleSource } from "@/features/editorial/articles";
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

/*
 * There is deliberately no draft-status banner here.
 *
 * `status` and `needsVerification` are *editorial* state. They decide whether
 * an article is indexed and whether it appears in the sitemap, and they tell
 * an editor what is left to do — none of which is a reader's concern. Printing
 * "Editorial draft — not yet published" and a list of open fact-checks on the
 * live page published the newsroom's working notes to everyone who opened the
 * article on a phone.
 *
 * The distinction that matters: `noindex` keeps a page out of search results,
 * it does not make the page private. Anything rendered is public. So workflow
 * state stays in the content model, where editors and `articles.test.ts` can
 * read it, and never reaches the template.
 *
 * The honesty rules this replaces are still enforced, structurally, elsewhere:
 * an unpublished article carries no publication date (`article-byline.tsx`),
 * is `noindex` and is absent from the sitemap. It makes no claim it has not
 * earned — it simply does not narrate its own workflow.
 */

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
 * A list of outbound links under a heading. Shared by the two blocks below.
 */
function LinkList({ items }: { items: readonly ArticleSource[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item.url} className="text-body-sm text-foreground-muted">
          <a
            href={item.url}
            rel="noreferrer"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            {item.label}
          </a>{" "}
          — {item.publisher}
        </li>
      ))}
    </ul>
  );
}

/**
 * The evidence behind the article.
 *
 * ## Why this is not the same block as "Where to go next"
 *
 * These two used to be one list, and eleven articles cited the same
 * veterinary association homepage under a heading reading "Sources". That
 * link is genuinely useful — it is how you find your own province's
 * regulator — but it supports no claim in any of those articles. A reader
 * scanning for whether a piece is sourced saw a citation and got a directory.
 *
 * So the split is by *promise*: this heading says "here is where we got
 * that", and an entry earns it only if following the link lands on the thing
 * the article says. `ArticleResources` says "here is where you look yours
 * up", which is a different and equally honest offer.
 *
 * The article's `needsVerification` list — claims an editor still has to
 * confirm — is deliberately rendered by neither; see the note above
 * `VeterinaryBoundary`.
 */
export function ArticleSources({ article }: ArticleSourcesProps) {
  const sources = article.sources ?? [];

  if (sources.length === 0) {
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
        Sources
      </h2>
      <p className="mt-2 text-body-sm text-foreground-muted">
        The publications behind the specific claims above.
      </p>

      <LinkList items={sources} />
    </section>
  );
}

export interface ArticleResourcesProps {
  article: Article;
}

/**
 * Directories, regulators and official tools — useful, but not evidence.
 *
 * Almost everything in this project varies by province, municipality,
 * practice or insurer, and the honest answer to most specifics is "look yours
 * up". This block is where that lookup lives, named as what it is.
 */
export function ArticleResources({ article }: ArticleResourcesProps) {
  const resources = article.resources ?? [];

  if (resources.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="article-resources-heading"
      className="border-t border-border pt-6"
    >
      <h2
        id="article-resources-heading"
        className="font-sans text-label uppercase text-foreground-subtle"
      >
        Where to go next
      </h2>
      <p className="mt-2 text-body-sm text-foreground-muted">
        Official directories and regulators, for the parts that depend on where you live.
      </p>

      <LinkList items={resources} />
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
