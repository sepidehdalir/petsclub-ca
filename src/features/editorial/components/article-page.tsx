import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { Media } from "@/components/ui/media";
import {
  articlePath,
  getArticleSection,
  relatedArticles,
  type Article,
} from "@/features/editorial/articles";
import { findReviewer, getAuthor } from "@/features/editorial/authors";
import { ArticleByline } from "@/features/editorial/components/article-byline";
import { ArticleCard } from "@/features/editorial/components/article-card";
import {
  ArticleAuthorCard,
  ArticleResources,
  ArticleSources,
  KeyTakeaways,
  RelatedDiscussion,
  VeterinaryBoundary,
} from "@/features/editorial/components/article-furniture";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

export interface ArticlePageProps {
  article: Article;
  /** The compiled MDX body. */
  children: ReactNode;
}

/**
 * The article template.
 *
 * ## Why the measure changes down the page
 *
 * The headline, deck, body and furniture all sit in the `prose` container —
 * one narrow column, so the eye never has to hunt for the start of the next
 * line. The lead photograph is the single exception: it runs to the full page
 * width beneath them. That contrast between a wide picture and a narrow column
 * is most of what separates a magazine feature from a documentation page, and
 * it costs nothing but a second `Container`.
 *
 * ## Order
 *
 * Breadcrumb, section, headline, deck, byline, picture, takeaways, body, then
 * the furniture: veterinary boundary, sources, community, author.
 * Related reading closes the page on a tinted band so the article has a
 * visible end rather than trailing off.
 */
export function ArticlePage({ article, children }: ArticlePageProps) {
  const section = getArticleSection(article.section);
  const author = getAuthor(article.authorId);
  const reviewer = article.reviewerId ? findReviewer(article.reviewerId) : null;
  const asset = getMediaAsset(article.mediaId);
  const related = relatedArticles(article);
  const path = articlePath(article.slug);

  return (
    <article>
      <header className="border-b border-border bg-surface">
        <Container width="prose" className="pb-8 pt-5 sm:pt-9">
          <Breadcrumbs
            className="mb-5 sm:mb-7"
            // Home > Canada Guides > Dogs > this article. The section is a real
            // surface with its own listing page, so leaving it out both cost a
            // reader a step and left the `BreadcrumbList` claiming a flatter
            // hierarchy than the site actually has. Sections pointed at
            // `/guides` are skipped rather than repeating the hub.
            items={[
              { name: "Canada Guides", path: "/guides" },
              ...(section.surfacePath === "/guides"
                ? []
                : [{ name: section.name, path: section.surfacePath }]),
              { name: article.title, path },
            ]}
          />

          <p className="font-sans text-label uppercase">
            <Link href={section.surfacePath} className="text-pine-700 hover:text-pine-900">
              {section.name}
            </Link>
            {article.subcategory ? (
              <span className="text-foreground-subtle"> · {article.subcategory}</span>
            ) : null}
          </p>

          <h1 className="mt-3 text-display-3 text-foreground sm:text-display-2">
            {article.title}
          </h1>

          {/* The deck is the one piece of running text set in the serif above
              the body — it belongs to the article, not to the interface. */}
          <p className="mt-4 font-serif text-body-lg text-foreground-muted sm:text-deck">
            {article.deck}
          </p>

          <ArticleByline article={article} className="mt-6" />
        </Container>

        <Container className="pb-10 sm:pb-14">
          <Media
            asset={asset}
            alt={article.mediaAlt ?? asset.alt}
            ratio="lead"
            // The lead image, and the only one above the fold.
            priority
            showCredit
            sizes="(min-width: 1152px) 1088px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
          />
        </Container>
      </header>

      <Section spacing="compact">
        <Container width="prose">
          {article.keyTakeaways && article.keyTakeaways.length > 0 ? (
            <KeyTakeaways items={article.keyTakeaways} />
          ) : null}

          {/* `prose` sets the reading measure and `prose-article` the long-form
              step; both live in `globals.css` beside the type scale. */}
          <div className="prose prose-article mt-9 sm:mt-10">{children}</div>

          <div className="mt-12 space-y-8">
            {article.veterinaryNotice ? <VeterinaryBoundary /> : null}
            <ArticleSources article={article} />
            <ArticleResources article={article} />
            <RelatedDiscussion categorySlugs={article.relatedCategorySlugs ?? []} />
            <ArticleAuthorCard article={article} />
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="muted" aria-labelledby="related-reading-heading">
          <Container>
            <SectionHeading
              id="related-reading-heading"
              eyebrow="Related reading"
              title="More from The Pet Club"
            />

            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-10">
              {related.map((item) => (
                <li key={item.slug} className="flex">
                  <ArticleCard
                    article={item}
                    className="w-full"
                    sizes="(min-width: 1152px) 528px, (min-width: 640px) 46vw, 92vw"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <JsonLd
        schema={articleSchema({
          headline: article.title,
          description: article.deck,
          path,
          // Only once the article has actually been published. `ArticleByline`
          // suppresses the date for an `in-review` article, and the markup a
          // crawler reads must not contradict the page a person reads.
          ...(article.status === "published"
            ? { datePublished: article.publishedAt, dateModified: article.updatedAt }
            : {}),
          author: { name: author.name, kind: author.kind },
          section: section.name,
          imagePath: asset.src.src,
          // Only ever set from the reviewer register; there is no path here
          // that can invent one. See `features/editorial/authors.ts`.
          ...(reviewer
            ? { reviewer: { name: reviewer.name, credentials: reviewer.credentials } }
            : {}),
        })}
      />
    </article>
  );
}
