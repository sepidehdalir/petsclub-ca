/**
 * Illustrative Lost & Found reports.
 *
 * ⚠️ THESE ARE NOT REAL MISSING PETS.
 *
 * This is the most sensitive fixture set in the application: a fabricated
 * missing-pet report could send a real person searching for an animal that
 * does not exist. Every surface rendering these must label them as samples,
 * they must never carry contact details, and they must be replaced by real
 * reports in Milestone 5 rather than supplemented by them.
 *
 * Locations are real Canadian cities only so the layout can be judged with
 * realistic string lengths.
 */

export type LostFoundStatus = "lost" | "found";

export interface DemoLostFoundReport {
  id: string;
  status: LostFoundStatus;
  species: "Dog" | "Cat";
  descriptor: string;
  city: string;
  province: string;
  /** Days since the report, resolved against a caller-supplied "now". */
  reportedDaysAgo: number;
}

export const demoLostFoundReports: readonly DemoLostFoundReport[] = [
  {
    id: "demo-lf-1",
    status: "lost",
    species: "Dog",
    descriptor: "Small tan terrier mix, blue collar",
    city: "Hamilton",
    province: "ON",
    reportedDaysAgo: 1,
  },
  {
    id: "demo-lf-2",
    status: "found",
    species: "Cat",
    descriptor: "Grey tabby, very friendly, no collar",
    city: "Burnaby",
    province: "BC",
    reportedDaysAgo: 2,
  },
  {
    id: "demo-lf-3",
    status: "lost",
    species: "Cat",
    descriptor: "Black and white shorthair, indoor cat",
    city: "Halifax",
    province: "NS",
    reportedDaysAgo: 4,
  },
] as const;
