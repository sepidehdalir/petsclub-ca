import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { LinkCard } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { siteConfig } from "@/config/site";
import { communityTaxonomy } from "@/features/community/taxonomy";
import { ArticleListSection } from "@/features/editorial/components/article-list-section";
import { SavedJourneyLink } from "@/features/puppy/components/saved-journey-link";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  path: "/",
  description: "Age-based puppy guides, device-saved checklists and practical pet care reading for life in Canada. Start the Puppy Journey without an account.",
});

const exploreTopics = [
  { href: "/dogs", title: "Dogs", description: "Puppies, health, nutrition, training and breeds." },
  { href: "/cats", title: "Cats", description: "Kittens, behaviour, health and indoor enrichment." },
  { href: "/health", title: "Health", description: "Symptoms, prevention and working with your vet." },
  { href: "/food", title: "Food", description: "Diets, ingredients and brands sold in Canada." },
  { href: "/training", title: "Training", description: "Everyday skills, behaviour and building routines." },
  { href: "/guides", title: "Canada Guides", description: "Costs, insurance, travel and provincial rules." },
] as const;

export default function HomePage() {
  return (
    <>
      <Section spacing="spacious" aria-labelledby="hero-heading">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <p className="text-label-lg uppercase text-pine-700">{siteConfig.legalName}</p>
              <h1 id="hero-heading" className="mt-4 text-display-3 text-foreground sm:text-display-2 lg:text-display-1">
                Your puppy. Their next small step.
              </h1>
              <p className="mt-6 max-w-2xl text-body-lg text-foreground-muted">
                Find the guide for their age, keep track of this stage&rsquo;s checklist,
                and return to the Journey as they grow. Made for pet life in Canada.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/puppy" size="lg" className="h-auto min-h-12 whitespace-normal py-3 text-center">
                  Start the Puppy Journey
                </ButtonLink>
                <ButtonLink href="/guides" size="lg" variant="secondary" className="h-auto min-h-12 whitespace-normal py-3 text-center">
                  Browse Canadian guides
                </ButtonLink>
              </div>
              <p className="mt-3 text-body-sm text-foreground-muted">No account or email required to get your guide. Saved checklists stay on this device.</p>
              <SavedJourneyLink />
            </div>
            <aside className="rounded-card border border-pine-200 bg-pine-50 p-6 sm:p-8 lg:col-span-4" aria-labelledby="small-steps-heading">
              <h2 id="small-steps-heading" className="text-title-2 text-pine-900">A useful next step, not another endless feed.</h2>
              <ol className="mt-6 space-y-5 text-body-sm text-foreground-reading">
                <li><strong className="block text-pine-900">Find your stage</strong>Start with your puppy&rsquo;s date of birth, or browse an age guide.</li>
                <li><strong className="block text-pine-900">Make a little progress</strong>Read the guidance and mark the checklist steps you have taken.</li>
                <li><strong className="block text-pine-900">Pick up where you left off</strong>Return on the same device. Keep a progress card when you have something to celebrate.</li>
              </ol>
              <p className="mt-6 border-t border-pine-200 pt-4 text-caption text-foreground-muted">General information, not veterinary diagnosis or treatment.</p>
            </aside>
          </div>
        </Container>
      </Section>

      <ArticleListSection
        surfacePath="/guides"
        id="guides-heading"
        eyebrow="Editorial"
        title="Canadian pet care guides"
        description="Practical guides to caring for pets in Canada, with sources you can follow."
        tone="muted"
        limit={3}
        action={<ButtonLink href="/guides" variant="secondary" size="sm">Browse all Canadian pet guides</ButtonLink>}
      />

      <Section aria-labelledby="explore-heading">
        <Container>
          <SectionHeading id="explore-heading" eyebrow="Explore" title="Here for a different question?"
            description="The Puppy Journey is one way in. Our wider guide library covers life with dogs and cats in Canada." />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exploreTopics.map((topic) => (
              <li key={topic.href} className="flex"><LinkCard className="w-full" href={topic.href} title={topic.title} description={topic.description} /></li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="start-heading">
        <Container>
          <div className="max-w-2xl">
            <h2 id="start-heading" className="text-title-1 text-foreground">Not ready to enter details? Start with a guide.</h2>
            <p className="mt-4 text-body-lg text-foreground-muted">The public Journey stages are available to read without a profile. Personalising the Journey is optional.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/puppy/8-weeks" className="h-auto min-h-11 whitespace-normal py-3 text-center">Explore the 8-week guide</ButtonLink>
              <ButtonLink href="/puppy" variant="secondary">See the whole Journey</ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="all-topics-heading">
        <Container>
          <h2 id="all-topics-heading" className="font-sans text-label-lg uppercase text-foreground-muted">Community topics</h2>
          <p className="mt-3 text-body-sm text-foreground-muted">The community area is being prepared. Its sample discussions are labelled; they are not live member activity.</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {communityTaxonomy.map((group) => (
              <li key={group.slug}><a href={`/community#${group.slug}`} className="text-body-sm text-foreground-muted hover:text-pine-700 hover:underline">{group.name}</a></li>
            ))}
          </ul>
          <p className="mt-5 text-body-sm"><a href="/lost-found" className="text-pine-700 underline underline-offset-4">About the planned Lost &amp; Found tool</a></p>
        </Container>
      </Section>
    </>
  );
}
