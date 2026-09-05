import type { Season } from "@/features/puppy/age";
import type {
  BreedSlug,
  ProvinceCode,
  PuppyStage,
  ResolvedSection,
  SizeGroup,
} from "@/features/puppy/model";
import { findBreed } from "@/features/puppy/model";
import {
  breedModifiers,
  provinceModifiers,
  seasonModifiers,
  sizeGroupModifiers,
} from "@/features/puppy/stages";

/**
 * Layer composition.
 *
 * ## Precedence, and why it is additive rather than overwriting
 *
 * Universal → size group → breed → province → season. Every layer *adds a
 * distinguished block*; none rewrites the base prose. That is a deliberate
 * constraint rather than a limitation of the implementation.
 *
 * The alternative — letting a breed layer replace the universal paragraph —
 * is how programmatic content happens. Once a modifier can rewrite the base,
 * the cheapest way to make a Golden Retriever page differ from a Poodle page
 * is to paraphrase, and a hundred paraphrased pages is exactly the pattern
 * this product must not become. Making replacement impossible means a
 * modifier has to earn its place by saying something new.
 *
 * Where a layer has nothing to say for a section, it contributes nothing and
 * the reader sees the universal content. That is the correct outcome, and it
 * is why most sections for most readers render with no modifiers at all.
 */

export interface JourneyContext {
  sizeGroup?: SizeGroup;
  breedSlug?: BreedSlug;
  province?: ProvinceCode;
  season?: Season;
}

/** Composes one stage against a context. Pure, and safe to call at build time. */
export function resolveStage(
  stage: PuppyStage,
  context: JourneyContext = {},
): readonly ResolvedSection[] {
  // A breed implies a size group. An explicit size group still wins, so the
  // caller can resolve a size group without naming a breed.
  const breed = context.breedSlug ? findBreed(context.breedSlug) : null;
  const sizeGroup = context.sizeGroup ?? breed?.sizeGroup;

  return stage.sections.map((section): ResolvedSection => {
    const sizeGroupBlock = sizeGroup
      ? sizeGroupModifiers.find(
          (m) =>
            m.sizeGroup === sizeGroup &&
            m.stageSlug === stage.slug &&
            m.sectionId === section.id,
        )
      : undefined;

    // `mixed` deliberately carries no breed modifiers — there is nothing
    // defensible to say about an unknown breed beyond its size group.
    const breedBlock =
      context.breedSlug && context.breedSlug !== "mixed"
        ? breedModifiers.find(
            (m) =>
              m.breedSlug === context.breedSlug &&
              m.stageSlug === stage.slug &&
              m.sectionId === section.id,
          )
        : undefined;

    const provinceBlocks = context.province
      ? provinceModifiers
          .filter(
            (m) =>
              m.provinces.includes(context.province as ProvinceCode) &&
              m.stageSlug === stage.slug &&
              m.sectionId === section.id,
          )
          .map((m) => ({ heading: m.heading, body: m.body, kind: m.kind }))
      : [];

    const seasonBlock = context.season
      ? seasonModifiers.find(
          (m) =>
            m.season === context.season &&
            m.stageSlug === stage.slug &&
            m.sectionId === section.id,
        )
      : undefined;

    return {
      ...section,
      sizeGroupBlock: sizeGroupBlock ? { body: sizeGroupBlock.body } : undefined,
      breedBlock: breedBlock ? { body: breedBlock.body } : undefined,
      provinceBlocks,
      seasonBlock: seasonBlock
        ? { heading: seasonBlock.heading, body: seasonBlock.body, guide: seasonBlock.guide }
        : undefined,
    };
  });
}

/** Every source cited by a stage plus the province blocks a context activates. */
export function resolveSources(stage: PuppyStage, context: JourneyContext = {}) {
  const provinceSources = context.province
    ? provinceModifiers
        .filter(
          (m) => m.provinces.includes(context.province as ProvinceCode) && m.stageSlug === stage.slug,
        )
        .flatMap((m) => m.sources)
    : [];

  // De-duplicate by URL: a province source may already be a stage source.
  const seen = new Set(stage.sources.map((s) => s.url));
  return [...stage.sources, ...provinceSources.filter((s) => !seen.has(s.url))];
}
