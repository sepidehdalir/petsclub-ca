import type { Metadata } from "next";
import Link from "next/link";

import { DemoContentNotice } from "@/components/shared/demo-content-notice";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import {
  communityCategoryPath,
  findCommunityGroup,
} from "@/features/community/taxonomy";
import { LostFoundCard } from "@/features/lost-found/components/lost-found-card";
import { demoLostFoundReports } from "@/features/lost-found/fixtures";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Lost & Found pets",
  description:
    "Community help for lost and found pets across Canada. Post a missing dog or cat, or help reunite a found pet with their family.",
  path: "/lost-found",
});

/** Practical first steps, kept short and non-prescriptive. */
const firstSteps = [
  {
    title: "Search close to home first",
    body: "Most lost cats are found within a few houses of where they went missing, and frightened dogs often circle back.",
  },
  {
    title: "Call the local shelters and clinics",
    body: "File a report with your municipal animal services and nearby veterinary clinics so a found pet can be matched to you.",
  },
  {
    title: "Check the microchip registry",
    body: "Confirm your contact details are current with your microchip provider — an out-of-date phone number is the most common reason a chip fails.",
  },
] as const;

export default function LostFoundPage() {
  const lostFoundGroup = findCommunityGroup("lost-and-found");

  return (
    <>
      <PageHeader
        eyebrow="Lost & Found"
        title="Lost & Found pets in Canada"
        description="When a pet goes missing, the first hours matter most. PetsClub is building a Canada-wide Lost & Found so a report reaches the people nearby who can actually help."
        breadcrumbs={[{ name: "Lost & Found", path: "/lost-found" }]}
        actions={
          <ButtonLink href="/community/lost-dogs">Go to Lost &amp; Found categories</ButtonLink>
        }
      />

      <Section aria-labelledby="lf-status-heading">
        <Container>
          <SectionHeading
            id="lf-status-heading"
            eyebrow="Status"
            title="What exists today"
            description="Lost & Found currently lives in the community forums. A dedicated tool with local alerts, photo uploads and searchable reports is planned for a later milestone."
          />

          {lostFoundGroup ? (
            <Card className="mt-8 overflow-hidden">
              <ul className="divide-y divide-border">
                {lostFoundGroup.children.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={communityCategoryPath(category.slug)}
                      className="block transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
                    >
                      <CardBody className="space-y-1 py-4">
                        <span className="block font-sans text-base font-semibold text-foreground">
                          {category.name}
                        </span>
                        <span className="block text-sm leading-relaxed text-foreground-muted">
                          {category.description}
                        </span>
                      </CardBody>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="lf-steps-heading">
        <Container>
          <SectionHeading
            id="lf-steps-heading"
            eyebrow="If your pet is missing"
            title="Three things worth doing right now"
            description="General guidance only. Your municipality and your veterinarian are the authorities on local procedure."
          />

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {firstSteps.map((step, index) => (
              <li key={step.title} className="flex">
                <Card className="w-full">
                  <CardBody className="space-y-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pine-100 text-sm font-semibold text-pine-800"
                    >
                      {index + 1}
                    </span>
                    <h3 className="font-sans text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground-muted">{step.body}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section aria-labelledby="lf-preview-heading">
        <Container>
          <SectionHeading
            id="lf-preview-heading"
            eyebrow="Coming soon"
            title="What a report will look like"
            description="The planned report format: species, distinguishing details, location and how recent the sighting is."
          />

          <DemoContentNotice className="mt-6">
            Sample layout only — these are not real missing pets
          </DemoContentNotice>

          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoLostFoundReports.map((report) => (
              <li key={report.id} className="flex">
                <LostFoundCard report={report} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
