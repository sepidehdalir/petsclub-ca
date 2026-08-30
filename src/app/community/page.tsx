import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Container, Section } from "@/components/ui/layout-primitives";
import { CategoryGroupList } from "@/features/community/components/category-group-list";
import { allCommunityCategories, communityTaxonomy } from "@/features/community/taxonomy";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Community",
  description:
    "Discussion categories for Canadian pet parents — dogs, cats, health, food, training, Canadian pet life and Lost & Found.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="PetsClub Community"
        description={`Ask a question, share what worked, or read what other Canadian pet parents have been through. ${allCommunityCategories.length} categories across ${communityTaxonomy.length} areas.`}
        breadcrumbs={[{ name: "Community", path: "/community" }]}
      />

      {/* Jump links: with 25 categories, an in-page index is faster than a
          long scroll and gives the taxonomy a crawlable internal link block. */}
      <Section spacing="compact" as="nav" aria-label="Community areas">
        <Container>
          <ul className="flex flex-wrap gap-2">
            {communityTaxonomy.map((group) => (
              <li key={group.slug}>
                <a
                  href={`#${group.slug}`}
                  className="inline-flex rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-pine-600 hover:text-pine-800"
                >
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="compact" className="pb-16 sm:pb-20">
        <Container>
          <div className="space-y-14">
            {communityTaxonomy.map((group) => (
              <CategoryGroupList key={group.slug} group={group} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
