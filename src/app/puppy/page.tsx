import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { OnboardingForm } from "@/features/puppy/components/onboarding-form";
import { JourneyTimeline } from "@/features/puppy/components/journey-timeline";
import { createMetadata } from "@/lib/seo/metadata";
import { getMediaAsset } from "@/media/manifest";

export const metadata: Metadata = createMetadata({
  title: "Puppy Journey",
  description:
    "An age-aware guide to your puppy's first year, built around where you live and when your puppy was born.",
  path: "/puppy",
  // In review with the stages themselves. Nothing here is indexed until the
  // Journey has been reviewed to the same standard as the article library.
  noIndex: true,
});

/** What the Journey does differently, stated plainly rather than as marketing. */
const principles = [
  {
    title: "Age-aware, not article-shaped",
    body: "A puppy's needs change week to week in the first few months. The Journey shows what matters now rather than a single page covering three months at once.",
  },
  {
    title: "Canadian by default",
    body: "Rabies rules, licensing thresholds and parasite timing all differ across this country. Tell us your province and the Journey tells you what actually applies where you are.",
  },
  {
    title: "Questions, not a schedule",
    body: "We do not publish a vaccination timetable, because the right one depends on your puppy, your region and your veterinarian. We give you the questions that get you the right answer.",
  },
] as const;

export default function PuppyJourneyPage() {
  return (
    <>
      <PageHeader
        eyebrow="New"
        title="Puppy Journey"
        description="Tell us when your puppy was born and we will show you what matters this week — the development, the training, the questions for your next appointment, and what is coming next."
        breadcrumbs={[{ name: "Puppy Journey", path: "/puppy" }]}
        media={{ asset: getMediaAsset("puppy-eleven-weeks") }}
      />

      <Section spacing="compact">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="max-w-xl">
                <h2 className="text-title-1 text-foreground">Start your Journey</h2>
                <p className="mt-3 text-body text-foreground-muted">
                  One field is required. The other two make the guidance more specific to your
                  dog and your province.
                </p>

                <div className="mt-8">
                  <OnboardingForm />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-card border border-border bg-surface-muted p-6 sm:p-7">
                {/* No puppy has been entered yet, so no row is "you are here".
                    The 11-week row still reads as the finished one — it is the
                    only entry without a "soon" badge. */}
                <JourneyTimeline currentSlug="" />
              </div>

              <p className="mt-5 text-body-sm text-foreground-muted">
                The 11-week stage is written and reviewed. You can{" "}
                <Link
                  href="/puppy/11-weeks"
                  className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
                >
                  read it without entering anything
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="journey-principles-heading">
        <Container>
          <SectionHeading
            id="journey-principles-heading"
            eyebrow="How this works"
            title="What makes this different"
          />

          <ul className="mt-8 grid gap-6 sm:grid-cols-3 lg:gap-8">
            {principles.map((principle) => (
              <li key={principle.title} className="flex">
                <Card className="w-full">
                  <CardBody className="sm:p-6">
                    <h3 className="text-title-3 text-foreground">{principle.title}</h3>
                    <p className="mt-2 text-body-sm text-foreground-muted">{principle.body}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
