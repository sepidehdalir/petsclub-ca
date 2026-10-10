import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import {
  allCommunityCategories,
  communityCategoryPath,
  findCommunityCategory,
} from "@/features/community/taxonomy";
import { editorialConversationStarters } from "@/features/community/editorial-conversation-starters";
import { ArticleCard } from "@/features/editorial/components/article-card";
import { publishedArticles } from "@/features/editorial/articles";
import { createMetadata } from "@/lib/seo/metadata";

/** Categories are static, and their editorial resources are approved articles. */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ categorySlug: string }> {
  return allCommunityCategories.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/community/[categorySlug]">,
): Promise<Metadata> {
  const { categorySlug } = await props.params;
  const match = findCommunityCategory(categorySlug);

  if (!match) {
    return createMetadata({ title: "Category not found", robots: "private-noindex" });
  }

  return createMetadata({
    title: `${match.category.name} — ${match.group.name}`,
    description: match.category.description,
    path: communityCategoryPath(categorySlug),
  });
}

export default async function CommunityCategoryPage(
  props: PageProps<"/community/[categorySlug]">,
) {
  const { categorySlug } = await props.params;
  const match = findCommunityCategory(categorySlug);
  if (!match) notFound();

  const { category, group } = match;
  const siblings = group.children.filter((child) => child.slug !== category.slug);
  const resources = publishedArticles()
    .filter((article) => article.relatedCategorySlugs?.includes(category.slug))
    .slice(0, 4);
  const prompts = editorialConversationStarters[category.slug] ?? [];

  return (
    <>
      <PageHeader
        eyebrow={group.name}
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { name: "Community", path: "/community" },
          { name: category.name, path: communityCategoryPath(category.slug) },
        ]}
        actions={
          <ButtonLink href="/guides" variant="editorialQuiet">
            Browse Canadian pet guides ↗
          </ButtonLink>
        }
      />

      {resources.length > 0 ? (
        <Section aria-labelledby="category-resources-heading">
          <Container>
            <SectionHeading
              id="category-resources-heading"
              title="Useful reads to get started"
              description="Published guides selected from The Pet Club editorial library — not community posts."
            />
            <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {resources.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 92vw"
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone={resources.length > 0 ? "muted" : "default"} aria-labelledby="conversation-heading">
        <Container>
          <SectionHeading
            id="conversation-heading"
            title="Ideas for future conversations"
            description="Editorial prompts to explore while we're preparing member posting. These are not real discussion threads or replies."
          />
          {prompts.length > 0 ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {prompts.map((prompt, index) => (
                <Card key={prompt} className="h-full overflow-hidden">
                  <CardBody className="flex h-full flex-col gap-4">
                    <span className="font-sans text-label uppercase text-pine-700">
                      Question {index + 1}
                    </span>
                    <h3 className="font-serif text-title-3 text-foreground">{prompt}</h3>
                    <p className="mt-auto text-body-sm text-foreground-muted">
                      Member answers are not open yet. For now, explore related Canadian pet guides.
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ButtonLink href="/guides">Explore published guides ↗</ButtonLink>
            <ButtonLink href="/community" variant="secondary">All community topics</ButtonLink>
          </div>
          <p className="mt-4 text-caption text-foreground-muted">
            This category is currently a reading resource. Posting, replies and member activity will be enabled in a separate release.
          </p>
        </Container>
      </Section>

      {siblings.length > 0 ? (
        <Section spacing="compact" aria-labelledby="related-heading">
          <Container>
            <SectionHeading
              id="related-heading"
              headingLevel="h2"
              title={`Explore more in ${group.name}`}
            />
            <Card className="mt-6 overflow-hidden">
              <ul className="divide-y divide-border">
                {siblings.map((sibling) => (
                  <li key={sibling.slug}>
                    <Link
                      href={communityCategoryPath(sibling.slug)}
                      className="block transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
                    >
                      <CardBody className="space-y-1 py-4">
                        <span className="block font-serif text-title-4 text-foreground">
                          {sibling.name}
                        </span>
                        <span className="block text-body-sm text-foreground-muted">
                          {sibling.description}
                        </span>
                      </CardBody>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
