import type { ArticleAuthorId, ArticleReviewerId } from "@/features/editorial/authors";
import type { MediaAssetId } from "@/media/manifest";
import type { RobotsPolicy } from "@/lib/seo/metadata";

/**
 * The editorial article registry.
 *
 * ## Why metadata lives here and prose lives in MDX
 *
 * Each article is two files: a typed record below, and a body at
 * `src/content/articles/<slug>.mdx`. The split is deliberate.
 *
 * Frontmatter inside the MDX would be a bag of strings — nothing would stop a
 * typo in `mediaId`, a `section` that is not a real section, or a byline
 * pointing at an author who does not exist, until a page rendered wrong in
 * production. Here, every reference is a union type resolved at compile time,
 * and `articles.test.ts` checks the rest (the body file exists, the stated
 * reading time matches the actual word count, related links resolve, and no
 * article claims a review that did not happen).
 *
 * The cost is that adding an article means touching two files. That is the
 * right trade for content that makes claims about people’s animals.
 *
 * ## URLs
 *
 * Every article lives at `/guides/<slug>`, which is the route
 * [ADR 0005](../../../docs/decisions/0005-community-and-editorial-architecture.md)
 * and the roadmap already committed to. `section` decides which *surfaces* an
 * article appears on — a dogs article is listed on `/dogs` and on `/guides` —
 * but it is not part of the path. One editorial hub keeps the canonical URL
 * stable if an article is later re-sectioned, and avoids a dynamic segment
 * sitting at the site root.
 */

/** Where an article is surfaced, and the label above its headline. */
export interface ArticleSection {
  id: string;
  /** Eyebrow label, and the link text in listings. */
  name: string;
  /** Existing topic surface this section’s articles are listed on. */
  surfacePath: string;
}

const sections = {
  dogs: { id: "dogs", name: "Dogs", surfacePath: "/dogs" },
  cats: { id: "cats", name: "Cats", surfacePath: "/cats" },
  // Species-neutral and about the care system rather than the animal —
  // insurance, choosing a practice, what an emergency asks of you. These read
  // as one shelf, and `/health` already existed as a surface with nothing on
  // it, so they are listed there rather than diluted into the general hub.
  health: { id: "health", name: "Pet health", surfacePath: "/health" },
  "canadian-life": {
    id: "canadian-life",
    name: "Pet ownership in Canada",
    surfacePath: "/guides",
  },
} as const satisfies Record<string, ArticleSection>;

export type ArticleSectionId = keyof typeof sections;

export function getArticleSection(id: ArticleSectionId): ArticleSection {
  return sections[id];
}

/** Every section, for the discovery surfaces and tests. */
export const allArticleSections: readonly ArticleSection[] = Object.values(sections);

/**
 * A cited source.
 *
 * Only organisations whose own publications back the claim. A source is a
 * pointer a reader can follow, so it links to the body itself rather than to a
 * deep page that will rot.
 */
export interface ArticleSource {
  /** What the reader is being sent to. */
  label: string;
  /** The organisation publishing it. */
  publisher: string;
  url: string;
}

/**
 * ## The pricing rule
 *
 * Settled at Quality Gate #2, after thirty articles containing no dollar
 * figures at all. The blanket ban was the right call while nothing could be
 * sourced, and it became the single largest constraint on this library's
 * Canadian specificity — a cost guide that answers no cost question is only
 * half an article.
 *
 * The replacement is not "prices are now allowed". It is a narrow test that a
 * figure has to pass, and most figures cannot:
 *
 *  1. **Set and published by the body that sets it.** A municipal licence fee
 *     on the city's own fee page qualifies. A veterinary fee, a premium, a
 *     grooming rate or an adoption fee does not, because no authority
 *     publishes them and they are set per practice, per insurer, per shelter.
 *  2. **Geographically attributed in the sentence itself**, not in a footnote.
 *     "Toronto charges" is publishable; "licences cost" is not.
 *  3. **Dated, and cited to the page that carries it**, so a reader can check
 *     whether it has moved.
 *  4. **Framed as one example, never as a Canadian figure.** A price appears
 *     to show that a category is real and how it varies — never to let a
 *     reader in another city plan against it.
 *  5. **Recorded in `needsVerification` with its own re-check note**, because
 *     a fee that was right in 2026 is a wrong fee in 2028 and nothing else in
 *     this system will notice.
 *
 * What this deliberately does not unlock: national averages, "typical" ranges
 * assembled from clinics we phoned, anything converted from US dollars, and
 * any figure whose only source is another article. An attributed provincial estimate may be used as a benchmark, not a
 * national average or prescribed care schedule, when the original publisher
 * supplies its year, scope and caveats. The dog-cost guide applies this
 * exception to the OVMA 2026–27 estimate, checked October 20, 2026.
 *
 * Applied in the licensing and dog-budget guides. Any future use starts
 * by asking whether the number would survive all five tests, and the honest
 * answer for most pet costs in Canada is still no.
 */

/**
 * Editorial status.
 *
 * `in-review` is the honest state for a draft that has been written but not
 * yet signed off by a person who is accountable for it. The editorial policy
 * at `/editorial-policy` promises that every published guide is written and
 * reviewed by a person; an article does not move to `published` until that has
 * actually happened.
 *
 * This is **internal state and is never rendered.** It decides two things: an
 * `in-review` article is `noindex`, and it is absent from the sitemap. It does
 * not put a banner on the page — a reader is owed accurate content, not the
 * newsroom’s workflow. What an unpublished article does instead is make no
 * claim it has not earned: it carries no publication date until there is one.
 */
export type ArticleStatus = "in-review" | "published";

interface ArticleContent {
  /** Opt-in homepage brand treatment; unrelated editorial pages keep their layout. */
  visualStyle?: "unleashed";
  /** URL slug. The article lives at `/guides/<slug>`. */
  slug: string;
  section: ArticleSectionId;
  /** Narrower label shown beside the section, e.g. "Seasonal care". */
  subcategory?: string;
  title: string;
  /** The deck — one or two sentences under the headline. */
  deck: string;
  /**
   * Meta description, where the deck is too long for one.
   *
   * A deck is written to be read under a headline and can run to two full
   * sentences; a meta description is cut off around 160 characters in a
   * result page. Rather than shortening the deck to suit a crawler, an
   * article may carry a tighter line for search. A test holds the effective
   * description to length.
   */
  metaDescription?: string;
  authorId: ArticleAuthorId;
  /**
   * A named veterinary reviewer who actually read this article. There are none
   * yet, and the template cannot render a review credit without one — see the
   * note in `authors.ts`.
   */
  reviewerId?: ArticleReviewerId;
  /** Stated reading time. Guarded against the real word count by a test. */
  readingMinutes: number;
  /** Hero photograph. Typed, so a deleted asset is a compile error. */
  mediaId: MediaAssetId;
  /** Overrides the asset’s default alt text where the article needs a different emphasis. */
  mediaAlt?: string;
  /**
   * Internal organisation only. These are for editorial planning and for
   * finding related articles — they deliberately do **not** generate public
   * tag pages, which would be thin, indexable and worthless.
   */
  tags: readonly string[];
  /**
   * Promotes the article on its section surface.
   *
   * Reserved for the lead article of a surface — the one worth putting a
   * reader in front of before they have decided what they came for. It ran to
   * sixteen of thirty by the end of Batch F, which is not a selection, and was
   * cut back to one or two per surface at Quality Gate #2.
   *
   * Nothing reads this field yet. That is exactly why it drifted: a flag with
   * no consumer has no feedback. Whatever eventually consumes it inherits
   * whatever discipline is kept here, so the bar is deliberately high — an
   * article earns it by being the best thing on its shelf, not by being new.
   */
  featured?: boolean;
  /**
   * Whether this article may be indexed **once it is published**.
   *
   * Editorial state and search policy are different questions. `status` is
   * whether the writing is finished and signed off; this is whether we want
   * search engines to carry it. Holding a finished article out of the index by
   * calling it `in-review` would mean misstating the content in order to
   * control a crawler, and it cannot express the state that makes this field
   * necessary: published, publicly readable, linked from other articles, and
   * deliberately not in the index.
   *
   * Both must be true to index or to reach the sitemap, so this can never
   * cause indexing on its own \u2014 see `isArticleIndexable`. Every article is
   * `true` today, meaning no article carries an SEO-level hold; the thing
   * holding all 35 back is `status`, which is the honest reason.
   */
  indexable: boolean;
  /** The quick answer, shown above the body where the subject supports one. */
  keyTakeaways?: readonly string[];
  /** Other articles, by slug. Rendered as "Related reading". */
  relatedSlugs?: readonly string[];
  /** Community categories this article should send readers to. Validated against the taxonomy. */
  relatedCategorySlugs?: readonly string[];
  /**
   * Evidence. Publications that actually support a claim this article makes.
   *
   * The bar is narrow on purpose: if a reader followed the link, would they
   * find the thing the article says? A directory, a regulator's landing page
   * or a "find a vet" tool answers no — those are useful, but they are not
   * evidence, and listing them under a heading reading "Sources" tells a
   * reader the article is cited when it is not. Those go in `resources`.
   */
  sources?: readonly ArticleSource[];
  /**
   * Useful places to go next. Directories, regulators, official tools.
   *
   * Rendered under its own heading, separately from `sources`, because the
   * two make different promises. This is "here is where you look yours up";
   * `sources` is "here is where we got that".
   */
  resources?: readonly ArticleSource[];
  /**
   * Claims that need checking against a primary source before publication.
   *
   * This field is the alternative to guessing. Where a fact would strengthen
   * the article but cannot be confirmed, it is written conservatively in the
   * body and the open question is recorded here.
   *
   * **Editorial only — never rendered.** It is a work queue for whoever signs
   * the article off, not a reference list for a reader, and the two do not
   * belong under one heading on a live page. The published references a reader
   * can follow are `sources`. An empty-but-present list is not the same as an
   * absent one: absent means nothing was flagged.
   */
  needsVerification?: readonly string[];
  /**
   * Renders the standing note distinguishing general information from
   * veterinary advice. Set on anything that touches health, symptoms or
   * medication, even in passing.
   */
  veterinaryNotice?: boolean;
}

/**
 * Every article, in the order they are listed on a surface.
 *
 * Ordering is explicit rather than sorted at render time: an editor decides
 * what leads a section, and a date is a poor proxy for that. The first entry
 * whose section points at a surface becomes that surface’s lead — so moving an
 * article up this list is how it gets promoted, and nothing else needs
 * changing.
 */
/**
 * When an article was published, if it ever was.
 *
 * ## Why this is a union rather than two required fields
 *
 * Every article carried a `publishedAt` from the day it was written \u2014
 * 2026-09-01, 09-02, 09-03, 09-05 \u2014 and the launch gate established that
 * those were the *authoring* dates: they match the commit dates of the writing
 * batches, and no article has ever been public. They were harmless only
 * because every consumer gates on `status`, so nothing rendered them. The
 * first publish would have turned them into public claims about a publication
 * that never happened, backdated by however long the review took.
 *
 * Modelling publication as a union makes the invalid states unrepresentable
 * rather than merely discouraged, exactly as `PuppyStagePublication` does:
 *
 *  - `in-review` **cannot** carry a publication date. `publishedAt?: undefined`
 *    is not the same as omitting the field \u2014 it makes setting one a type
 *    error, so an article cannot claim a publication it has not had.
 *  - `published` **must** carry one, so there is no way to publish and leave
 *    the date to be filled in later or inferred from somewhere else.
 *
 * The old values were removed rather than moved to a `draftedAt` field.
 * Nothing read them, the byline only ever used them to decide whether an
 * article had been revised, and adding a private field for data with no
 * consumer is how the original problem started.
 */
export type ArticlePublication =
  | {
      status: "in-review";
      /** Not merely optional \u2014 forbidden. An unpublished article has no date. */
      publishedAt?: undefined;
      updatedAt?: undefined;
    }
  | {
      status: "published";
      /** ISO `YYYY-MM-DD`. The day this article first went live. */
      publishedAt: string;
      /** ISO date of a meaningful public revision. Absent until one happens. */
      updatedAt?: string;
    };

export type Article = ArticleContent & ArticlePublication;

export const articles: readonly Article[] = [
  {
    slug: "dog-trainers-greater-vancouver",
    section: "dogs",
    subcategory: "Local directory",
    visualStyle: "unleashed",
    title: "Dog Trainers in Greater Vancouver: An Independent Starting Directory",
    deck: "Compare five Vancouver-based training businesses, their stated methods and service formats, with dated Google Maps ratings and questions to ask before booking.",
    metaDescription: "Compare Greater Vancouver dog trainers, dated Google Maps ratings, service areas and training formats. An independent directory, not a ranking.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "training-forest-path",
    mediaAlt: "A dog watches a handler's signal on a forest path; illustrative stock photography, not a listed trainer.",
    tags: ["dog-training", "greater-vancouver", "trainer-directory"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-29",
    keyTakeaways: [
      "Initial Vancouver-focused coverage; five businesses listed alphabetically, not ranked.",
      "Google Maps ratings and counts were checked October 28, 2026 and can change.",
      "Ask about methods, suitability and written terms; stars do not verify credentials or outcomes."
    ],
    relatedSlugs: ["loose-leash-walking-and-recall", "puppy-socialisation-checklist"],
    sources: [{ label: "Humane dog training position statement", publisher: "American Veterinary Society of Animal Behavior", url: "https://avsab.org/wp-content/uploads/2021/08/AVSAB-Humane-Dog-Training-Position-Statement-2021.pdf" }],
    needsVerification: ["Owner-approved release 2026-10-29; Maps observations remain explicitly dated October 28, 2026; no paid listing or referral relationship exists."]
  },
  {
    slug: "raw-pet-food-canada-risks-nutrition",
    section: "health",
    subcategory: "Food decisions",
    visualStyle: "unleashed",
    title: "Raw Pet Food in Canada: Evidence, Safety and Manufacturers",
    deck: "Separate proposed benefits from evidence, understand nutrition and household risks, and explore a starting directory of Canadian manufacturers by province.",
    metaDescription: "Compare raw pet food evidence, nutritional adequacy and household risks, with a starting directory of Canadian manufacturers by province.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "health-vet-examining-dog",
    mediaAlt: "A veterinarian examines a small dog; an editorial stock photograph, not a review or endorsement of raw food.",
    tags: ["raw-pet-food", "nutrition", "food-safety", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-29",
    updatedAt: "2026-10-31",
    veterinaryNotice: true,
    keyTakeaways: [
      "CVMA says documented risks outweigh purported benefits; PHAC advises against raw pet food and treats.",
      "Raw does not mean nutritionally complete, and freezing does not remove every pathogen.",
      "Manufacturer listings are factual starting points, not nutrition endorsements or current affiliate partners."
    ],
    relatedSlugs: ["reading-a-canadian-pet-food-label", "pet-food-storage-container-original-bag", "finding-a-veterinarian-in-canada"],
    sources: [
      { label: "Safety of raw meat-based pet food products", publisher: "Canadian Veterinary Medical Association", url: "https://www.canadianveterinarians.net/policy-and-outreach/position-statements/statements/safety-of-raw-meat-based-pet-food-products" },
      { label: "Pet food and treats", publisher: "Public Health Agency of Canada", url: "https://www.canada.ca/en/public-health/services/food-safety/pet-food-treats.html" },
      { label: "Raw meat-based diets for pets", publisher: "World Small Animal Veterinary Association", url: "https://wsava.org/wp-content/uploads/2021/04/Raw-Meat-Based-Diets-for-Pets_WSAVA-Global-Nutrition-Toolkit.pdf" }
    ],
    needsVerification: ["Owner-approved release 2026-10-29; manufacturer location and distribution evidence checked October28,2026, not a product audit or endorsement."]
  },
  {
    slug: "cat-pregnancy-signs-and-tests",
    visualStyle: "unleashed",
    section: "cats",
    subcategory: "Pregnancy and health",
    title: "Cat Pregnancy: Signs, Tests, Gestation and Care",
    deck: "Possible signs are not confirmation. Learn how vets test for pregnancy, how long it lasts, everyday care and when your cat needs urgent help.",
    metaDescription: "Learn possible cat pregnancy signs, veterinary tests, gestation length, everyday care and when to seek urgent help.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "cats-window-tabby",
    mediaAlt: "A ginger tabby cat rests on a windowsill; this is not a diagnostic pregnancy photograph.",
    tags: [
      "cat-pregnancy",
      "pregnancy-tests",
      "pet-health"
    ],
    indexable: true,
    veterinaryNotice: true,
    keyTakeaways: [
      "Appearance and behaviour cannot confirm or rule out pregnancy.",
      "A veterinarian chooses testing and timing; an early negative may need repeating.",
      "An unwell pet needs care rather than waiting for a pregnancy-test appointment."
    ],
    relatedSlugs: [
      "finding-a-veterinarian-in-canada",
      "emergency-vet-visits-in-canada",
      "cost-of-owning-a-cat-in-canada"
    ],
    sources: [
      { label: "Pregnancy and parturition in cats", publisher: "VCA Animal Hospitals", url: "https://vcahospitals.com/know-your-pet/pregnancy-and-parturition-in-cats" },
      { label: "Feeding practices in small animals", publisher: "Merck Veterinary Manual", url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/feeding-practices-in-small-animals" },
      {
        label: "Pregnancy in cats",
        publisher: "PDSA",
        url: "https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/pregnancy-in-cats"
      },
      {
        label: "Management of reproduction of cats",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/cat-owners/reproductive-disorders-of-cats/management-of-reproduction-of-cats"
      },
      {
        label: "Pregnancy determination in bitches and queens",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/pregnancy-determination-in-bitches-and-queens"
      },
      {
        label: "Relaxin (Lateral Flow): species-specific testing windows",
        publisher: "Texas A&M Veterinary Medical Diagnostic Laboratory",
        url: "https://tvmdl.tamu.edu/tests/relaxin-lateral-flow/"
      },
      {
        label: "Reproductive disorders of female cats",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/cat-owners/reproductive-disorders-of-cats/reproductive-disorders-of-female-cats"
      },
      {
        label: "Pyometra",
        publisher: "American College of Veterinary Surgeons",
        url: "https://www.acvs.org/small-animal/pyometra/"
      },
      {
        label: "Serologic test kits",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/clinical-pathology-and-procedures/diagnostic-procedures-for-the-private-practice-laboratory/serologic-test-kits"
      }
    ],
    status: "published",
    publishedAt: "2026-10-25",
    updatedAt: "2026-10-29",
    needsVerification: []
  },
  {
    slug: "dog-pregnancy-signs-and-tests",
    visualStyle: "unleashed",
    section: "dogs",
    subcategory: "Pregnancy and health",
    title: "Dog Pregnancy: Signs, Tests, Gestation and Care",
    deck: "Understand possible signs, false pregnancy, veterinary testing, gestation and everyday care—without relying on appearance or a due-date calculator.",
    metaDescription: "Understand dog pregnancy signs, false pregnancy, veterinary testing, gestation, feeding and when to call a veterinarian.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "health-dog-on-bed",
    mediaAlt: "A small dog rests on a bed beside a hand; this is not a diagnostic pregnancy photograph.",
    tags: [
      "dog-pregnancy",
      "pregnancy-tests",
      "pet-health"
    ],
    indexable: true,
    veterinaryNotice: true,
    keyTakeaways: [
      "Appearance and behaviour cannot confirm or rule out pregnancy.",
      "A veterinarian chooses testing and timing; an early negative may need repeating.",
      "An unwell pet needs care rather than waiting for a pregnancy-test appointment."
    ],
    relatedSlugs: [
      "finding-a-veterinarian-in-canada",
      "emergency-vet-visits-in-canada",
      "cost-of-owning-a-dog-in-canada"
    ],
    sources: [
      { label: "Feeding practices in small animals", publisher: "Merck Veterinary Manual", url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/feeding-practices-in-small-animals" },
      { label: "Disorders of calcium metabolism in dogs", publisher: "Merck Veterinary Manual", url: "https://www.merckvetmanual.com/dog-owners/metabolic-disorders-of-dogs/disorders-of-calcium-metabolism-in-dogs" },
      { label: "Whelping: when to seek help", publisher: "PDSA", url: "https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/other-veterinary-advice/whelping-a-guide-to-your-dog-giving-birth" },
      {
        label: "Pregnancy in dogs",
        publisher: "PDSA",
        url: "https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/pregnancy-in-dogs"
      },
      {
        label: "Dog estrous cycles",
        publisher: "Cornell University College of Veterinary Medicine",
        url: "https://www.vet.cornell.edu/dog-estrous-cycles"
      },
      {
        label: "Pregnancy Diagnosis in the Bitch",
        publisher: "UC Davis School of Veterinary Medicine",
        url: "https://healthtopics.vetmed.ucdavis.edu/health-topics/canine/pregnancy-diagnosis-bitch"
      },
      {
        label: "Pregnancy determination in bitches and queens",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/pregnancy-determination-in-bitches-and-queens"
      },
      {
        label: "Relaxin (Lateral Flow): species-specific testing windows",
        publisher: "Texas A&M Veterinary Medical Diagnostic Laboratory",
        url: "https://tvmdl.tamu.edu/tests/relaxin-lateral-flow/"
      },
      {
        label: "Pregnancy Testing in the Dog",
        publisher: "VCA Animal Hospitals",
        url: "https://vcahospitals.com/clinton-township/know-your-pet/pregnancy-testing-in-the-dog"
      },
      {
        label: "The reproductive system in animals",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/reproductive-system/reproductive-system-introduction/the-reproductive-system-in-animals"
      },
      {
        label: "Pyometra",
        publisher: "American College of Veterinary Surgeons",
        url: "https://www.acvs.org/small-animal/pyometra/"
      }
    ],
    status: "published",
    publishedAt: "2026-10-25",
    updatedAt: "2026-10-29",
    needsVerification: []
  },
  {
    slug: "choosing-dog-boots-in-canada",
    section: "dogs",
    subcategory: "Buying guides",
    title: "Choosing Dog Boots in Canada: Measure, Compare and Check the Fit",
    deck: "Compare model-specific sizing, two-boot and four-boot packs, care and Canadian return terms before choosing dog boots.",
    metaDescription: "Choose dog boots using model-specific measurements, pack quantities, care and return terms. Compare Ruffwear and Muttluks features without a tested ranking.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "guides-dogs-winter-forest",
    mediaAlt: "Two dogs stand among snow-covered pines in a winter forest.",
    tags: [
      "dog-boots",
      "winter",
      "buying-guides"
    ],
    indexable: true,
    veterinaryNotice: true,
    keyTakeaways: [
      "Use the exact model’s measuring directions; width and length charts are not interchangeable.",
      "Compare the cost of the required number of boots, including care and return conditions.",
      "Read sole restrictions before a trial: some winter designs are specified for outdoor use only."
    ],
    relatedSlugs: [
      "winter-dog-care-in-canada",
      "choosing-a-dog-harness-in-canada",
      "cost-of-owning-a-dog-in-canada"
    ],
    sources: [
      {
        label: "Cold Weather and Pets",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/related-resources/cold-weather-and-pets"
      },
      {
        label: "Polar Trex Winter Boots: model, sizing and care",
        publisher: "Ruffwear Canada",
        url: "https://ruffwear.ca/products/polar-trex-winter-dog-boots"
      },
      {
        label: "Sizing Muttluks Boots",
        publisher: "Muttluks",
        url: "https://muttluks.ca/pages/dog-boots-size-chart"
      },
      {
        label: "Original Fleece-Lined Muttluks: package, materials and care",
        publisher: "Muttluks",
        url: "https://muttluks.ca/products/original-fleece-lined-muttluks"
      }
    ],
    status: "published",
    publishedAt: "2026-10-18",
    needsVerification: []
  },
  {
    slug: "choosing-a-cat-scratching-post-in-canada",
    section: "cats",
    subcategory: "Buying guides",
    title: "Choosing a Cat Scratching Post in Canada: Surface, Size and Space",
    deck: "Match a cat scratcher to observed habits, usable surface and home space, then compare manufacturer details and Canadian purchase conditions.",
    metaDescription: "Choose a cat scratching post or board using surface, usable size and floor space. Compare two examples and a practical Canadian shopping worksheet.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "cats-window-tabby",
    mediaAlt: "A ginger tabby cat lies on a windowsill in daylight, watching outside.",
    tags: [
      "cat-scratchers",
      "enrichment",
      "buying-guides"
    ],
    indexable: true,
    veterinaryNotice: true,
    keyTakeaways: [
      "Observe your cat’s scratching direction, preferred texture and location before shopping.",
      "Separate usable scratching surface from overall product dimensions and floor footprint.",
      "Check assembly, included accessories, replacements and Canadian return terms."
    ],
    relatedSlugs: [
      "indoor-cat-enrichment-canadian-homes",
      "cost-of-owning-a-cat-in-canada",
      "choosing-a-cat-puzzle-feeder"
    ],
    sources: [
      {
        label: "Living with a Clawed Cat",
        publisher: "Feline Veterinary Medical Association / Cat Friendly Homes",
        url: "https://catfriendly.com/be-a-cat-friendly-caregiver/living-clawed-cat/"
      },
      {
        label: "SmartCat Ultimate Scratching Post: manufacturer specifications",
        publisher: "Pioneer Pet",
        url: "https://pioneerpet.com/product/3832-ultimate-scratching-post/"
      },
      {
        label: "SmartCat Ultimate Scratching Post: Canadian retail listing",
        publisher: "Pet Valu",
        url: "https://www.petvalu.ca/product/smartcat-ultimate-scratching-post/SCM06958"
      },
      {
        label: "Senses Oval Scratcher: model and dimensions",
        publisher: "Catit",
        url: "https://www.catit.com/products/toys/senses-oval-scratcher/"
      },
      {
        label: "Catit Senses 2.0 Oval Scratcher: Canadian listing",
        publisher: "Homes Alive Pets",
        url: "https://www.homesalive.ca/cat/scratchers/catit-senses-2-0-oval-scratcher.html"
      }
    ],
    status: "published",
    publishedAt: "2026-10-18",
    needsVerification: []
  },
  {
    "slug": "choosing-a-cat-carrier-in-canada",
    "section": "cats",
    "subcategory": "Buying guides",
    "title": "Choosing a Cat Carrier in Canada: Size, Access and Fit",
    "deck": "Compare cat-carrier size, access, closures and cleaning, then check Canadian shopping options and the requirements for your actual journey.",
    "metaDescription": "Compare hard and soft cat carriers, check size and access, and review Canadian shopping options and airline rules before choosing a carrier for your cat.",
    "authorId": "pet-club-editorial",
    "readingMinutes": 6,
    "mediaId": "health-cat-in-carrier",
    "mediaAlt": "An orange tabby cat rests inside a pet carrier; this stock photograph does not show either product compared in the guide.",
    "tags": [
      "cats",
      "carriers",
      "buying-guides",
      "travel",
      "canada"
    ],
    "indexable": true,
    "status": "published",
    publishedAt: "2026-10-17",
    "veterinaryNotice": true,
    "keyTakeaways": [
      "Check your cat’s measurements and the exact model’s intended weight limit.",
      "Compare usable space, entry points, closures and cleaning access.",
      "Confirm the transport operator’s current requirements and the seller’s return conditions before buying."
    ],
    "relatedSlugs": [
      "travelling-with-a-pet-in-canada",
      "cost-of-owning-a-cat-in-canada",
      "pet-emergency-preparedness-canada"
    ],
    "sources": [
      {
        "label": "Choosing the Right Cat Carrier",
        "publisher": "Edmonton Humane Society",
        "url": "https://www.edmontonhumanesociety.com/wp-content/uploads/2024/09/2024-choosing-cat-carrier-EHS-Resources.pdf"
      },
      {
        "label": "Choosing the Perfect Cat Carrier",
        "publisher": "Cat Friendly Homes / FelineVMA",
        "url": "https://catfriendly.com/be-a-cat-friendly-caregiver/cat-carriers/"
      },
      {
        "label": "Current in-cabin carrier requirements",
        "publisher": "Air Canada",
        "url": "https://www.aircanada.com/ca/en/aco/home/plan/special-assistance/pets.html"
      },
      {
        "label": "PIXI Mio specifications and intended size limits",
        "publisher": "Catit",
        "url": "https://www.catit.com/products/catit-pixi-mio-carrier/"
      },
      {
        "label": "Original Deluxe product specifications",
        "publisher": "Sherpa",
        "url": "https://sherpapet.com/products/sherpa-original-deluxe-travel-bag-pet-carrier?Color=Black&Size=Medium"
      }
    ],
    "needsVerification": []
  },
  {
    slug: "choosing-a-cat-puzzle-feeder",
    section: "cats",
    subcategory: "Buying guides",
    title: "Choosing a Cat Puzzle Feeder: A Canadian Buying Checklist",
    deck: "Compare food compatibility, easy settings, space, cleaning and Canadian purchase conditions before choosing a cat puzzle feeder.",
    metaDescription: "Choose a cat puzzle feeder by food type, access, space and cleaning. Includes a Canadian buying checklist and a sourced Catit Digger example.",
    authorId: "pet-club-editorial",
    readingMinutes: 4,
    mediaId: "cats-feather-toy-play",
    mediaAlt: "A grey cat holds a feather toy between its paws, illustrating play rather than a feeder product test.",
    tags: ["cats", "puzzle-feeders", "buying-guides", "enrichment"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-16",
    veterinaryNotice: true,
    keyTakeaways: ["Match the feeder to the food and activity before comparing brands.", "Start with easy access and keep the normal food bowl available while learning.", "Check assembled size, cleaning directions and Canadian return conditions."],
    relatedSlugs: ["indoor-cat-enrichment-canadian-homes", "cost-of-owning-a-cat-in-canada", "pet-food-storage-container-original-bag"],
    sources: [
      { label: "Introducing a puzzle feeder", publisher: "BC SPCA", url: "https://spca.bc.ca/article/five-tips-for-introducing-a-puzzle-feeder-to-your-cat/" },
      { label: "Senses Digger specifications", publisher: "Catit", url: "https://www.catit.com/products/toys/senses-digger/" },
      { label: "Digger cleaning instructions", publisher: "Catit", url: "https://www.catit.com/spotlight/catit-senses-digger-cleaning-guide/" },
      { label: "Canadian product listing and supervision instructions", publisher: "Homes Alive Pets", url: "https://www.homesalive.ca/catit-senses-2-0-digger.html" },
    ],
    needsVerification: [],
  },
  {
    slug: "pet-food-storage-container-original-bag",
    section: "canadian-life",
    subcategory: "Buying guides",
    title: "Pet Food Storage Containers: Fit the Original Bag",
    deck: "Measure your dry-food bag, compare usable container dimensions and check cleaning, storage and Canadian checkout details before buying.",
    metaDescription: "Buying a dog or cat food storage container? Use this original-bag measurement worksheet, cleaning checklist and Canadian purchase guide.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "food-pouring-kibble",
    mediaAlt: "A hand tilts an unbranded paper bag containing dry pet food; no storage container is pictured.",
    tags: ["pet-food", "storage", "buying-guides", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-16",
    veterinaryNotice: true,
    keyTakeaways: ["Compare the full bag with the usable interior and lid opening, not only a weight-capacity label.", "Keep the original packaging and its product and batch information.", "Choose a container you can clean and dry, and follow the food manufacturer's storage directions."],
    relatedSlugs: ["reading-a-canadian-pet-food-label", "cost-of-owning-a-dog-in-canada", "choosing-a-cat-puzzle-feeder"],
    sources: [
      { label: "Proper storage of pet food and treats", publisher: "US Food and Drug Administration", url: "https://www.fda.gov/animal-veterinary/animal-health-literacy/proper-storage-pet-food-treats" },
      { label: "Pet food storage guidance", publisher: "Hill's Pet Nutrition Canada", url: "https://www.hillspet.ca/content/cp-sites-aem/hills/hills-pet/en_ca/home/pet-care/nutrition-feeding/cat-and-dog-food-storage-tips.html" },
    ],
    needsVerification: [],
  },

  {
    slug: "choosing-a-dog-harness-in-canada",
    section: "dogs",
    subcategory: "Buying guides",
    title: "Choosing a Dog Harness in Canada: Fit, Features and Returns",
    deck: "Build a practical harness shortlist using model-specific sizing, attachment instructions, care requirements and Canadian retailer return conditions.",
    metaDescription: "Compare dog harness sizing, attachment points, cleaning instructions and Canadian returns before buying. A practical checklist without untested product rankings.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "dogs-autumn-bridge",
    tags: ["dogs", "harnesses", "buying-guides", "puppies"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-10",
    veterinaryNotice: true,
    keyTakeaways: ["Use the exact model’s size chart, not a familiar size label.", "Check fastening, leash attachment and care instructions before purchase.", "Compare delivered cost and return eligibility with the Canadian retailer."],
    relatedSlugs: ["loose-leash-walking-and-recall", "cost-of-owning-a-dog-in-canada", "bringing-home-a-puppy-first-30-days"],
    relatedCategorySlugs: ["puppies"],
    sources: [
      { label: "Selecting and fitting a dog harness", publisher: "Edmonton Humane Society", url: "https://www.edmontonhumanesociety.com/wp-content/uploads/2024/05/2023-canine-harness-selection-EHS-Resources.pdf" },
      { label: "Evolution Step-in Harness sizing and instructions", publisher: "RC Pets", url: "https://rcpets.com/evolution-step-in-harness/" },
    ],
    needsVerification: [],
  },
  {
    slug: "winter-dog-care-in-canada",
    section: "dogs",
    subcategory: "Seasonal care",
    title: "Winter Dog Care in Canada",
    deck: "Plan winter dog walks in Canada: cold-weather decisions, paw cleaning, coat and boot fit, ice-melt precautions and when to call a vet.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "guides-dogs-winter-forest",
    mediaAlt:
      "Two dogs standing among snow-covered pines on a still winter day in the forest.",
    tags: ["winter", "seasonal-care", "paw-care", "safety", "dogs"],
    indexable: true,
    status: "published",
    updatedAt: "2026-10-25",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Consider weather and ground conditions alongside your dog's age, coat, health and signs of discomfort.",
      "Inspect and clean paws after winter walks; road salt and de-icers can irritate them.",
      "Antifreeze and frozen water bodies are absolutes, not judgement calls.",
      "Choose clothing for the individual dog and conditions; check fit and replace wet items.",
      "Offer suitable indoor activities without assuming they replace a fixed amount of walking.",
    ],
    relatedSlugs: [
      "choosing-dog-boots-in-canada",
      "bringing-home-a-puppy-first-30-days",
      "emergency-vet-visits-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "dog-training-and-behaviour", "general-dog-discussion"],
    sources: [
      { label: "Cold Weather Safety Tips", publisher: "ASPCA Animal Poison Control Center", url: "https://www.aspca.org/pet-care/general-pet-care/cold-weather-safety-tips" },
      { label: "Cold Weather and Pets", publisher: "Canadian Veterinary Medical Association", url: "https://www.canadianveterinarians.net/related-resources/cold-weather-and-pets" },
      {
        label: "Cold weather animal safety — why there is no single temperature threshold",
        publisher: "American Veterinary Medical Association",
        url: "https://www.avma.org/resources-tools/pet-owners/petcare/cold-weather-animal-safety",
      },
      {
        label: "Frostbite in dogs, and what not to do while warming an affected area",
        publisher: "VCA Animal Hospitals",
        url: "https://vcahospitals.com/know-your-pet/frostbite-in-dogs",
      },
      {
        label: "Ethylene glycol (antifreeze) poisoning",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/special-pet-topics/poisoning/ethylene-glycol-antifreeze-poisoning",
      },
      {
        label: "The dangers of ice melts, including products sold as pet-safe",
        publisher: "ASPCA Animal Poison Control Center",
        url: "https://www.aspca.org/news/keeping-pets-safe-during-winter-dangers-ice-melts",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "Whether to name specific temperature guidance for small or short-coated dogs — still omitted rather than estimated, and the AVMA source supports omitting it.",
    ],
  },
  {
    slug: "indoor-or-outdoor-cats-in-canada",
    section: "cats",
    subcategory: "Living arrangements",
    title: "Indoor and Outdoor Cats in Canada: Safer Access and Home Setup",
    deck: "Compare indoor living and contained outdoor access, check local rules, and plan enrichment, supervision and secure equipment for your cat.",
    metaDescription: "Compare indoor living and contained outdoor access, check local rules, and plan enrichment, supervision and secure equipment for your cat.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "cats-window-tabby",
    mediaAlt:
      "A ginger tabby cat lying on a windowsill in daylight, watching the street outside.",
    tags: ["indoor-cats", "enrichment", "safety", "wildlife", "cats"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Provide indoor activities as well as secure boundaries.", "Check municipal rules and property permission before changing outdoor access.", "Containment and supervision need ongoing maintenance."],
    relatedSlugs: [
      "indoor-cat-enrichment-canadian-homes",
      "bringing-home-a-kitten-first-30-days",
    ],
    relatedCategorySlugs: ["cat-behaviour", "cat-health", "general-cat-discussion"],
    sources: [
      {"label": "Indoor and outdoor cat welfare guidance", "publisher": "BC SPCA", "url": "https://spca.bc.ca/article/how-to-keep-your-cat-happy-feline-enrichment-tips/"},
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "renting-with-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Housing",
    title: "Renting With a Pet in Canada: Rules, Deposits and Written Permission",
    deck: "Check provincial tenancy guidance, building pet rules and lawful deposits before renting with a dog or cat in Canada.",
    metaDescription: "Check provincial tenancy guidance, building pet rules and lawful deposits before renting with a dog or cat in Canada.",
    authorId: "pet-club-editorial",
    readingMinutes: 4,
    mediaId: "about-kitchen-play",
    mediaAlt: "A man crouches in the kitchen of a rented home, playing with a white dog.",
    tags: ["housing", "renting", "tenancy", "moving", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    keyTakeaways: ["Permission and lawful fees are separate questions.", "Ontario, BC and Québec have different rules and case-specific exceptions.", "Keep agreements, inspection records and receipts."],
    relatedSlugs: [
      "travelling-with-a-pet-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "canadian-pet-products"],
    sources: [
      {"label": "Standard lease guide", "publisher": "Ontario Ministry of Municipal Affairs and Housing", "url": "https://files.ontario.ca/mmah-guide-to-standard-lease-for-rental-housing-en-2022-04-19.pdf"},
      {"label": "Pets and tenancy", "publisher": "Province of British Columbia", "url": "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/pets-and-tenancy"},
      {"label": "Deposits and fees", "publisher": "Province of British Columbia", "url": "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/starting-a-tenancy/deposits-fees"},
      {"label": "Rights and obligations", "publisher": "Gouvernement du Québec", "url": "https://www.quebec.ca/en/housing-territory/renting/rights-and-obligations-of-the-lessor-and-lessee"},
      {"label": "Pet case summaries", "publisher": "Tribunal administratif du logement", "url": "https://www.tal.gouv.qc.ca/en/summary-decisions-pets"},
    ],
    needsVerification: [],
  },

  /* ---------------------------------------------------------------- Batch A
     A puppy cluster. These four are written to be read together: a reader who
     arrives on any one of them is one click from the other three, and between
     them they cover the first year of owning a dog in this country. */

  {
    slug: "bringing-home-a-puppy-first-30-days",
    section: "dogs",
    subcategory: "New owners",
    title: "Bringing Home a Puppy: The First 30 Days",
    deck: "A week-by-week account of what actually fills the first month — sleep, toilet trips in a Canadian winter, socialisation on a deadline, and teaching a puppy to be alone.",
    metaDescription:
      "What actually fills a puppy’s first month, week by week: sleep, house-training in winter, socialisation on a deadline, and alone-time training.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "dogs-black-lab-puppy",
    mediaAlt:
      "A black Labrador puppy lying on a wooden floor, head down, watching the room.",
    tags: ["puppies", "new-owners", "house-training", "socialisation", "dogs"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-09-27",
    veterinaryNotice: true,
    keyTakeaways: [
      "Sleep, toilet trips, socialisation and alone-time training are the whole first month — recall and lead work can wait.",
      "If you are considering insurance, review the policy early; do not delay veterinary care for insurance timing.",
      "Teach being alone from the first full day, in seconds. It is the most-skipped step and the hardest to fix later.",
      "A winter puppy needs a shovelled toilet patch and an owner dressed to stand outside with it.",
      "Puppies sleep a great deal in short bouts, but a single daily-hour figure is not a reliable rule for every puppy.",
    ],
    relatedSlugs: [
      "puppy-vaccination-schedule-in-canada",
      "crate-training-a-puppy-in-canada",
    ],
    relatedCategorySlugs: [
      "puppies",
      "dog-training-and-behaviour",
      "general-dog-discussion",
    ],
    sources: [
      {
        label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia",
        publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
        url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
      },
      {
        label:
          "Sleep Duration and Behaviours: A Descriptive Analysis of a Cohort of Dogs up to 12 Months of Age \u2014 owner-reported mean total sleep of 11.2 h at sixteen weeks",
        publisher: "Generation Pup, Animals 2020;10(7):1172",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7401528/",
      },
      {
        label: "Position statement on puppy socialization, and why it precedes full vaccination",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://avsab.org/puppy-socialization-position-statement/",
      },
      {
        label:
          "Pre-existing-condition definition — signs or symptoms before enrolment, the effective date, or during the waiting period",
        publisher: "Fetch Pet Insurance Canada",
        url: "https://www.fetchpet.com/canada/faqs/what-is-pre-existing-conditions",
      },
      {
        label:
          "Coverage start and waiting periods — conditions beginning during the applicable waiting period are treated as pre-existing",
        publisher: "Trupanion Canada",
        url: "https://www.trupanion.com/en-ca/pet-insurance-faq/article/when-does-my-coverage-begin",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 NARROWED, 2026-09-06. The VetNote previously said very young puppies \u201chave little reserve, and a problem that would be minor in an adult dog can become serious quickly\u201d \u2014 an unregistered general claim about physiological reserve, for which no source was found. It now names dehydration and low blood sugar specifically. Sourced to Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06: \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d, and pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system. See the standing guardrail on the emergency guide; the three articles must not drift apart.",
      "RESOLVED 2026-09-06 \u2014 the sixteen-to-eighteen-hours sleep figure, shared with the crate guide and resolved identically. Both articles now cite the Generation Pup cohort study, carry its owner-reported limitation, and use compatible wording. Neither states a precise daily total as fact.",
      "STANDING GUARDRAIL \u2014 the two puppy guides state sleep the same way. Do not let one drift to a precise number the other does not carry, and do not introduce the age-in-months-plus-one-hour rule here; it was removed from the crate guide for want of a source.",
      "STANDING GUARDRAIL \u2014 That most Canadian municipalities require dogs to be licensed — stated generally rather than enumerated; confirm before naming a proportion.",
      "OPEN (NON-BLOCKING) \u2014 The 14–16 week close of the primary socialisation window, against the same source used in the vaccination guide.",
    ],
  },
  {
    slug: "puppy-vaccination-schedule-in-canada",
    section: "dogs",
    subcategory: "Health",
    title: "Puppy Vaccination Schedule in Canada",
    deck: "Why the puppy series is several appointments rather than one, what core and non-core actually mean here, and which parts a veterinarian decides rather than an article.",
    metaDescription:
      "Why a puppy needs a series rather than one shot, what core and non-core mean in Canada, and the questions worth asking at the first appointment.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "dogs-golden-in-leaves",
    tags: ["puppies", "vaccination", "preventative-care", "socialisation", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "The series exists because nobody can see when maternal antibodies fade, so it takes several attempts spaced two to four weeks apart.",
      "The final dose comes after 16 weeks — later than most people expect, and 18–20 weeks where distemper or parvovirus risk is high.",
      "Core now means distemper, adenovirus, parvovirus, leptospirosis and rabies. Leptospirosis was reclassified as core in 2024; a lot of advice online predates that.",
      "Rabies is a legal requirement in some provinces and not others — Ontario requires it, British Columbia does not.",
      "Guidance now points to a further dose at around six months rather than waiting a year. Ask which schedule your clinic follows.",
      "Socialise deliberately in low-risk ways while the window is open: it is the first three months, and it closes before the series does.",
    ],
    relatedSlugs: [
      "bringing-home-a-puppy-first-30-days",
      "finding-a-veterinarian-in-canada",
    ],
    relatedCategorySlugs: ["puppies", "dog-health", "vet-costs"],
    sources: [
      {
        label:
          "Rabies information for veterinary clinics \u2014 quarantine after exposure, and the 96-hour booster window for fully vaccinated animals",
        publisher: "Government of Alberta",
        url: "https://www.alberta.ca/rabies-information-for-veterinary-clinics",
      },
      {
        label: "2022 Canine Vaccination Guidelines, and the 2024 update making leptospirosis core",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/",
      },
      {
        label: "2024 Guidelines for the Vaccination of Dogs and Cats",
        publisher: "World Small Animal Veterinary Association",
        url: "https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf",
      },
      {
        label: "Position statement on puppy socialization",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://avsab.org/puppy-socialization-position-statement/",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 VERIFIED, 2026-09-06. Alberta post-exposure management, re-read on the province's rabies information for veterinary clinics page. The range is current, and verbatim: \u201cCats, dogs and ferrets that are unvaccinated or do not receive a booster vaccination promptly after exposure may require a 3- to 6-month quarantine\u201d, while \u201cfully vaccinated cats, dogs and ferrets that receive a booster vaccine within 96 hours after exposure will not require quarantine\u201d. The decision is the public health veterinarian's, and where the offending animal is unavailable or untestable the need for and duration of quarantine come from that veterinarian's risk assessment. Other species are handled separately. The article previously said only \u201can unvaccinated\u201d animal and gave no booster window; it now carries the \u201cor not boosted promptly\u201d half, the 96-hour figure, who decides, and the explicit statement that this is Alberta's framework rather than the country's.",
      "STANDING GUARDRAIL \u2014 post-exposure management is conditional, not a duration. Do not reduce it to a universal quarantine figure, do not extend Alberta's framework to other provinces, and do not name another province's range without that province's own source.",
      "The British Columbia rabies wording was corrected on 2026-09-06. The schedule table previously said \u201cBritish Columbia sets no legal requirement at all\u201d \u2014 an exhaustive negative legal claim, and no authoritative source states it. The BCCDC rabies page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them does; proving the absence of a law is a different exercise from reading one. The table now carries only the positive claim BCCDC does make \u2014 that pets should be vaccinated and kept up to date \u2014 says plainly that we are not presenting a province-wide legal requirement, and leaves municipal, travel and bite-investigation rules explicitly open. Do not restore the stronger wording without a named statute or regulation.",
      "Ontario's threshold is quoted from the primary regulation: R.R.O. 1990, Reg. 567 (Rabies Immunization) under the Health Protection and Promotion Act, s. 1 \u2014 \u201ca cat, dog or ferret three months of age or over\u201d, verified against e-Laws on 2026-09-06 at consolidation from 2023-07-01, last amendment O. Reg. 67/23. \u201cOr over\u201d is inclusive, so the anniversary day itself is inside the duty. Do not paraphrase it back to \u201cover three months\u201d or \u201cafter three months\u201d, both of which exclude that day.",
      "Ontario and British Columbia are named because both were confirmed against a government source. Every other province and territory is still described generically — establish each before any of them is named.",
      "The regions of Canada where blacklegged ticks are established, before naming any of them.",
      "Whether Canadian provincial regulators or the CVMA have taken a formal position on leptospirosis as core, distinct from the AAHA and WSAVA positions the article cites.",
    ],
  },
  {
    slug: "crate-training-a-puppy-in-canada",
    section: "dogs",
    subcategory: "Training",
    title: "Crate Training a Puppy in Canada",
    deck: "A four-week plan for a dog that goes into an open crate to sleep — plus how long is too long, the five mistakes everyone makes, and how to tell when a crate is the wrong tool.",
    metaDescription:
      "A four-week crate training plan, how long is too long, the five common mistakes, and how to tell when a crate is the wrong tool for your dog.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "training-dog-in-crate",
    mediaAlt:
      "A dog dozing on a cushion inside an open wire crate — the thing the guide is trying to build.",
    tags: ["puppies", "crate-training", "training", "alone-time", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Buy the crate for the adult dog and use the divider — a crate a puppy can toilet at one end of loses the house-training benefit.",
      "Feed every meal inside it with the door open for the first few days. Ask for nothing else.",
      "Put it in your bedroom for the first few weeks; a puppy that can hear people settles far faster.",
      "Use a release word every time the door opens, and never open it in response to screaming.",
      "Crate work and alone-time training are the same project — which matters most if you live in an apartment.",
      "Protest fades and distress escalates. If it is distress, stop and use a pen instead.",
    ],
    relatedSlugs: [
      "bringing-home-a-puppy-first-30-days",
      "winter-dog-care-in-canada",
    ],
    relatedCategorySlugs: [
      "dog-training-and-behaviour",
      "puppies",
      "general-dog-discussion",
    ],
    sources: [
      {
        label:
          "House training for puppies and dogs \u2014 elimination intervals by activity, and no more than about three hours alone in a crate",
        publisher: "VCA Animal Hospitals",
        url: "https://vcahospitals.com/know-your-pet/house-training-your-puppy",
      },
      {
        label:
          "Sleep Duration and Behaviours: A Descriptive Analysis of a Cohort of Dogs up to 12 Months of Age \u2014 owner-reported mean total sleep of 11.2 h at sixteen weeks",
        publisher: "Generation Pup, Animals 2020;10(7):1172",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7401528/",
      },
      {
        label: "Position statement on puppy socialization — why early training and rest matter",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://avsab.org/puppy-socialization-position-statement/",
      },
      {
        label: "Residential Tenancies Act, 2006 — section 14 makes a no-pets provision void",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/laws/statute/06r17",
      },
      {
        label: "Pets and tenancy — where a no-pets term is enforceable",
        publisher: "Province of British Columbia",
        url: "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/pets-and-tenancy",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED 2026-09-06 \u2014 the age-in-months-plus-one-hour rule was REMOVED. No veterinary, veterinary-university or peer-reviewed source for the formula could be found, and it produced an actionable figure (four hours for a three-month-old) that owners plan a working day around. Replaced with VCA's house-training intervals, which are guidance rather than a capacity formula: out every one to two hours awake, every four hours even when resting, after meals and naps, roughly every half hour during energetic play, overnight outings often needed until around five months, and no more than about three hours alone in a crate. The article now says explicitly that the formula was taken out and why.",
      "STANDING GUARDRAIL \u2014 no bladder-capacity formula, and no maximum-confinement number that is not attributable to a veterinary source. Do not replace one unsupported figure with another.",
      "RESOLVED 2026-09-06 \u2014 the sixteen-to-eighteen-hours sleep figure was unsourced and higher than anything measured. The Generation Pup cohort study (Animals 2020;10(7):1172) reports owner-reported mean total sleep of 11.2 h (SD 2.9) over 24 hours at sixteen weeks and 10.8 h at twelve months, with median daytime sleep of 3.5 h at sixteen weeks. The article now gives that figure with the study's own limitation \u2014 owners were not observing directly and may not distinguish sleep from rest \u2014 and notes the study's earliest timepoint is sixteen weeks, so it does not measure an eight-week-old.",
      "OPEN (NON-BLOCKING) \u2014 Whether to name the recognised behavioural condition directly rather than describing it, once a veterinary source is attached.",
    ],
  },
  {
    slug: "cost-of-owning-a-dog-in-canada",
    section: "dogs",
    subcategory: "Money",
    title: "How Much Does It Cost to Own a Dog in Canada?",
    deck: "A dated Ontario benchmark, a monthly budget worksheet and local quote checks for food, veterinary care, licensing, equipment and unexpected costs.",
    metaDescription:
      "Build a Canadian dog budget with the OVMA 2026–27 Ontario benchmark, a monthly cost worksheet, local quotes and clear first-year and emergency-cost checks.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "dogs-white-dog-leaves",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-20",
    veterinaryNotice: true,
    keyTakeaways: [
      "OVMA's 2026–27 adult-dog estimate is Ontario-specific, not a national average or a quote for your dog.",
      "Separate startup purchases, monthly bills, planned occasional care and emergency arrangements.",
      "Record quote dates and inclusions, and leave missing prices marked not quoted rather than zero.",
      "Insurance coverage and out-of-pocket costs depend on the policy; do not delay veterinary care.",
      "Use the original-bag storage and dog-harness checklists before buying equipment.",
    ],
    relatedSlugs: [
      "renting-with-a-pet-in-canada",
      "puppy-vaccination-schedule-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "dog-food-and-nutrition"],
    sources: [
      { label: "2026–27 annual dog and puppy cost estimates: Ontario provincial average", publisher: "Ontario Veterinary Medical Association", url: "https://www.ovma.org/getmedia/0be8d20a-759e-47b9-9b16-1607903774fe/OVMA-CostofCare-Canine.pdf?ext=.pdf" },
      { label: "Pet-care planning and ownership commitments", publisher: "Ontario Veterinary Medical Association", url: "https://www.ovma.org/petcare" },
      { label: "Current pet licensing fees", publisher: "City of Toronto", url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/pet-licensing-fees/" },
      { label: "2026 pet licence fee schedule", publisher: "City of Calgary", url: "https://www.calgary.ca/pets/licences.html" },
      { label: "How to adopt and what is included", publisher: "BC SPCA", url: "https://spca.bc.ca/adoption/how-to-adopt/" },
      { label: "Adoption package inclusions", publisher: "Calgary Humane Society", url: "https://www.calgaryhumane.ca/adopt/" },
      { label: "Canadian explanation of pre-existing-condition assessment", publisher: "Trupanion", url: "https://www.trupanion.com/en-ca/pet-insurance-faq/article/how-to-tell-pre-existing-conditions" },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED — October 20, 2026: OVMA's own linked 2026–27 PDF was read and establishes the Ontario adult-dog estimate of CAD4993. Monthly416 is rounded annual/12 arithmetic, not a monthly quote. No Canadian average or individual treatment schedule is claimed.",
      "RESOLVED — October 20, 2026: Toronto and Calgary fees reread from official current pages; BC SPCA stale adoption-fees URL replaced with the current how-to-adopt page. Named adoption examples are not generalised.",
      "RESOLVED — October 20, 2026: Removed unsupported food-cost multiplier and overly absolute insurance/emergency claims. Current Canadian insurer source supports the limited medical-history explanation, not universal policy terms. No clinical recommendation or veterinary review is claimed.",
      "STANDING GUARDRAIL — Recheck dated estimate and municipality fees at the next review. Published estimates may be cited only with year, geography, source and limits; they are not a personalised budget. Do not extrapolate clinical care from cost categories.",
    ],
  },

  /* ---------------------------------------------------------------- Batch B
     The cat side of the same shelf. Deliberately not the dog articles with the
     nouns swapped: the first-month guide is about rooms rather than a
     schedule, the vaccination guide turns on "but my cat never goes outside",
     and the cost guide is built around the two lines dog owners never model —
     litter, and the second cat.

     ⚠️ Photography: the manifest holds three cat photographs and there are now
     five cat articles, so one asset is used twice within this batch and one is
     shared with the indoor/outdoor guide. The repeated pair is placed at the
     first and last positions of the group deliberately — those are diagonal in
     the two-column grid and two cards apart once it stacks into one column on
     a phone, which is the only arrangement that avoids the repeat reading as a
     mistake at both widths. That is mitigation, not a fix. Additional verified
     cat images would improve visual variety in a future update. */

  {
    slug: "bringing-home-a-kitten-first-30-days",
    section: "cats",
    subcategory: "New owners",
    title: "Bringing Home a Kitten: First-Month Preparation",
    deck: "Prepare a starting room, organize records, arrange veterinary care and build a household budget before bringing a kitten home.",
    metaDescription: "Prepare a starting room, organize records, arrange veterinary care and build a household budget before bringing a kitten home.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "cats-kittens-at-window",
    tags: ["kittens", "new-owners", "planning", "budgeting", "cats"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Prepare the home and agree who handles everyday care.", "Keep actual records and mark missing information clearly.", "Discuss feeding and preventive care with your veterinary team.", "Use local quotes and check municipal requirements."],
    relatedSlugs: [
      "finding-a-veterinarian-in-canada",
      "indoor-cat-enrichment-canadian-homes",
    ],
    relatedCategorySlugs: ["kittens", "general-cat-discussion", "cat-behaviour"],
    sources: [{ label: "Cat care: bringing home a new cat and preparing separate spaces", publisher: "BC SPCA", url: "https://spca.bc.ca/get-help/pet-care/cats/" }],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: ["RESOLVED 2026-10-09 — rewritten as home preparation, records and budgeting. Clinical assessment, treatment, fixed introduction timelines, product efficacy and unsourced superlatives were removed, not signed off. BC SPCA source checked for the limited room/resource guidance. No veterinary review is claimed."],
  },
  {
    slug: "kitten-vaccination-schedule-in-canada",
    section: "cats",
    subcategory: "Health",
    title: "Kitten Vaccination Schedule in Canada",
    deck: "What the core feline vaccines are for, why the series takes several appointments rather than one, and the honest answer to “but my cat never goes outside”.",
    metaDescription:
      "What FVRCP and rabies cover, why a kitten needs a series rather than one shot, and a straight answer on vaccinating an indoor-only cat.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-kitten-windowsill",
    tags: ["kittens", "vaccination", "preventative-care", "indoor-cats", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "The series exists because nobody can see when maternal antibodies fade, so it takes several attempts spaced two to four weeks apart.",
      "The final dose comes no earlier than 16 weeks, and current guidance adds a further dose at around six months.",
      "Core is FVRCP (panleukopenia, herpesvirus-1, calicivirus) and rabies — plus FeLV, which is core for every cat in its first year and a lifestyle decision after that.",
      "Rabies is regulated provincially: required by law in Ontario, recommended but not mandated in British Columbia.",
      "Indoor-only lowers exposure but is not zero: cats get out, bats get into Canadian houses, and an unvaccinated cat assessed as exposed can face months of quarantine.",
    ],
    relatedSlugs: [
      "bringing-home-a-kitten-first-30-days",
      "cost-of-owning-a-cat-in-canada",
    ],
    relatedCategorySlugs: ["kittens", "cat-health", "vet-costs"],
    sources: [
      {
        label: "2020 AAHA/AAFP Feline Vaccination Guidelines",
        publisher: "American Animal Hospital Association and American Association of Feline Practitioners",
        url: "https://www.aaha.org/resources/2020-aahaaafp-feline-vaccination-guidelines/",
      },
      {
        label: "2024 Guidelines for the Vaccination of Dogs and Cats",
        publisher: "World Small Animal Veterinary Association",
        url: "https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
      {
        label: "Bats and rabies in Canada",
        publisher: "Public Health Agency of Canada",
        url: "https://www.canada.ca/en/public-health/services/reports-publications/canada-communicable-disease-report-ccdr/monthly-issue/2024-50/issue-12-december-2024/bats-rabies.html",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The British Columbia rabies wording was corrected on 2026-09-06. The schedule table previously said \u201cBritish Columbia sets no legal requirement at all\u201d \u2014 an exhaustive negative legal claim, and no authoritative source states it. The BCCDC rabies page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them does; proving the absence of a law is a different exercise from reading one. The table now carries only the positive claim BCCDC does make \u2014 that pets should be vaccinated and kept up to date \u2014 says plainly that we are not presenting a province-wide legal requirement, and leaves municipal, travel and bite-investigation rules explicitly open. Do not restore the stronger wording without a named statute or regulation.",
      "Ontario's threshold is quoted from the primary regulation: R.R.O. 1990, Reg. 567 (Rabies Immunization) under the Health Protection and Promotion Act, s. 1 \u2014 \u201ca cat, dog or ferret three months of age or over\u201d, verified against e-Laws on 2026-09-06 at consolidation from 2023-07-01, last amendment O. Reg. 67/23. \u201cOr over\u201d is inclusive, so the anniversary day itself is inside the duty. Do not paraphrase it back to \u201cover three months\u201d or \u201cafter three months\u201d, both of which exclude that day.",
      "Ontario, British Columbia and Alberta are named because each was confirmed against a government source. Every other province and territory is still described generically — establish each before naming it.",
      "Whether any Canadian province regulates rabies vaccination differently for cats than for dogs.",
      "The reasoning behind feline injection sites is referred to without being named. Decide whether to name it once a veterinary source is attached.",
      "Whether the six-month FVRCP dose has been widely adopted by Canadian practices, or is still guideline-ahead-of-practice. The article tells the reader to ask rather than assuming either way.",
    ],
  },
  {
    slug: "indoor-cat-enrichment-canadian-homes",
    section: "cats",
    subcategory: "Behaviour",
    title: "Indoor Cat Enrichment: Practical Setup for Canadian Homes",
    deck: "Create accessible hiding places, secure perches, supervised play, scratching choices and separated resources for your indoor cat.",
    metaDescription: "Create accessible hiding places, secure perches, supervised play, scratching choices and separated resources for your indoor cat.",
    authorId: "pet-club-editorial",
    readingMinutes: 4,
    mediaId: "cats-feather-toy-play",
    mediaAlt:
      "A grey cat rearing up to catch a feather toy in both paws — the hunt, indoors.",
    tags: ["indoor-cats", "enrichment", "behaviour", "apartments", "cats"],
    indexable: true,
    status: "published",
    updatedAt: "2026-10-23",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Start with the individual cat and accessible choices.", "Install equipment securely and inspect wear.", "Enrichment is not a diagnosis or treatment for changed health or behaviour."],
    relatedSlugs: [
      "choosing-a-cat-scratching-post-in-canada",
      "indoor-or-outdoor-cats-in-canada",
      "bringing-home-a-kitten-first-30-days",
    ],
    relatedCategorySlugs: ["cat-behaviour", "general-cat-discussion", "kittens"],
    sources: [
      { label: "Catit Senses 2.0 Digger listing and care instructions", publisher: "Homes Alive Pets", url: "https://www.homesalive.ca/cat/bowls-and-feeders/automatic/catit-senses-2-0-digger.html" },
      { label: "Catit Senses 2.0 Wave Circuit listing and care instructions", publisher: "Homes Alive Pets", url: "https://www.homesalive.ca/cat/toys/catit-senses/catit-senses-2-0-wave-circuit.html" },
      {"label": "2025 indoor cat environmental needs statement", "publisher": "Feline Veterinary Medical Association", "url": "https://catvets.com/resource/2025-meeting-the-physical-and-emotional-needs-of-indoor-cats/"},
      {"label": "Feline enrichment ideas", "publisher": "BC SPCA", "url": "https://spca.bc.ca/article/how-to-keep-your-cat-happy-feline-enrichment-tips/"},
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "cost-of-owning-a-cat-in-canada",
    section: "cats",
    subcategory: "Money",
    title: "Cost of Owning a Cat in Canada: Monthly and First-Year Budget",
    deck: "Use an Ontario 2026–27 cost benchmark and a practical worksheet to budget for food, litter, care, setup and a second cat.",
    metaDescription: "Use an Ontario 2026–27 cost benchmark and a practical worksheet to budget for food, litter, care, setup and a second cat.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "cats-eating-from-bowls",
    mediaAlt:
      "Two cats eating from separate bowls — the line that doubles when the second cat arrives.",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "cats"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    updatedAt: "2026-10-22",
    veterinaryNotice: true,
    keyTakeaways: ["Separate setup, recurring, irregular and emergency expenses.", "Compare actual included services and current local quotes.", "Budget for each animal without assuming costs simply double or stay shared."],
    relatedSlugs: [
      "cost-of-owning-a-dog-in-canada",
      "kitten-vaccination-schedule-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "cat-food-and-nutrition"],
    sources: [
      { label: "2026–27 annual costs of owning a kitten or cat", publisher: "Ontario Veterinary Medical Association", url: "https://www.ovma.org/getmedia/343d20ed-e15f-41f2-914d-c24527522f6e/OVMA-CostofCare-Feline.pdf?ext=.pdf" },
      { label: "Cat adoption package inclusions", publisher: "BC SPCA", url: "https://spca.bc.ca/adoption/how-to-adopt/" },
      { label: "Catit Senses 2.0 Digger listing and care instructions", publisher: "Homes Alive Pets", url: "https://www.homesalive.ca/cat/bowls-and-feeders/automatic/catit-senses-2-0-digger.html" },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: ["Recheck the attributed OVMA 2026–27 Ontario adult-cat benchmark (CAD $3,594 annually; $299.50 divided by 12), scope and caveats at the next scheduled review. Verified October 22, 2026. It is not a national average or prescribed care schedule."],
  },

  /* ---------------------------------------------------------------- Batch C
     The care system rather than the animal. Insurance, choosing a practice and
     preparing for an emergency are one continuous argument — decide before you
     need to — and they are cross-linked to be read in that order. The travel
     guide sits with them because it is the same argument applied to being four
     hundred kilometres from your own clinic.

     Every one of these subjects varies by insurer, practice, carrier,
     municipality and province, and most of that variation is not sourceable
     from here. So the bodies are written at the durable level — structure,
     definitions and the questions to ask — and every specific that would have
     strengthened a paragraph is in `needsVerification` instead of in the prose.
     No premium, fee, waiting period, reimbursement rate, carrier dimension or
     provincial requirement is stated anywhere in this batch.

     ⚠️ Photography: the manifest has no image of a clinic, a car journey or a
     consultation, so these four use general portraits that carry the mood
     rather than the subject. Assets that serve as a topic page's own hero are
     avoided on the surface where that page lists them. Four images that
     actually depict the subjects are needed before this batch is published. */

  {
    slug: "pet-insurance-in-canada",
    section: "health",
    subcategory: "Money",
    title: "Pet Insurance in Canada: What It Covers and What It Doesn’t",
    deck: "It is not a discount plan for veterinary care. What accident, illness and wellness cover actually do, the four numbers that settle a claim, and why the exclusions decide more than the price does.",
    metaDescription:
      "What accident, illness and wellness cover actually do, the four numbers that settle a claim, and why a policy’s exclusions matter more than its monthly price.",
    authorId: "pet-club-editorial",
    readingMinutes: 10,
    mediaId: "health-senior-dog-resting",
    mediaAlt:
      "An elderly dog with a greying muzzle rests on a wooden floor — the years a policy is bought for.",
    tags: ["pet-insurance", "money", "budgeting", "vet-costs", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: [
      "Separate unexpected-care cover from routine-care benefits; compare wellness limits and cost, and check whether it is an insurance endorsement.",
      "A claim is settled by four values: the deductible and how it resets, the reimbursement rate, every limit, and which line items are eligible at all.",
      "Pre-existing definitions can include signs or symptoms before diagnosis; any reconsideration of a resolved condition depends on the policy.",
      "Waiting periods differ by policy and condition type. Find them in the wording and note when each type of cover begins.",
      "Compare the policy documents, not the quotes. Two identical-looking premiums can differ by an entire category of disease.",
    ],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["pet-insurance", "vet-costs"],
    sources: [
      {
        label: "Pre-existing conditions — signs and symptoms can matter before a formal diagnosis",
        publisher: "Fetch Pet Insurance Canada",
        url: "https://www.fetchpet.com/canada/faqs/what-is-pre-existing-conditions",
      },
      {
        label: "How to resolve a property and other insurance complaint, and the escalation path",
        publisher: "Financial Services Regulatory Authority of Ontario",
        url: "https://www.fsrao.ca/submit-complaint-fsra",
      },
      {
        label: "Dispute resolution — how a general insurance complaint escalates",
        publisher: "Insurance Bureau of Canada",
        url: "https://www.ibc.ca/insurance-basics/how-insurance-works/dispute-resolution",
      },
      {
        label: "Canadian deductible structure and province-specific product caveats",
        publisher: "Trupanion Canada",
        url: "https://www.trupanion.com/en-ca/pet-insurance-faq/article/deductibles",
      },
      {
        label: "Claim calculation and coverage of earlier-year conditions at renewal — printed pages 9–10",
        publisher: "PHI Direct",
        url: "https://www.phidirect.com/hubfs/PHI-Direct-Documents/PHI-CA-Policy-Document-Online.pdf?hsLang=en-ca",
      },
      {
        label: "Canada sample plans — annual deductible, calculation order and temporary exclusions",
        publisher: "Spot Pet Insurance Canada",
        url: "https://spotpetinsurance.ca/spot-sample-policy-ca.pdf",
      },
      {
        label: "Accident and illness terms — claim calculation and pre-existing conditions",
        publisher: "Pets Plus Us",
        url: "https://www.petsplusus.com/sites/default/files/2026-03/AI%20TNC%20ENG%2011-2025.pdf",
      },
      {
        label: "Free subscriber-insurer complaint review, final position letter and non-binding recommendations",
        publisher: "General Insurance OmbudService",
        url: "https://giocanada.org/how-the-process-works/",
      },
      {
        label: "Canadian policy terms and wellness endorsement structure",
        publisher: "Fetch Pet Insurance Canada",
        url: "https://www.fetchpet.com/canada/terms-conditions",
      },
    ],
    resources: [
      {
        label: "General Insurance OmbudService — independent dispute resolution for general insurance",
        publisher: "General Insurance OmbudService",
        url: "https://www.giocanada.org/",
      },
      {
        label: "How to file a complaint about an insurance company",
        publisher: "Financial Consumer Agency of Canada",
        url: "https://www.canada.ca/en/financial-consumer-agency/services/insurance/make-complaint.html",
      },
    ],
    needsVerification: ["Any future provider ranking or affiliate comparison requires current province-specific policy documents and separately verified benefit rows."],
  },
  {
    slug: "finding-a-veterinarian-in-canada",
    section: "health",
    subcategory: "Choosing care",
    title: "How to Choose a Veterinarian in Canada",
    deck: "The worst time to choose a practice is the first time you need one. What to weigh, the twelve questions worth a phone call, and why the after-hours answer matters more than anything on the website.",
    metaDescription:
      "How to choose a veterinary practice before an emergency: what to weigh, the questions worth a phone call, and why the after-hours answer matters most.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "health-vet-examining-dog",
    mediaAlt:
      "A veterinarian listening to a small dog's chest during a routine consultation.",
    tags: ["veterinary-care", "choosing-a-vet", "vet-costs", "canada", "planning"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Register with a practice while nothing is wrong. A clinic that already holds the history is worth more than one that is marginally closer.",
      "Ask what happens at two in the morning, and write down the name, address and hours of wherever you would be sent.",
      "Weigh travel time in January conditions, real opening hours and same-day availability above anything on the website.",
      "Confirm two things early: that you can obtain and transfer the records, and that written estimates come before significant work.",
      "Book a routine appointment and treat it as an audition — handling, explanation, estimate against invoice, and whether anyone asked what you were worried about.",
    ],
    relatedSlugs: ["emergency-vet-visits-in-canada", "pet-insurance-in-canada"],
    relatedCategorySlugs: ["vet-costs", "provincial-questions"],
    sources: [
      {
        label:
          "The provincial and territorial veterinary regulatory bodies \u2014 twelve listed, with Northwest Territories and Nunavut handled by territorial government departments",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
      {
        label: "The provincial and territorial veterinary regulatory bodies, by name",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 NARROWED, 2026-09-06. The public-register claim. The CVMA list was re-read: it names twelve bodies, and two of those \u2014 Northwest Territories and Nunavut \u2014 are government departments rather than colleges or associations. Yukon is not named at all. Nothing on that page establishes that every body publishes a public searchable register, and we did not verify thirteen jurisdictions individually. The article no longer implies a uniform lookup: it says to use whatever your own jurisdiction's body provides, notes that some publish an online member search while others answer by phone or email, and says plainly that there is no national lookup and that we have not verified every body publishes a register. Yukon's absence is now stated rather than left as a silent gap.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. The complaint route. The article implied the regulator is the destination for any complaint in every jurisdiction. It now separates the categories: professional conduct to the regulator, billing and service to the practice first, animal welfare often to a provincial SPCA or equivalent \u2014 and tells the reader to ask their own regulator which of those it handles rather than assuming the answer matches another province.",
      "STANDING GUARDRAIL \u2014 thirteen jurisdictions, twelve named bodies, two of them government departments and one jurisdiction unlisted. Do not write a sentence beginning \u201cevery province and territory\u201d about veterinary regulation without verifying all thirteen.",
      "OPEN (NON-BLOCKING) \u2014 Whether a practice may charge for copying or transferring records, and whether any province regulates that — currently written as a question to ask rather than an entitlement.",
      "STANDING GUARDRAIL \u2014 That an owner has a right of access to their animal’s veterinary record, which likely varies by province. The article says records “should be” available and transferable on request; do not strengthen this without a provincial source.",
      "OPEN (NON-BLOCKING) \u2014 Whether telephone or video triage is generally available from Canadian practices, and how it is charged — raised as a question for rural readers rather than asserted.",
    ],
  },
  {
    slug: "emergency-vet-visits-in-canada",
    section: "health",
    subcategory: "Preparedness",
    title: "Emergency Vet Visits in Canada: How to Prepare",
    deck: "Not a symptom checker. The hour of preparation — destination, transport, records, money — that decides how the worst night goes, and the one rule for when you are not sure whether to call.",
    metaDescription:
      "The hour of preparation that decides how the worst night goes: destination, transport, records and money — plus the one rule for when you are unsure.",
    authorId: "pet-club-editorial",
    readingMinutes: 10,
    mediaId: "health-cat-in-carrier",
    mediaAlt:
      "A cat settled in a pet carrier — left out and open, which is the whole point.",
    tags: ["emergency-care", "veterinary-care", "preparedness", "safety", "canada"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Confirm your after-hours destination by phone in daylight, then write the name, address, phone and winter drive time somewhere you can find in the dark.",
      "Solve transport now: carrier left out and open, leash by the door, a plan for a large dog who cannot walk, and a plan if you do not drive.",
      "Keep one folder — weight, microchip number, medication list with doses and last times given, chronic diagnoses, and how you would pay.",
      "For a suspected poisoning, bring the packaging and never induce vomiting unless a veterinary professional has told you to.",
      "If you are asking yourself whether this is an emergency, that is the reason to phone. Telephone triage is a normal part of what a clinic does.",
    ],
    relatedSlugs: [
      "finding-a-veterinarian-in-canada",
      "pet-insurance-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance"],
    sources: [
      {
        label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia",
        publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
        url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
      },
      {
        label: "The neonatal period is the first 21 days; no thermoregulation until four weeks; neonates lack glucose reserves, so even minimal fasting can cause hypoglycaemia",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/management-and-nutrition/management-of-the-neonate/management-of-the-neonate-in-dogs-and-cats",
      },
      {
        label: "\u201cPediatric\u201d in small-animal practice conventionally means birth to six months of age",
        publisher: "Hoskins JD, Veterinary Clinics of North America: Small Animal Practice 29(4), 1999 (PMID 10390787)",
        url: "https://pubmed.ncbi.nlm.nih.gov/10390787/",
      },
      {
        label: "Animal emergencies that require immediate veterinary consultation or care",
        publisher: "American Veterinary Medical Association",
        url: "https://www.avma.org/resources/pet-owners/emergencycare/13-animal-emergencies-require-immediate-veterinary-consultation-andor-care",
      },
      {
        label: "What to do in a dog or cat emergency — calling ahead, and handling an injured animal",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/special-pet-topics/emergencies/what-to-do-in-a-dog-or-cat-emergency",
      },
      {
        label: "Why emesis is contraindicated for corrosives and petroleum distillates",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/toxicology/petroleum-product-poisoning/petroleum-product-poisoning-in-animals",
      },
      {
        label: "The provincial and territorial veterinary regulatory bodies, by name",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 NARROWED, 2026-09-06. The article previously said very young animals \u201chave far less reserve than an adult and deteriorate faster\u201d. No source was found for that as a general physiological claim, and it is not asserted any more. What replaced it is scoped to the mechanisms that are actually sourced. Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, doi 10.1016/j.cvsm.2016.09.010, verified 2026-09-06 via Europe PMC, states verbatim that \u201cyoung puppies and kittens have unique physiologic needs in regards to fluid therapy, which must address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d and that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d. The Merck Veterinary Manual, Management of the Neonate in Dogs and Cats, verified 2026-09-06, states that \u201cthe neonatal period in dogs and cats encompasses the first 21 days of life\u201d, that \u201cpuppies and kittens lack thermoregulatory mechanisms until 4 weeks of age\u201d, and that \u201cneonates lack glucose reserves and have minimal capacity for gluconeogenesis\u201d so that \u201ceven minimal fasting can result in hypoglycemia\u201d. Hoskins JD, \u201cPediatric health care and management\u201d, Veterinary Clinics of North America: Small Animal Practice 29(4), 1999, PMID 10390787, verified 2026-09-06, anchors the age scope: pediatric care covers puppies and kittens \u201cfrom birth to 6 months of age\u201d. LIMITATION \u2014 what is supported is fluid, glucose and temperature, not reserve across every organ system, and the thermoregulation and glycogen findings are neonatal rather than pediatric. Nothing supports a blanket claim that young animals deteriorate faster in every illness, and the article now says so explicitly. No numeric threshold for calling was added; the ages quoted define the source populations and are not action cutoffs.",
      "STANDING GUARDRAIL \u2014 Do not restore a broad \u201cyoung animals deteriorate faster\u201d statement without evidence supporting the exact scope. The claim is licensed for fluid loss, hypoglycaemia and (under four weeks) thermoregulation, and for pediatric animals to about six months; it is not licensed as a general statement about physiological reserve. The two 30-days guides carry the same narrowed claim and must not drift apart from this one.",
      "That payment is generally expected at the time of service at Canadian emergency hospitals, and that a deposit may be requested on admission \u2014 described as what to ask about rather than as a rule.",
      "That emergency hospitals treat in order of severity rather than arrival. Kept descriptive rather than stated as a Canada-wide rule.",
      "That cats conceal illness \u2014 carried over from the cat cost guide, and flagged there too.",
      "Whether a Canadian animal poison control service exists as such, distinct from the North American services that take calls from Canada. None is named, and no fee is stated.",
    ],
  },
  {
    slug: "travelling-with-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Travel",
    title: "Travelling With a Pet in Canada: Transport and Booking Checklist",
    deck: "Confirm transport, accommodation, documents and contingency plans for your actual pet, route and destination in Canada.",
    metaDescription: "Confirm transport, accommodation, documents and contingency plans for your actual pet, route and destination in Canada.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "guides-dog-harness-in-car",
    mediaAlt:
      "A dog wearing a harness settled on a car seat, restrained for the drive.",
    tags: ["travel", "planning", "identification", "microchip", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Confirm each operator and accommodation policy for the actual booking.", "Secure travel equipment according to its instructions.", "Check international border and return requirements separately."],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["travelling-with-pets", "pet-friendly-canada"],
    sources: [
      {"label": "Transporting pets", "publisher": "Canadian Food Inspection Agency", "url": "https://inspection.canada.ca/en/importing-food-plants-animals/pets/transporting-pets"},
      {"label": "Pet import and travel portal", "publisher": "Canadian Food Inspection Agency", "url": "https://inspection.canada.ca/en/importing-food-plants-animals/pets"},
    ],
    resources: [
      {
        label: "Air carrier tariffs — every airline must publish its terms of carriage",
        publisher: "Canadian Transportation Agency",
        url: "https://otc-cta.gc.ca/eng/air-carrier-tariffs-posted-websites",
      },
      {
        label: "Dogs in Parks Canada’s protected places",
        publisher: "Parks Canada",
        url: "https://parks.canada.ca/voyage-travel/regles-rules/chien-dog",
      },
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [],
  },

  /* ---------------------------------------------------------------- Batch D
     Articles 16\u201320, and the first batch written to the standard Quality
     Gate #1 arrived at rather than retrofitted to it: name the jurisdiction,
     cite the source a reader can follow, say which jurisdictions were actually
     checked, and refuse to generalise past them.

     Two of these close open questions carried since the first batch. The
     parasite guide finally names where blacklegged ticks are established, and
     with it the heartworm start date and the reasoning behind it. The
     separation anxiety guide is the destination the crate guide has been
     deferring to since it was written, and it takes Training/Behaviour from
     one article to two.

     No prices anywhere, as before. */

  {
    slug: "parasite-prevention-for-pets-in-canada",
    section: "health",
    subcategory: "Preventative care",
    title: "Parasite Prevention in Canada, by Region and Season",
    deck: "When should Canadian pets start or stop parasite prevention? Plan for local tick risk, heartworm season, travel and cat-safe products with your veterinarian.",
    metaDescription:
      "Plan parasite prevention in Canada by region, season and travel. Questions for your vet about heartworm, autumn ticks, fleas and cat-safe products.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "health-dog-in-tall-grass",
    mediaAlt:
      "A dog standing in long meadow grass.",
    tags: ["parasites", "ticks", "heartworm", "fleas", "preventative-care", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-24",
    veterinaryNotice: true,
    keyTakeaways: [
      "There is no single parasite-prevention calendar for every Canadian pet; location, travel and species matter.",
      "The Ontario heartworm timing study is regional evidence, not a prescription for every province or international trip.",
      "Ticks can remain active during mild autumn and winter days; ask your veterinarian about the full local risk period.",
      "Flea management can involve the home as well as the pets living in it.",
      "Dog-labelled flea and tick products must not be used on cats; some also require separation from recently treated dogs.",
      "Compare the parasites covered, doses and testing included, not package price alone.",
    ],
    relatedSlugs: [
      "puppy-vaccination-schedule-in-canada",
      "summer-heat-safety-for-dogs-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      { label: "Heartworm prevention and travel considerations", publisher: "Canadian Parasitology Expert Panel, University of Saskatchewan", url: "https://research-groups.usask.ca/cpep/parasites/heartworm.php" },
      { label: "Ontario seasonal heartworm timing analysis", publisher: "Ontario Veterinary College, Centre for Public Health and Zoonoses", url: "https://www.wormsandgermsblog.com/2025/04/articles/animals/dogs/seasonal-canine-heartworm-prevention-in-canadadoes-our-current-timing-still-work/" },
      { label: "Tick activity and the local risk period", publisher: "Canadian Veterinary Medical Association", url: "https://www.canadianveterinarians.net/media/qlvd05gw/2025_ntam_tick-activity-calendar_en.pdf" },
      { label: "Current Lyme disease risk information", publisher: "Public Health Agency of Canada", url: "https://www.canada.ca/en/public-health/services/diseases/lyme-disease/prevention-lyme-disease.html" },
      { label: "Western Canada regional parasite context (2019)", publisher: "Canadian Parasitology Expert Panel, University of Saskatchewan", url: "https://research-groups.usask.ca/cpep/parasitedata/western-canada.php" },
      { label: "Flea management in pets and homes", publisher: "Health Canada", url: "https://www.canada.ca/en/health-canada/services/pest-control-tips/fleas.html" },
      { label: "Pet pesticide safety", publisher: "Health Canada", url: "https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/pesticides-pest-management/fact-sheets-other-resources/keep-your-pets-safe-when-using-pesticides.html" },
      { label: "Spot-on products and cat contact warnings", publisher: "Health Canada", url: "https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/pesticides-pest-management/policies-guidelines/label-improvements-spot-on-pesticides-companion-animals.html" },
      { label: "Tick removal", publisher: "Public Health Agency of Canada", url: "https://www.canada.ca/en/public-health/services/diseases/lyme-disease/removing-submitting-ticks-testing.html" },
    ],
    resources: [
      {
        label: "Lyme disease monitoring, and the tick surveillance data by region",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/public-health/services/diseases/lyme-disease/surveillance-lyme-disease.html",
      },
    ],
    needsVerification: [
      "UPDATED 2026-10-24: The Ontario timing study is explicitly regional; national start-date and static province-map claims were removed. Sources were checked on this date. This is not a veterinary review.",
      "STANDING GUARDRAIL: Do not prescribe doses or tell owners to start or stop medication based on this guide. Refer local risk, travel, product choice and testing to their veterinarian.",
      "STANDING GUARDRAIL: The Western Canada reference is dated 2019 and is labelled as context, not current prevalence. Recheck public health maps and regional guidance at review.",
    ],
  },
  {
    slug: "spaying-and-neutering-in-canada",
    visualStyle: "unleashed",
    section: "health",
    subcategory: "Procedures",
    title: "When to Spay or Neuter Your Cat or Dog in Canada",
    deck: "Most cats should be spayed or neutered by five months; dogs need an individual plan. Understand Canadian guidance and the questions to ask your veterinarian.",
    metaDescription: "Learn Canadian cat spay/neuter timing and why dog breed, size, sex, health and home circumstances need an individual veterinary plan.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "health-dog-recovery-cone",
    mediaAlt: "A golden retriever wearing a recovery cone rests indoors; an illustrative stock photograph.",
    tags: ["spay-neuter", "surgery", "preventative-care", "money", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-29",
    veterinaryNotice: true,
    keyTakeaways: ["CVMA supports spaying or neutering most cats not intended for breeding by five months.", "There is no universal dog surgery age; discuss breed, size, sex, health and household circumstances.", "Plan how to prevent mating while waiting, compare written estimates and prepare for recovery.", "Surgery is not a guaranteed treatment for behaviour problems."],
    relatedSlugs: [
      "adopting-a-pet-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "dog-health", "cat-health"],
    sources: [
      { label: "Spaying and neutering of dogs and cats", publisher: "Canadian Veterinary Medical Association", url: "https://www.canadianveterinarians.net/policy-and-outreach/position-statements/statements/spaying-and-neutering-of-dogs-and-cats/" },
      { label: "When should you neuter or spay your dog?", publisher: "UC Davis School of Veterinary Medicine", url: "https://www.vetmed.ucdavis.edu/news/when-should-you-neuter-or-spay-your-dog" },
      {
        label:
          "2019 AAHA Canine Life Stage Guidelines, Textbox 1 \u2014 recommended timing for canine sterilization, split at 45 lb projected adult bodyweight",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf",
      },
      {
        label: "When should I spay or neuter my dog or cat? Age and timing by projected adult weight",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/spay-or-neuter/",
      },
      {
        label: "2019 AAHA Canine Life Stage Guidelines \u2014 reproductive health and gonadectomy timing",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/life-stage-canine-2019/reproductive-health/",
      },
      {
        label: "Pet licensing \u2014 annual licences for dogs and cats",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 VERIFIED, 2026-09-06. The AAHA windows were re-read in the 2019 Canine Life Stage Guidelines PDF, Textbox 1, retrieved directly rather than copied from the Puppy Journey. Verbatim: castration \u2014 small breeds 6 months of age, large breeds wait until growth stops (~9\u201315 months); ovariohysterectomy \u2014 small breeds prior to anticipated heat cycle (5\u20136 months), large breeds 5\u201315 months. The split is < 45 lbs versus \u2265 45 lbs projected adult bodyweight. The article matches on every figure, and its \u201cabout 45 lb\u201d and \u201caround six months\u201d soften rather than overstate the source.",
      "RESOLVED \u2014 REMOVED, 2026-09-06. The mechanism claim \u2014 that sex hormones are part of what signals long bones to stop growing \u2014 was taken out. No source could be attached that supports it as stated, and the practical advice does not depend on it. In its place the article gives AAHA's own footnote to Textbox 1: earlier, before the first estrus, decreases mammary neoplasia and unwanted litters; later, after growth stops, decreases the risk of orthopaedic disease, some cancers and urethral sphincter mechanism incompetence, with clinical discretion and owner education rather than one answer.",
      "STANDING GUARDRAIL \u2014 associations stay associations. Do not convert \u201cassociated in some breeds with joint disorders\u201d into a causal claim that early neutering causes joint disease, and do not generalise a single-breed finding to all dogs.",
      "STANDING GUARDRAIL \u2014 That municipal licence fees are commonly lower for spayed or neutered animals \u2014 verified for Toronto and Calgary only; no proportion of Canadian municipalities is claimed.",
      "RESOLVED 2026-10-28 — CVMA December2024 position supports most non-breeding cats by five months; dog timing individualized. Sources rechecked; no veterinarian review claimed.",
      "STANDING GUARDRAIL \u2014 Which subsidised or low-cost spay and neuter programmes operate in Canada, and who runs them \u2014 described as intensely local and named nowhere.",
    ],
  },
  {
    slug: "adopting-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Getting a pet",
    title: "Adopting a Pet in Canada: Questions, Records and Import Checks",
    deck: "Questions before adopting a dog or cat in Canada: origin, records, included services, housing, support and current import requirements.",
    metaDescription: "Questions before adopting a dog or cat in Canada: origin, records, included services, housing, support and current import requirements.",
    authorId: "pet-club-editorial",
    readingMinutes: 4,
    mediaId: "guides-adopt-me-bandana",
    mediaAlt:
      "A dog in an \u201cAdopt Me\u201d bandana at an outdoor adoption event.",
    tags: ["adoption", "rescue", "shelters", "breeders", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    keyTakeaways: ["Verify history and responsibilities before paying.", "Commercial dog import rules include adoption and fostering.", "An application process or polished listing alone does not prove quality."],
    relatedSlugs: [
      "spaying-and-neutering-in-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "general-dog-discussion", "general-cat-discussion"],
    sources: [
      {"label": "Questions before acquiring a dog", "publisher": "Canadian Food Inspection Agency", "url": "https://inspection.canada.ca/en/importing-food-plants-animals/pets/ask-questions-you-get-dog"},
      {"label": "Pet import requirements", "publisher": "Canadian Food Inspection Agency", "url": "https://inspection.canada.ca/en/importing-food-plants-animals/pets"},
    ],
    resources: [
      {
        label: "Countries the CFIA classifies as high-risk for dog rabies",
        publisher: "Canadian Food Inspection Agency",
        url: "https://inspection.canada.ca/en/animal-health/terrestrial-animals/diseases/reportable/rabies/countries-high-risk-dog",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "separation-anxiety-in-dogs",
    section: "dogs",
    subcategory: "Behaviour",
    title: "Separation Anxiety in Dogs: Telling It Apart and Treating It",
    deck: "Protest fades and distress escalates, and the difference decides everything you do next. What the evidence-based protocol actually is, and why most plans fail for a reason that is not the dog.",
    metaDescription:
      "How to tell distress from protest, the graduated departure protocol that has evidence behind it, and why plans with too many instructions fail.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "training-dog-at-window",
    mediaAlt:
      "A dog alone at a window, seen from behind, watching for something outside.",
    tags: ["separation-anxiety", "behaviour", "training", "alone-time", "dogs"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Protest fades and distress escalates. Film a departure before you change anything \u2014 it answers the question in one afternoon.",
      "Rule out medical causes first, especially where a previously settled adult dog has suddenly stopped coping.",
      "The protocol with evidence behind it is graduated departure training plus a safety signal, so departures become predictable.",
      "Moving too fast provokes anxiety and undoes progress. The increments are the mechanism, not a formality.",
      "Owners given more than five instructions did worse than those given fewer \u2014 so do three things properly rather than twelve badly.",
      "Medication, where a veterinarian recommends it, augments the training rather than replacing it.",
      "In an apartment the risk is the noise complaint, and what that costs you depends on your province.",
    ],
    relatedSlugs: [
      "crate-training-a-puppy-in-canada",
      "bringing-home-a-puppy-first-30-days",
    ],
    relatedCategorySlugs: ["dog-training-and-behaviour", "dog-health", "general-dog-discussion"],
    sources: [
      {
        label: "Treatment of behaviour problems in animals \u2014 graduated departures and safety signals",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/behavior/behavioral-medicine-introduction/treatment-of-behavior-problems-in-animals",
      },
      {
        label: "Evaluation of treatments for separation anxiety in dogs",
        publisher: "Journal of the American Veterinary Medical Association",
        url: "https://avmajournals.avma.org/view/journals/javma/217/3/javma.2000.217.342.xml",
      },
      {
        label: "Anxious behaviour: how to help your dog cope with unsettling situations",
        publisher: "Cornell University College of Veterinary Medicine",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/anxious-behavior-how-help-your-dog-cope-unsettling-situations",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The finding that owners given more than five instructions saw worse outcomes comes from a single JAVMA evaluation. Read the paper in full and confirm the framing before publication rather than relying on a summary.",
      "How behaviour professionals are credentialed in Canada, and whether any province regulates the title. The article routes readers through their veterinary clinic instead, which is safe but less useful than naming a route.",
      "Whether veterinary behaviour referral is generally available across Canada, or concentrated in a few centres \u2014 relevant to rural readers and currently not addressed.",
      "The list of signs distinguishing distress from protest is drawn from veterinary behaviour references and is framed as what to look for, never as a diagnosis. Confirm each against a named source before publication.",
    ],
  },
  {
    slug: "summer-heat-safety-for-dogs-in-canada",
    section: "dogs",
    subcategory: "Seasonal care",
    title: "Summer Heat Safety for Dogs in Canada",
    deck: "The same rule as winter, pointed the other way \u2014 except heat does not give you the warning cold does. Parked cars, the pavement test, and what an AQHI of 7 should change about your walk.",
    metaDescription:
      "Why there is no safe temperature, the back-of-hand pavement test, heatstroke signs, and how to read wildfire smoke and the AQHI for a dog.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "dogs-drinking-water-summer",
    mediaAlt:
      "A dog drinking from a water container on dry grass in strong summer sun.",
    tags: ["summer", "seasonal-care", "heatstroke", "wildfire-smoke", "safety", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "There is no safe temperature, for the same reason there is no \u201ctoo cold\u201d number: coat, body fat, activity level and health decide it.",
      "Flat-faced, overweight, elderly and unwell dogs need a more cautious plan than the dog next door.",
      "Never leave a dog in a parked car. On a 29 \u00b0C day the interior passes 38 \u00b0C in ten minutes.",
      "Press the back of your hand to the pavement for seven seconds. If you cannot, neither can your dog.",
      "Move walks to the ends of the day rather than shortening them at noon.",
      "On smoke days read the Air Quality Health Index and cut exertion, not just distance \u2014 7 or above is the high-risk band.",
      "Heatstroke is an emergency: begin cooling, phone ahead, and go, even if the dog seems to improve.",
    ],
    relatedSlugs: [
      "winter-dog-care-in-canada",
      "parasite-prevention-for-pets-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "general-dog-discussion", "pet-friendly-canada"],
    sources: [
      {
        label:
          "Pet safety in vehicles \u2014 the temperature-rise table, and that the rise is much the same whether it is 70 \u00b0F or 110 \u00b0F outside",
        publisher: "American Veterinary Medical Association",
        url: "https://www.avma.org/resources-tools/pet-owners/petcare/pets-vehicles",
      },
      {
        label:
          "Dog paw injuries \u2014 the palm test at ten seconds, and what a burned pad looks like",
        publisher: "VCA Animal Hospitals",
        url: "https://vcahospitals.com/pediatric/puppy/health-wellness/dog-paw-injuries-and-how-to-help",
      },
      {
        label: "Warm weather pet safety \u2014 parked cars, hot pavement and heatstroke signs",
        publisher: "American Veterinary Medical Association",
        url: "https://www.avma.org/resources-tools/pet-owners/petcare/warm-weather-pet-safety",
      },
      {
        label: "Air Quality Health Index \u2014 the 1 to 10+ scale and its risk bands",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/environment-climate-change/services/air-quality-health-index.html",
      },
      {
        label: "Wildfire smoke, air quality and your health",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/services/health/healthy-living/environment/air-quality/wildfire-smoke.html",
      },
    ],
    resources: [
      {
        label: "Current Air Quality Health Index readings and special air quality statements",
        publisher: "Environment and Climate Change Canada",
        url: "https://www.canada.ca/en/environment-climate-change/services/air-quality-health-index/wildfire-smoke.html",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 NARROWED, 2026-09-06. The parked-car figures were traced to AVMA's Pet safety in vehicles page, which publishes a temperature *rise above ambient* rather than the absolute interior temperatures the article was giving: 19 \u00b0F at ten minutes, 29 \u00b0F at twenty, 34 \u00b0F at thirty, 43 \u00b0F at an hour. The article's old numbers were derivable from that table applied to an 85 \u00b0F start, but presenting them as absolutes lost AVMA's more useful point, which is now carried: the rise is much the same whether it is 70 \u00b0F or 110 \u00b0F outside. The article states these are averages across vehicles rather than a promise about any one car, and keeps AVMA's line that cracking the windows makes no difference. The AVMA warm-weather page does not carry these figures; the vehicles page does, and it is the one cited.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. The double-coat claim was categorical and unsourced. AVMA's warm-weather guidance says to ask your veterinarian whether a pet would benefit from a warm-weather haircut or other protection \u2014 it does not say never shave. The article now says shaving is not a reliable way to prevent heatstroke and is a conversation with a veterinarian, acknowledges that medical and grooming reasons to clip exist, and drops the unsourced claim that the coat is sun protection.",
      "RESOLVED \u2014 REMOVED, 2026-09-06. The seven-second pavement threshold was removed as a numeric rule. It could not be confirmed against a named authority that this project retrieved: the AAHA page attributed to it did not load, and the veterinary source that did \u2014 VCA \u2014 publishes a different duration (palm, ten seconds). The article now gives the hand test qualitatively, cites VCA's version as an attributed example, and uses the disagreement to make the honest point that this is a screening test rather than a measurement. Burned pads are described as needing veterinary attention.",
      "STANDING GUARDRAIL \u2014 no unsourced numeric threshold in this article, for pavement, air temperature or anything else. Do not replace a removed number with a rounder one.",
      "STANDING GUARDRAIL \u2014 No AQHI threshold exists for animals. The article says so explicitly and treats the human bands as a conservative proxy \u2014 do not let that framing weaken into a recommendation.",
      "STANDING GUARDRAIL \u2014 Blue-green algae and specific waterborne risks are deliberately not described. The article says to check local advisories and names none.",
      "STANDING GUARDRAIL \u2014 Whether any Canadian jurisdiction legislates on animals left in parked vehicles. None is claimed; the argument is made on physiology alone.",
    ],
  },

  /* ---------------------------------------------------------------- Batch E
     Articles 21\u201325, chosen to correct the balance rather than to chase
     volume. No dog-only article in this batch: one on cats and inter-cat
     behaviour, two on preventative health that cover both species, and two on
     Canadian rules and practicalities.

     The licensing guide is the one this library has been missing since the
     first batch \u2014 five articles referred to municipal licensing and none
     owned it. It is also the most purely Canadian thing here: municipal, not
     provincial, and impossible to write from anywhere else. */

  {
    slug: "introducing-a-second-cat",
    section: "cats",
    subcategory: "New owners",
    title: "Planning for a Second Cat: Space, Budget and Support",
    deck: "Check separate spaces, supplies, recurring costs and adoption support before adding a second cat to your Canadian household.",
    metaDescription: "Check separate spaces, supplies, recurring costs and adoption support before adding a second cat to your Canadian household.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "cats-two-resting-together",
    mediaAlt:
      "Two cats resting a few feet apart on a tiled floor \u2014 coexistence, which is the realistic goal.",
    tags: ["multi-cat", "new-owners", "budgeting", "cats"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Check whether separate spaces are practical before adoption.", "Budget recurring and unplanned costs for both cats.", "Read official introduction guidance and ask individual questions.", "An introduction checklist cannot guarantee compatibility."],
    relatedSlugs: [
      "indoor-cat-enrichment-canadian-homes",
      "cost-of-owning-a-cat-in-canada",
    ],
    relatedCategorySlugs: ["cat-behaviour", "general-cat-discussion", "kittens"],
    sources: [{ label: "Cat care: bringing home a new cat and preparing separate spaces", publisher: "BC SPCA", url: "https://spca.bc.ca/get-help/pet-care/cats/" }],
    needsVerification: ["RESOLVED 2026-10-09 — rewritten as home preparation, records and budgeting. Clinical assessment, treatment, fixed introduction timelines, product efficacy and unsourced superlatives were removed, not signed off. BC SPCA source checked for the limited room/resource guidance. No veterinary review is claimed."],
  },
  {
    slug: "dental-care-for-dogs-and-cats",
    section: "health",
    subcategory: "Preventative care",
    title: "Dental Care for Dogs and Cats",
    deck: "Most dogs and cats have periodontal disease by three and almost none of them show it. What a professional dental actually involves, and the straight answer on anaesthesia-free cleaning.",
    metaDescription:
      "Why dental disease is invisible, what a professional dental under anaesthetic actually does, and why AAHA does not recommend anaesthesia-free cleaning.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "health-dog-teeth-brushing",
    mediaAlt:
      "A small dog having its teeth brushed \u2014 the only home-care measure that reliably works.",
    tags: ["dental", "preventative-care", "surgery", "money", "dogs", "cats"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "By three years of age most dogs and cats have some periodontal disease, and it usually goes unnoticed \u2014 animals adapt rather than stop eating.",
      "Most of each tooth, and most of the disease, is below the gumline. That is why radiographs and probing under anaesthetic are the procedure.",
      "AAHA does not recommend anaesthesia-free dentistry: no accurate diagnosis, no pain control, no airway protection, and no treatment of the actual disease.",
      "Removing the visible tartar alone is cosmetic.",
      "If anaesthesia is the worry, interrogate the anaesthesia \u2014 bloodwork, monitoring, and what changes for an older patient.",
      "Brushing is the home-care measure that works. Dental chews and additives vary; ask which your clinic considers evidenced.",
      "Hard chews fracture teeth. If you would not want it hitting your knee, it is too hard.",
    ],
    relatedSlugs: [
      "senior-dogs-and-cats",
      "pet-insurance-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      {
        label: "2019 AAHA Dental Care Guidelines for Dogs and Cats",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2019-aaha-dental-care-guidelines-for-dogs-and-cats/",
      },
      {
        label: "Nonanesthetic dentistry \u2014 why AAHA does not recommend it",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2019-aaha-dental-care-guidelines-for-dogs-and-cats/nonanesthetic-dentistry/",
      },
      {
        label: "Do pets need anesthesia for dental care?",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/anesthesia-and-dental-cleaning/",
      },
    ],
    needsVerification: [
      "\u201cBy three years of age, most dogs and cats have some periodontal disease\u201d is cited to AAHA. Confirm the exact wording and whether the association states a figure before any number is used.",
      "Feline-specific dental disease \u2014 resorptive lesions in particular \u2014 is deliberately not described. Establish a source before adding it, because it is the commonest feline dental question and the article currently does not answer it.",
      "That human toothpaste is unsafe for dogs and cats \u2014 well established, attach a toxicology or veterinary source.",
      "That hard chews are a common cause of tooth fracture. Widely stated by veterinary dentists; source it or present it purely as a rule of thumb.",
      "Which home-care products have evidence behind them. The article deliberately names none and refers the reader to their clinic; the VOHC accepted-products list should be assessed as a possible resource.",
    ],
  },
  {
    slug: "when-a-pet-goes-missing-in-canada",
    section: "canadian-life",
    subcategory: "Emergencies",
    title: "Missing Pets in Canada: Search, Report and Check Identification",
    deck: "Steps for a missing dog or cat: contact local animal services, search safely, check identification records and follow up on found-animal listings.",
    metaDescription: "Steps for a missing dog or cat: contact local animal services, search safely, check identification records and follow up on found-animal listings.",
    authorId: "pet-club-editorial",
    readingMinutes: 4,
    mediaId: "guides-cat-under-car",
    mediaAlt:
      "A cat crouched under a parked car \u2014 which is where a frightened lost cat usually is.",
    tags: ["lost-pet", "microchip", "identification", "emergencies", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    keyTakeaways: ["Search promptly and use several reporting routes.", "A microchip is identification, not a GPS tracker.", "Confirm local reporting and holding procedures directly."],
    relatedSlugs: [
      "pet-licensing-across-canada",
      "indoor-or-outdoor-cats-in-canada",
    ],
    relatedCategorySlugs: ["general-dog-discussion", "general-cat-discussion", "pet-friendly-canada"],
    sources: [
      {"label": "Lost and found reporting example", "publisher": "City of Toronto", "url": "https://www.toronto.ca/community-people/animals-pets/lost-found-pets/"},
      {"label": "Microchip identification", "publisher": "Canadian Veterinary Medical Association", "url": "https://www.canadianveterinarians.net/policy-and-outreach/position-statements/statements/microchip-animal-identification-in-small-companion-animals/"},
    ],
    needsVerification: [],
  },
  {
    slug: "pet-licensing-across-canada",
    section: "canadian-life",
    subcategory: "Rules",
    title: "Dog and Cat Licensing Across Canada",
    deck: "Tenancy is provincial, rabies is provincial, licensing is not \u2014 it is municipal, and five Canadian cities give five different answers about species, age and what you get.",
    metaDescription:
      "Licensing is municipal, not provincial. How Toronto, Ottawa, Calgary, Edmonton and Vancouver differ on species, age thresholds and what is included.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "guides-dog-collar-tag",
    mediaAlt:
      "A dog wearing a collar with a metal identification tag \u2014 the layer that works without a scanner.",
    tags: ["licensing", "bylaws", "municipal", "identification", "canada"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-21",
    keyTakeaways: [
      "Licensing is municipal. Your city decides it, and neighbouring cities genuinely differ.",
      "Toronto, Ottawa, Calgary and Edmonton all license cats as well as dogs. Many municipalities do not.",
      "Calgary and Edmonton explicitly include indoor cats.",
      "Age thresholds differ: three months in Calgary, Ottawa and Vancouver; six months in Edmonton.",
      "Edmonton's included microchip programme requires an appointment, proof of ownership and a valid City licence.",
      "Licensing is not the rabies rule \u2014 that is provincial \u2014 but Ottawa layers its own vaccination requirement on top.",
      "A licence is not housing permission; check the new municipality rather than assuming a licence transfers when you move.",
    ],
    relatedSlugs: [
      "when-a-pet-goes-missing-in-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "provincial-questions", "canadian-pet-products"],
    sources: [
      {
        label: "Pet licensing \u2014 dogs and cats, renewed annually",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/",
      },
      {
        label: "Pet licensing fees \u2014 the published rates for altered and unaltered animals",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/pet-licensing-fees/",
      },
      {
        label: "Cat and dog registration, and the Animal Care and Control By-law",
        publisher: "City of Ottawa",
        url: "https://ottawa.ca/en/living-ottawa/animals-and-pets/pet-registration/cat-and-dog-registration",
      },
      {
        label: "Pet licences, and bylaws related to cats",
        publisher: "City of Calgary",
        url: "https://www.calgary.ca/pets/licences.html",
      },
      {
        label: "Pet licences \u2014 cats and dogs over six months, microchip included",
        publisher: "City of Edmonton",
        url: "https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/pet-licences-for-residents",
      },
      {
        label: "Dog licences and tags",
        publisher: "City of Vancouver",
        url: "https://vancouver.ca/home-property-development/licensing-your-dog.aspx",
      },
    ],
    needsVerification: [
      "October 21, 2026 limited correction: current Edmonton licensing and microchip-program pages explicitly confirm the included chip with appointment, ownership proof and valid licence. This supersedes the earlier microchip exclusion note below. National no-transfer takeaway narrowed to the existing body. Added application checklist and budget/harness routes; no new city fee or medical claim.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. Vancouver cats. vancouver.ca and bylaws.vancouver.ca are behind Cloudflare and returned 403 to every route available here \u2014 curl, WebFetch and a headless browser. What is verifiable from the City's own indexed material is that dogs three months and older require a licence under Animal Control By-law No. 9150, an instrument whose stated purpose is to establish a pound and license dogs. Cats are not asserted either way: inferring exemption from a dog-licensing bylaw is precisely the move the BC rabies error was made of. The row now says what is verified, says plainly that we are not presenting a position on cats, and sends the reader to Vancouver Animal Services.",
      "STANDING GUARDRAIL \u2014 do not conclude that a municipality does not license cats from the absence of cats on a dog-licensing page. That requires the bylaw or the City saying so.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. Toronto fees re-read on the City's pet licensing fee page: dog spayed/neutered $25.00, unaltered $60.00; cat spayed/neutered $15.00, unaltered $50.00; service dog no charge. Owners 65+ receive 50% off, and households under $50,000 income may have fees subsidised or waived. Licences run one year. The article now dates the figures to September 2026, attributes them to Toronto, gives the senior and low-income reductions so the headline numbers do not read as universal, and says explicitly that these are Toronto's numbers rather than a Canadian price.",
      "STANDING GUARDRAIL \u2014 PRICE. These are the only municipal fees in the library. Re-read the City's fee page at every scheduled review and delete the figures rather than carry a stale one. No other municipality's fees may be added without that city's own page and a date.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. Edmonton re-read on the City's pet licences page: \u201cAll cats and dogs over 6 months of age - even indoor pets - must be licensed and need to be renewed every 12 months\u201d, under the renewed Animal Care and Control Bylaw approved 19 August 2025 and in effect 19 May 2026. The fine for no valid licence is $250. One claim was removed rather than kept: the article said Edmonton's licence includes a microchip, and the current page describes a separate Pet Microchip Program rather than an inclusion, so the article no longer says it.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. The licence-transfer claim was a Canada-wide negative verified for none of the five cities. It is gone. The article now gives the actionable point \u2014 licensing is municipal, so check the new municipality rather than assume \u2014 and says openly that we have not checked whether any municipality recognises another's licence and are not claiming none does.",
      "STANDING GUARDRAIL \u2014 No other municipality\u2019s fees are quoted, and none should be added unless each can be sourced to that city\u2019s own fee page and dated. Toronto is present as an illustration of the spay/neuter differential, not as a Canadian figure.",
      "STANDING GUARDRAIL \u2014 The five cities are illustrative. No proportion of Canadian municipalities is claimed for any of the patterns described, and none should be added without a survey.",
    ],
  },
  {
    slug: "senior-dogs-and-cats",
    section: "health",
    subcategory: "Life stage",
    title: "Caring for a Senior Dog or Cat",
    deck: "\u201cHe\u2019s just getting old\u201d is the most expensive sentence in pet ownership. When senior actually starts, what changes, and why most of it has a name.",
    metaDescription:
      "Senior is the last quarter of expected lifespan \u2014 seven for a large dog, ten for a cat. What changes, what it might really be, and what to change at home.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "health-senior-dog-close",
    mediaAlt:
      "An elderly dog with a greying muzzle resting indoors, watching the room.",
    tags: ["senior-pets", "life-stage", "arthritis", "preventative-care", "dogs", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Senior is a proportion, not a birthday: the last 25% of estimated lifespan.",
      "A large dog can be senior at seven or eight; a small breed may not be until around twelve; a cat is generally senior past ten.",
      "What changes is the monitoring \u2014 more frequent examinations and baseline bloodwork you can compare against later.",
      "Stiffness, increased thirst, weight change and night-time confusion all have names, and several are manageable.",
      "Cats rarely limp. A cat that has stopped jumping to a favourite perch has told you something specific.",
      "Traction on hard floors, ramps, and lower-sided litter boxes do more for quality of life than most purchases.",
      "Adjust the exercise rather than stopping it \u2014 lost muscle makes painful joints worse.",
    ],
    relatedSlugs: [
      "dental-care-for-dogs-and-cats",
      "pet-insurance-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      {
        label: "2023 AAHA Senior Care Guidelines for Dogs and Cats \u2014 defining the senior patient",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2023-aaha-senior-care-guidelines-for-dogs-and-cats/defining-the-senior-patient/",
      },
      {
        label: "Senior status: understanding your senior pet\u2019s life stage",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/senior-status-understanding-your-senior-pets-life-stage/",
      },
      {
        label: "2021 AAHA/AAFP Feline Life Stage Guidelines",
        publisher: "American Animal Hospital Association and American Association of Feline Practitioners",
        url: "https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/feline-life-stage-2021/2021-aaha-aafp-feline-life-stage-guidelines.pdf",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The age reference points \u2014 large dogs at seven to eight, small breeds around twelve, cats past ten \u2014 are cited to AAHA and AAFP guidance. Re-check against the current editions before publication.",
      "That a recognised cognitive dysfunction syndrome exists in older dogs and cats \u2014 referred to without being named, and it should be named once a source is attached.",
      "That osteoarthritis is common and under-diagnosed in cats specifically, and that cats rarely present with lameness. Well supported in feline medicine; attach a source.",
      "That baseline bloodwork is more useful as a trend than a single result \u2014 presented as reasoning rather than as a guideline recommendation.",
      "End-of-life care, palliative options and euthanasia are deliberately not covered here. Both cost guides name it as the least discussed cost, and it needs its own article rather than a paragraph.",
    ],
  },

  /* ---------------------------------------------------------------- Batch F
     Articles 26\u201330, which complete the ranked gap analysis produced at
     Quality Gate #1. Every one of the fifteen concepts on that list has now
     been written; nothing here was invented to reach thirty.

     Two of these are load-bearing for the library rather than for search.
     Moving provinces is the connector \u2014 it is the article where the
     rabies, tenancy, licensing and veterinary-regulator differences
     established across earlier batches finally sit in one place and explain
     each other. End-of-life is the one both cost guides have been pointing at
     since the first batch while calling it the least discussed cost.

     The pet food guide is the one with the genuinely surprising Canadian
     answer: no federal body sets nutritional standards for retail pet food
     here, and the ingredient definitions in use are an American voluntary
     body's. */

  {
    slug: "puppy-socialisation-checklist",
    section: "dogs",
    subcategory: "Training",
    title: "Puppy Socialisation Checklist: Safe Starts in Canada",
    deck: "Plan comfortable early experiences, choose pre-vaccination settings with your vet, and adapt puppy socialisation for Canadian winter conditions.",
    metaDescription:
      "A puppy socialisation checklist for Canada: pre-vaccination planning, class questions, body-language cues and practical winter alternatives.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "training-puppy-on-street",
    mediaAlt:
      "A puppy on a lead taking in a street \u2014 the world at a distance it can handle.",
    tags: ["puppies", "socialisation", "training", "behaviour", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-26",
    veterinaryNotice: true,
    keyTakeaways: [
      "Discuss early socialisation and local infection precautions with your veterinary team before the vaccination series is complete.",
      "Choose brief, comfortable experiences, not a target number of meetings or a list the puppy must finish.",
      "Check the actual class health requirements and how it handles worried puppies before booking.",
      "Read behaviour in context: taking or refusing treats is not a stand-alone test of comfort.",
      "Use safe indoor alternatives when winter weather makes outings unsuitable; ice and road salt are not training surfaces.",
    ],
    relatedSlugs: [
      "puppy-vaccination-schedule-in-canada",
      "finding-a-veterinarian-in-canada",
      "winter-dog-care-in-canada",
    ],
    relatedCategorySlugs: ["puppies", "dog-training-and-behaviour", "general-dog-discussion"],
    sources: [
      {
        label: "Socialization and Infectious Disease Prevention: a planning checklist",
        publisher: "Ohio State University College of Veterinary Medicine — Stull and Herron (2025)",
        url: "https://vet.osu.edu/sites/default/files/documents/socialization-and-id-prevention-checklist-final.pdf",
      },
      {
        label: "Age and behavior: individual development and avoiding forced exposure",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2015-aaha-canine-and-feline-behavior-management-guidelines/age-and-behavior/",
      },
      {
        label: "Puppy behavior and training basics: recognizing possible fear signs",
        publisher: "VCA Animal Hospitals",
        url: "https://vcahospitals.com/know-your-pet/puppy-behavior-and-training-training-basics",
      },
      {
        label: "Puppy socialization class information: a Canadian provider example",
        publisher: "Winnipeg Humane Society",
        url: "https://winnipeghumanesociety.ca/puppy-socialization-important-information/",
      },
      {
        label: "Cold Weather and Pets",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/related-resources/cold-weather-and-pets/",
      },
      {
        label:
          "Behavioral problems of dogs \u2014 acute fear and anxiety signs, including displacement behaviours such as yawning and lip-licking",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/behavior/normal-social-behavior-and-behavioral-problems-of-domestic-animals/behavioral-problems-of-dogs",
      },
      {
        label: "Position statement on puppy socialization",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://www.avsab.org/wp-content/uploads/2019/01/Puppy-Socialization-Position-Statement-FINAL.pdf",
      },
      {
        label: "Behavior problems of dogs \u2014 socialisation and early learning",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/behavior/behavior-of-dogs/behavior-problems-of-dogs",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED 2026-10-26 — current copy uses AVSAB early-period and AAHA individual-variation guidance rather than the older precise approach-to-novelty trajectory. Historical September review notes below are retained as history, not current article assertions.",
      "RESOLVED 2026-10-26 — editorial safety refresh removed treat-taking diagnostics, guaranteed lifetime noise tolerance, universal recovery timers and hazardous surface practice. Added individual veterinary venue advice, class-selection questions and winter alternatives from AVSAB, OSU, AAHA, VCA, CVMA and a Canadian class provider. Not a veterinary review; no product or affiliate endorsement.",
      "RESOLVED 2026-09-06 \u2014 the second-wariness claim. The article said \u201cmany dogs go through a second period of increased wariness during adolescence\u201d, which is the second fear period in other words and contradicted the Puppy Journey's editorial position, where the differentiation gate found no peer-reviewed basis for a scheduled adolescent fear stage at any age. Replaced with the sourced trajectory: McEvoy et al. 2022 put the peak tendency to approach novelty at three to five weeks with a decline after it, and Merck describes attraction to unfamiliar people decreasing and avoidance becoming more pronounced through the juvenile period from about twelve weeks. Framed as a gradual curve rather than a stage, individual variation stated, pain and illness named as possible causes of sudden change, and a route to veterinary and qualified behavioural help given.",
      "STANDING GUARDRAIL \u2014 no second fear period, fear stage, fear phase, scheduled adolescent fear event or universal age threshold, in any wording. The prohibition is on the developmental assertion, not on a form of words: do not reintroduce it by avoiding the phrase.",
      "RESOLVED 2026-09-06 \u2014 body-language signals. Merck is now named for the signs it actually lists (low body posture, piloerection, vocalisation, and displacement behaviours such as yawning or lip-licking), and the article states plainly that none of these is a fear signal on its own. Merck classes yawning and lip-licking as displacement behaviours, which is exactly why they are non-specific; the article now asks the reader to read the combination and the context rather than any single sign.",
      "STANDING GUARDRAIL \u2014 never write \u201cX means your dog is afraid\u201d for a single signal. Signals are read together, in context, or not at all.",
      "STANDING GUARDRAIL \u2014 The exposure categories are an editorial organising structure rather than a published checklist. Confirm nothing in the table conflicts with AVSAB or Merck guidance.",
      "OPEN (NON-BLOCKING) \u2014 Whether any Canadian veterinary or behaviour body publishes puppy class standards that should be cited alongside AVSAB's.",
    ],
  },
  {
    slug: "moving-provinces-with-a-pet",
    section: "canadian-life",
    subcategory: "Moving",
    title: "Moving Provinces With a Pet: Housing, Records and Local Checks",
    deck: "Prepare a move with your pet: confirm housing, local licensing, route requirements, identification contacts and continuity of veterinary care.",
    metaDescription: "Prepare a move with your pet: confirm housing, local licensing, route requirements, identification contacts and continuity of veterinary care.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "guides-moving-boxes-dog",
    mediaAlt:
      "A dog sitting between two people carrying moving boxes \u2014 the day the rules change.",
    tags: ["moving", "provincial", "licensing", "tenancy", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    keyTakeaways: ["Check the destination rather than assuming old rules carry over.", "Arrange records and prescription continuity with the veterinary team.", "Assign responsibility for animals while doors are open on moving day."],
    relatedSlugs: [
      "pet-licensing-across-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "provincial-questions", "travelling-with-pets"],
    sources: [
      {"label": "Pet tenancy example", "publisher": "Province of British Columbia", "url": "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/pets-and-tenancy"},
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "pet-emergency-preparedness-canada",
    section: "canadian-life",
    subcategory: "Preparedness",
    title: "Pet Emergency Preparedness in Canada: Kits and Evacuation Plans",
    deck: "Build a pet emergency kit and evacuation plan for Canada, with regional supply guidance, a household worksheet and current official sources.",
    metaDescription: "Build a pet emergency kit and evacuation plan for Canada, with regional supply guidance, a household worksheet and current official sources.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "guides-pet-emergency-kit",
    mediaAlt:
      "A pet carrier, collapsible bowls, food, a coat and a bed laid out from above \u2014 the kit, assembled.",
    tags: ["emergency-preparedness", "evacuation", "wildfire", "safety", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    updatedAt: "2026-10-28",
    veterinaryNotice: true,
    keyTakeaways: ["Confirm shelter access instead of assuming pets are accepted.", "Use local supply guidance, and plan both portable and reserve supplies.", "Follow official evacuation instructions and ask local services for help."],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "when-a-pet-goes-missing-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "general-dog-discussion", "general-cat-discussion"],
    sources: [
      {label: "Pet preparedness: supplies, profiles and evacuation planning", publisher: "Government of Alberta", url: "https://www.alberta.ca/pet-preparedness"},
      {label: "How to prepare for an emergency: pet edition", publisher: "BC SPCA", url: "https://spca.bc.ca/article/emergency-evacuation-checklist/"},
      {"label": "Emergency preparedness for pets and service animals", "publisher": "Public Safety Canada", "url": "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared/emergency-planning-resources/animals.html"},
    ],
    resources: [
      {
        label: "Get Prepared \u2014 building a household emergency plan",
        publisher: "Public Safety Canada",
        url: "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared.html",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "reading-a-canadian-pet-food-label",
    section: "health",
    subcategory: "Nutrition",
    title: "How to Read a Canadian Pet Food Label",
    deck: "Read adequacy and life-stage statements, compare wet and dry food carefully, and use a practical worksheet to check calories, cost and manufacturer information.",
    metaDescription:
      "Read Canadian pet food labels, compare wet and dry food on a dry-matter basis, and check life stage, calories and daily cost before buying.",
    authorId: "pet-club-editorial",
    readingMinutes: 10,
    mediaId: "food-pouring-kibble",
    mediaAlt:
      "Dry food being poured from an unbranded paper bag into a bowl.",
    tags: ["nutrition", "labelling", "regulation", "food", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    updatedAt: "2026-10-30",
    veterinaryNotice: true,
    keyTakeaways: [
      "A nutritional adequacy statement is not Canadian government approval of a product.",
      "CFIA covers imports, exports and animal by-products; Health Canada polices unsubstantiated health claims; the Competition Bureau requires a bilingual common name, metric net quantity and dealer address.",
      "Ingredient definitions come from AAFCO \u2014 an American voluntary body \u2014 and are recommended rather than required here.",
      "The nutritional adequacy statement and life stage is the most useful line on the bag and the one most people skim.",
      "Ingredient order alone does not establish nutritional quality; moisture affects weight comparisons.",
      "Wet and dry food need a common comparison basis; guaranteed minimums and maximums are not exact nutrient levels.",
      "Marketing adjectives do not establish nutritional suitability; check adequacy, life stage and manufacturer evidence.",
    ],
    relatedSlugs: [
      "pet-food-storage-container-original-bag",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["dog-food-and-nutrition", "cat-food-and-nutrition", "canadian-pet-products"],
    sources: [
      { label: "Food-selection questions", publisher: "World Small Animal Veterinary Association", url: "https://wsava.org/wp-content/uploads/2021/04/Selecting-a-pet-food-for-your-pet-updated-2021_WSAVA-Global-Nutrition-Toolkit.pdf" },
      { label: "Guaranteed analysis and dry-matter comparisons", publisher: "Merck Veterinary Manual", url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/dog-and-cat-foods" },
      { label: "Nutritional adequacy and label statements (US context)", publisher: "AAFCO", url: "https://www.aafco.org/consumers/understanding-pet-food/reading-labels/" },
      {
        label:
          "Guide for the labelling and advertising of pet foods \u2014 the three mandatory items under the Consumer Packaging and Labelling Act, and ingredients in descending order by percentage of weight",
        publisher: "Competition Bureau Canada",
        url: "https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/publications/guide-labelling-and-advertising-pet-foods",
      },
      {
        label: "Guide for the labelling and advertising of pet foods \u2014 who regulates what, and what a label must carry",
        publisher: "Competition Bureau Canada",
        url: "https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/publications/guide-labelling-and-advertising-pet-foods",
      },
      {
        label: "Regulatory oversight of pet food, treats and chews in Canada",
        publisher: "Canadian Food Inspection Agency",
        url: "https://inspection.canada.ca/en/animal-health/terrestrial-animals/exports/pet-food/pet-food-treats-and-chews",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 VERIFIED, 2026-09-06. The division of federal responsibility was re-read in the Competition Bureau's current guide and is unchanged: CFIA regulates movement of inedible meat products and certification of certain imported pet foods containing animal products; Health Canada administers the prohibition on unsubstantiated health claims; the Competition Bureau administers the requirement for a bilingual common name, metric net quantity declaration and dealer name and address. The article now separates those three legally mandatory items, which come from the Consumer Packaging and Labelling Act, from the fuller list the guide recommends \u2014 ingredient list, guaranteed analysis, feeding instructions, nutritional adequacy \u2014 which it previously ran together as though all six were statute.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. Ingredient order. The guide does say ingredients are listed in descending order by percentage of weight. It does NOT say at what point that weight is taken, and the \u201cmeasured before cooking\u201d explanation is US labelling practice; no Canadian source for it could be found. The article no longer states it as the Canadian rule, says where the explanation comes from, and keeps the moisture consequence, which holds regardless of jurisdiction. \u201cIngredient splitting\u201d is now described as an interpretive term used by label readers rather than a legal category.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. Marketing terms. The article asserted that premium, super-premium, holistic, gourmet and human-grade have no defined legal meaning in Canada \u2014 one exhaustive negative covering five words, and the same class of claim as the BC rabies error. The Competition Bureau's guide does not mention any of them. The article now says exactly that, says \u201cwe could not find a Canadian definition\u201d is not \u201cnone exists\u201d, and moves the weight onto the point that actually helps a reader: none of those words tells you whether a food is nutritionally appropriate, and any claim must be accurate, not misleading, and based on adequate and proper tests.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. Two further exhaustive negatives were softened in the same pass: \u201cthere is no federal agency setting nutritional standards\u201d and \u201cno Canadian body sets nutritional standards\u201d now read as none of the three federal bodies that touch pet food does so, which is what the guide establishes.",
      "STANDING GUARDRAIL \u2014 AAFCO is an American voluntary body. It may never be described as a Canadian regulator, and an AAFCO statement may never be presented as Canadian regulatory approval.",
      "STANDING GUARDRAIL \u2014 No product, brand or manufacturer is named anywhere, deliberately. Keep it that way unless an assessment can be sourced and dated.",
      "OPEN (NON-BLOCKING) \u2014 Whether any Canadian body publishes an accepted-products list comparable to the VOHC for dental products, which would be worth adding as a resource.",
    ],
  },
  {
    slug: "end-of-life-care-for-pets",
    section: "health",
    subcategory: "End of life",
    title: "End-of-Life Care, and Knowing When It Is Time",
    deck: "The moment rarely announces itself, so a framework replaces it: pain, and whether an animal can still eat, breathe, move and engage. Written to be read early.",
    metaDescription:
      "How quality of life is actually assessed, what euthanasia involves, and the practical decisions worth making in a quiet week rather than a hard one.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "health-hand-holding-paw",
    mediaAlt:
      "A hand holding a dog\u2019s paw, the dog leaning in towards it.",
    tags: ["end-of-life", "euthanasia", "palliative-care", "senior-pets", "grief"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Quality of life is assessed on pain, and the ability to eat and drink, breathe comfortably, eliminate appropriately, move around the home and engage with you.",
      "Track good days and bad days in writing. A month of notes shows a pattern that no single afternoon contains.",
      "Palliative care and hospice exist between treating and stopping, and most owners are never told.",
      "Current guidance is explicit: where pain and suffering cannot be relieved, withholding palliative sedation or euthanasia is unethical and inhumane.",
      "Euthanasia is usually two stages, sedation first. Knowing what to expect beforehand removes most of the fear.",
      "Decide home or clinic, and aftercare, in a quiet week rather than in a consulting room.",
      "Home burial is not universally permitted \u2014 it depends on municipal rules, so check before rather than after.",
    ],
    relatedSlugs: [
      "senior-dogs-and-cats",
      "finding-a-veterinarian-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      {
        label: "End of life and euthanasia \u2014 quality of life assessment and the limits of palliative care",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2023-aaha-senior-care-guidelines-for-dogs-and-cats/end-of-life-and-euthanasia/",
      },
      {
        label: "2016 AAHA/IAAHPC End-of-Life Care Guidelines for Dogs and Cats",
        publisher: "American Animal Hospital Association and the International Association for Animal Hospice and Palliative Care",
        url: "https://www.aaha.org/resources/2016-aaha-iaahpc-end-of-life-care-guidelines/",
      },
      {
        label: "Things pet owners should know about end-of-life care",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/end-of-life-care-for-pets/",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The description of what euthanasia involves is written generically and deliberately names no drug. Confirm the two-stage description and the post-mortem observations against a veterinary source before publication \u2014 this is the passage where being wrong would do the most harm.",
      "Availability of at-home euthanasia across Canada, and whether it is concentrated in urban centres. Described as varying by region and quantified nowhere.",
      "Whether home burial of a companion animal is permitted, restricted or prohibited, and at which level of government. The article states only that it varies and to check locally \u2014 do not make this specific without a jurisdiction-by-jurisdiction check.",
      "Whether letting surviving animals see the body helps them. Deliberately written as uncertain; do not strengthen it without evidence.",
      "Guidance on discussing pet death with children is referred to only in general terms. If it is expanded, it needs a source from a body qualified to give it.",
      "Pet-loss support services available in Canada \u2014 referred to generally and named nowhere.",
    ],
  },

  /* ---------------------------------------------------------------- Batch G
     Articles 31–35, the first batch after Quality Gate #2 and the first
     written under the pricing rule documented above.

     Three of these exist because earlier articles kept pointing at them: the
     cat guides have said for six batches that litter box problems are the
     commonest reason cats lose their homes, the cat cost guide names urinary
     blockage as the thing that breaks a budget, and the senior guide gestures
     at arthritis repeatedly. Each was a promise the library had not kept.

     The veterinary costs article is the one that tests the new pricing rule,
     and it largely fails it on purpose — no authority in Canada publishes what
     a consultation costs, because practices set their own fees and competition
     law constrains associations from doing it for them. So the article teaches
     the structure of a bill instead, carries the federal Competition Bureau
     material on why the sector looks as it does, and quotes exactly one price:
     the municipal licence fee already established in the licensing guide. */

  {
    slug: "litter-box-problems-in-cats",
    section: "cats",
    subcategory: "Behaviour",
    title: "Litter Box Problems in Cats",
    deck: "A cat that has stopped using the box is not making a point. Rule out the body first, then work out whether it is toileting or marking — because they need opposite fixes.",
    metaDescription:
      "Why medical causes come first, how to tell toileting from marking, and the litter box audit that resolves most cases.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "cats-leaving-litter-box",
    mediaAlt:
      "A cat stepping out of an open litter tray — uncovered, low-sided, in a quiet corner.",
    tags: ["litter-box", "house-soiling", "behaviour", "cats", "multi-cat"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Rule out medical causes before anything else — it is the first step in the veterinary guidelines, and behavioural work is wasted until it is done.",
      "Straining while producing little or no urine is an emergency, not a litter box problem.",
      "Toileting and marking look similar on the carpet and need opposite responses: normal volume squatting versus small-volume spraying on vertical surfaces.",
      "One box per cat plus one, in separate rooms — two trays side by side is one location as far as a cat is concerned.",
      "Uncovered, bigger than looks necessary, low sides, fine unscented litter, scooped daily.",
      "Clean with an enzymatic cleaner and never anything ammonia-based, which smells to a cat like a spot already used.",
      "Never punish: it cannot connect to a decision made twenty minutes ago, and it adds the stress that often caused the problem.",
    ],
    relatedSlugs: [
      "cat-urinary-blockage-flutd",
      "introducing-a-second-cat",
    ],
    relatedCategorySlugs: ["cat-behaviour", "cat-health", "general-cat-discussion"],
    sources: [
      {
        label: "AAFP/ISFM guidelines for diagnosing and solving house-soiling behaviour in cats",
        publisher: "American Association of Feline Practitioners and International Society of Feline Medicine",
        url: "https://catvets.com/resource/aafp-isfm-house-soiling-guidelines/",
      },
      {
        label: "Feline behaviour problems: house soiling",
        publisher: "Cornell Feline Health Center",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-house-soiling",
      },
      {
        label: "Soiling indoors — telling toileting from marking",
        publisher: "International Cat Care",
        url: "https://icatcare.org/articles/soiling-indoors",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The named medical causes (urinary tract inflammation, feline idiopathic cystitis, hyperthyroidism, diabetes) are drawn from the AAFP/ISFM guidance and Cornell. Confirm each against the guideline text before publication rather than relying on a summary.",
      "That house-soiling is among the most common reasons cats are surrendered — carried from the kitten guide, where it is also flagged, and still not attached to a Canadian source.",
      "That ammonia-based cleaners encourage re-soiling: widely stated and mechanistically plausible; attach a source or soften.",
      "The four-category framing in the AAFP/ISFM algorithm is simplified here to two. Confirm the simplification does not misrepresent the guidance.",
      "Whether synthetic pheromone products have evidence in house-soiling specifically. Mentioned only as a possible adjunct and named nowhere.",
    ],
  },
  {
    slug: "cat-urinary-blockage-flutd",
    section: "cats",
    subcategory: "Urgent care",
    title: "Urinary Blockage and FLUTD in Cats",
    deck: "A cat straining and producing nothing is an emergency measured in hours. What FLUTD actually covers, which cats are at risk, and the one line that decides your next hour.",
    metaDescription:
      "Straining with little or no urine is an emergency. What FLUTD covers, which cats are at higher risk, and how the signs are triaged.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "cats-drinking-running-water",
    mediaAlt:
      "A cat drinking from a running tap — water intake being one of the few levers a household actually has.",
    tags: ["flutd", "urinary", "emergency-care", "cat-health", "cats"],
    featured: true,
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Straining in the box while producing little or no urine is an emergency at any hour. Phone immediately and do not attempt anything at home.",
      "Do not use a predicted survival time as a deadline for seeking veterinary help.",
      "FLUTD is a category, not a diagnosis — it covers idiopathic cystitis, stones, obstruction, infection and more, and they are treated differently.",
      "Feline idiopathic cystitis, in which stress plays a recognised part, is the most common finding.",
      "Male and neutered male cats are at higher risk of obstruction because the urethra is longer and narrower.",
      "Owners routinely mistake obstruction for constipation. If you cannot tell which you are looking at, that is the reason to phone.",
      "Water intake, weight, activity, stress and easy litter box access are the household levers — none replaces veterinary care.",
    ],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "litter-box-problems-in-cats",
    ],
    relatedCategorySlugs: ["cat-health", "vet-costs", "general-cat-discussion"],
    sources: [
      {
        label: "Feline lower urinary tract disease — what it covers, the signs, and why obstruction is an emergency",
        publisher: "Cornell Feline Health Center",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease",
      },
      {
        label: "Lower urinary tract disease in cats",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/urinary-system/noninfectious-diseases-of-the-urinary-system-in-small-animals/lower-urinary-tract-disease-in-cats",
      },
      {
        label: "Obstructive uropathy in dogs and cats",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/urinary-system/noninfectious-diseases-of-the-urinary-system-in-small-animals/obstructive-uropathy-in-dogs-and-cats",
      },
    ],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "SAFETY — the 24 to 48 hour figure is quoted from Cornell and is the most consequential sentence in this article. Confirm the exact wording against the current page before publication; do not paraphrase it into anything more precise.",
      "The risk profile (male and neutered male, middle-aged, overweight, indoor, low activity) is Cornell's. Confirm before publication, and do not let it harden into a prediction about any individual cat.",
      "The treatment description (catheterisation under sedation, fluids, hospitalisation) is deliberately general and names no drug. Confirm it against a veterinary source before publication.",
      "That prescription diets are effective for specific urinary conditions — stated generally and attached to no product or study.",
      "Whether Canadian emergency hospital availability materially affects outcomes in obstruction cases, which would be a genuinely Canadian addition if a source exists. Not claimed here.",
    ],
  },
  {
    slug: "what-veterinary-care-costs-in-canada",
    section: "health",
    subcategory: "Money",
    title: "Veterinary Costs in Canada: How to Compare Written Estimates",
    deck: "Read veterinary estimates, compare their scope, ask about payment and prescriptions, and build a budget using actual local quotes.",
    metaDescription: "Read veterinary estimates, compare their scope, ask about payment and prescriptions, and build a budget using actual local quotes.",
    authorId: "pet-club-editorial",
    readingMinutes: 3,
    mediaId: "health-vet-consultation-discussion",
    mediaAlt:
      "An owner and a veterinarian talking over a small dog on the consulting table — the conversation the article argues for having early.",
    tags: ["vet-costs", "money", "budgeting", "regulation", "canada"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-10-09",
    veterinaryNotice: true,
    keyTakeaways: ["Compare included services before comparing totals.", "Discuss clinical decisions and financial constraints with the veterinary team.", "An insurance policy does not guarantee payment of every invoice."],
    relatedSlugs: [
      "pet-insurance-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "provincial-questions"],
    sources: [{ label: "Ontario medical record and itemised fee guidance", publisher: "College of Veterinarians of Ontario", url: "https://www.cvo.org/standards/medical-records-guide-to-the-standard" }],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [],
  },
  {
    slug: "arthritis-and-mobility-in-dogs-and-cats",
    section: "health",
    subcategory: "Chronic conditions",
    title: "Arthritis and Mobility in Dogs and Cats",
    deck: "Changes in activity and mobility to discuss with your veterinary team, and questions about assessment, management and the home environment.",
    metaDescription:
      "The signs of joint pain in dogs and cats, why cats rarely limp, what multimodal treatment means, and the home changes that matter most.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "health-dog-descending-stairs",
    mediaAlt:
      "A dog picking its way carefully down a wooden staircase — stairs being one of the first things to change.",
    tags: ["arthritis", "mobility", "pain", "senior-pets", "dogs", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Osteoarthritis is described by AAHA as underdiagnosed, largely because animals do less rather than limping.",
      "In dogs: slowness to rise, hoisting the back end up, difficulty on stairs, less jumping and play.",
      "In cats it is almost entirely indirect — stopped jumping, missed landings, a coat that has stopped being groomed, weight loss, and toileting outside the box.",
      "A cat that has stopped reaching a favourite high place has told you something specific.",
      "Treatment is multimodal by design: pain management, weight, controlled exercise, rehabilitation, diet, environment and sometimes surgery.",
      "Overweight is a recognised risk factor for development and progression, and it is the lever owners control most directly.",
      "Never give human pain medication — several are toxic to dogs and cats.",
      "Discuss suitable floor traction and other environmental changes with the veterinary team.",
    ],
    relatedSlugs: [
      "senior-dogs-and-cats",
      "what-veterinary-care-costs-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      {
        label: "Osteoarthritis in dogs and cats — clinical signs, risk factors and multimodal management",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/musculoskeletal-system/osteoarthritis-in-dogs-and-cats/osteoarthritis-in-dogs-and-cats",
      },
      {
        label: "2022 AAHA Pain Management Guidelines for Dogs and Cats",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/resources/2022-aaha-pain-management-guidelines-for-dogs-and-cats/",
      },
      {
        label: "Canine osteoarthritis: an underdiagnosed condition",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/trends-magazine/publications/canine-osteoarthritis-an-underdiagnosed-condition/",
      },
    ],
    resources: [
      {
        label: "Mobility Matters — recognising and managing osteoarthritis",
        publisher: "American Animal Hospital Association",
        url: "https://www.aaha.org/wp-content/uploads/globalassets/05-pet-health-resources/mobilitymatters.pdf",
      },
    ],
    needsVerification: [
      "PUBLICATION HOLD — qualified veterinary review is required for the clinical or behavioural assessment and intervention claims; no veterinarian has signed off this guide.",
      "The feline sign list (weight loss, reduced appetite, changed attitude, poor grooming, toileting outside the box, inability to jump) is Merck's. Confirm the wording before publication — it is the part of this article doing the most work.",
      "That AAHA describes canine osteoarthritis as underdiagnosed: confirm against the article cited rather than the headline.",
      "That overweight is a recognised risk factor for development and progression — stated for dogs; confirm whether the same is established for cats before the wording covers both species equally.",
      "No drug, drug class or dose appears anywhere, deliberately. Keep it that way: species differences in analgesia between dogs and cats are exactly where owner harm occurs.",
      "The evidence base for joint supplements is described as varying by product and ingredient. Do not strengthen or weaken this without a source, and name no product.",
      "Whether veterinary rehabilitation and physiotherapy are widely available in Canada, or concentrated in urban centres — relevant to rural readers and currently not addressed.",
    ],
  },
  {
    slug: "loose-leash-walking-and-recall",
    section: "dogs",
    subcategory: "Training",
    title: "Loose-Leash Walking and Recall",
    deck: "Both fail for the same reason: they get tested on the street before they are built in the hallway. A progression for each, and the one rule that protects a recall for life.",
    metaDescription:
      "How to build lead walking and recall in the order that works, why the long line matters, and the mistakes that break a recall permanently.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "training-dog-looking-back-walk",
    mediaAlt:
      "A dog on a lead pausing on a path to look back towards its handler — the moment both of these skills are built on.",
    tags: ["training", "recall", "lead-walking", "behaviour", "dogs"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "AVSAB recommends only reward-based methods for all dog training, and holds that aversive methods should not be used under any circumstances.",
      "Deliver the reward at your trouser seam, not out in front — this single detail fixes more pulling than any equipment.",
      "Pulling works, which is why it persists. Forward progress stops when the lead tightens and resumes when it loosens.",
      "Recall's protective rule: coming back must always be worth it, and must usually end with a release back to what the dog was doing.",
      "Never call a recall you cannot back up, and never call a dog to something it will dislike.",
      "The long line is the stage most people skip and the one that makes off-lead recall possible.",
      "Increase one variable at a time — distance, then duration, then distraction.",
      "No recall is guaranteed. Roads, wildlife and livestock are reasons to keep the line on regardless.",
    ],
    relatedSlugs: [
      "puppy-socialisation-checklist",
      "bringing-home-a-puppy-first-30-days",
    ],
    relatedCategorySlugs: ["dog-training-and-behaviour", "puppies", "general-dog-discussion"],
    sources: [
      {
        label:
          "Teenage dogs? Evidence for adolescent-phase conflict behaviour \u2014 carer-rated trainability lower at around eight months, in a guide-dog population",
        publisher: "Asher et al., Biology Letters (2020)",
        url: "https://royalsocietypublishing.org/doi/10.1098/rsbl.2020.0097",
      },
      {
        label: "Position statement on humane dog training — reward-based methods, and no role for aversive training",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://avsab.org/wp-content/uploads/2021/08/AVSAB-Humane-Dog-Training-Position-Statement-2021.pdf",
      },
      {
        label: "Veterinary behaviorists: no role for aversive dog training practices",
        publisher: "American Veterinary Medical Association",
        url: "https://www.avma.org/javma-news/2021-11-01/veterinary-behaviorists-no-role-aversive-dog-training-practices",
      },
      {
        label: "What are reward-based training methods for dogs and cats?",
        publisher: "American Veterinary Society of Animal Behavior",
        url: "https://avsab.org/what-are-reward-based-training-methods-for-dogs-and-cats/",
      },
    ],
    resources: [
      {
        label: "Dogs in Parks Canada’s protected places — the leash requirement",
        publisher: "Parks Canada",
        url: "https://parks.canada.ca/voyage-travel/regles-rules/chien-dog",
      },
    ],
    needsVerification: [
      "RESOLVED 2026-09-06 \u2014 the adolescence claim. The article said \u201cmany dogs get noticeably worse between roughly six and eighteen months\u201d with no source, which asserted a universal developmental window. Replaced with what Asher et al. 2020 actually measured: sampling at roughly five, eight and twelve months; carers rating trainability lower at eight; the dogs responding less to their own carer's cue while responding better to a stranger's; professional trainers rating the same dogs higher. The guide-dog population and the authors' own caution that the age groupings would need reconsidering for other breeds are both carried in the prose. No six-to-eighteen-month schedule is claimed.",
      "STANDING GUARDRAIL \u2014 no universal adolescent regression window, and no dominance, pack-leader, boundary-testing or \u201cstubborn because adolescent\u201d framing. Where Asher is cited its population limitation travels with it.",
      "RESOLVED 2026-09-06 \u2014 the AVSAB wording was verified against the 2021 Humane Dog Training position statement PDF, retrieved directly. Confirmed verbatim: \u201conly reward-based training methods are used for all dog training, including the treatment of behavior problems\u201d; the avoided-equipment list (choke chains, prong collars, electronic shock collars; squirt bottles, shaker noise cans, compressed air cans, shouting, staring, alpha rolls or dominance downs); and, on aggression, \u201cThere are no exceptions to this standard.\u201d The article previously gave only two of the four categories the statement names. It now gives all four \u2014 pain, intimidation, physical correction techniques (leash jerking, physical force) and flooding \u2014 plus the statement\u2019s requirement that the learner feel safe and be able to opt out. An earlier draft of this note claimed the statement does not name leash corrections; it does, under physical correction techniques, and that was my error rather than the article\u2019s.",
      "STANDING GUARDRAIL \u2014 The five-stage lead progression and the recall progression are editorial structures rather than published protocols. They make no claim beyond ordering, but confirm nothing conflicts with AVSAB guidance.",
      "OPEN (NON-BLOCKING) \u2014 That retractable leads teach a dog that pulling extends the lead: mechanically obvious, but presented as reasoning rather than as a sourced finding.",
      "OPEN (NON-BLOCKING) \u2014 Whether dog training is regulated in any Canadian province, or whether any credential is protected. The article routes readers to their veterinary clinic instead, which is safe but less useful than naming a route if one exists.",
    ],
  },
] as const;

/**
 * Every article slug, as a union.
 *
 * Derived from the array rather than maintained beside it, so it cannot drift.
 * This exists so that other features — Puppy Journey, for one — can hold a
 * reference to an article and have a deleted or renamed slug surface as a
 * compile error rather than as a 404 discovered by a reader.
 */
export type ArticleSlug = (typeof articles)[number]["slug"];

/** The description used for metadata. Falls back to the deck. */
export function articleDescription(article: Article): string {
  return article.metaDescription ?? article.deck;
}

/** Site-relative path for an article. */
export function articlePath(slug: string): string {
  return `/guides/${slug}`;
}

/** Finds an article by slug, or `null`. */
export function findArticle(slug: string): Article | null {
  return articles.find((article) => article.slug === slug) ?? null;
}

/**
 * Articles surfaced on a topic or hub page.
 *
 * `/guides` is the editorial hub and lists everything; a topic surface lists
 * only the sections pointed at it. Resolving by `surfacePath` rather than by
 * section id means a new section is wired up by adding it to `sections`, not
 * by editing every page that lists articles.
 */
export function articlesForSurface(surfacePath: string): readonly Article[] {
  if (surfacePath === "/guides") {
    return articles;
  }

  return articles.filter(
    (article) => getArticleSection(article.section).surfacePath === surfacePath,
  );
}

/** Resolves an article’s related reading, skipping anything unresolvable. */
export function relatedArticles(article: Article): readonly Article[] {
  return (article.relatedSlugs ?? [])
    .map((slug) => findArticle(slug))
    .filter((related): related is Article => related !== null && related.slug !== article.slug);
}

/**
 * Articles that have completed editorial review.
 *
 * Editorial state only. Being published does not by itself make an article
 * eligible for the sitemap — see `indexableArticles`, which is the list the
 * sitemap actually reads.
 */
export function publishedArticles(): readonly Article[] {
  return articles.filter((article) => article.status === "published");
}

/**
 * Whether an article may be indexed, and therefore advertised in the sitemap.
 *
 * The single predicate behind both the `noindex` meta tag and sitemap
 * membership, so the two cannot contradict each other: an article cannot be
 * listed in the sitemap while telling crawlers to drop it, and it cannot be
 * indexable while being held back.
 *
 * Both halves are required and they answer different questions. `status` is
 * whether the writing is finished; `indexable` is whether we want it found.
 * Indexability can never override review status, which is why setting the flag
 * ahead of a launch is safe.
 */
export function isArticleIndexable(article: Article): boolean {
  return article.status === "published" && article.indexable;
}

/**
 * How search engines should treat this article.
 *
 * Three states, because `isArticleIndexable` returning false covers two very
 * different situations and they must not emit the same directive:
 *
 * | status     | indexable | policy            | robots           |
 * | ---------- | --------- | ----------------- | ---------------- |
 * | in-review  | any       | private-noindex   | noindex, nofollow|
 * | published  | true      | index             | index, follow    |
 * | published  | false     | public-noindex    | noindex, follow  |
 *
 * The last row is the one that needed a name. An article held back from search
 * for editorial reasons is still published, still linked, and still part of the
 * site's crawl graph; only its own listing is withheld. An article in review is
 * not a public editorial surface yet, so nothing is followed out of it.
 */
export function articleRobotsPolicy(article: Article): RobotsPolicy {
  if (article.status !== "published") {
    return "private-noindex";
  }

  return article.indexable ? "index" : "public-noindex";
}

/** Articles eligible for the sitemap. Empty while every article is in review. */
export function indexableArticles(): readonly Article[] {
  return articles.filter(isArticleIndexable);
}

/**
 * The publication dates an article may put in its metadata and markup.
 *
 * Empty while the article is in review: an unpublished page makes no claim
 * about when it was published, and there is no authoring date left in the
 * registry that could be substituted for one.
 *
 * The throw is a second lock behind the type union, which already makes a
 * published article without `publishedAt` a compile error. It can only fire if
 * something casts around the type, and it fails the build rather than quietly
 * omitting the field — an article whose status claims publication and whose
 * markup denies it is the contradiction this exists to prevent.
 */
export function articlePublicationDates(article: Article): {
  datePublished?: string;
  dateModified?: string;
} {
  if (article.status !== "published") {
    return {};
  }

  if (!article.publishedAt) {
    throw new Error(
      `Article "${article.slug}" is published with no publishedAt. Set the date it ` +
        "actually went live; a drafting or commit date is not a publication date.",
    );
  }

  return {
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
  };
}
