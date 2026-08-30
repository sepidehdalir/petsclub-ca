import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { EmptyState } from "@/components/ui/states";
import {
  allCommunityCategories,
  communityCategoryPath,
  findCommunityCategory,
} from "@/features/community/taxonomy";
import { createMetadata } from "@/lib/seo/metadata";

/**
 * Every category is known at build time, so all 25 pages are prerendered and
 * served from the CDN. `dynamicParams = false` makes an unknown slug a clean
 * 404 rather than an on-demand render of a category that does not exist.
 */
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
    return createMetadata({ title: "Category not found", noIndex: true });
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

  if (!match) {
    notFound();
  }

  const { category, group } = match;
  const siblings = group.children.filter((child) => child.slug !== category.slug);

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
      />

      <Section aria-labelledby="discussions-heading">
        <Container>
          <SectionHeading
            id="discussions-heading"
            title="Discussions"
            description={`Questions and conversations in ${category.name}.`}
          />

          {/*
            No discussions exist yet, and none are invented here. The community
            engine — posting, replying, sorting and moderation — is Milestone 2.
          */}
          <EmptyState
            className="mt-8"
            title="No discussions yet"
            description="Posting opens when the community engine launches. Until then, browse the rest of the categories to see what The Pet Club will cover."
            action={
              <ButtonLink href="/community" variant="secondary">
                Browse all categories
              </ButtonLink>
            }
          />
        </Container>
      </Section>

      {siblings.length > 0 ? (
        <Section tone="muted" spacing="compact" aria-labelledby="related-heading">
          <Container>
            <SectionHeading
              id="related-heading"
              headingLevel="h2"
              title={`More in ${group.name}`}
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
                        <span className="block font-sans text-base font-semibold text-foreground">
                          {sibling.name}
                        </span>
                        <span className="block text-sm leading-relaxed text-foreground-muted">
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
