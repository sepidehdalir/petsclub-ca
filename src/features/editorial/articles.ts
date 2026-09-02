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
 * right trade for content that makes claims about people's animals.
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
  /** Existing topic surface this section's articles are listed on. */
  surfacePath: string;
}

const sections = {
  dogs: { id: "dogs", name: "Dogs", surfacePath: "/dogs" },
  cats: { id: "cats", name: "Cats", surfacePath: "/cats" },
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
 * newsroom's workflow. What an unpublished article does instead is make no
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
  /** Overrides the asset's default alt text where the article needs a different emphasis. */
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
  sources?: readonly ArticleSource[];
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
 * Every article, newest first.
 *
 * Ordering is explicit rather than sorted at render time: an editor decides
 * what leads a section, and a date is a poor proxy for that.
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
    readingMinutes: 8,
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
    relatedSlugs: ["indoor-or-outdoor-cats-in-canada", "renting-with-a-pet-in-canada"],
    relatedCategorySlugs: ["dog-health", "dog-training-and-behaviour", "general-dog-discussion"],
    sources: [
      {
        label: "Find a veterinarian, and provincial veterinary associations",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/",
      },
    ],
    needsVerification: [
      "Whether to name specific temperature guidance for small or short-coated dogs — currently omitted rather than estimated.",
      "Comparative irritancy of chloride-based de-icers marketed as pet-safe, against a veterinary or toxicology source.",
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
      "The Canadian risk profile is its own thing: winter, antifreeze, established urban coyotes, and municipal bylaws that in some cities cover cats.",
      "Indoors is not the low-effort option — it is a trade in which you take on the enrichment the outdoors used to supply.",
      "Two short wand-toy sessions a day, ending in a catch and a meal, is the highest-yield thing most owners are not doing.",
      "A catio, harness walks, a cat-proofed fence or a dusk-to-dawn curfew all cut risk without removing the outdoors entirely.",
      "If a cat goes out at all: breakaway collar, a microchip registration that is actually current, and a check under the car hood in winter.",
    ],
    relatedSlugs: ["winter-dog-care-in-canada", "renting-with-a-pet-in-canada"],
    relatedCategorySlugs: ["cat-behaviour", "cat-health", "general-cat-discussion"],
    sources: [
      {
        label: "Find a veterinarian, and provincial veterinary associations",
        publisher: "Canadian Veterinary Medical Association",
        url: "https://www.canadianveterinarians.net/",
      },
    ],
    needsVerification: [
      "Calgary's responsible-pet-ownership regime is cited as the best-known municipal cat bylaw — confirm current scope and wording with the City before publication.",
      "The scale of predation on Canadian wild birds by free-roaming cats is described qualitatively; attach a primary source or drop the sentence.",
      "Whether to state a lifespan comparison between indoor and outdoor cats — deliberately omitted rather than estimated.",
    ],
  },
  {
    slug: "renting-with-a-pet-in-canada",
    section: "canadian-life",
    subcategory: "Housing",
    title: "Renting With a Pet in Canada",
    deck: "Tenancy law is provincial, and a “no pets” clause that is unenforceable in one province is binding a few hours' drive away. What to establish first, and how to become the applicant a landlord says yes to.",
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
      "There is no national rule. Establish your own province's position with its tenancy authority before you negotiate anything.",
      "In a condo there are two rulebooks and the stricter wins — read the declaration and rules before signing.",
      "Confirm any pet deposit or fee is permitted where you live, and whether it is refundable.",
      "A one-page pet résumé plus a previous landlord's reference is what converts a refusal into a yes.",
      "Get the pet named and permitted in the lease or a signed addendum, however relaxed the landlord sounds.",
    ],
    relatedSlugs: ["winter-dog-care-in-canada", "indoor-or-outdoor-cats-in-canada"],
    relatedCategorySlugs: ["pet-friendly-canada", "canadian-pet-products"],
    needsVerification: [
      "The three-way grouping of provincial approaches to no-pets clauses — confirm each province's current position with its tenancy authority and name them explicitly if confirmed.",
      "Which provinces permit a pet damage deposit, and any caps — currently described generically rather than quantified.",
      "Whether non-refundable monthly pet rent is permitted in each jurisdiction.",
      "The exact current name of each tenancy authority in the directory, before the list is linked.",
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

/** Resolves an article's related reading, skipping anything unresolvable. */
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
