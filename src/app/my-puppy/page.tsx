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
import {
  findBreed,
  findProvince,
  parseSizeAnswer,
  resolveSizeGroup,
  sizeGroups,
} from "@/features/puppy/model";
import type { BreedSlug, ProvinceCode } from "@/features/puppy/model";
import {
  findPhase,
  isBeforeJourney,
  isJourneyComplete,
  journeyAnimalNoun,
  journeyHeadlineAge,
  journeyMeta,
  roadmapStageFor,
  stageFor,
} from "@/features/puppy/stages";
import type { JourneyPhaseId } from "@/features/puppy/stages";
import { articlePath } from "@/features/editorial/articles";
import type { ArticleSlug } from "@/features/editorial/articles";
import { journeyStateCopy } from "@/features/puppy/journey-states";
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

  const stage = stageFor(age.age);
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
 * It is `private-noindex` rather than `public-noindex`, so `follow: false` too.
 * That is the right half of the distinction for this route: it is application
 * state rather than published content, and the internal links a reader needs
 * are all reachable from `/puppy` and from the article library, so nothing is
 * stranded. A published stage held back from a launch wave is the other case,
 * and it keeps `follow: true`.
 */
export async function generateMetadata({
  searchParams,
}: MyPuppyPageProps): Promise<Metadata> {
  const params = await searchParams;

  return createMetadata({
    title: "Your Puppy Journey",
    description: "Your puppy's Journey, personalised to their age.",
    path: canonicalPathFor(single(params.dob), single(params.province)),
    robots: "private-noindex",
  });
}

/**
 * What to offer a reader whose stage has not been written yet.
 *
 * The Journey now spans eight weeks to young adulthood, so a single pair of
 * links cannot serve it. Sending the owner of an eight-month-old adolescent to
 * "the first thirty days" is worse than sending them nowhere: it reads as a
 * product that did not understand the age it just calculated.
 *
 * These are all existing articles. Nothing here promises a stage page.
 */
const MEANTIME_READING: Record<
  JourneyPhaseId,
  readonly [{ slug: ArticleSlug; label: string }, { slug: ArticleSlug; label: string }]
> = {
  "early-puppy": [
    { slug: "bringing-home-a-puppy-first-30-days", label: "the first thirty days" },
    { slug: "puppy-socialisation-checklist", label: "puppy socialisation" },
  ],
  "early-development": [
    { slug: "puppy-socialisation-checklist", label: "puppy socialisation" },
    { slug: "crate-training-a-puppy-in-canada", label: "crate training" },
  ],
  adolescence: [
    { slug: "loose-leash-walking-and-recall", label: "lead work and recall" },
    { slug: "spaying-and-neutering-in-canada", label: "spaying and neutering" },
  ],
  handoff: [
    { slug: "loose-leash-walking-and-recall", label: "lead work and recall" },
    { slug: "dental-care-for-dogs-and-cats", label: "dental care" },
  ],
};

/** A page state that is not a stage — no DOB, a bad one, or an age we have not written. */
function Placeholder({
  title,
  body,
  children,
  facts,
  currentSlug = "",
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
  /** The quiet meta row — exact age and phase, never a second headline. */
  facts?: readonly string[];
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
              {facts && facts.length > 0 ? (
                <p className="mt-3 font-sans text-body-sm text-foreground-muted">
                  {facts.join(" · ")}
                </p>
              ) : null}
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

  // An input problem, not an editorial one.
  //
  // `MAX_PLAUSIBLE_DAYS` is a guard against a mistyped date of birth and has
  // nothing to do with how far the Journey runs — `JOURNEY_ENDS_AFTER_MONTHS`
  // does that, and a dog past it gets the Journey Complete screen. So this
  // state may not say how long the Journey is, and it may not call the animal
  // anything. It used to do both: it claimed the Journey "covers the first few
  // years" (it ends at eighteen months) and sent the owner of a dog that had
  // just turned three to senior-care reading. Three is not senior, and this
  // page has no basis for deciding when any dog is.
  if (!result.ok) {
    return (
      <Placeholder
        title={
          result.problem === "future" ? "That date is in the future" : "Worth checking that date"
        }
        body={
          result.problem === "future"
            ? "A puppy born after today is a hard problem for us. Check the year and try again."
            : "That date of birth is more than three years ago, which is usually a mistyped year rather than a puppy. Go back and check it."
        }
      >
        {result.problem === "implausible" ? (
          <p className="mt-4 text-body text-foreground-muted">
            If the date is right, then this is an adult dog and the Journey has nothing age-staged
            left to offer it — the library is organised by subject from here, starting with{" "}
            <Link
              href={articlePath("loose-leash-walking-and-recall")}
              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              training you maintain rather than finish
            </Link>{" "}
            and{" "}
            <Link
              href={articlePath("dental-care-for-dogs-and-cats")}
              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              the dental care that is easy to let slide
            </Link>
            .
          </p>
        ) : null}
      </Placeholder>
    );
  }

  const { age } = result;
  const breed = breedParam ? findBreed(breedParam) : null;
  const province = provinceParam ? findProvince(provinceParam) : null;
  const stage = stageFor(age);

  // Size is the reader's answer first and the breed's implication second, and
  // an explicit "not sure" beats both. When it comes out undefined the page
  // renders no size block and states no weight — an unknown size stays unknown
  // all the way to the screen rather than being rounded to medium somewhere in
  // the middle.
  const sizeGroup = resolveSizeGroup(parseSizeAnswer(single(params.size)), breed);

  // Younger than the Journey's first stage. A third state, distinct from both
  // "complete" and "not written yet": every roadmap stage exists, so nothing
  // here is pending. The Journey starts at eight weeks because before that a
  // puppy is normally still with its breeder or rescue, and this page must not
  // improvise neonatal care it has never researched.
  if (isBeforeJourney(age)) {
    return (
      <Placeholder
        title={journeyStateCopy.before.title}
        facts={[`Your puppy is ${age.exact} old`]}
        body={journeyStateCopy.before.body}
      >
        <p className="mt-4 text-body text-foreground-muted">
          The people to ask right now are the breeder or rescue who has the litter, and a
          veterinarian — for a puppy this age they are the source, not a website. It is a good
          moment to{" "}
          <Link
            href={articlePath("finding-a-veterinarian-in-canada")}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            choose a practice before you need one
          </Link>
          , and to read{" "}
          <Link
            href={articlePath("bringing-home-a-puppy-first-30-days")}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            what the first thirty days will ask of you
          </Link>
          . Come back when your puppy is eight weeks old and the Journey starts there.
        </p>
      </Placeholder>
    );
  }

  // Past the end of the Journey. This is **not** the same as "we have not
  // written this yet", and it must never borrow that copy: a two-year-old dog
  // is not waiting for a page, and telling its owner that one is being
  // researched would be false. The Journey is a finite series and this is
  // what finishing it looks like.
  if (isJourneyComplete(age)) {
    return (
      <Placeholder
        title={journeyStateCopy.complete.title}
        facts={[`Your dog is ${age.exact} old`]}
        body={journeyStateCopy.complete.body}
      >
        <p className="mt-4 text-body text-foreground-muted">
          None of that means development is finished. It means the guidance stops being
          age-staged. The library is organised by subject rather than by month, which is how
          the questions arrive from here — starting with{" "}
          <Link
            href={articlePath("loose-leash-walking-and-recall")}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            training you maintain rather than finish
          </Link>{" "}
          and{" "}
          <Link
            href={articlePath("dental-care-for-dogs-and-cats")}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            the dental care that is easy to let slide
          </Link>
          .
        </p>
      </Placeholder>
    );
  }

  // A roadmap entry without a page.
  //
  // Unreachable today — every roadmap stage is written, and the two ages that
  // resolve to no roadmap entry at all are handled above. It is kept rather
  // than deleted so that adding a roadmap entry ahead of its page degrades
  // into a truthful screen instead of a crash or a wrong redirect.
  //
  // What it may not do is promise. The copy says a page is missing and stops
  // there: no "coming soon", no "being researched", no count of what is
  // following. Those were false the moment the roadmap was finished, and the
  // next person to add an entry should not inherit them.
  if (!stage) {
    const roadmap = roadmapStageFor(age);
    const phase = roadmap ? findPhase(roadmap.phase) : null;
    const meantime = MEANTIME_READING[phase?.id ?? "early-puppy"];
    return (
      <Placeholder
        currentSlug={roadmap?.slug ?? ""}
        title={`Your ${journeyAnimalNoun(roadmap)} is ${journeyHeadlineAge(age, roadmap)}`}
        facts={journeyMeta(age, roadmap)}
        body={
          roadmap ? journeyStateCopy.noPage.body : "There is no stage in the Journey for this age."
        }
      >
        <p className="mt-4 text-body text-foreground-muted">
          In the meantime,{" "}
          <Link
            href={articlePath(meantime[0].slug)}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            {meantime[0].label}
          </Link>{" "}
          and{" "}
          <Link
            href={articlePath(meantime[1].slug)}
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            {meantime[1].label}
          </Link>{" "}
          are the closest things we have written.
        </p>
      </Placeholder>
    );
  }

  const roadmap = roadmapStageFor(age);

  // Exact age in the headline where the stage is measured in weeks, the stage
  // label where it is measured in months. The stage's own name is in the
  // eyebrow above either way, so the two are never confused.
  const agePhrase = journeyHeadlineAge(age, roadmap);
  // "Puppy" through early development, "dog" from adolescence on — the same
  // line the stage titles draw. A named breed sidesteps the question.
  const headline = breed && breed.slug !== "mixed"
    ? `Your ${breed.name} is ${agePhrase}`
    : `Your ${journeyAnimalNoun(roadmap)} is ${agePhrase}`;

  const facts = [
    ...journeyMeta(age, roadmap),
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
        // Only this route has the reader's dates, and only this route may
        // therefore say which side of a calendar-month legal threshold they
        // are on. The public stage page passes no context and says the honest
        // thing instead — see `LegalAgeThreshold`.
        birth,
        today,
      }}
      banner={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/*
            The breed's size note only holds while the breed's size does. A
            reader who overrode a Labrador to "toy", or to "not sure", must not
            be told underneath that growth finishes later than they expect.
          */}
          <p className="font-sans text-body-sm text-foreground-muted">
            {sizeGroup && sizeGroup === breed?.sizeGroup && breed.sizeNote
              ? breed.sizeNote
              : "Personalised to your puppy's age."}
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
