import type { Metadata } from "next";
import Link from "next/link";

import { DemoContentNotice } from "@/components/shared/demo-content-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { GuideCard } from "@/features/editorial/components/guide-card";
import { plannedGuides } from "@/features/editorial/fixtures";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Canada Guides",
  description:
    "Canada-specific pet guides covering costs, insurance, nutrition and care — researched and reviewed by the PetsClub editorial team.",
  path: "/guides",
});

/** What a published PetsClub guide will commit to. */
const editorialPrinciples = [
  {
    title: "Canadian by default",
    body: "Prices in Canadian dollars, products actually sold here, and rules that reflect provincial reality rather than a US template.",
  },
  {
    title: "Sourced and dated",
    body: "Every claim is attributed, every guide shows when it was last reviewed, and corrections are published rather than quietly edited.",
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
        actions={<ButtonLink href="/community">Ask the Community</ButtonLink>}
      />

      <Section aria-labelledby="planned-guides-heading">
        <Container>
          <SectionHeading
            id="planned-guides-heading"
            title="What we are writing first"
            description="These are the guides being researched now. Nothing has been published yet."
          />

          <DemoContentNotice className="mt-6">
            Planned titles — no article has been published yet
          </DemoContentNotice>

          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plannedGuides.map((guide) => (
              <li key={guide.id} className="flex">
                <GuideCard guide={guide} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="principles-heading">
        <Container>
          <SectionHeading
            id="principles-heading"
            eyebrow="How we work"
            title="Our editorial standards"
            description="The rules a PetsClub guide has to meet before it is published."
          />

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {editorialPrinciples.map((principle) => (
              <li key={principle.title} className="flex">
                <Card className="w-full">
                  <CardBody className="space-y-2">
                    <h3 className="font-sans text-base font-semibold text-foreground">
                      {principle.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground-muted">
                      {principle.body}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-foreground-muted">
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
