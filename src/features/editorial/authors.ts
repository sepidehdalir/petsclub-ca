/**
 * Editorial bylines and reviewers.
 *
 * ## The rule this file exists to enforce
 *
 * **A person listed here must be a real person who really did the work.**
 *
 * A pet publication earns or loses its readers on exactly one question: can
 * they believe what it says about their animal? Inventing an author is the
 * cheapest way to look authoritative and the fastest way to deserve nothing.
 * Inventing a *veterinary* reviewer is worse again — it invites a reader to
 * weigh medical information more heavily because of a credential that does not
 * exist.
 *
 * So the byline surface is deliberately narrow:
 *
 *  - `petClubEditorial` is a **house byline**, and says so. It is an
 *    organisation, not a person, and it claims no clinical qualification.
 *  - `reviewers` is **empty**. It stays empty until a licensed veterinarian
 *    has actually read an article and agreed to be named on it. When that
 *    happens, the entry records their name, their licensing college and their
 *    registration number, so the claim is checkable rather than decorative.
 *
 * `articles.test.ts` fails the build if an article references a reviewer that
 * is not in `reviewers`, and the article template has no code path that can
 * render a review credit without one.
 */

export interface ArticleAuthor {
  /** Stable key referenced by `articles.ts`. */
  id: string;
  name: string;
  /**
   * How the byline is rendered in structured data. A house byline is an
   * `Organization`; a named writer is a `Person`. Getting this wrong is a
   * small lie told to a machine, which is still a lie.
   */
  kind: "Organization" | "Person";
  /** Short line under the name, e.g. "Editorial team". Never a credential. */
  role: string;
  /** Author-box biography. Two or three sentences. */
  bio: string;
}

export interface ArticleReviewer {
  id: string;
  /** Full name as registered with the licensing body. */
  name: string;
  /** Post-nominals exactly as the licensing body issues them, e.g. "DVM". */
  credentials: string;
  /** The provincial college the reviewer is licensed by. */
  college: string;
  /** Public registration number, so a reader can verify the licence. */
  registrationNumber: string;
  /** ISO date the review was completed. */
  reviewedOn: string;
}

/**
 * The house byline.
 *
 * Used until an article has a named writer who is willing to stand behind it
 * publicly. It is honest about what it is: a team, not a specialist.
 */
export const petClubEditorial: ArticleAuthor = {
  id: "pet-club-editorial",
  name: "The Pet Club Editorial Team",
  kind: "Organization",
  role: "Editorial team",
  bio: "The Pet Club editorial team writes practical, Canada-specific guidance for people looking after dogs and cats here — with Canadian prices, Canadian products and Canadian rules. We are writers and researchers, not veterinarians, and we say so on every page that touches health.",
};

// Keyed with a literal rather than `[petClubEditorial.id]`, so `ArticleAuthorId`
// is the union of real ids and an article cannot reference a byline that is not
// here.
const authors = {
  "pet-club-editorial": petClubEditorial,
} as const satisfies Record<string, ArticleAuthor>;

export type ArticleAuthorId = keyof typeof authors;

/**
 * Named veterinary reviewers.
 *
 * Empty by design. See the note at the top of this file — this list is not a
 * placeholder waiting to be filled with plausible names, it is a register of
 * reviews that actually happened.
 */
const reviewers = {} as const satisfies Record<string, ArticleReviewer>;

export type ArticleReviewerId = keyof typeof reviewers;

export function getAuthor(id: ArticleAuthorId): ArticleAuthor {
  return authors[id];
}

export function findReviewer(id: string): ArticleReviewer | null {
  return (reviewers as Record<string, ArticleReviewer>)[id] ?? null;
}

/** Every reviewer on record, for the trust tests. */
export const allReviewers: readonly ArticleReviewer[] = Object.values(reviewers);
