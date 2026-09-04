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

export interface Article {
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
  /** ISO date (`YYYY-MM-DD`). */
  publishedAt: string;
  /** ISO date. Equal to `publishedAt` until the article is revised. */
  updatedAt: string;
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
  /** Promotes the article on its section surface. */
  featured?: boolean;
  status: ArticleStatus;
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
export const articles: readonly Article[] = [
  {
    slug: "winter-dog-care-in-canada",
    section: "dogs",
    subcategory: "Seasonal care",
    title: "Winter Dog Care in Canada",
    deck: "Why there is no single “too cold” temperature, what road salt actually does to paws, and the winter hazards that put Canadian dogs in front of a vet.",
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "guides-dogs-winter-forest",
    mediaAlt:
      "Two dogs standing among snow-covered pines on a still winter day in the forest.",
    tags: ["winter", "seasonal-care", "paw-care", "safety", "dogs"],
    featured: true,
    status: "in-review",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-window-tabby",
    mediaAlt:
      "A ginger tabby cat lying on a windowsill in daylight, watching the street outside.",
    tags: ["indoor-cats", "enrichment", "safety", "wildlife", "cats"],
    featured: true,
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "about-kitchen-play",
    mediaAlt: "A man crouches in the kitchen of a rented home, playing with a white dog.",
    tags: ["housing", "renting", "tenancy", "moving", "canada"],
    featured: true,
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "dogs-black-lab-puppy",
    mediaAlt:
      "A black Labrador puppy lying on a wooden floor, head down, watching the room.",
    tags: ["puppies", "new-owners", "house-training", "socialisation", "dogs"],
    featured: true,
    status: "in-review",
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
      "The 16–18 hours of sleep a day figure for young puppies — widely repeated, but attach a veterinary or behavioural source or soften the sentence.",
      "That most Canadian municipalities require dogs to be licensed — stated generally rather than enumerated; confirm before naming a proportion.",
      "The 14–16 week close of the primary socialisation window, against the same source used in the vaccination guide.",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "dogs-golden-in-leaves",
    tags: ["puppies", "vaccination", "preventative-care", "socialisation", "dogs"],
    status: "in-review",
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
        label: "Rabies — vaccination is recommended in British Columbia, not legally required",
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
      "Ontario and British Columbia are named because both were confirmed against a government source. Every other province and territory is still described generically — establish each before any of them is named.",
      "The regions of Canada where blacklegged ticks are established, before naming any of them.",
      "Whether Canadian provincial regulators or the CVMA have taken a formal position on leptospirosis as core, distinct from the AAHA and WSAVA positions the article cites.",
      "The Alberta post-exposure quarantine range is taken from the province's guidance for veterinary clinics; confirm it is current before publication and check whether other provinces publish comparable ranges.",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "health-dog-on-bed",
    tags: ["puppies", "crate-training", "training", "alone-time", "dogs"],
    status: "in-review",
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
      "The age-in-months-plus-one-hour rule of thumb — presented as a rough planning figure rather than guidance; attach a source or cut it.",
      "The 16–18 hours of sleep a day figure, shared with the first-30-days guide.",
      "Whether to name the recognised behavioural condition directly rather than describing it, once a veterinary source is attached.",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "dogs-white-dog-leaves",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "dogs"],
    status: "in-review",
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
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "That rescue adoption fees in Canada commonly include spay or neuter, initial vaccines and a microchip — stated as usual rather than universal.",
      "That municipal licence fees are commonly lower for spayed or neutered dogs — true in the cities we checked informally, not yet sourced.",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "cats-kittens-at-window",
    tags: ["kittens", "new-owners", "litter-box", "socialisation", "cats"],
    featured: true,
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 8,
    mediaId: "cats-kitten-windowsill",
    tags: ["kittens", "vaccination", "preventative-care", "indoor-cats", "cats"],
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
        label: "Rabies — vaccination is recommended in British Columbia, not legally required",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "cats-window-tabby",
    tags: ["indoor-cats", "enrichment", "behaviour", "apartments", "cats"],
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
    resources: [
      {
        label: "Your provincial or territorial veterinary regulator, and what it licenses",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
      },
    ],
    needsVerification: [
      "That declawing is prohibited by the veterinary regulators in a number of Canadian provinces — name the provinces once each college’s position is confirmed, or drop the sentence.",
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
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    authorId: "pet-club-editorial",
    readingMinutes: 7,
    mediaId: "cats-kittens-at-window",
    tags: ["money", "budgeting", "pet-insurance", "vet-costs", "cats"],
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
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    authorId: "pet-club-editorial",
    readingMinutes: 10,
    mediaId: "health-senior-dog-resting",
    mediaAlt:
      "An elderly dog with a greying muzzle rests on a wooden floor — the years a policy is bought for.",
    tags: ["pet-insurance", "money", "budgeting", "vet-costs", "canada"],
    featured: true,
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
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "dogs-autumn-bridge",
    mediaAlt:
      "A golden retriever trots along a leaf-covered footbridge on an ordinary autumn day.",
    tags: ["veterinary-care", "choosing-a-vet", "vet-costs", "canada", "planning"],
    status: "in-review",
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
      "That every province and territory has a body responsible for licensing veterinarians and regulating practices, and that each maintains a register a member of the public can search — stated generally. Name each regulator, and confirm which registers are public, before the list is made specific.",
      "That the provincial regulator is the correct destination for a complaint about a licensed veterinarian in every province and territory — described generically; confirm the process differs before describing it as uniform.",
      "Whether a practice may charge for copying or transferring records, and whether any province regulates that — currently written as a question to ask rather than an entitlement.",
      "That an owner has a right of access to their animal’s veterinary record, which likely varies by province. The article says records “should be” available and transferable on request; do not strengthen this without a provincial source.",
      "Whether telephone or video triage is generally available from Canadian practices, and how it is charged — raised as a question for rural readers rather than asserted.",
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
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    authorId: "pet-club-editorial",
    readingMinutes: 9,
    mediaId: "training-forest-path",
    mediaAlt:
      "A small dog stands alert on a wet forest path, looking up towards the person walking it.",
    tags: ["emergency-care", "veterinary-care", "preparedness", "safety", "canada"],
    status: "in-review",
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
      "That very young animals have less physiological reserve and deteriorate faster than adults \u2014 widely repeated, not yet sourced here. Written as a reason to lower the threshold for calling, never as a physiological claim.",
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
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    authorId: "pet-club-editorial",
    readingMinutes: 11,
    mediaId: "guides-dog-in-car",
    mediaAlt:
      "A border collie settled on a blanket in the back of a car, waiting for the drive to start.",
    tags: ["travel", "planning", "identification", "microchip", "canada"],
    featured: true,
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
] as const;

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
 * Articles eligible for the sitemap.
 *
 * Only `published` ones. An article awaiting editorial sign-off is rendered
 * `noindex` and must not be advertised in the sitemap — the two would
 * contradict each other.
 */
export function publishedArticles(): readonly Article[] {
  return articles.filter((article) => article.status === "published");
}
