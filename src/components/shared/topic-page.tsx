import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoContentNotice } from "@/components/shared/demo-content-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { EmptyState } from "@/components/ui/states";
import { findTopic } from "@/config/topics";
import {
  communityCategoryPath,
  findCommunityCategory,
} from "@/features/community/taxonomy";
import { ArticleListSection } from "@/features/editorial/components/article-list-section";
import { ArticleCard } from "@/features/editorial/components/article-card";
import { publishedArticles } from "@/features/editorial/articles";
import { GuideCard } from "@/features/editorial/components/guide-card";
import { plannedGuides } from "@/features/editorial/fixtures";
import { getMediaAsset } from "@/media/manifest";

export interface TopicPageProps {
  /** Route path of the topic to render, e.g. `/dogs`. */
  path: string;
}

/**
 * Shared layout for every `/[topic]` section front.
 *
 * One template rather than five near-identical route files: the topics differ
 * only in their copy and in which categories and guides they surface, so that
 * variation lives in `config/topics.ts` and the structure lives here.
 */
export function TopicPage({ path }: TopicPageProps) {
  const topic = findTopic(path);

  // Unreachable via routing — every caller passes a literal path — but this
  // keeps the component total rather than silently rendering an empty page.
  if (!topic) {
    notFound();
  }

  const categories = topic.categorySlugs
    .map((slug) => findCommunityCategory(slug))
    .filter((match): match is NonNullable<typeof match> => match !== null);

  const guides = plannedGuides.filter((guide) => topic.guideIds.includes(guide.id));
  const topicalGuides = (path === "/food" || path === "/training")
    ? publishedArticles().filter((article) => {
        const terms = [article.title, ...article.tags].join(" ").toLowerCase();
        return path === "/food"
          ? /food|nutrition|feeding|diet|kibble/.test(terms)
          : /training|socialisation|leash|recall|behaviour|crate/.test(terms);
      }).slice(0, 6)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Topic"
        title={topic.title}
        description={topic.description}
        breadcrumbs={[{ name: topic.name, path: topic.path }]}
        media={{ asset: getMediaAsset(topic.mediaId) }}
        actions={
          <>
            <ButtonLink href="/guides" variant="editorial">
              Read Canadian guides
            </ButtonLink>
            <ButtonLink href="/community" variant="editorialQuiet">
              Explore future community topics
            </ButtonLink>
          </>
        }
      />

      {/* Published articles lead, where there are any. `ArticleListSection`
          renders nothing when a topic has none, so `/health`, `/food` and
          `/training` are untouched until they do. */}
      <ArticleListSection
        surfacePath={topic.path}
        id="topic-articles-heading"
        // Tinted so the published band separates from the category list below
        // it. Without this the two run together: page header, articles and
        // categories would be three canvas sections in a row.
        tone="muted"
        eyebrow="Read"
        title={`${topic.name} guides`}
        // Deliberately not built from `topic.name`: pluralising a section
        // label into a possessive gives "dogs owners". A fixed line is the
        // right amount of cleverness here.
        description="Researched, Canada-specific writing from the Pet Club editorial team."
      />

      {topicalGuides.length > 0 ? (
        <Section tone="muted" aria-labelledby="topic-guide-picks-heading">
          <Container>
            <SectionHeading id="topic-guide-picks-heading"
              eyebrow="Selected guides"
              title={path === "/food" ? "Food and nutrition reading" : "Training for real life"}
              description="Published advice selected from our Canadian pet editorial library."
              action={<ButtonLink href="/guides" variant="editorialQuiet">All guides ↗</ButtonLink>}
            />
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topicalGuides.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section aria-labelledby="topic-categories-heading">
        <Container>
          <SectionHeading
            id="topic-categories-heading"
            eyebrow="Explore"
            title={`${topic.name} community topics`}
            description="Browse editorial questions and related reading. Member posting and replies are not available yet."
          />

          <Card className="mt-8 overflow-hidden">
            <ul className="divide-y divide-border">
              {categories.map(({ category, group }) => (
                <li key={category.slug}>
                  <Link
                    href={communityCategoryPath(category.slug)}
                    className="block transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
                  >
                    <CardBody className="space-y-1 py-4">
                      <p className="text-label uppercase text-pine-700">
                        {group.name}
                      </p>
                      <h3 className="text-title-4 text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-body-sm text-foreground-muted">
                        {category.description}
                      </p>
                    </CardBody>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="topic-guides-heading">
        <Container>
          <SectionHeading
            id="topic-guides-heading"
            eyebrow="Editorial"
            title="On our editorial roadmap"
            description="Future article ideas, not yet published."
          />

          {guides.length > 0 ? (
            <>
              <DemoContentNotice className="mt-6">
                Planned titles — these are not live articles
              </DemoContentNotice>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => (
                  <li key={guide.id} className="flex">
                    <GuideCard guide={guide} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              className="mt-8"
              title={`No ${topic.name.toLowerCase()} guides commissioned yet`}
              description="Our published guide library already has useful advice. Explore it while new topics are researched."
              action={<ButtonLink href="/guides">Browse published guides</ButtonLink>}
            />
          )}
        </Container>
      </Section>
    </>
  );
}
