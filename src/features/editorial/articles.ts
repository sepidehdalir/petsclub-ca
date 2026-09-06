import type { ArticleAuthorId, ArticleReviewerId } from "@/features/editorial/authors";
import type { MediaAssetId } from "@/media/manifest";

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
 * any figure whose only source is another article. The two cost guides keep
 * their no-figures position — their argument is that no honest national
 * average exists, and that argument is unaffected by a city publishing its own
 * licence fee.
 *
 * Applied once so far, in `pet-licensing-across-canada`. Any future use starts
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
    slug: "winter-dog-care-in-canada",
    section: "dogs",
    subcategory: "Seasonal care",
    title: "Winter Dog Care in Canada",
    deck: "Why there is no single “too cold” temperature, what road salt actually does to paws, and the winter hazards that put Canadian dogs in front of a vet.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "guides-dogs-winter-forest",
    mediaAlt:
      "Two dogs standing among snow-covered pines on a still winter day in the forest.",
    tags: ["winter", "seasonal-care", "paw-care", "safety", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Read the dog, not the thermometer: coat type, size, age, health and acclimatisation matter more than the number.",
      "Rinse and check paws after every winter walk — road salt and de-icers are the most common urban winter problem.",
      "Antifreeze and frozen water bodies are absolutes, not judgement calls.",
      "Short-coated, small, senior and recently clipped dogs need a waterproof coat that covers the chest and belly.",
      "Replace lost walking distance with nose work and training — mental work tires a dog disproportionately.",
    ],
    relatedSlugs: [
      "bringing-home-a-puppy-first-30-days",
      "emergency-vet-visits-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "dog-training-and-behaviour", "general-dog-discussion"],
    sources: [
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
      "Whether a Canadian veterinary or public health source publishes de-icer guidance, so the ASPCA citation can be paired with a domestic one.",
    ],
  },
  {
    slug: "indoor-or-outdoor-cats-in-canada",
    section: "cats",
    subcategory: "Living arrangements",
    title: "Indoor, Outdoor, or In Between: How Cats Live in Canada",
    deck: "The risks that are specific to this country, what an indoor cat actually needs in return, and the middle options — catios, harnesses and curfews — that most well-run Canadian households land on.",
    metaDescription:
      "The Canadian risks that actually matter, what an indoor cat needs in return, and the middle options most well-run households land on.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-window-tabby",
    mediaAlt:
      "A ginger tabby cat lying on a windowsill in daylight, watching the street outside.",
    tags: ["indoor-cats", "enrichment", "safety", "wildlife", "cats"],
    featured: true,
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "The Canadian risk profile is its own thing: winter, antifreeze, established urban coyotes, and cat bylaws that in Calgary and Toronto are real and enforceable.",
      "Indoors is not the low-effort option — it is a trade in which you take on the enrichment the outdoors used to supply.",
      "Two short wand-toy sessions a day, ending in a catch and a meal, is the highest-yield thing most owners are not doing.",
      "A catio, harness walks, a cat-proofed fence or a dusk-to-dawn curfew all cut risk without removing the outdoors entirely.",
      "If a cat goes out at all: breakaway collar, a microchip registration that is actually current, and a check under the car hood in winter.",
    ],
    relatedSlugs: [
      "indoor-cat-enrichment-canadian-homes",
      "bringing-home-a-kitten-first-30-days",
    ],
    relatedCategorySlugs: ["cat-behaviour", "cat-health", "general-cat-discussion"],
    sources: [
      {
        label: "Bylaws related to cats, and the licence required from three months of age",
        publisher: "City of Calgary",
        url: "https://www.calgary.ca/bylaws/cats.html",
      },
      {
        label: "Pet licensing — every dog and cat in the city must be licensed",
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
      "The scale of predation on Canadian wild birds by free-roaming cats is described qualitatively; attach a primary source or drop the sentence.",
      "Whether to state a lifespan comparison between indoor and outdoor cats — deliberately omitted rather than estimated.",
      "Calgary and Toronto are named from their own bylaw pages. No proportion of Canadian municipalities is claimed; establish one before implying it.",
    ],
  },
  {
    slug: "renting-with-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Housing",
    title: "Renting With a Pet in Canada",
    deck: "Tenancy law is provincial, and a “no pets” clause that is unenforceable in one province is binding a few hours’ drive away. What to establish first, and how to become the applicant a landlord says yes to.",
    metaDescription:
      "Tenancy law is provincial, and a “no pets” clause that is unenforceable in one province binds in another. What to establish, and how to be the easy yes.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "about-kitchen-play",
    mediaAlt: "A man crouches in the kitchen of a rented home, playing with a white dog.",
    tags: ["housing", "renting", "tenancy", "moving", "canada"],
    indexable: true,
    status: "in-review",
    keyTakeaways: [
      "There is no national rule. In Ontario a no-pets clause is void; in British Columbia and Quebec the same clause binds you.",
      "Two separate questions, and they do not travel together: is the clause enforceable here, and can a landlord take money for the pet?",
      "British Columbia permits a pet damage deposit of up to half a month’s rent, one deposit however many pets. Ontario permits none.",
      "In a condo there are two rulebooks and the stricter wins — read the declaration and rules before signing.",
      "A one-page pet résumé plus a previous landlord’s reference is what converts a refusal into a yes.",
      "Get the pet named and permitted in the lease or a signed addendum, however relaxed the landlord sounds.",
    ],
    relatedSlugs: [
      "travelling-with-a-pet-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "canadian-pet-products"],
    sources: [
      {
        label: "Residential Tenancies Act, 2006 — section 14 makes a no-pets provision void",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/laws/statute/06r17",
      },
      {
        label: "Pets and tenancy — prohibitions, restrictions and the pet damage deposit",
        publisher: "Province of British Columbia",
        url: "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/pets-and-tenancy",
      },
      {
        label: "Pets in rental housing, and the exception for an animal that palliates a handicap",
        publisher: "Éducaloi (Québec)",
        url: "https://educaloi.qc.ca/en/capsules/pets-in-rental-housing/",
      },
    ],
    needsVerification: [
      "Ontario, British Columbia and Quebec are named because each was confirmed against a government or public legal-information source. The other ten jurisdictions are still unexamined and are deliberately not characterised.",
      "Whether non-refundable monthly pet rent is permitted in each jurisdiction — described as something not to assume rather than as a rule.",
      "The exact current name of each tenancy authority in the directory, before the list is linked.",
      "Whether Ontario's condominium carve-out has an equivalent in the other provinces named.",
    ],
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
    veterinaryNotice: true,
    keyTakeaways: [
      "Sleep, toilet trips, socialisation and alone-time training are the whole first month — recall and lead work can wait.",
      "Book the veterinary appointment and settle the insurance question before the puppy arrives, not after.",
      "Teach being alone from the first full day, in seconds. It is the most-skipped step and the hardest to fix later.",
      "A winter puppy needs a shovelled toilet patch and an owner dressed to stand outside with it.",
      "Sixteen to eighteen hours of sleep a day is normal; most spectacular biting is an overtired puppy, not a badly behaved one.",
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
    deck: "No national average, because there isn’t an honest one. Instead: every cost category that exists, the one that decides whether ownership is comfortable, and how to build a real number for your own city in an hour.",
    metaDescription:
      "Every cost category of owning a dog in Canada, what actually drives the number, and an hour-long method for building a real figure for your own city.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "dogs-white-dog-leaves",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "This guide quotes no dollar figures on purpose: veterinary fees, food and municipal charges vary too much for a national average to be plannable.",
      "Adult size is the variable that moves almost everything — food, drug doses, boarding and many procedures scale with weight.",
      "The monthly cost is not the part that matters. Whether an unplanned four-figure veterinary bill is an inconvenience or a crisis is.",
      "Insurance or a dedicated savings account both work; neither can be started on the day you need it.",
      "An hour of phone calls to three local clinics produces a budget you can actually trust.",
    ],
    relatedSlugs: [
      "renting-with-a-pet-in-canada",
      "puppy-vaccination-schedule-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "dog-food-and-nutrition"],
    sources: [
      {
        label:
          "Pet licensing fees \u2014 the published rates for altered and unaltered dogs",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/pet-licensing-fees/",
      },
      {
        label:
          "Pet licences and responsible pet ownership \u2014 the published licence fee schedule by sterilisation status",
        publisher: "City of Calgary",
        url: "https://www.calgary.ca/pets/licences.html",
      },
      {
        label:
          "Adoption fees \u2014 what an adoption includes: medical assessments, vaccinations, parasite treatment, spay or neuter surgery and microchip identification",
        publisher: "BC SPCA",
        url: "https://spca.bc.ca/adoption/adoption-fees/",
      },
      {
        label:
          "Adopt \u2014 what is included in an adoption: spay/neuter, microchip, up-to-date vaccines, wellness exam and six months of city licensing",
        publisher: "Calgary Humane Society",
        url: "https://www.calgaryhumane.ca/adopt",
      },
      {
        label:
          "Nutritional requirements of small animals \u2014 energy requirements are not a linear function of body weight, and two animals of the same weight can differ by up to 30%",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals",
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
      "EVIDENCE POLICY \u2014 no national cost estimate is being claimed, and none may be added. This article deliberately publishes no Canadian average, no annual total, no emergency-fund figure and no food price. Its method is to teach a reader to build their own budget from their own clinic, municipality and dog. The only dollar figures it carries are municipal licence fees read from the cities' own pages and dated. If a figure cannot be sourced to the body that sets it, it does not go in.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. The licence-fee differential was previously \u201ctrue in the cities we checked informally\u201d. It now rests on two geographically distinct municipal fee pages, read directly: Toronto lists $25.00 for a spayed or neutered dog against $60.00 unaltered; Calgary's 2026 column lists $45 against $71. The article says two cities is not a Canadian pattern and tells the reader to look up their own. Both figures must be re-read at every scheduled review and deleted rather than carried stale.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. Adoption-fee bundling is now sourced as examples rather than stated as usual practice. BC SPCA publishes that an adoption includes medical assessments, vaccinations, flea and parasite treatments, spay or neuter surgery and BC Pet Registry microchip identification. Calgary Humane Society publishes spay/neuter, microchip, up-to-date vaccines, a complimentary wellness exam and six months of city licensing. The article names both, says inclusions differ between organisations, and no longer implies a national norm.",
      "RESOLVED \u2014 NARROWED, 2026-09-06. The food claim was wrong as written, not merely unsourced: it said cost \u201cscales almost directly with the dog's adult weight\u201d. Merck states that energy requirements are not a linear function of body weight and that resting requirement is calculated against weight to the power of 0.75, and that two animals of the same weight can differ by as much as 30% either way. The article now says it rises steeply but not in a straight line, keeps the true directional point that a large dog costs multiples of a small one, and carries the individual-variation caveat.",
      "STANDING GUARDRAIL \u2014 no kcal formula, no brand comparison and no food price belongs in this article. The energy relationship is here to explain why size dominates a budget, not to let a reader calculate a ration.",
      "That rescue adoption fees in Canada commonly include spay or neuter, initial vaccines and a microchip — stated as usual rather than universal.",
      "Whether to name typical ranges for any category at all once Canadian figures can be sourced and dated.",
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
     mistake at both widths. That is mitigation, not a fix. Three more verified
     cat images are needed before this batch is published. */

  {
    slug: "bringing-home-a-kitten-first-30-days",
    section: "cats",
    subcategory: "New owners",
    title: "Bringing Home a Kitten: The First 30 Days",
    deck: "A kitten asks less of your calendar than a puppy and much more of your house — one room to start, two litter boxes, a carrier left out for a decade, and never, ever playing with your hands.",
    metaDescription:
      "One room to start, two litter boxes, a carrier left out permanently, and never playing with your hands — the first month with a kitten, in order.",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "cats-kittens-at-window",
    tags: ["kittens", "new-owners", "litter-box", "socialisation", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Start in one room. A kitten settles by taking control of territory, and the whole house is too much to hold.",
      "Two litter boxes for one kitten — one per cat plus one — uncovered, big, and never beside the food.",
      "Leave the carrier out permanently as furniture. It is the highest-return thing in the article.",
      "Never play with a kitten using your hands. Charming at eight weeks, a real problem at eight months.",
      "Lilies, and string or ribbon of any kind, are the two household hazards worth dealing with before arrival.",
    ],
    relatedSlugs: [
      "kitten-vaccination-schedule-in-canada",
      "indoor-cat-enrichment-canadian-homes",
    ],
    relatedCategorySlugs: ["kittens", "general-cat-discussion", "cat-behaviour"],
    sources: [
      {
        label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia",
        publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
        url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
      },
      {
        label: "Which lilies are toxic to cats, and why pollen and vase water count",
        publisher: "ASPCA Animal Poison Control Center",
        url: "https://www.aspca.org/news/which-lilies-are-toxic-pets",
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
      "RESOLVED \u2014 NARROWED, 2026-09-06. The VetNote previously said kittens \u201chave very little reserve and can go downhill quickly\u201d \u2014 an unregistered general claim about physiological reserve, for which no source was found. It now names dehydration and low blood sugar specifically. Sourced to Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06: \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d, and pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system. See the standing guardrail on the emergency guide; the three articles must not drift apart.",
      "That litter box problems are the most common behavioural reason cats lose their homes — widely repeated, currently written as a general claim; source it or soften it.",
      "The kitten socialisation period, described here as earlier and shorter than a puppy’s without naming weeks; attach a source before adding figures.",
      "That most cats past kittenhood digest cow’s milk poorly — well established, but attach a veterinary source.",
      "Which Canadian municipalities license cats, before the sentence implies a proportion.",
    ],
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
    title: "Indoor Cat Enrichment in Canadian Homes",
    deck: "Height, a window, a proper hunt twice a day, something worth scratching and somewhere to hide — and what changes when the house is shut up and dark by five for half the year.",
    metaDescription:
      "The five things a cat needs to be able to do indoors, how to supply each in a Canadian home, and a ten-minute weekly rotation that keeps it working.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-feather-toy-play",
    mediaAlt:
      "A grey cat rearing up to catch a feather toy in both paws — the hunt, indoors.",
    tags: ["indoor-cats", "enrichment", "behaviour", "apartments", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Five behaviours drive everything: hunt, climb and survey, scratch, hide, patrol. Every good idea supplies one of them.",
      "Vertical routes are the cheapest win — a cat should be able to cross a room without touching the floor.",
      "Two wand-toy sessions a day, moved like prey escaping rather than waved in the cat’s face, ending in a catch and a meal.",
      "Scratching posts fail on height, wobble and location far more often than on material.",
      "Rotate toys weekly and store the rest. Novelty is the active ingredient, not the number of toys.",
    ],
    relatedSlugs: [
      "indoor-or-outdoor-cats-in-canada",
      "bringing-home-a-kitten-first-30-days",
    ],
    relatedCategorySlugs: ["cat-behaviour", "general-cat-discussion", "kittens"],
    sources: [
      {
        label:
          "Professional Practice Standard 1: Feline Partial Digit Amputation / Declawing — the mandatory prohibition and its therapeutic exceptions",
        publisher: "College of Veterinarians of British Columbia",
        url: "https://www.cvbc.ca/wp-content/uploads/2020/03/Feline-Declaw-Standard-_Revised_.pdf",
      },
      {
        label:
          "Medically unnecessary veterinary surgery — why Ontario takes a different regulatory approach",
        publisher: "College of Veterinarians of Ontario",
        url: "https://www.cvo.org/standards/medically-unnecessary-veterinary-surgery",
      },
      {
        label:
          "Partial digital amputation (onychectomy or declawing) of the domestic felid — the national position",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/policy-and-outreach/position-statements/statements/partial-digital-amputation-onychectomy-or-declawing-of-the-domestic-felid/",
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
      "British Columbia and Ontario are named because each was confirmed from its own regulator’s published standard. Other provinces are described only as “several”: secondary sources put the total at eight, but no province beyond these two has been checked against its own regulator here, so no number is stated. Verify each before naming any.",
      "The CVBC standard is dated May 2018 and revised the same month. Confirm it is still the current version before publication.",
      "Bird feeder placement guidance (very close to glass or well away, rather than the middle distance) — attach a conservation source before publication.",
      "The framing of the five behaviours is descriptive rather than sourced. It makes no medical or preventative claim, but a behavioural source would strengthen it.",
      "Whether hiding places help cats cope with stressors is stated descriptively; source it before making it any stronger.",
    ],
  },
  {
    slug: "cost-of-owning-a-cat-in-canada",
    section: "cats",
    subcategory: "Money",
    title: "How Much Does It Cost to Own a Cat in Canada?",
    deck: "Cheaper than a dog, and the reason cat owners get caught out more often. The lines dog owners never have, the three expensive realities specific to cats, and how to build your own number.",
    metaDescription:
      "The cost categories of owning a cat in Canada, the two lines nobody models — litter and the second cat — and an hour-long method for your own figure.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-eating-from-bowls",
    mediaAlt:
      "Two cats eating from separate bowls — the line that doubles when the second cat arrives.",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "cats"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "No dollar figures here, deliberately: fees are set per practice and municipal charges differ between adjacent cities.",
      "Litter is a permanent line dog owners do not have, and it scales directly with the number of cats.",
      "The number of cats is the variable that dominates, and the one most likely to change without a decision being made.",
      "Urinary blockage, the conditions of older cats and dental disease are the three a cat budget should be able to absorb.",
      "Cats conceal illness and indoor cats live a long time — which means more senior years, where the spending sits.",
    ],
    relatedSlugs: [
      "cost-of-owning-a-dog-in-canada",
      "kitten-vaccination-schedule-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "cat-food-and-nutrition"],
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "That rescue adoption fees in Canada commonly bundle spay or neuter, vaccines, deworming, a microchip and FeLV/FIV testing — stated as frequent rather than universal.",
      "That dental disease is common enough in cats to belong in a routine budget — attach a veterinary source.",
      "That kidney disease and thyroid problems are among the conditions commonly managed in senior cats — described qualitatively; source it before adding any figure.",
      "That urinary blockage is the most common reason a cat budget goes from comfortable to not — currently an editorial assertion, not a sourced one. Soften or source.",
      "Whether to name typical ranges for any category once Canadian figures can be sourced and dated.",
    ],
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
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Buy insurance for the catastrophe, not the routine — a wellness add-on is a payment plan for costs you can already predict.",
      "A claim is settled by four values: the deductible and how it resets, the reimbursement rate, every limit, and which line items are eligible at all.",
      "Pre-existing does not require a diagnosis. A symptom noted in a file can make a related condition ineligible years later.",
      "Waiting periods differ by condition type and are where cover is most often lost. Find them in the wording and diary the dates.",
      "Compare the policy documents, not the quotes. Two identical-looking premiums can differ by an entire category of disease.",
    ],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["pet-insurance", "vet-costs"],
    sources: [
      {
        label: "How to resolve a property and other insurance complaint, and the escalation path",
        publisher: "Financial Services Regulatory Authority of Ontario",
        url: "https://www.fsrao.ca/consumers/property-and-other-insurance/how-resolve-property-and-other-insurance-complaint",
      },
      {
        label: "Dispute resolution — how a general insurance complaint escalates",
        publisher: "Insurance Bureau of Canada",
        url: "https://www.ibc.ca/insurance-basics/how-insurance-works/dispute-resolution",
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
    needsVerification: [
      "Whether every consumer pet policy sold in Canada excludes pre-existing conditions, or whether any insurer offers a route back for a resolved condition — stated as a general rule with a conditional exception; confirm against several current policy wordings before it is any firmer.",
      "That reimbursement is typically calculated after the deductible rather than before — the article deliberately tells the reader to check which, rather than asserting one. Confirm the market norm before naming it.",
      "Whether direct payment to a clinic exists in the Canadian market at all, and with which insurers — currently described as “not universal” and dependent on the clinic agreeing.",
      "That premiums commonly rise with an animal’s age, and whether an insurer may add an exclusion at renewal for a condition already claimed on. Both are described as questions to ask, not as facts.",
      "That insurers routinely request the full veterinary history when a significant claim is made. Sourced from nothing yet; confirm or soften.",
      "The exclusion categories list (breeding, elective procedures, preventable disease where vaccination lapsed, behavioural treatment, hereditary conditions) is framed as “categories to look for” rather than as any insurer’s actual terms. Keep that framing unless each can be sourced.",
      "Whether Canadian policies commonly apply lifetime limits as well as annual and per-condition ones.",
    ],
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
    title: "Travelling With a Pet in Canada",
    deck: "Most trips fail on something ordinary — a microchip registered to an old phone number, or a booking that allowed one cat and not two dogs. What to settle before you book, and what to arrange at the other end.",
    metaDescription:
      "Domestic travel with a dog or cat: identification, restraint in the car, lodging policies in writing, and finding a vet at the other end before you need one.",
    authorId: "pet-club-editorial",
    readingMinutes: 11,
    mediaId: "guides-dog-harness-in-car",
    mediaAlt:
      "A dog wearing a harness settled on a car seat, restrained for the drive.",
    tags: ["travel", "planning", "identification", "microchip", "canada"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Update the microchip registry before you leave, and add a second contact who will actually be reachable while you are away.",
      "Restrain the animal properly — secured crate, belted carrier or crash-tested harness — and never leave one alone in a parked car in any season.",
      "Get the accommodation’s pet policy in writing, including whether the animal may be left alone in the room.",
      "Look up a regular clinic and an emergency hospital near your destination before you go, and keep your own clinic’s number to hand.",
      "Carrier rules for flights, trains, ferries and buses are set by each operator and change. Confirm them directly for your route and date, in writing.",
    ],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["travelling-with-pets", "pet-friendly-canada"],
    sources: [
      {
        label: "Air carrier tariffs — the published contract of carriage, and where to find each one",
        publisher: "Canadian Transportation Agency",
        url: "https://otc-cta.gc.ca/eng/air-carrier-tariffs-posted-websites",
      },
      {
        label: "Dogs in Parks Canada’s protected places — the leash requirement and penalties",
        publisher: "Parks Canada",
        url: "https://parks.canada.ca/voyage-travel/regles-rules/chien-dog",
      },
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
    needsVerification: [
      "Every carrier-specific rule is deliberately absent — no airline, rail, ferry or bus operator is named, and no dimension, fee, documentation or temperature restriction is stated. If any of this is ever added, it must be sourced per operator and per route, and dated, because it changes.",
      "Whether taxi and rideshare operators in major Canadian cities accept animals, and under what conditions — written as something the reader must establish locally.",
      "That microchip registries in Canada allow an owner to update contact details directly, and whether a second contact can be added — described as what to do rather than as a guaranteed feature of every registry.",
      "That a chip can be checked for readability at a routine appointment.",
      "Provincial or municipal requirements for animals in vehicles, if any exist. None are claimed; restraint is argued on safety grounds only.",
      "Leash, seasonal and access rules for national, provincial and municipal parks, campgrounds and beaches — the article says to check the specific site, and names none.",
      "That flat-faced breeds tolerate heat poorly. Widely accepted; attach a veterinary source before publication.",
      "Whether insurance policies commonly cover care received away from home within Canada — raised as a wording question, not answered.",
    ],
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
    deck: "Heartworm has a date and ticks have a map \u2014 and both are Canadian. Where blacklegged ticks are actually established, why prevention starts on 1 June, and the month everyone stops too early.",
    metaDescription:
      "Where blacklegged ticks are established in Canada, why heartworm prevention starts on 1 June, and the autumn month most owners stop too early.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "health-dog-in-tall-grass",
    mediaAlt:
      "A dog shoulder-deep in long meadow grass \u2014 which is exactly where the ticks are.",
    tags: ["parasites", "ticks", "heartworm", "fleas", "preventative-care", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Blacklegged ticks are established in southern Manitoba, southern and southeastern Ontario, southern Quebec and Nova Scotia \u2014 and the range is expanding.",
      "British Columbia has a different species, the western blacklegged tick, and a comparatively stable picture.",
      "1 June is the Canadian convention for starting heartworm prevention, because larval development in mosquitoes stops below about 14 \u00b0C.",
      "The common mistake is not missing July. It is stopping tick prevention in September, when ticks are still active.",
      "Fleas are an indoor, year-round problem, which is why an outbreak in February is not mysterious.",
      "Never put a dog tick product on a cat, and raise it explicitly if both live in your house.",
    ],
    relatedSlugs: [
      "puppy-vaccination-schedule-in-canada",
      "summer-heat-safety-for-dogs-in-canada",
    ],
    relatedCategorySlugs: ["dog-health", "cat-health", "vet-costs"],
    sources: [
      {
        label:
          "Lyme disease risk areas \u2014 the current PHAC cross-sections, and that blacklegged ticks are spreading to new areas",
        publisher: "Public Health Agency of Canada",
        url: "https://www.canada.ca/en/public-health/services/diseases/lyme-disease/risk-lyme-disease.html",
      },
      {
        label:
          "Heartworm infection in domestic dogs in Canada, 1977\u20132016 \u2014 prevalence among tested dogs, rising in Manitoba and Quebec over 2007\u20132016",
        publisher: "McGill, Berke, Weese and Peregrine, Can Vet J 2019;60(6):605\u2013612",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6515813/",
      },
      {
        label:
          "Ectoparasiticides used in small animals \u2014 some pyrethroids, permethrin among them, can be highly toxic to cats",
        publisher: "Merck Veterinary Manual",
        url: "https://www.merckvetmanual.com/pharmacology/ectoparasiticides/ectoparasiticides-used-in-small-animals",
      },
      {
        label:
          "Systemically and cutaneously distributed ectoparasiticides \u2014 any contact between cats and permethrin products, including contact with a treated dog, must be avoided",
        publisher: "Pfister and Armstrong, Parasites & Vectors 2016;9:436",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4977707/",
      },
      {
        label: "Lyme disease surveillance in Canada \u2014 where blacklegged ticks are established",
        publisher: "Public Health Agency of Canada",
        url: "https://www.canada.ca/en/public-health/services/publications/diseases-conditions/lyme-disease-surveillance-canada-annual-edition-2022.html",
      },
      {
        label: "Seasonal canine heartworm prevention in Canada: does our current timing still work?",
        publisher: "Centre for Public Health and Zoonoses, Ontario Veterinary College",
        url: "https://www.wormsandgermsblog.com/2025/04/articles/animals/dogs/seasonal-canine-heartworm-prevention-in-canadadoes-our-current-timing-still-work/",
      },
    ],
    resources: [
      {
        label: "Lyme disease monitoring, and the tick surveillance data by region",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/public-health/services/diseases/lyme-disease/surveillance-lyme-disease.html",
      },
    ],
    needsVerification: [
      "RESOLVED \u2014 NARROWED, 2026-09-06. Blacklegged tick distribution was verified against the current PHAC Lyme disease risk-areas page. Two corrections followed. PHAC's term is \u201crisk areas\u201d, not \u201cestablished populations\u201d, and the article's four-province list was out of date: it omitted New Brunswick entirely (twelve named counties), understated Manitoba (PHAC covers the province below the 53rd parallel, not only the south), said Nova Scotia rather than all of Nova Scotia, and described British Columbia as comparatively stable when PHAC lists risk areas across much of Vancouver Island, the facing coast and southern river valleys. The article now follows PHAC's cross-sections and carries its two caveats: the range is spreading, and ticks turn up outside known areas.",
      "STANDING GUARDRAIL \u2014 the tick map moves. Re-read the PHAC risk-areas page at every scheduled review and follow its wording; do not freeze a province count into the prose.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. The heartworm trend is now attributed to the underlying study rather than a summary: McGill, Berke, Weese and Peregrine, Can Vet J 2019;60(6):605\u2013612, using clinic mail-back surveys to 2010 and laboratory antigen-test submissions 2007\u20132016. It measured prevalence among dogs submitted for testing, and the authors state plainly that only dogs which see a veterinarian and are tested can appear, so it under-reports and does not extrapolate to all dogs. The article now says \u201ctested\u201d dog populations and carries that limitation in the prose.",
      "STANDING GUARDRAIL \u2014 never generalise clinic or laboratory test data to all dogs in a province. \u201cTested dogs\u201d is load-bearing.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. The dog-product-to-cat claim is now specific and doubly sourced. Merck: some pyrethroids, permethrin among them, can be highly toxic to cats, producing muscle fasciculations and seizures. Pfister and Armstrong (Parasites & Vectors 2016;9:436) for the secondary route the article asserts: any contact between cats and permethrin-containing products, including contact with a permethrin-treated dog, must be avoided; cats lack the enzyme dogs use to clear it. The compound is now named, the route is sourced rather than assumed, and the escalation is a phone call. No dose, no antidote, no home treatment, and no instruction to induce vomiting.",
      "STANDING GUARDRAIL \u2014 the secondary-contact route may be stated only while a source explicitly supports it. Never add treatment, dosing or decontamination instructions here.",
      "RESOLVED \u2014 VERIFIED, 2026-09-06. Tick removal now follows PHAC: fine-tipped tweezers or a tick remover, grasp as close to the skin as possible, pull straight out gently and steadily without twisting, jerking or crushing, then clean the bite. The article names the methods that must not be used \u2014 heat, a lit match, petroleum jelly, alcohol \u2014 rather than only implying them.",
      "OPEN (NON-BLOCKING) \u2014 Whether any Canadian veterinary body publishes a current national parasite protocol that should be cited alongside the regional evidence.",
    ],
  },
  {
    slug: "spaying-and-neutering-in-canada",
    section: "health",
    subcategory: "Procedures",
    title: "Spaying and Neutering in Canada: Timing, Cost and Recovery",
    deck: "\u201cSix months\u201d is still right for a lot of animals and is no longer the answer for large-breed dogs. What the timing turns on, and the two Canadian costs nobody mentions.",
    metaDescription:
      "Why the timing guidance changed for large-breed dogs, what recovery actually asks of you, and the two Canadian costs that change the arithmetic.",
    authorId: "pet-club-editorial",
    readingMinutes: 5,
    mediaId: "health-dog-recovery-cone",
    mediaAlt:
      "A golden retriever in a recovery cone resting on the floor \u2014 the fortnight that decides how the surgery goes.",
    tags: ["spay-neuter", "surgery", "preventative-care", "money", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "Small dogs: around six months for males, and before the first heat \u2014 roughly five to six months \u2014 for females.",
      "Large dogs over about 45 lb: after growth finishes, usually 9 to 15 months. This is the part that changed.",
      "For large-breed females the window is wider still, 5 to 15 months, and is meant to be narrowed by a veterinarian rather than applied as a rule.",
      "The reasoning is orthopaedic and oncologic \u2014 it is an argument for timing the procedure, not for skipping it.",
      "Municipal licence fees are commonly lower for an altered animal, which is a recurring saving rather than a one-off.",
      "Exercise restriction during recovery is the instruction most often ignored and the one that matters most.",
    ],
    relatedSlugs: [
      "adopting-a-pet-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "dog-health", "cat-health"],
    sources: [
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
      "OPEN (NON-BLOCKING) \u2014 Feline timing is described only as \u201cgenerally done young\u201d because no AAFP age window has been confirmed here. Establish one before making it any more specific.",
      "STANDING GUARDRAIL \u2014 Which subsidised or low-cost spay and neuter programmes operate in Canada, and who runs them \u2014 described as intensely local and named nowhere.",
    ],
  },
  {
    slug: "adopting-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Getting a pet",
    title: "Adopting a Dog or Cat in Canada",
    deck: "Shelters, rescues, breeders and private sales \u2014 what each one owes you, the questions that separate a serious organisation from a good website, and the federal import rule almost nobody knows about.",
    metaDescription:
      "What shelters, rescues and breeders each owe you, the questions the CFIA says to ask, and the 2022 import rule that covers rescue and fostering.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "guides-adopt-me-bandana",
    mediaAlt:
      "A dog in an \u201cAdopt Me\u201d bandana at an outdoor adoption event.",
    tags: ["adoption", "rescue", "shelters", "breeders", "canada"],
    indexable: true,
    status: "in-review",
    keyTakeaways: [
      "Since 28 September 2022 commercial dogs cannot enter Canada from countries the CFIA lists as high-risk for dog rabies \u2014 and \u201ccommercial\u201d expressly includes adoption and fostering.",
      "Ask where the animal is from, what documentation comes with it, and whether you may visit. The CFIA publishes this list itself.",
      "Red flags: meeting somewhere neutral, no access to the animal or its mother, money transferred abroad, no questions about your household, no paperwork.",
      "A difficult application process is a recommendation, not an obstacle.",
      "Settle your housing before you apply \u2014 a no-pets clause is void in Ontario and binding in British Columbia and Quebec.",
      "Re-register the microchip in your own name the week the animal arrives. Implanting and registering are two different things.",
    ],
    relatedSlugs: [
      "spaying-and-neutering-in-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "general-dog-discussion", "general-cat-discussion"],
    sources: [
      {
        label: "Ask questions before you buy or adopt a dog \u2014 and the warning signs to look for",
        publisher: "Canadian Food Inspection Agency",
        url: "https://inspection.canada.ca/en/importing-food-plants-animals/pets/ask-questions-you-get-dog",
      },
      {
        label: "New measure prohibiting the entry of commercial dogs from countries at high risk for dog rabies",
        publisher: "Canadian Food Inspection Agency",
        url: "https://inspection.canada.ca/en/animal-health/terrestrial-animals/diseases/reportable/rabies/notice-industry-2022-06-28",
      },
    ],
    resources: [
      {
        label: "Countries the CFIA classifies as high-risk for dog rabies",
        publisher: "Canadian Food Inspection Agency",
        url: "https://inspection.canada.ca/en/animal-health/terrestrial-animals/diseases/reportable/rabies/countries-high-risk-dog",
      },
    ],
    needsVerification: [
      "The 2022 commercial dog import prohibition and the CFIA's definition of \u201ccommercial\u201d are cited from the agency's own notice. Confirm it remains in force, and that the high-risk country list is current, before publication \u2014 this is exactly the kind of measure that gets amended.",
      "Whether provincial animal welfare legislation imposes any requirement on rescues or breeders that a reader should know about. None is claimed; the article stays on federal ground and on questions to ask.",
      "Whether any province regulates dog breeding or rescue operation through licensing, which would be worth naming if so.",
      "That shelter and rescue adoption fees commonly bundle spay or neuter, vaccines, deworming and microchipping \u2014 stated as frequent rather than universal, and carried over from the cost guides where it is also flagged.",
    ],
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
    subcategory: "Behaviour",
    title: "Introducing a Second Cat, or a Cat and a Dog",
    deck: "Cats decide who is family by smell, which is why the first ten minutes matter more than the next ten weeks. A staged introduction, and the quiet conflict most owners never notice.",
    metaDescription:
      "A staged introduction for a second cat \u2014 scent before sight \u2014 plus the silent signs of conflict owners miss, and how cat-and-dog differs.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "cats-two-resting-together",
    mediaAlt:
      "Two cats resting a few feet apart on a tiled floor \u2014 coexistence, which is the realistic goal.",
    tags: ["multi-cat", "behaviour", "introductions", "cats", "training"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Cats identify group members by smell, so the introduction is about scent long before it is about sight.",
      "Separate room first, then swap bedding, then swap territory, then sight through a barrier \u2014 the cats' behaviour decides when to move on, not the calendar.",
      "One per cat plus one, in separate locations: litter boxes, feeding stations, water, beds and scratching posts.",
      "Most inter-cat conflict is silent. A cat blocking a doorway or avoiding half the house is the sign, not fighting.",
      "\u201cThe first cat seems lonely\u201d is the most common reason given for a second cat and the least reliable one.",
      "With a dog the failure mode is one bad moment rather than a slow stalemate \u2014 lead on, escape routes up high, and the cat sets the pace.",
    ],
    relatedSlugs: [
      "indoor-cat-enrichment-canadian-homes",
      "cost-of-owning-a-cat-in-canada",
    ],
    relatedCategorySlugs: ["cat-behaviour", "general-cat-discussion", "kittens"],
    sources: [
      {
        label: "Step-by-step guide: how to introduce a new cat to other cats in your home",
        publisher: "American Association of Feline Practitioners",
        url: "https://catvets.com/wp-content/uploads/2024/07/Step-by-Step-Guide-How-to-Introduce-a-New-Cat-to-Other-Cats-in-Your-Home.pdf",
      },
      {
        label: "Introducing cats, and introducing cats and dogs",
        publisher: "International Cat Care",
        url: "https://icatcare.org/articles/introducing-cats",
      },
      {
        label: "Feline behaviour problems: aggression",
        publisher: "Cornell Feline Health Center",
        url: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-aggression",
      },
    ],
    needsVerification: [
      "The staged introduction sequence is drawn from feline behaviour guidance and is deliberately given without fixed timings. Confirm each stage against the AAFP guide before publication.",
      "Synthetic pheromone products are mentioned as something that may help. Establish what evidence exists before that framing is strengthened, and name no product.",
      "The list of silent conflict signs is behavioural description rather than a diagnostic tool. Source it against a named reference.",
      "That bite wounds in cats abscess readily \u2014 clinically well established, not yet sourced here.",
    ],
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
    title: "When a Pet Goes Missing in Canada",
    deck: "The first hour matters more than the next three days, and most of it gets spent on the wrong things. What to do first, and why a lost cat search looks nothing like a lost dog search.",
    metaDescription:
      "What to do in the first hour, why a lost cat is hiding within a few houses, and the microchip limitation the CVMA is explicit about.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "guides-cat-under-car",
    mediaAlt:
      "A cat crouched under a parked car \u2014 which is where a frightened lost cat usually is.",
    tags: ["lost-pet", "microchip", "identification", "emergencies", "canada"],
    indexable: true,
    status: "in-review",
    keyTakeaways: [
      "Update the microchip registration and file a municipal lost report before anything else. Both take minutes and both get skipped.",
      "A microchip is not a tracker, and the CVMA is explicit that not all scanners read all chips \u2014 use every search method, not just the chip.",
      "A lost dog travels and is seen by people. A frightened lost cat hides silently, close by, and will not answer you.",
      "Search cats at ground level: under decks, porches, sheds and vehicles, with a torch after dark.",
      "Ask neighbours for permission to physically check their property, not just to keep an eye out.",
      "Visit shelters in person and keep going back \u2014 animals arrive looking nothing like their photographs.",
      "A collar tag with a mobile number is the layer that needs no scanner, no clinic and no institution.",
    ],
    relatedSlugs: [
      "pet-licensing-across-canada",
      "indoor-or-outdoor-cats-in-canada",
    ],
    relatedCategorySlugs: ["general-dog-discussion", "general-cat-discussion", "pet-friendly-canada"],
    sources: [
      {
        label: "Microchip animal identification in small companion animals \u2014 including scanner limitations",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/policy-and-outreach/position-statements/statements/microchip-animal-identification-in-small-companion-animals/",
      },
      {
        label: "Lost and found pets \u2014 filing a lost report with municipal animal services",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/lost-found-pets/",
      },
      {
        label: "Lost cats and dogs \u2014 what a municipality does with a found animal",
        publisher: "City of Calgary",
        url: "https://www.calgary.ca/pets/lost-animals.html",
      },
    ],
    needsVerification: [
      "That a frightened lost cat typically stays close and hides rather than travelling \u2014 consistently reported by recovery organisations and not yet attached to a named source here.",
      "Hold periods for unclaimed animals, and the length of published found-animal lists, vary by municipality. The article says to ask locally and states no period as national.",
      "Whether any Canadian microchip registry allows owners to update their own details directly, and which registries operate here. None is named.",
      "Whether municipal animal services universally accept lost reports from the public \u2014 verified for Toronto and Calgary only.",
    ],
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
    readingMinutes: 6,
    mediaId: "guides-dog-collar-tag",
    mediaAlt:
      "A dog wearing a collar with a metal identification tag \u2014 the layer that works without a scanner.",
    tags: ["licensing", "bylaws", "municipal", "identification", "canada"],
    featured: true,
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    keyTakeaways: [
      "Licensing is municipal. Your city decides it, and neighbouring cities genuinely differ.",
      "Toronto, Ottawa, Calgary and Edmonton all license cats as well as dogs. Many municipalities do not.",
      "Indoor cats are generally not exempt \u2014 Calgary and Edmonton both say so explicitly.",
      "Age thresholds differ: three months in Calgary, Ottawa and Vancouver; six months in Edmonton.",
      "Edmonton's licence includes a microchip, and reduced fees for altered animals are common.",
      "Licensing is not the rabies rule \u2014 that is provincial \u2014 but Ottawa layers its own vaccination requirement on top.",
      "A licence is not permission from a landlord or a condominium, and it does not transfer when you move.",
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
    title: "Puppy Socialisation: What to Actually Expose a Puppy To",
    deck: "Socialisation is not exposure \u2014 it is exposure at an intensity the puppy can handle, in which nothing bad happens. The categories to cover, and how to read whether it is working.",
    metaDescription:
      "What to actually socialise a puppy to, how to tell an exposure is helping rather than harming, and why a puppy that won\u2019t eat is over threshold.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "training-puppy-on-street",
    mediaAlt:
      "A puppy on a lead taking in a street \u2014 the world at a distance it can handle.",
    tags: ["puppies", "socialisation", "training", "behaviour", "dogs"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "The primary period is the first three months, so it is largely over by the time most owners feel ready to start.",
      "AVSAB holds that socialising before a puppy is fully vaccinated should be the standard of care \u2014 behavioural problems, not infectious disease, are the leading cause of death in dogs under three.",
      "Classes can start at 7\u20138 weeks with one set of vaccines at least seven days beforehand, plus a first deworming.",
      "A puppy that will not take food is over threshold. That is the single most reliable signal you have.",
      "Let the puppy choose the distance, watch how fast it recovers, and stop while it is still going well.",
      "Cover categories rather than counting encounters \u2014 surfaces, sounds and handling get missed while people and dogs get overdone.",
      "A winter puppy meets far fewer people and far more snow. Compensate deliberately rather than waiting for spring.",
    ],
    relatedSlugs: [
      "puppy-vaccination-schedule-in-canada",
      "separation-anxiety-in-dogs",
    ],
    relatedCategorySlugs: ["puppies", "dog-training-and-behaviour", "general-dog-discussion"],
    sources: [
      {
        label:
          "Canine Socialisation: A Narrative Systematic Review \u2014 the tendency to approach unfamiliar stimuli peaks at about three to five weeks and declines thereafter",
        publisher: "McEvoy, Baqueiro Espinosa, Crump and Arnott, Animals (2022)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9655304/",
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
        url: "https://avsab.org/puppy-socialization-position-statement/",
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
    title: "Moving to Another Province With a Pet",
    deck: "Crossing a provincial line can create obligations you did not have and remove protections you were relying on. Two of the three layers of Canadian pet rules change, and nothing tells you.",
    metaDescription:
      "Rabies law, tenancy law and municipal licensing all change when you move province. What to check, in what order, and the ten minutes that matters most.",
    authorId: "pet-club-editorial",
    readingMinutes: 6,
    mediaId: "guides-moving-boxes-dog",
    mediaAlt:
      "A dog sitting between two people carrying moving boxes \u2014 the day the rules change.",
    tags: ["moving", "provincial", "licensing", "tenancy", "canada"],
    indexable: true,
    status: "in-review",
    keyTakeaways: [
      "Federal rules barely change; provincial and municipal ones change completely, and municipal ones change again within a province.",
      "Rabies vaccination is required by law in Ontario and not in British Columbia \u2014 moving west to east can create an obligation you did not have.",
      "A no-pets clause is void in Ontario and enforceable in British Columbia and Quebec. Settle this before you sign anything.",
      "Municipal licences do not transfer, and whether cats are licensed at all differs between cities.",
      "Request veterinary records before you leave, and register with a new practice before you need one.",
      "Update the microchip registry before moving day. A move is exactly when animals get out.",
      "Keep cats indoors for several weeks after arrival regardless of their previous arrangement.",
    ],
    relatedSlugs: [
      "pet-licensing-across-canada",
      "renting-with-a-pet-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "provincial-questions", "travelling-with-pets"],
    sources: [
      {
        label: "Rabies and your pets \u2014 the provincial vaccination requirement",
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
        label: "Residential Tenancies Act, 2006 \u2014 section 14 makes a no-pets provision void",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/laws/statute/06r17",
      },
      {
        label: "Pets and tenancy \u2014 prohibitions, restrictions and the pet damage deposit",
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
      "RESOLVED \u2014 NARROWED, 2026-09-06. Carried over from the Batch A licensing work rather than discovered here: this article stated three times that a municipal licence does not transfer \u2014 a Canada-wide negative verified for no municipality. It was the same claim removed from pet-licensing-across-canada in the same pass, and leaving it would have kept the error alive in a second place. All three now give the actionable version: licensing is municipal, so check the new municipality rather than assume.",
      "Ontario, British Columbia and Quebec are named because each was confirmed against a government source. The other ten jurisdictions are not characterised, and the article says so.",
      "That municipal licences generally do not transfer between municipalities \u2014 stated as a general rule and verified for none of the five cities specifically.",
      "Whether any province restricts the interprovincial movement of companion animals. None is claimed; the article treats domestic moves as unrestricted at the federal level.",
      "Whether a practice may charge for transferring records, and whether any province regulates it \u2014 carried over from the guide to choosing a veterinarian, where it is also flagged.",
      "The advice to keep cats in for several weeks after a move is widely given by rescue and veterinary organisations; attach a source before publication.",
    ],
  },
  {
    slug: "pet-emergency-preparedness-canada",
    section: "canadian-life",
    subcategory: "Preparedness",
    title: "Pets, Wildfires and Evacuation: Emergency Preparedness in Canada",
    deck: "Most evacuation shelters take service animals only, which means the plan almost everyone has does not work. Where the animal actually goes, and the 72-hour kit the federal guidance asks for.",
    metaDescription:
      "Most evacuation shelters accept only service animals. How to plan where a pet goes, and the 72-hour kit \u2014 including the water volumes nobody expects.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "guides-pet-emergency-kit",
    mediaAlt:
      "A pet carrier, collapsible bowls, food, a coat and a bed laid out from above \u2014 the kit, assembled.",
    tags: ["emergency-preparedness", "evacuation", "wildfire", "safety", "canada"],
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "Most evacuation shelters will only accept service animals \u2014 so the plan cannot be \u201cwe will go to the shelter\u201d.",
      "Write a list now of where the animal could actually go: family further away, pet-friendly hotels, boarding kennels, clinics, shelters.",
      "The Canadian standard is 72 hours of supplies, and pets are explicitly included in it.",
      "Federal guidance puts water at 4 litres a day for an average dog and 1 litre for an average cat \u2014 a real volume to have bought in advance.",
      "Leave the carrier out where you can reach it in the dark. Transport is what evacuations most often fail on.",
      "When there is a warning rather than an order, that is the moment to move the animals.",
      "If you truly cannot take them: never loose, never tethered, water in several rooms, and a notice on the door saying how many are inside and where they hide.",
    ],
    relatedSlugs: [
      "emergency-vet-visits-in-canada",
      "when-a-pet-goes-missing-in-canada",
    ],
    relatedCategorySlugs: ["pet-friendly-canada", "general-dog-discussion", "general-cat-discussion"],
    sources: [
      {
        label: "Emergency preparedness for pets and service animals \u2014 the kit, the water volumes and the shelter position",
        publisher: "Public Safety Canada",
        url: "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared/emergency-planning-resources/animals.html",
      },
      {
        label: "Emergency kit checklist \u2014 the 72-hour standard",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared/emergency-kits/get-kit.html",
      },
      {
        label: "Wildfire smoke, air quality and your health",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/services/health/healthy-living/environment/air-quality/wildfire-smoke.html",
      },
    ],
    resources: [
      {
        label: "Get Prepared \u2014 building a household emergency plan",
        publisher: "Public Safety Canada",
        url: "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared.html",
      },
    ],
    needsVerification: [
      "\u201cMost evacuation shelters will only accept service animals\u201d is federal guidance rather than a survey of Canadian shelters. Keep the federal attribution; do not restate it as a fact about any specific jurisdiction.",
      "Whether any province or municipality operates a pet-inclusive evacuation shelter programme, or a pet-rescue service working from door notices \u2014 referred to generally and named nowhere.",
      "The door-notice practice is widely recommended by emergency management organisations; confirm whether any Canadian authority publishes it before implying official standing.",
      "Whether provincial emergency management agencies publish their own pet guidance that should be cited alongside the federal source.",
    ],
  },
  {
    slug: "reading-a-canadian-pet-food-label",
    section: "health",
    subcategory: "Nutrition",
    title: "How to Read a Canadian Pet Food Label",
    deck: "No Canadian body sets nutritional standards for retail pet food or approves it before sale. Which parts of the label are actually load-bearing, and which words mean nothing here.",
    metaDescription:
      "Pet food is not regulated in Canada the way you think. Who oversees what, which parts of the label matter, and why AAFCO is a US voluntary standard.",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "food-pouring-kibble",
    mediaAlt:
      "Dry food being poured from an unbranded paper bag into a bowl.",
    tags: ["nutrition", "labelling", "regulation", "food", "canada"],
    indexable: true,
    status: "published",
    publishedAt: "2026-09-06",
    veterinaryNotice: true,
    keyTakeaways: [
      "No Canadian federal body sets nutritional standards for retail pet food or approves a formulation before sale.",
      "CFIA covers imports, exports and animal by-products; Health Canada polices unsubstantiated health claims; the Competition Bureau requires a bilingual common name, metric net quantity and dealer address.",
      "Ingredient definitions come from AAFCO \u2014 an American voluntary body \u2014 and are recommended rather than required here.",
      "The nutritional adequacy statement and life stage is the most useful line on the bag and the one most people skim.",
      "Ingredient order is by pre-cooking weight, so moisture and ingredient splitting both distort the list.",
      "Guaranteed analysis is stated as fed, so wet and dry foods are not comparable until moisture is accounted for.",
      "Premium, holistic and human-grade are not defined terms in Canadian law.",
    ],
    relatedSlugs: [
      "senior-dogs-and-cats",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["dog-food-and-nutrition", "cat-food-and-nutrition", "canadian-pet-products"],
    sources: [
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
      "Cornell states the time from complete urinary obstruction until death may be less than twenty-four to forty-eight hours.",
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
    title: "What Veterinary Care Actually Costs in Canada",
    deck: "Nobody publishes it, and there is a competition-law reason for that. How a bill is actually assembled, why two clinics differ legitimately, and how to build a real number for your own city.",
    metaDescription:
      "Why no Canadian authority publishes veterinary prices, how a bill is structured line by line, and how to get a real figure for your own city.",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "health-vet-consultation-discussion",
    mediaAlt:
      "An owner and a veterinarian talking over a small dog on the consulting table — the conversation the article argues for having early.",
    tags: ["vet-costs", "money", "budgeting", "regulation", "canada"],
    featured: true,
    indexable: true,
    status: "in-review",
    veterinaryNotice: true,
    keyTakeaways: [
      "No Canadian authority publishes veterinary prices because none sets them — practices set their own fees, and competition law constrains associations from publishing schedules.",
      "A bill is assembled from separate lines: consultation, diagnostics, procedure and anaesthesia, medication, hospitalisation, after-hours premium, tax.",
      "Hospitalisation, not the procedure, is what most often turns an emergency into a four-figure event.",
      "The Competition Bureau reports the sector consolidating — nearly all practices independently owned in 2009, corporate chains at around a fifth of the market since.",
      "Ask for a written prescription rather than assuming you must buy medication at the clinic. Whether you can fill it elsewhere is a provincial question.",
      "An estimate with a range is more honest than a single number for work where the plan can change once someone can see what is happening.",
      "Phone three clinics and build your own figure — it takes an hour and it is the only kind worth anything.",
    ],
    relatedSlugs: [
      "pet-insurance-in-canada",
      "cost-of-owning-a-dog-in-canada",
    ],
    relatedCategorySlugs: ["vet-costs", "pet-insurance", "provincial-questions"],
    sources: [
      {
        label: "Pets, vets and meds: the case for more competition — consolidation, pricing pressures and prescription portability",
        publisher: "Competition Bureau Canada",
        url: "https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/pets-vets-and-meds-case-more-competition",
      },
      {
        label: "Trade associations and the Competition Act — why professional bodies do not set prices",
        publisher: "Competition Bureau Canada",
        url: "https://competition-bureau.canada.ca/en/bid-rigging-price-fixing-and-other-agreements-between-competitors/trade-associations-and-competition-act",
      },
      {
        label: "Competition Bureau recommends increasing competition in the sale of pet medication",
        publisher: "Government of Canada",
        url: "https://www.canada.ca/en/competition-bureau/news/2024/10/competition-bureau-recommends-increasing-competition-in-the-sale-of-pet-medication.html",
      },
      {
        label: "Pet licensing fees — the published rates for altered and unaltered animals",
        publisher: "City of Toronto",
        url: "https://www.toronto.ca/community-people/animals-pets/pet-licensing/pet-licensing-fees/",
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
      "The Competition Bureau figures ($9.3 billion annual spend; corporate chains at roughly 20.4% against nearly all independent ownership in 2009) are attributed to the Bureau in the prose. Confirm against the current version of its page before publication, since the study will be updated.",
      "The provincial medication-resale positions (Ontario, British Columbia, New Brunswick and Nova Scotia prohibiting resale to pharmacists; Quebec cited as the contrasting model) come from the Bureau rather than from each province's own regulator. Verify against provincial sources before this is relied on, and note the Bureau is advocating for change so the position may move.",
      "That competition law is the reason no association publishes a fee guide is an inference from the Bureau's general guidance to trade associations, not a statement the Bureau makes about veterinary fee guides specifically. Keep the current framing, which describes the constraint rather than asserting a causal history.",
      "No per-service veterinary price appears anywhere, deliberately. Do not add one unless an authority that sets it publishes it.",
    ],
  },
  {
    slug: "arthritis-and-mobility-in-dogs-and-cats",
    section: "health",
    subcategory: "Chronic conditions",
    title: "Arthritis and Mobility in Dogs and Cats",
    deck: "Animals with joint pain do not limp — they do less. What owners actually notice, why cats hide it almost entirely, and the changes at home that do the most.",
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
      "Traction on hard floors is free and is the change that most reliably restores an animal's confidence.",
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
