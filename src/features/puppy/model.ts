import type { ArticleSlug } from "@/features/editorial/articles";
import type { MediaAssetId } from "@/media/manifest";
import type { Season } from "@/features/puppy/age";

/**
 * The Puppy Journey content model.
 *
 * ## The composition rule this file exists to enforce
 *
 * A stage is written **once**, universally. Everything that varies — size
 * group, breed, province, season — is a *modifier* that adds a block or
 * replaces a named one. A modifier may not restate the universal text in
 * different words.
 *
 * That constraint is the whole difference between this and the programmatic
 * breed × age content that fills this category. If a Golden Retriever page
 * and a Poodle page differ only in adjectives, they should not be two pages,
 * and `puppy.test.ts` asserts that no modifier duplicates prose it is
 * layering onto.
 *
 * ## Why the same trust fields as an article
 *
 * `sources`, `resources` and `needsVerification` are the same shapes the
 * editorial registry uses, deliberately. A stage makes claims about people's
 * animals exactly as an article does, and it would be strange for the Journey
 * to be held to a lower standard than the guide it links to.
 *
 * `reviewBy` is the one addition. Stage content decays — vaccination guidance
 * has already moved once during this project, and provincial rules move
 * faster — and the editorial registry has no decay tracking at all. See the
 * note on the field itself.
 */

export interface StageSource {
  label: string;
  publisher: string;
  url: string;
}

/**
 * Adult size, which is the primary modifier in the whole system.
 *
 * It is primary because it is what actually drives the differences an owner
 * can act on: when growth finishes, when neutering is discussed, how much
 * exercise is appropriate while plates are open, when "puppy" ends. Breed is
 * mostly a proxy for this, which is why the Journey works without one.
 */
export type SizeGroup = "toy" | "small" | "medium" | "large" | "giant";

export const sizeGroups = {
  toy: { id: "toy", label: "Toy", adultWeight: "under about 5 kg" },
  small: { id: "small", label: "Small", adultWeight: "about 5–11 kg" },
  medium: { id: "medium", label: "Medium", adultWeight: "about 11–25 kg" },
  large: { id: "large", label: "Large", adultWeight: "about 25–45 kg" },
  giant: { id: "giant", label: "Giant", adultWeight: "over about 45 kg" },
} as const satisfies Record<SizeGroup, { id: SizeGroup; label: string; adultWeight: string }>;

/**
 * The breeds the onboarding offers.
 *
 * Deliberately small, and deliberately *not* breed profiles — this milestone
 * builds no breed pages. A breed here does two things and nothing else: it
 * resolves a size group, and it may carry a small number of genuinely
 * breed-specific notes. Where there is nothing defensible to say, `notes` is
 * absent and the reader sees size-group content, which is the honest outcome.
 */
export type BreedSlug =
  | "golden-retriever"
  | "labrador-retriever"
  | "german-shepherd"
  | "french-bulldog"
  | "poodle"
  | "bernese-mountain-dog"
  | "mixed";

export interface Breed {
  slug: BreedSlug;
  name: string;
  sizeGroup: SizeGroup;
  /** Shown under the age. Absent for `mixed`, which has no single answer. */
  sizeNote?: string;
}

const breeds = {
  "golden-retriever": {
    slug: "golden-retriever",
    name: "Golden Retriever",
    sizeGroup: "large",
    sizeNote: "Large breed — growth finishes later than most owners expect.",
  },
  "labrador-retriever": {
    slug: "labrador-retriever",
    name: "Labrador Retriever",
    sizeGroup: "large",
    sizeNote: "Large breed — growth finishes later than most owners expect.",
  },
  "german-shepherd": {
    slug: "german-shepherd",
    name: "German Shepherd",
    sizeGroup: "large",
    sizeNote: "Large breed — growth finishes later than most owners expect.",
  },
  "french-bulldog": {
    slug: "french-bulldog",
    name: "French Bulldog",
    sizeGroup: "medium",
    sizeNote: "A flat-faced breed, which changes how heat and exercise are handled.",
  },
  poodle: {
    slug: "poodle",
    name: "Poodle",
    sizeGroup: "medium",
    sizeNote: "Standard size assumed. A coat that will need professional grooming for life.",
  },
  "bernese-mountain-dog": {
    slug: "bernese-mountain-dog",
    name: "Bernese Mountain Dog",
    sizeGroup: "giant",
    sizeNote: "Giant breed — the slowest growth curve of anything here.",
  },
  mixed: {
    slug: "mixed",
    name: "Mixed breed or not sure",
    sizeGroup: "medium",
  },
} as const satisfies Record<BreedSlug, Breed>;

export const allBreeds: readonly Breed[] = Object.values(breeds);

export function findBreed(slug: string): Breed | null {
  return (breeds as Record<string, Breed>)[slug] ?? null;
}

/**
 * Provinces and territories.
 *
 * All thirteen are offered because asking someone to find themselves in a
 * partial list is worse than having nothing to say for their jurisdiction.
 * Whether a province *changes* anything at a given stage is a separate
 * question, answered by the modifiers below — and for most of them, at eleven
 * weeks, the honest answer is that it does not.
 */
export type ProvinceCode =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

export const provinces: readonly { code: ProvinceCode; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export function findProvince(code: string): { code: ProvinceCode; name: string } | null {
  return provinces.find((p) => p.code === code) ?? null;
}

/** The named sections a stage is built from, in render order. */
export type SectionId =
  | "this-week"
  /** The first 24–72 hours. Only the arrival stage has one. */
  | "first-days"
  | "development"
  /** House-training from nothing. Later stages fold this into routine. */
  | "toilet-training"
  | "training"
  | "socialisation"
  | "feeding"
  | "sleep"
  | "teething"
  | "grooming"
  | "exercise"
  | "veterinary-care"
  | "vaccine-questions"
  | "parasite-prevention"
  | "safety"
  /** Records, identification and licensing — an audit, not a to-do list. */
  | "paperwork"
  | "red-flags"
  | "checklist"
  | "whats-next";

export interface StageSection {
  id: SectionId;
  title: string;
  /** One line shown while the section is collapsed. */
  summary: string;
  /** Paragraphs. Kept as an array so a modifier can append without reflowing. */
  body: readonly string[];
  /** Rendered as a list under the body, where the content is list-shaped. */
  points?: readonly string[];
  /** At most one. A section is not a related-posts block. */
  guide?: { slug: ArticleSlug; label: string };
  /** Renders the section in the elevated safety treatment. */
  tone?: "default" | "caution";
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface PuppyStage {
  /**
   * Matches a `RoadmapStage` slug, which is where the age range lives.
   *
   * A stage deliberately does not restate its own bounds. It used to, and a
   * duplicated range is a range that can disagree with itself — the more so
   * now that early stages are measured in days and later ones in calendar
   * anniversaries, so a stage page cannot express its own span in one unit.
   */
  slug: string;
  /** "11 weeks" */
  label: string;
  title: string;
  deck: string;
  metaDescription: string;
  mediaId: MediaAssetId;
  mediaAlt: string;
  sections: readonly StageSection[];
  checklist: readonly ChecklistItem[];
  sources: readonly StageSource[];
  resources?: readonly StageSource[];
  /**
   * Editorial-only. Never rendered, exactly as `needsVerification` is never
   * rendered on an article — `puppy.test.ts` asserts no component reads it.
   */
  needsVerification: readonly string[];
  /**
   * The date this stage's factual content must be re-checked by.
   *
   * The editorial registry has no equivalent and should get one: the Gate #1
   * audit recommended it, vaccination guidance moved once mid-project, and
   * nothing in the system currently notices when a fact goes stale. Adding it
   * here first is the cheap way to prove the pattern before retrofitting
   * thirty-five articles.
   */
  reviewBy: string;
  status: "in-review" | "published";
}

/* ------------------------------------------------------------------ modifiers
   A modifier inserts or replaces. It never restates. */

export interface SizeGroupModifier {
  sizeGroup: SizeGroup;
  stageSlug: string;
  sectionId: SectionId;
  /** Prepended to the section as a distinguished block. */
  body: readonly string[];
}

export interface BreedModifier {
  breedSlug: BreedSlug;
  stageSlug: string;
  sectionId: SectionId;
  body: readonly string[];
}

/**
 * A legal duty that starts at an age expressed in calendar months.
 *
 * ## Why this exists rather than a day count
 *
 * Ontario's rabies regulation applies to animals "over three months of age".
 * Three calendar months is not a fixed number of days — depending on the
 * months a puppy has lived through it falls between 89 and 92 — and it is
 * never 84, which is what twelve weeks actually is. So a stage page covering
 * days 84 to 90 contains puppies on both sides of that line, and cannot state
 * which side any individual reader is on.
 *
 * The regulation does not define the threshold in days, so neither do we. The
 * public page says the honest thing: the threshold is near, and the two are
 * not the same date. The personalised Journey, which knows the date of birth,
 * computes the actual anniversary with the same civil-date arithmetic used
 * everywhere else and says which side of it the reader is on.
 *
 * `{date}`, in a heading or a body paragraph, is replaced with the
 * anniversary itself.
 */
export interface LegalAgeThreshold {
  /** Whole calendar months from the date of birth. */
  months: number;
  /** Rendered when today is before the anniversary. */
  before: { heading: string; body: readonly string[] };
  /** Rendered on or after it. */
  reached: { heading: string; body: readonly string[] };
}

export interface ProvinceModifier {
  provinces: readonly ProvinceCode[];
  stageSlug: string;
  sectionId: SectionId;
  /** "Ontario" / "British Columbia" — names the jurisdiction in the heading. */
  heading: string;
  body: readonly string[];
  /** Whether this is law or veterinary guidance. Rendered differently. */
  kind: "legal" | "guidance";
  /**
   * Replaces `heading` and `body` when the reader's date of birth is known.
   *
   * Absent on the public page, which has no date of birth and must therefore
   * not claim the threshold has been crossed either way.
   */
  ageThreshold?: LegalAgeThreshold;
  sources: readonly StageSource[];
}

export interface SeasonModifier {
  season: Season;
  stageSlug: string;
  sectionId: SectionId;
  heading: string;
  body: readonly string[];
  guide?: { slug: ArticleSlug; label: string };
}

/** What a resolved section looks like once modifiers have been layered on. */
export interface ResolvedSection extends StageSection {
  sizeGroupBlock?: { body: readonly string[] };
  breedBlock?: { body: readonly string[] };
  provinceBlocks: readonly {
    heading: string;
    body: readonly string[];
    kind: "legal" | "guidance";
  }[];
  seasonBlock?: {
    heading: string;
    body: readonly string[];
    guide?: { slug: ArticleSlug; label: string };
  };
}
