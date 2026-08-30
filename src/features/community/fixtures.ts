/**
 * Illustrative discussion fixtures.
 *
 * ⚠️ THIS IS NOT REAL COMMUNITY ACTIVITY.
 *
 * These entries exist so the interface can be designed and reviewed before the
 * community engine ships in Milestone 2. Rules that apply to everything in
 * this file:
 *
 *   - Every surface that renders them must display a `DemoContentNotice`.
 *   - Authors are labelled as samples, never as named members.
 *   - No testimonials, endorsements, ratings or expert claims.
 *   - Timestamps are relative offsets, so the UI never claims a specific date.
 *
 * Deleting this file and its two consumers removes all demo content from the
 * application.
 */

import { communityCategoryPath } from "@/features/community/taxonomy";

export interface DemoThread {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  replyCount: number;
  /** Hours since the last reply, resolved against a caller-supplied "now". */
  lastActivityHoursAgo: number;
}

export const demoThreads: readonly DemoThread[] = [
  {
    id: "demo-thread-1",
    title: "Best pet insurance in Canada?",
    categoryName: "Pet Insurance",
    categorySlug: "pet-insurance",
    replyCount: 24,
    lastActivityHoursAgo: 2,
  },
  {
    id: "demo-thread-2",
    title: "My puppy suddenly stopped eating kibble",
    categoryName: "Puppies",
    categorySlug: "puppies",
    replyCount: 11,
    lastActivityHoursAgo: 6,
  },
  {
    id: "demo-thread-3",
    title: "Favourite Canadian-made dog food?",
    categoryName: "Dog Food & Nutrition",
    categorySlug: "dog-food-and-nutrition",
    replyCount: 38,
    lastActivityHoursAgo: 20,
  },
  {
    id: "demo-thread-4",
    title: "Best cat litter available in Canada?",
    categoryName: "Cat Behaviour",
    categorySlug: "cat-behaviour",
    replyCount: 17,
    lastActivityHoursAgo: 31,
  },
] as const;

/** Resolves the category route a demo thread points at. */
export function demoThreadHref(thread: DemoThread): string {
  return communityCategoryPath(thread.categorySlug);
}
