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
  {
    id: "guide-pet-insurance",
    title: "Pet Insurance in Canada",
    summary:
      "What coverage really includes, how deductibles work, and the questions to ask before you buy.",
    topic: "Money",
  },
  {
    id: "guide-vaccination",
    title: "Puppy Vaccination Schedule Canada",
    summary:
      "A plain-language timeline of core and optional vaccines, and what your vet will typically recommend.",
    topic: "Health",
  },
  {
    id: "guide-cost-of-dog",
    title: "Cost of Owning a Dog in Canada",
    summary:
      "Realistic first-year and ongoing costs, from food and vet care to grooming, boarding and licensing.",
    topic: "Money",
  },
] as const;
