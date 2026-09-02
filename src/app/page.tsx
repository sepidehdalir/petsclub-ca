import type { Metadata } from "next";

import { DemoContentNotice } from "@/components/shared/demo-content-notice";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, LinkCard } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { siteConfig } from "@/config/site";
import { ThreadPreviewCard } from "@/features/community/components/thread-preview-card";
import { demoThreads } from "@/features/community/fixtures";
import { communityTaxonomy } from "@/features/community/taxonomy";
import { GuideCard } from "@/features/editorial/components/guide-card";
import { plannedGuides } from "@/features/editorial/fixtures";
import { LostFoundCard } from "@/features/lost-found/components/lost-found-card";
import { demoLostFoundReports } from "@/features/lost-found/fixtures";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  path: "/",
  description: siteConfig.description,
});

/** Topic entry points surfaced in the "Explore" grid. */
const exploreTopics = [
  {
    href: "/dogs",
    title: "Dogs",
    description: "Puppies, health, nutrition, training and breeds.",
  },
  {
    href: "/cats",
    title: "Cats",
    description: "Kittens, behaviour, health and indoor enrichment.",
  },
  {
    href: "/health",
    title: "Health",
    description: "Symptoms, prevention and working with your vet.",
  },
  {
    href: "/food",
    title: "Food",
    description: "Diets, ingredients and brands sold in Canada.",
  },
  {
    href: "/training",
    title: "Training",
    description: "Everyday skills, behaviour and building routines.",
  },
  {
    href: "/guides",
    title: "Canada Guides",
    description: "Costs, insurance, travel and provincial rules.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <Section as="section" spacing="spacious" aria-labelledby="hero-heading">
        <Container>
          <div className="max-w-3xl">
            <p className="text-label-lg uppercase text-pine-700">
              {siteConfig.legalName}
            </p>

            <h1
              id="hero-heading"
              className="mt-4 text-display-3 text-foreground sm:text-display-2 lg:text-display-1"
            >
              Canada&rsquo;s community for pet parents.
            </h1>

            <p className="mt-6 max-w-2xl text-body-lg text-foreground-muted">
              Ask questions, share experiences, and discover trusted pet advice from across
              Canada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/community" size="lg">
                Ask the Community
              </ButtonLink>
              <ButtonLink href="/community" size="lg" variant="secondary">
                Explore Discussions
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------- Trending discussions */}
      <Section tone="muted" aria-labelledby="trending-heading">
        <Container>
          <SectionHeading
            id="trending-heading"
            eyebrow="Community"
            title="Trending discussions"
            description="The questions Canadian pet parents are working through right now."
            action={
              <ButtonLink href="/community" variant="secondary" size="sm">
                Browse all categories
              </ButtonLink>
            }
          />

          <DemoContentNotice className="mt-6">
            Sample discussions — the community opens in an upcoming release
          </DemoContentNotice>

          <Card className="mt-4">
            <CardBody className="py-2">
              {demoThreads.map((thread) => (
                <ThreadPreviewCard key={thread.id} thread={thread} />
              ))}
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Explore */}
      <Section aria-labelledby="explore-heading">
        <Container>
          <SectionHeading
            id="explore-heading"
            eyebrow="Explore"
            title="Find your corner of The Pet Club"
            description="Start with a topic, then dive into the discussions and guides underneath it."
          />

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exploreTopics.map((topic) => (
              <li key={topic.href} className="flex">
                <LinkCard
                  className="w-full"
                  href={topic.href}
                  title={topic.title}
                  description={topic.description}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Latest guides */}
      <Section tone="muted" aria-labelledby="guides-heading">
        <Container>
          <SectionHeading
            id="guides-heading"
            eyebrow="Editorial"
            title="Guides we are writing"
            description="Researched, Canada-specific guides written and reviewed by our editorial team."
            action={
              <ButtonLink href="/guides" variant="secondary" size="sm">
                See the guide plan
              </ButtonLink>
            }
          />

          <DemoContentNotice className="mt-6">
            Planned titles — no article has been published yet
          </DemoContentNotice>

          {/* Two columns while only two titles remain unwritten. */}
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {plannedGuides.map((guide) => (
              <li key={guide.id} className="flex">
                <GuideCard guide={guide} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------ Ask the community CTA */}
      <Section aria-labelledby="ask-heading">
        <Container>
          <div className="rounded-card border border-pine-200 bg-pine-50 px-6 py-12 sm:px-12 sm:py-16">
            <div className="max-w-2xl">
              <h2
                id="ask-heading"
                className="text-title-2 text-pine-900 sm:text-title-1"
              >
                Have a question about your pet?
              </h2>
              <p className="mt-4 text-body-lg text-pine-900/80">
                Whether it is a first-week puppy problem, a vet bill you did not expect, or a
                cat that has decided the litter box is optional — ask the people who have been
                there.
              </p>
              <div className="mt-8">
                <ButtonLink href="/community" size="lg">
                  Ask the Community
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- Lost & Found preview */}
      <Section tone="muted" aria-labelledby="lost-found-heading">
        <Container>
          <SectionHeading
            id="lost-found-heading"
            eyebrow="Lost & Found"
            title="Helping Canadian pets get home"
            description="A dedicated Lost & Found tool with local alerts and searchable reports is on the roadmap."
            action={
              <ButtonLink href="/lost-found" variant="secondary" size="sm">
                About Lost &amp; Found
              </ButtonLink>
            }
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

      {/* ---------------------------------------------------------- Join the club */}
      <Section aria-labelledby="join-heading">
        <Container width="prose" className="text-center">
          <h2 id="join-heading" className="text-display-3 text-foreground sm:text-display-2">
            Join Canadian pet parents sharing advice, experiences and stories.
          </h2>
          <p className="mt-4 text-body-lg text-foreground-muted">
            Creating an account takes a minute, and it is free. Membership will let you post
            questions, follow topics and keep track of the answers that helped.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/sign-up" size="lg">
              Create your account
            </ButtonLink>
            <ButtonLink href="/community" size="lg" variant="secondary">
              Browse the community
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/*
        Category anchors give the taxonomy an internal-linking surface on the
        highest-authority page, without padding the homepage with copy.
      */}
      <Section as="section" spacing="compact" tone="muted" aria-labelledby="all-topics-heading">
        <Container>
          <h2
            id="all-topics-heading"
            className="font-sans text-label-lg uppercase text-foreground-muted"
          >
            All community categories
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {communityTaxonomy.map((group) => (
              <li key={group.slug}>
                <a
                  href={`/community#${group.slug}`}
                  className="text-body-sm text-foreground-muted transition-colors hover:text-pine-700 hover:underline"
                >
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
