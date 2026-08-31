import type { MediaAssetId } from "@/media/manifest";

/**
 * Editorial topic sections.
 *
 * Each entry drives one `/[topic]` landing page. Topics are a *presentation*
 * grouping over the community taxonomy: they let a visitor arrive from search
 * on "dog food" and find both the relevant forum categories and the guides
 * being written, without the forum tree having to match marketing structure.
 *
 * `categorySlugs` and `guideIds` are resolved against
 * `features/community/taxonomy.ts` and `features/editorial/fixtures.ts`; a
 * unit test asserts every reference exists, so a renamed slug fails CI rather
 * than silently emptying a section.
 */

export interface TopicDefinition {
  /** Route path. */
  path: string;
  /** Short name, used in breadcrumbs and navigation. */
  name: string;
  /** Page `h1`. */
  title: string;
  description: string;
  /** Community categories surfaced on this page. */
  categorySlugs: readonly string[];
  /** Planned editorial guides surfaced on this page. */
  guideIds: readonly string[];
  /**
   * Section-front photograph, keyed into `media/manifest`. Typed as
   * `MediaAssetId` rather than `string`, so a renamed or deleted asset is a
   * compile error here instead of a missing picture in production.
   */
  mediaId: MediaAssetId;
}

export const topics: readonly TopicDefinition[] = [
  {
    path: "/dogs",
    name: "Dogs",
    title: "Dogs in Canada",
    description:
      "Bringing home a puppy, feeding a senior, decoding a diagnosis or working through a behaviour problem — this is where Canadian dog owners compare notes.",
    categorySlugs: [
      "general-dog-discussion",
      "puppies",
      "dog-health",
      "dog-food-and-nutrition",
      "dog-training-and-behaviour",
      "dog-breeds",
    ],
    guideIds: ["guide-dog-food", "guide-cost-of-dog", "guide-vaccination"],
    mediaId: "dogs-autumn-bridge",
  },
  {
    path: "/cats",
    name: "Cats",
    title: "Cats in Canada",
    description:
      "Kittens, senior cats, litter box politics and the long-running question of what to actually feed them — cat-specific discussion from across the country.",
    categorySlugs: [
      "general-cat-discussion",
      "kittens",
      "cat-health",
      "cat-food-and-nutrition",
      "cat-behaviour",
      "cat-breeds",
    ],
    guideIds: [],
    mediaId: "cats-window-tabby",
  },
  {
    path: "/health",
    name: "Health",
    title: "Pet health",
    description:
      "Symptoms worth a vet visit, preventative care that pays off, what treatment costs in Canada, and how other owners navigated the same diagnosis.",
    categorySlugs: ["dog-health", "cat-health", "vet-costs", "pet-insurance"],
    guideIds: ["guide-vaccination", "guide-pet-insurance"],
    mediaId: "health-senior-dog-resting",
  },
  {
    path: "/food",
    name: "Food",
    title: "Pet food and nutrition",
    description:
      "Kibble, raw, fresh and prescription diets — what is actually available in Canada, how to read a label, and what it costs to feed a pet each day.",
    categorySlugs: [
      "dog-food-and-nutrition",
      "cat-food-and-nutrition",
      "canadian-pet-products",
    ],
    guideIds: ["guide-dog-food"],
    mediaId: "food-dog-at-bowl",
  },
  {
    path: "/training",
    name: "Training",
    title: "Training and behaviour",
    description:
      "Recall, reactivity, crate training, scratching and everything in between — practical behaviour help from owners and trainers across Canada.",
    categorySlugs: [
      "dog-training-and-behaviour",
      "cat-behaviour",
      "puppies",
      "kittens",
    ],
    guideIds: [],
    mediaId: "training-forest-path",
  },
] as const;

/** Finds a topic by its route path (e.g. `/dogs`), or `null`. */
export function findTopic(path: string): TopicDefinition | null {
  return topics.find((topic) => topic.path === path) ?? null;
}
