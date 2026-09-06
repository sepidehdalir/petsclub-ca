/**
 * Copy for the three Journey states that are not a stage.
 *
 * ## Why these live as data rather than inline in the page
 *
 * They are three *different facts*, and the whole history of this area is them
 * being confused for one another:
 *
 *  - **before** — the puppy is younger than the first stage. Nothing is
 *    missing; the series starts at eight weeks on purpose.
 *  - **complete** — the reader has finished. There is no next stage and there
 *    is not going to be one.
 *  - **noPage** — a roadmap entry exists without a page. Unreachable today,
 *    kept so that adding an entry ahead of its page degrades honestly.
 *
 * When these were three inline string literals the only way to assert on them
 * was to read `page.tsx` and slice it on comment markers, which broke whenever
 * the file was edited and passed on any comment that merely mentioned the
 * words. As data they are testable directly, which is the point: the invariant
 * that matters is that "finished" never borrows "not written yet" language,
 * and that neither of them promises content that does not exist.
 */

export interface JourneyStateCopy {
  title: string;
  body: string;
}

export const journeyStateCopy = {
  before: {
    title: "The Journey starts at eight weeks",
    body: "Your puppy is younger than that, which puts it before the start of this series rather than in a gap in it. Every stage of the Journey is written; none of them covers an age this early, because a puppy this young is normally still with its breeder or rescue and the day-to-day decisions are not yet yours to make.",
  },
  complete: {
    title: "The Puppy Journey is complete",
    body: "There is no next stage, and that is deliberate rather than an omission. A series arranged by age has nothing useful left to say once age stops being the thing that decides what matters — which from here is size, breed, body condition, health history and the individual dog.",
  },
  noPage: {
    title: "There is no page for this stage",
    body: "There is no page for this stage. The rest of the Journey is written, and where you sit in it is marked below.",
  },
} as const satisfies Record<string, JourneyStateCopy>;

/**
 * Language that promises content the Journey is not going to produce.
 *
 * Every roadmap stage is written, so any of this in any of the states above is
 * false. Kept here, beside the copy, so the rule and the thing it governs move
 * together.
 */
export const FORBIDDEN_PROMISE = /being researched|coming soon|not written yet|have not written|the rest are|are following|in progress/i;
