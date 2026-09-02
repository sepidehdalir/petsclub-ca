import type { Metadata } from "next";
import Link from "next/link";

import { DemoContentNotice } from "@/components/shared/demo-content-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { ArticleListSection } from "@/features/editorial/components/article-list-section";
import { GuideCard } from "@/features/editorial/components/guide-card";
import { plannedGuides } from "@/features/editorial/fixtures";
import { createMetadata } from "@/lib/seo/metadata";
import { getMediaAsset } from "@/media/manifest";

export const metadata: Metadata = createMetadata({
  title: "Canada Guides",
  description:
    "Canada-specific pet guides covering costs, insurance, nutrition and care — researched and reviewed by the Pet Club editorial team.",
  path: "/guides",
});

/** What a published Pet Club guide will commit to. */
const editorialPrinciples = [
  {
    title: "Canadian by default",
    body: "Prices in Canadian dollars, products actually sold here, and rules that reflect provincial reality rather than a US template.",
  },
  {
    title: "Sourced and dated",
    body: "Health and legal claims are checked against veterinary guidelines and government sources, and we link the ones you can follow. Corrections are published rather than quietly edited.",
  },
  {
    title: "Not veterinary advice",
    body: "Guides explain what to expect and what to ask. They never replace an examination by a licensed veterinarian.",
  },
] as const;

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Editorial"
        title="Canada Guides"
        description="Practical, Canada-specific guides on what pet care actually costs, what to feed, and how to plan for the things that go wrong."
        breadcrumbs={[{ name: "Canada Guides", path: "/guides" }]}
        media={{ asset: getMediaAsset("guides-winter-walk") }}
        actions={
          <ButtonLink href="/community" variant="editorial">
            Ask the Community
          </ButtonLink>
        }
      />

      <ArticleListSection
        surfacePath="/guides"
        id="published-guides-heading"
        eyebrow="Latest"
        title="Guides"
        description="Written for people looking after animals in this country — Canadian prices, Canadian products, Canadian rules."
      />

      <Section tone="muted" aria-labelledby="planned-guides-heading">
        <Container>
          <SectionHeading
            id="planned-guides-heading"
            eyebrow="Commissioned"
            title="What we are writing next"
            description="Commissioned titles that have not been written yet. They are not articles, and they do not link anywhere."
          />

          <DemoContentNotice className="mt-6">
            Planned titles — nothing here has been written yet
          </DemoContentNotice>

          {/* Two columns, not four: the list is down to the titles that have
              not been written yet, and a four-track grid holding two cards
              reads as a section that lost something. */}
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {plannedGuides.map((guide) => (
              <li key={guide.id} className="flex">
                <GuideCard guide={guide} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section aria-labelledby="principles-heading">
        <Container>
          <SectionHeading
            id="principles-heading"
            eyebrow="How we work"
            title="Our editorial standards"
            description="The rules a Pet Club guide has to meet before it is published."
          />

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {editorialPrinciples.map((principle) => (
              <li key={principle.title} className="flex">
                <Card className="w-full">
                  <CardBody className="space-y-2">
                    <h3 className="text-title-4 text-foreground">
                      {principle.title}
                    </h3>
                    <p className="text-body-sm text-foreground-muted">
                      {principle.body}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-body-sm text-foreground-muted">
            Read the full{" "}
            <Link
              href="/editorial-policy"
              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              editorial policy
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
