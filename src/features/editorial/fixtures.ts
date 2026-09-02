/**
 * Planned editorial guides.
 *
 * ⚠️ These are commissioned titles, not published articles. No article body
 * exists for any of them, so the cards render as clearly-labelled "in
 * progress" placeholders and link nowhere. Publishing thin or generated
 * articles to fill the section would be worse than showing an honest roadmap.
 *
 * Real articles live in `articles.ts` and render at `/guides/[slug]`. These two
 * lists are deliberately never merged: a commissioned title and a written
 * article are different things, and a reader must be able to tell which is
 * which at a glance. A title graduates by being written, at which point it is
 * deleted from here rather than cross-referenced.
 */

export interface PlannedGuide {
  id: string;
  title: string;
  summary: string;
  topic: string;
}

export const plannedGuides: readonly PlannedGuide[] = [
  {
    id: "guide-dog-food",
    title: "Best Dog Foods in Canada",
    summary:
      "How to read a Canadian label, which brands are actually made here, and how to compare cost per day.",
    topic: "Food",
  },
  // `guide-vaccination`, `guide-cost-of-dog` and `guide-pet-insurance` were
  // here. All three have now been written and live in `articles.ts`, so they
  // are gone from this list rather than cross-referenced — a title that exists
  // in both places would appear on its topic page twice, once as a guide a
  // reader can open and once as a promise to write it.
] as const;
