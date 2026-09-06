import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container, Section } from "@/components/ui/layout-primitives";
import { Media } from "@/components/ui/media";
import type { PuppyStage } from "@/features/puppy/model";
import type { JourneyContext } from "@/features/puppy/resolve";
import { resolveSources, resolveStage } from "@/features/puppy/resolve";
import { JourneyMasthead } from "@/features/puppy/components/journey-masthead";
import { JourneyTimeline } from "@/features/puppy/components/journey-timeline";
import { StageChecklist } from "@/features/puppy/components/stage-checklist";
import { StageSection } from "@/features/puppy/components/stage-section";
import { getMediaAsset } from "@/media/manifest";

export interface StageViewProps {
  stage: PuppyStage;
  context?: JourneyContext;
  /** Overrides the stage title — the personalised view leads with the age. */
  headline?: string;
  /** Breed, size, province, DOB. */
  facts?: readonly string[];
  /** Rendered above the masthead in the personalised view. */
  banner?: React.ReactNode;
  /** Trail excluding "Home". Omitted on the personalised view, which is noindex. */
  breadcrumbs?: readonly { name: string; path: string }[];
}

/**
 * The shared rendering of a stage.
 *
 * Used by every public stage page and by the personalised
 * `/my-puppy` view, so the two cannot drift apart in content — the only
 * differences are the headline, the fact row, and the banner. That matters
 * for more than tidiness: if the personalised route rendered its own copy,
 * the canonical relationship between the two would be a claim rather than a
 * fact.
 *
 * ## Layout
 *
 * One column on a phone, with sections as native disclosures. From `lg`, a
 * persistent stage rail on the left and the content on the right — the rail is
 * genuinely useful on a long page and costs nothing on a small screen, where
 * it moves below the content rather than being hidden.
 */
export function StageView({
  stage,
  context = {},
  headline,
  facts,
  banner,
  breadcrumbs,
}: StageViewProps) {
  const sections = resolveStage(stage, context);
  const sources = resolveSources(stage, context);
  const asset = getMediaAsset(stage.mediaId);

  return (
    <article>
      <header className="border-b border-border bg-surface">
        <Container className="pb-8 pt-5 sm:pt-9">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumbs items={breadcrumbs} className="mb-5 sm:mb-7" />
          ) : null}
          {banner}
          <JourneyMasthead
            stageLabel={stage.label}
            headline={headline ?? stage.title}
            deck={stage.deck}
            facts={facts}
            className={banner ? "mt-6" : undefined}
          />
        </Container>

        <Container className="pb-10 sm:pb-12">
          <Media
            asset={asset}
            alt={stage.mediaAlt}
            ratio="lead"
            priority
            showCredit
            sizes="(min-width: 1152px) 1088px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
          />
        </Container>
      </header>

      <Section spacing="compact">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Rail. Sticky from lg, where there is room for it to be useful.
                `top` has to clear the site masthead, which is itself sticky at
                the top of the viewport and about 81px tall — at a smaller
                offset the rail's heading and first stages scroll underneath
                it and are simply not readable.

                The hybrid roadmap made this taller than a laptop viewport
                (thirteen stages across four phases, ~1000px), so it is capped
                and scrolls internally. Without that, adolescence and maturity
                are permanently below the fold and unreachable. `overscroll-contain`
                stops that scroll chaining back into the article. */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:overscroll-contain">
                <JourneyTimeline currentSlug={stage.slug} className="hidden lg:block" />
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="max-w-[68ch]">
                {sections.map((section, index) => (
                  <StageSection
                    key={section.id}
                    section={section}
                    defaultOpen={index === 0}
                  />
                ))}

                <div className="mt-10 space-y-8 border-t border-border pt-8">
                  <StageChecklist items={stage.checklist} />

                  <section aria-labelledby="stage-boundary-heading">
                    <h2
                      id="stage-boundary-heading"
                      className="font-sans text-label uppercase text-foreground-subtle"
                    >
                      General information, not veterinary advice
                    </h2>
                    <p className="mt-2 text-body-sm text-foreground-muted">
                      The Pet Club is written by researchers and writers, not veterinarians. This
                      describes what typically happens at this age and what to ask about. It does
                      not diagnose, it does not recommend treatment, and it is not a substitute for
                      examining your puppy — only a licensed veterinarian who has seen your dog can
                      do that. If something is wrong, or you are unsure, call your veterinary
                      practice or your nearest emergency clinic.
                    </p>
                  </section>

                  <section aria-labelledby="stage-sources-heading">
                    <h2
                      id="stage-sources-heading"
                      className="font-sans text-label uppercase text-foreground-subtle"
                    >
                      Sources
                    </h2>
                    <p className="mt-2 text-body-sm text-foreground-muted">
                      The publications behind the specific claims above.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {sources.map((source) => (
                        <li key={source.url} className="text-body-sm text-foreground-muted">
                          <a
                            href={source.url}
                            rel="noreferrer"
                            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
                          >
                            {source.label}
                          </a>{" "}
                          — {source.publisher}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {stage.resources && stage.resources.length > 0 ? (
                    <section aria-labelledby="stage-resources-heading">
                      <h2
                        id="stage-resources-heading"
                        className="font-sans text-label uppercase text-foreground-subtle"
                      >
                        Where to go next
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {stage.resources.map((resource) => (
                          <li key={resource.url} className="text-body-sm text-foreground-muted">
                            <a
                              href={resource.url}
                              rel="noreferrer"
                              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
                            >
                              {resource.label}
                            </a>{" "}
                            — {resource.publisher}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              </div>

              {/* The rail again, below the content, on small screens. */}
              <div className="mt-12 border-t border-border pt-8 lg:hidden">
                <JourneyTimeline currentSlug={stage.slug} />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </article>
  );
}
