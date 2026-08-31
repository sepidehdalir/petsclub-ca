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
            <ButtonLink href="/community">Ask the Community</ButtonLink>
            <ButtonLink href="/community" variant="secondary">
              Browse all categories
            </ButtonLink>
          </>
        }
      />

      <Section aria-labelledby="topic-categories-heading">
        <Container>
          <SectionHeading
            id="topic-categories-heading"
            eyebrow="Discuss"
            title={`${topic.name} discussion categories`}
            description="Every question, experience and recommendation on this topic lives in one of these categories."
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
            title={`${topic.name} guides`}
            description="Researched, Canada-specific guides from the Pet Club editorial team."
          />

          {guides.length > 0 ? (
            <>
              <DemoContentNotice className="mt-6">
                Planned titles — no article has been published yet
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
              description="The editorial platform launches in a later milestone. In the meantime, the community is the fastest way to get an answer."
              action={<ButtonLink href="/community">Ask the Community</ButtonLink>}
            />
          )}
        </Container>
      </Section>
    </>
  );
}
