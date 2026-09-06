import type { Metadata } from "next";
import Link from "next/link";

import { Container, Section } from "@/components/ui/layout-primitives";
import { ButtonLink } from "@/components/ui/button";
import {
  formatCivilDate,
  parseCivilDate,
  resolveAge,
  resolveToday,
  seasonOf,
} from "@/features/puppy/age";
import { StageView } from "@/features/puppy/components/stage-view";
import { JourneyTimeline } from "@/features/puppy/components/journey-timeline";
import { findBreed, findProvince, sizeGroups } from "@/features/puppy/model";
import type { BreedSlug, ProvinceCode } from "@/features/puppy/model";
import { roadmapStageForDays, stageForDays } from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";

interface MyPuppyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Resolves the public page this personalised state is a variant of.
 *
 * The first version canonicalised every `/my-puppy` state to
 * `/puppy/11-weeks`, which is only true when the puppy is actually eleven
 * weeks old. For a four-month-old it told a crawler that this page is a
 * duplicate of an unrelated age — a false identity claim, and precisely the
 * kind of thing the rest of this project refuses to do to a machine.
 *
 * So: canonical to the matching stage when one exists, and to the Journey hub
 * when it does not. The hub is the honest parent of a state we have not
 * written a page for.
 */
function canonicalPathFor(
  dobParam: string | undefined,
  provinceParam: string | undefined,
): string {
  if (!dobParam) {
    return "/puppy";
  }

  const birth = parseCivilDate(dobParam);
  if (!birth) {
    return "/puppy";
  }

  const { date: today } = resolveToday({ province: provinceParam, now: new Date() });
  const age = resolveAge(birth, today);
  if (!age.ok) {
    return "/puppy";
  }

  const stage = stageForDays(age.age.days);
  return stage ? `/puppy/${stage.slug}` : "/puppy";
}

/**
 * The personalised Journey.
 *
 * **Always `noindex`.** Every combination of date of birth, breed and province
 * produces a different page, and there are tens of thousands of them. Letting
 * a crawler index that space would create exactly the programmatic duplication
 * the blueprint set out to avoid — so the canonical points at whichever public
 * page this state is genuinely a variant of.
 *
 * `noIndex` also sets `follow: false`, which is a slightly blunt instrument
 * here, but the internal links a reader needs are all reachable from `/puppy`
 * and from the article library, so nothing is stranded.
 */
export async function generateMetadata({
  searchParams,
}: MyPuppyPageProps): Promise<Metadata> {
  const params = await searchParams;

  return createMetadata({
    title: "Your Puppy Journey",
    description: "Your puppy's Journey, personalised to their age.",
    path: canonicalPathFor(single(params.dob), single(params.province)),
    noIndex: true,
  });
}

/** A page state that is not a stage — no DOB, a bad one, or an age we have not written. */
function Placeholder({
  title,
  body,
  children,
  currentSlug = "",
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
  /**
   * The rail row to mark as "you are here", where the age resolves to one.
   *
   * Empty by default, and deliberately so: marking a row current is a claim
   * about this reader's puppy. A seven-month-old shown a rail with "11 weeks"
   * lit up is being told something false about their own dog, which is worse
   * than a rail with nothing highlighted at all.
   */
  currentSlug?: string;
}) {
  return (
    <Section spacing="default">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="max-w-xl">
              <p className="font-sans text-label uppercase text-pine-700">Puppy Journey</p>
              <h1 className="mt-3 text-display-3 text-foreground sm:text-display-2">{title}</h1>
              <p className="mt-4 text-body-lg text-foreground-muted">{body}</p>
              {children}
              <div className="mt-8">
                <ButtonLink href="/puppy" variant="editorial">
                  Back to the start
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-card border border-border bg-surface-muted p-6 sm:p-7">
              <JourneyTimeline currentSlug={currentSlug} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default async function MyPuppyPage({ searchParams }: MyPuppyPageProps) {
  const params = await searchParams;
  const dobParam = single(params.dob);
  const breedParam = single(params.breed);
  const provinceParam = single(params.province);

  if (!dobParam) {
    return (
      <Placeholder
        title="Tell us when your puppy was born"
        body="The Journey works from a date of birth. It takes a moment and nothing is stored anywhere but this browser."
      />
    );
  }

  const birth = parseCivilDate(dobParam);
  if (!birth) {
    return (
      <Placeholder
        title="That date did not look right"
        body="We could not read that as a date. Go back and enter your puppy's date of birth again."
      />
    );
  }

  // Server-rendered, so the browser's own date is not available here. The
  // province supplies a representative zone when one exists; otherwise this
  // falls to UTC, which is deterministic and therefore hydration-safe.
  const { date: today } = resolveToday({ province: provinceParam });
  const result = resolveAge(birth, today);

  if (!result.ok) {
    return (
      <Placeholder
        title={result.problem === "future" ? "That date is in the future" : "That is beyond puppyhood"}
        body={
          result.problem === "future"
            ? "A puppy born after today is a hard problem for us. Check the year and try again."
            : "The Puppy Journey covers the first few years. For an older dog, our guides on senior care and everyday health will be more use."
        }
      >
        {result.problem === "implausible" ? (
          <p className="mt-4 text-body text-foreground-muted">
            Try{" "}
            <Link
              href="/guides/senior-dogs-and-cats"
              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              caring for a senior dog or cat
            </Link>{" "}
            instead.
          </p>
        ) : null}
      </Placeholder>
    );
  }

  const { age } = result;
  const breed = breedParam ? findBreed(breedParam) : null;
  const province = provinceParam ? findProvince(provinceParam) : null;
  const stage = stageForDays(age.days);

  // An age we have not written yet. Say so rather than routing anywhere
  // that does not exist, and show where they sit in the journey.
  if (!stage) {
    const roadmap = roadmapStageForDays(age.days);
    return (
      <Placeholder
        currentSlug={roadmap?.slug ?? ""}
        title={`Your puppy is ${age.label}`}
        body={
          roadmap
            ? `We are writing the ${roadmap.label} stage now. Only the 11-week stage is finished so far — it is researched and sourced to the same standard as the rest of the site, and the others are following.`
            : "We have not written a stage for this age yet. The 11-week stage is finished, and the rest are being researched to the same standard."
        }
      >
        <p className="mt-4 text-body text-foreground-muted">
          In the meantime,{" "}
          <Link
            href="/guides/bringing-home-a-puppy-first-30-days"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            the first thirty days
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/puppy-socialisation-checklist"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            puppy socialisation
          </Link>{" "}
          cover most of what matters early on.
        </p>
      </Placeholder>
    );
  }

  const sizeGroup = breed?.sizeGroup;
  const headline = breed && breed.slug !== "mixed"
    ? `Your ${breed.name} is ${age.label}`
    : `Your puppy is ${age.label}`;

  const facts = [
    `Born ${formatCivilDate(birth)}`,
    ...(sizeGroup ? [`${sizeGroups[sizeGroup].label} breed · ${sizeGroups[sizeGroup].adultWeight}`] : []),
    ...(province ? [province.name] : []),
  ];

  return (
    <StageView
      stage={stage}
      headline={headline}
      facts={facts}
      context={{
        breedSlug: breed?.slug as BreedSlug | undefined,
        sizeGroup,
        province: province?.code as ProvinceCode | undefined,
        season: seasonOf(today),
      }}
      banner={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-body-sm text-foreground-muted">
            {breed?.sizeNote ?? "Personalised to your puppy's age."}
          </p>
          <Link
            href="/puppy"
            className="font-sans text-body-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Change details
          </Link>
        </div>
      }
    />
  );
}
