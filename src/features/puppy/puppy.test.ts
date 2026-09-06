import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articles } from "@/features/editorial/articles";
import { FORBIDDEN_PROMISE, journeyStateCopy } from "@/features/puppy/journey-states";
import { parseSizeAnswer, resolveSizeGroup, sizeGroups } from "@/features/puppy/model";
import { parseStoredPuppy } from "@/features/puppy/storage";
import { generateMetadata as myPuppyMetadata } from "@/app/my-puppy/page";
import {
  addCalendarMonths,
  civilFromDays,
  completedCalendarMonths,
  daysBetween,
  daysFromCivil,
  daysInMonth,
  daysSinceMonthAnniversary,
  formatCivilDate,
  parseCivilDate,
  resolveAge,
  resolveAgeFromInput,
  hasRepresentativeTimeZone,
  MAX_PLAUSIBLE_DAYS,
  resolveToday,
  seasonOf,
  todayInZone,
  todayLocal,
} from "@/features/puppy/age";
import type { PuppyAge } from "@/features/puppy/age";
import { allBreeds, findBreed, findProvince, provinces } from "@/features/puppy/model";
import { resolveSources, resolveStage } from "@/features/puppy/resolve";
import {
  nineToElevenWeeks,
  nineToTwelveMonths,
  findPhase,
  findRoadmapStage,
  isBeforeJourney,
  isJourneyComplete,
  JOURNEY_BEGINS_AT_DAYS,
  journeyPhases,
  JOURNEY_ENDS_AFTER_MONTHS,
  journeyAnimalNoun,
  journeyMeta,
  roadmapByPhase,
  breedModifiers,
  beyondTheFirstYear,
  eightWeeks,
  provinceModifiers,
  roadmapStageFor,
  roadmapStages,
  seasonModifiers,
  sizeGroupModifiers,
  journeyHeadlineAge,
  stageAgePhrase,
  stageFor,
  fourToSixMonths,
  sevenToEightMonths,
  stages,
  threeMonths,
  twelveWeeks,
} from "@/features/puppy/stages";
import type { RoadmapStage } from "@/features/puppy/stages";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

const FEATURE_DIR = fileURLToPath(new URL("./", import.meta.url));

/**
 * "What is today" is a separate question from "how old is this puppy", and it
 * is the one with a time zone in it. These tests pin the answer for the cases
 * the country actually contains — a reader in Vancouver at 9pm is on a
 * different calendar day from a reader in Toronto at midnight, and a server in
 * UTC is on a third.
 */
describe("today resolution", () => {
  // 9:30pm Wednesday in Vancouver is 00:30 Thursday in Toronto and 04:30
  // Thursday UTC. One instant, three calendar days.
  const vancouverWednesdayEvening = new Date("2026-09-03T04:30:00Z");

  it("gives Vancouver the previous day when Toronto has already turned over", () => {
    expect(todayInZone("America/Vancouver", vancouverWednesdayEvening)).toEqual({
      year: 2026,
      month: 9,
      day: 2,
    });
    expect(todayInZone("America/Toronto", vancouverWednesdayEvening)).toEqual({
      year: 2026,
      month: 9,
      day: 3,
    });
  });

  it("resolves a BC reader to the Pacific date rather than the Eastern one", () => {
    const bc = resolveToday({ province: "BC", now: vancouverWednesdayEvening });
    const on = resolveToday({ province: "ON", now: vancouverWednesdayEvening });

    expect(bc).toEqual({ date: { year: 2026, month: 9, day: 2 }, source: "province" });
    expect(on).toEqual({ date: { year: 2026, month: 9, day: 3 }, source: "province" });
  });

  it("puts Atlantic Canada ahead of Ontario in the late evening", () => {
    // 11:30pm Wednesday in Toronto is 12:30am Thursday in Halifax, and
    // 1:00am Thursday in St John's — which is half an hour ahead again.
    const lateToronto = new Date("2026-09-03T03:30:00Z");

    expect(resolveToday({ province: "ON", now: lateToronto }).date).toEqual({
      year: 2026,
      month: 9,
      day: 2,
    });
    expect(resolveToday({ province: "NS", now: lateToronto }).date).toEqual({
      year: 2026,
      month: 9,
      day: 3,
    });
    expect(resolveToday({ province: "NL", now: lateToronto }).date).toEqual({
      year: 2026,
      month: 9,
      day: 3,
    });
  });

  it("does not let the deployment region change the answer", () => {
    // The failure this guards against is a build that resolves correctly in
    // one region and a day out in another. Nothing in `resolveToday` reads
    // the process time zone, so all of these must agree.
    const now = new Date("2026-09-03T04:30:00Z");
    const original = process.env.TZ;

    for (const tz of ["UTC", "America/Toronto", "America/Vancouver", "Pacific/Auckland"]) {
      process.env.TZ = tz;
      expect(resolveToday({ province: "BC", now }).date).toEqual({ year: 2026, month: 9, day: 2 });
      expect(resolveToday({ now })).toEqual({
        date: { year: 2026, month: 9, day: 3 },
        source: "utc",
      });
    }

    process.env.TZ = original;
  });

  it("falls back to UTC when no province is supplied, and says so", () => {
    const now = new Date("2026-09-03T04:30:00Z");
    expect(resolveToday({ now })).toEqual({
      date: { year: 2026, month: 9, day: 3 },
      source: "utc",
    });
    expect(resolveToday({ province: null, now }).source).toBe("utc");
  });

  it("falls back to UTC for a province with no defensible single zone", () => {
    // Nunavut spans three zones. Guessing one would be worse than not
    // guessing, so it is deliberately unmapped.
    const now = new Date("2026-09-03T04:30:00Z");
    expect(hasRepresentativeTimeZone("NU")).toBe(false);
    expect(resolveToday({ province: "NU", now }).source).toBe("utc");

    // Every other province and territory must map to something.
    for (const province of provinces) {
      if (province.code !== "NU") {
        expect(hasRepresentativeTimeZone(province.code)).toBe(true);
        expect(resolveToday({ province: province.code, now }).source).toBe("province");
      }
    }
  });

  it("prefers the browser's own local date over any province mapping", () => {
    // A reader in Ontario reading from a laptop still set to Vancouver time
    // should get the calendar their device shows them.
    const clientDate = { year: 2026, month: 9, day: 2 };
    const now = new Date("2026-09-03T04:30:00Z");

    expect(resolveToday({ clientDate, province: "ON", now })).toEqual({
      date: clientDate,
      source: "client",
    });
  });

  it("reads the browser's local date from the device clock", () => {
    // `todayLocal` is the only function that trusts the ambient zone, which
    // on the client is exactly the right thing to trust.
    const original = process.env.TZ;
    const now = new Date("2026-09-03T04:30:00Z");

    process.env.TZ = "America/Vancouver";
    expect(todayLocal(now)).toEqual({ year: 2026, month: 9, day: 2 });

    process.env.TZ = "America/Toronto";
    expect(todayLocal(now)).toEqual({ year: 2026, month: 9, day: 3 });

    process.env.TZ = original;
  });

  it("moves a puppy across a stage boundary at local midnight, not UTC midnight", () => {
    // Born 18 June 2026. Day 77 — the first day of week 11 — is 3 September.
    // At 04:30 UTC on 3 September it is still 2 September in Vancouver, so a
    // BC reader is correctly still on week 10 while an Ontario reader is on
    // week 11. This is the bug the previous Toronto-only clock produced in
    // reverse.
    const birth = { year: 2026, month: 6, day: 18 };
    const now = new Date("2026-09-03T04:30:00Z");

    const bc = resolveAge(birth, resolveToday({ province: "BC", now }).date);
    const on = resolveAge(birth, resolveToday({ province: "ON", now }).date);

    expect(bc.ok && bc.age.days).toBe(76);
    expect(bc.ok && bc.age.weeks).toBe(10);
    expect(on.ok && on.age.days).toBe(77);
    expect(on.ok && on.age.weeks).toBe(11);

    // Four hours later it is past midnight in Vancouver too, and they agree.
    const later = new Date("2026-09-03T08:30:00Z");
    const bcLater = resolveAge(birth, resolveToday({ province: "BC", now: later }).date);
    expect(bcLater.ok && bcLater.age.weeks).toBe(11);
  });
});

describe("age engine", () => {
  it("parses a date input value and rejects anything that is not a real date", () => {
    expect(parseCivilDate("2026-06-18")).toEqual({ year: 2026, month: 6, day: 18 });
    expect(parseCivilDate("2026-02-29")).toBeNull(); // 2026 is not a leap year
    expect(parseCivilDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseCivilDate("2026-13-01")).toBeNull();
    expect(parseCivilDate("2026-04-31")).toBeNull();
    expect(parseCivilDate("18/06/2026")).toBeNull();
    expect(parseCivilDate("")).toBeNull();
  });

  it("counts days across month, year and leap boundaries", () => {
    expect(daysBetween({ year: 2026, month: 6, day: 18 }, { year: 2026, month: 6, day: 18 })).toBe(0);
    expect(daysBetween({ year: 2026, month: 6, day: 18 }, { year: 2026, month: 6, day: 19 })).toBe(1);
    expect(daysBetween({ year: 2025, month: 12, day: 31 }, { year: 2026, month: 1, day: 1 })).toBe(1);
    // 2024 is a leap year: 29 February exists and must be counted.
    expect(daysBetween({ year: 2024, month: 2, day: 28 }, { year: 2024, month: 3, day: 1 })).toBe(2);
  });

  it("resolves an 11-week-old puppy, and holds for the whole of that week", () => {
    const birth = { year: 2026, month: 6, day: 18 };

    // Day 77 is the first day of week 11; day 83 is the last.
    const firstDay = resolveAge(birth, { year: 2026, month: 9, day: 3 });
    const lastDay = resolveAge(birth, { year: 2026, month: 9, day: 9 });

    expect(firstDay.ok && firstDay.age.days).toBe(77);
    expect(firstDay.ok && firstDay.age.weeks).toBe(11);
    expect(firstDay.ok && firstDay.age.label).toBe("11 weeks old");

    expect(lastDay.ok && lastDay.age.days).toBe(83);
    expect(lastDay.ok && lastDay.age.weeks).toBe(11);
  });

  it("moves to the next week exactly one day after the boundary", () => {
    const birth = { year: 2026, month: 6, day: 18 };
    const dayBefore = resolveAge(birth, { year: 2026, month: 9, day: 2 });
    const dayAfter = resolveAge(birth, { year: 2026, month: 9, day: 10 });

    expect(dayBefore.ok && dayBefore.age.weeks).toBe(10);
    expect(dayAfter.ok && dayAfter.age.weeks).toBe(12);
  });

  it("rejects a future date of birth rather than reporting a negative age", () => {
    const result = resolveAge({ year: 2027, month: 1, day: 1 }, { year: 2026, month: 9, day: 5 });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.problem).toBe("future");
  });

  it("rejects a date of birth beyond puppyhood", () => {
    const result = resolveAge({ year: 2019, month: 1, day: 1 }, { year: 2026, month: 9, day: 5 });
    expect(result.ok === false && result.problem).toBe("implausible");
  });

  it("reports an unparseable input as invalid rather than throwing", () => {
    const today = { year: 2026, month: 9, day: 3 };
    expect(resolveAgeFromInput("not a date", today).ok).toBe(false);
    expect(resolveAgeFromInput("not a date", today)).toEqual({ ok: false, problem: "invalid" });
  });

  it("is timezone-safe: the same civil dates give the same answer regardless of the clock", () => {
    // The bug this guards is `new Date("2026-06-18")` parsing as midnight UTC,
    // which is the previous evening across every Canadian time zone. Because
    // the engine never constructs a Date from a DOB, the result depends only
    // on the two civil dates.
    const birth = { year: 2026, month: 6, day: 18 };
    const today = { year: 2026, month: 9, day: 3 };

    for (const tz of ["UTC", "America/St_Johns", "America/Vancouver", "Pacific/Auckland"]) {
      const original = process.env.TZ;
      process.env.TZ = tz;
      expect(resolveAge(birth, today).ok && resolveAge(birth, today).ok).toBe(true);
      const result = resolveAge(birth, today);
      expect(result.ok && result.age.days).toBe(77);
      process.env.TZ = original;
    }
  });

  it("labels ages in the unit an owner would use", () => {
    const birth = { year: 2026, month: 1, day: 1 };
    const at = (m: number, d: number) => {
      const r = resolveAge(birth, { year: 2026, month: m, day: d });
      return r.ok ? r.age.label : "";
    };
    expect(at(1, 2)).toBe("1 day old");
    expect(at(1, 4)).toBe("3 days old");
    expect(at(1, 8)).toBe("1 week old");
    expect(at(3, 19)).toBe("11 weeks old");
    expect(at(7, 1)).toContain("months old");
  });

  it("maps months to meteorological seasons", () => {
    expect(seasonOf({ year: 2026, month: 1, day: 15 })).toBe("winter");
    expect(seasonOf({ year: 2026, month: 4, day: 15 })).toBe("spring");
    expect(seasonOf({ year: 2026, month: 7, day: 15 })).toBe("summer");
    expect(seasonOf({ year: 2026, month: 10, day: 15 })).toBe("autumn");
    expect(seasonOf({ year: 2026, month: 12, day: 15 })).toBe("winter");
  });

  it("formats a civil date without shifting it", () => {
    expect(formatCivilDate({ year: 2026, month: 6, day: 18 })).toBe("18 June 2026");
  });
});

/**
 * Fixtures.
 *
 * Stage resolution is a function of a *resolved age*, not of a raw day count,
 * because from three months on a stage is a span between calendar
 * anniversaries of a specific date of birth. So the tests go through the same
 * front door the product does: a date of birth, a today, `resolveAge`.
 */
function ageOn(dob: string, today: string): PuppyAge {
  const birth = parseCivilDate(dob);
  const now = parseCivilDate(today);
  if (!birth || !now) {
    throw new Error(`bad fixture date: ${dob} / ${today}`);
  }
  const result = resolveAge(birth, now);
  if (!result.ok) {
    throw new Error(`fixture age did not resolve: ${dob} → ${today} (${result.problem})`);
  }
  return result.age;
}

/** The resolved stage slug for a date of birth observed on a given day. */
function slugOn(dob: string, today: string): string | null {
  return roadmapStageFor(ageOn(dob, today))?.slug ?? null;
}

/** A civil date `days` after a date of birth, as `YYYY-MM-DD`. */
function dayAfter(dob: string, days: number): string {
  const birth = parseCivilDate(dob);
  if (!birth) {
    throw new Error(`bad fixture date: ${dob}`);
  }
  const { year, month, day } = civilFromDays(daysFromCivil(birth) + days);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** A civil date as `YYYY-MM-DD`. */
function formatIso({ year, month, day }: { year: number; month: number; day: number }): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The resolved stage slug on a puppy's nth day of life. */
function slugAtDay(dob: string, days: number): string | null {
  return slugOn(dob, dayAfter(dob, days));
}

describe("stage resolution", () => {
  it("resolves the implemented stage from an age, and nothing outside it", () => {
    const dob = "2026-06-18";
    expect(stageFor(ageOn(dob, dayAfter(dob, 63)))?.slug).toBe("9-11-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 73)))?.slug).toBe("9-11-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 83)))?.slug).toBe("9-11-weeks");
    // Either side: eight weeks and twelve weeks each have their own page now.
    expect(stageFor(ageOn(dob, dayAfter(dob, 62)))?.slug).toBe("8-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 84)))?.slug).toBe("12-weeks");
  });

  it("has written every stage it puts on the roadmap", () => {
    // The Journey is finished: no age inside it resolves to a roadmap entry
    // that has no page.
    const dob = "2026-06-18";
    expect(slugAtDay(dob, 60)).toBe("8-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 60)))?.slug).toBe("8-weeks");
    expect(slugOn(dob, "2027-07-18")).toBe("beyond-the-first-year");
    expect(stageFor(ageOn(dob, "2027-07-18"))?.slug).toBe("beyond-the-first-year");

    const implemented = new Set(stages.map((stage) => stage.slug));
    for (const entry of roadmapStages) {
      expect(implemented.has(entry.slug), entry.slug).toBe(true);
    }
  });

  it("keeps the weekly table contiguous in days and the monthly one in months", () => {
    const weekly = roadmapStages.filter((stage) => stage.range.unit === "weeks");
    const monthly = roadmapStages.filter((stage) => stage.range.unit === "months");

    for (let i = 1; i < weekly.length; i += 1) {
      const current = weekly[i]!.range;
      const previous = weekly[i - 1]!.range;
      if (current.unit !== "weeks" || previous.unit !== "weeks") {
        throw new Error("weekly partition is not weekly");
      }
      expect(current.minDays).toBe(previous.maxDays + 1);
    }

    for (let i = 1; i < monthly.length; i += 1) {
      const current = monthly[i]!.range;
      const previous = monthly[i - 1]!.range;
      if (current.unit !== "months" || previous.unit !== "months") {
        throw new Error("monthly partition is not monthly");
      }
      expect(previous.maxMonths).toBeDefined();
      expect(current.minMonths).toBe(previous.maxMonths! + 1);
    }

    // The Journey is finite: every stage is bounded, and it ends where the
    // handoff ends.
    const openEnded = roadmapStages.filter(
      (stage) => stage.range.unit === "months" && stage.range.maxMonths === undefined,
    );
    expect(openEnded).toEqual([]);
    expect(roadmapStages.at(-1)?.slug).toBe("beyond-the-first-year");
    const last = roadmapStages.at(-1)!.range;
    if (last.unit !== "months") throw new Error("terminal stage is not a month range");
    expect(last.maxMonths).toBe(JOURNEY_ENDS_AFTER_MONTHS);
  });

  it("has exactly the two implemented stages of this milestone", () => {
    expect(stages.map((stage) => stage.slug)).toEqual([
      "8-weeks",
      "9-11-weeks",
      "12-weeks",
      "3-months",
      "4-6-months",
      "7-8-months",
      "9-12-months",
      "beyond-the-first-year",
    ]);
  });
});

/**
 * Calendar-month arithmetic.
 *
 * These test the engine rather than the roadmap: whether "three months later"
 * means what an owner means by it, including in the months where the answer is
 * not obvious.
 */
describe("calendar months", () => {
  it("counts the days in a month, leap years included", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29); // divisible by 4
    expect(daysInMonth(1900, 2)).toBe(28); // divisible by 100, not 400
    expect(daysInMonth(2000, 2)).toBe(29); // divisible by 400
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 8)).toBe(31);
  });

  it("clamps to the last day of the month where the day-of-month does not exist", () => {
    const jan31 = { year: 2026, month: 1, day: 31 };
    expect(addCalendarMonths(jan31, 1)).toEqual({ year: 2026, month: 2, day: 28 });
    expect(addCalendarMonths(jan31, 3)).toEqual({ year: 2026, month: 4, day: 30 });
    expect(addCalendarMonths(jan31, 2)).toEqual({ year: 2026, month: 3, day: 31 });

    // Leap year: the clamp lands a day later.
    expect(addCalendarMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });

    expect(addCalendarMonths({ year: 2026, month: 8, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 9,
      day: 30,
    });

    // A leap-day birthday has an anniversary every year, clamped in three of four.
    expect(addCalendarMonths({ year: 2024, month: 2, day: 29 }, 12)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
    expect(addCalendarMonths({ year: 2024, month: 2, day: 29 }, 48)).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
  });

  it("crosses the year boundary and accepts a zero or large offset", () => {
    expect(addCalendarMonths({ year: 2026, month: 11, day: 15 }, 3)).toEqual({
      year: 2027,
      month: 2,
      day: 15,
    });
    expect(addCalendarMonths({ year: 2026, month: 6, day: 18 }, 0)).toEqual({
      year: 2026,
      month: 6,
      day: 18,
    });
    expect(addCalendarMonths({ year: 2026, month: 6, day: 18 }, 30)).toEqual({
      year: 2028,
      month: 12,
      day: 18,
    });
  });

  it("treats the anniversary itself as the day the month completes", () => {
    const birth = { year: 2026, month: 6, day: 18 };
    expect(completedCalendarMonths(birth, { year: 2026, month: 9, day: 17 })).toBe(2);
    expect(completedCalendarMonths(birth, { year: 2026, month: 9, day: 18 })).toBe(3);
    expect(completedCalendarMonths(birth, { year: 2026, month: 9, day: 19 })).toBe(3);
    expect(completedCalendarMonths(birth, birth)).toBe(0);
  });

  it("gets the month-end dates right, which naive day comparison does not", () => {
    // Born 31 January. A `today.day < birth.day` test says this puppy is not
    // one month old on 28 February, because 28 < 31. It is.
    const jan31 = { year: 2026, month: 1, day: 31 };
    expect(completedCalendarMonths(jan31, { year: 2026, month: 2, day: 27 })).toBe(0);
    expect(completedCalendarMonths(jan31, { year: 2026, month: 2, day: 28 })).toBe(1);
    expect(completedCalendarMonths(jan31, { year: 2026, month: 3, day: 30 })).toBe(1);
    expect(completedCalendarMonths(jan31, { year: 2026, month: 3, day: 31 })).toBe(2);

    // Born 30 January. Shares the 28 February anniversary with 31 January —
    // the documented consequence of the clamp, asserted so it stays deliberate.
    const jan30 = { year: 2026, month: 1, day: 30 };
    expect(completedCalendarMonths(jan30, { year: 2026, month: 2, day: 27 })).toBe(0);
    expect(completedCalendarMonths(jan30, { year: 2026, month: 2, day: 28 })).toBe(1);

    // Born 28 February. No clamping needed anywhere, and the month after is 28 March.
    const feb28 = { year: 2026, month: 2, day: 28 };
    expect(completedCalendarMonths(feb28, { year: 2026, month: 3, day: 27 })).toBe(0);
    expect(completedCalendarMonths(feb28, { year: 2026, month: 3, day: 28 })).toBe(1);

    // Born 29 February in a leap year.
    const feb29 = { year: 2024, month: 2, day: 29 };
    expect(completedCalendarMonths(feb29, { year: 2024, month: 3, day: 28 })).toBe(0);
    expect(completedCalendarMonths(feb29, { year: 2024, month: 3, day: 29 })).toBe(1);
    expect(completedCalendarMonths(feb29, { year: 2025, month: 2, day: 27 })).toBe(11);
    expect(completedCalendarMonths(feb29, { year: 2025, month: 2, day: 28 })).toBe(12);

    // Born 31 August.
    const aug31 = { year: 2026, month: 8, day: 31 };
    expect(completedCalendarMonths(aug31, { year: 2026, month: 9, day: 29 })).toBe(0);
    expect(completedCalendarMonths(aug31, { year: 2026, month: 9, day: 30 })).toBe(1);
    expect(completedCalendarMonths(aug31, { year: 2026, month: 10, day: 30 })).toBe(1);
    expect(completedCalendarMonths(aug31, { year: 2026, month: 10, day: 31 })).toBe(2);
  });

  it("never goes backwards as the day advances", () => {
    // Monotonicity is what the clamp buys, and the property most likely to
    // break if someone "simplifies" the rule later. Checked across four years
    // of dates of birth, day by day, for three years each — collecting
    // violations rather than asserting per day, for the reason set out on the
    // exhaustive stage sweep below.
    const start = daysFromCivil({ year: 2024, month: 1, day: 1 });
    const violations: string[] = [];

    for (let offset = 0; offset < 366 * 4; offset += 37) {
      const birth = civilFromDays(start + offset);
      const birthDay = daysFromCivil(birth);
      let previous = 0;

      for (let days = 0; days <= MAX_PLAUSIBLE_DAYS; days += 1) {
        const months = completedCalendarMonths(birth, civilFromDays(birthDay + days));
        if (months < previous || months - previous > 1) {
          violations.push(`${formatCivilDate(birth)} day ${days}: ${previous} → ${months}`);
        }
        previous = months;
      }
    }

    expect(violations).toEqual([]);
  });

  it("reports the remainder since the anniversary, not since a mean month", () => {
    const birth = { year: 2026, month: 1, day: 31 };
    expect(daysSinceMonthAnniversary(birth, { year: 2026, month: 2, day: 28 })).toBe(0);
    expect(daysSinceMonthAnniversary(birth, { year: 2026, month: 3, day: 5 })).toBe(5);

    // And it feeds the label, so a headline cannot disagree with the stage.
    const age = ageOn("2026-01-31", "2026-06-14");
    expect(age.months).toBe(4);
    expect(age.remainderDaysInMonth).toBe(14);
    expect(age.label).toBe("4 months and 2 weeks old");
  });
});

/**
 * The hybrid model.
 *
 * The cadence widens as development slows — a week early on, a calendar month
 * through early development, paired calendar months through adolescence. These
 * tests pin every boundary, because the whole model is boundaries and an
 * off-by-one anywhere puts a reader on the wrong stage.
 */
describe("hybrid age resolution", () => {
  it("steps week by week from 8 to 12 weeks, whatever the date of birth", () => {
    const weekly: [number, number, string][] = [
      [56, 62, "8-weeks"],
      [63, 83, "9-11-weeks"],
      [84, 90, "12-weeks"],
    ];

    // Four dates of birth chosen so their three-month anniversaries land on
    // different days of life: 31 December reaches three months on day 90,
    // 31 May not until day 92.
    for (const dob of ["2026-06-18", "2025-12-31", "2026-05-31", "2024-02-29"]) {
      for (const [min, max, slug] of weekly) {
        // Whole weeks, still — one for the ends, three for the middle.
        expect((max - min + 1) % 7).toBe(0);
        expect(slugAtDay(dob, min)).toBe(slug);
        expect(slugAtDay(dob, max)).toBe(slug);
        expect(slugAtDay(dob, min - 1)).not.toBe(slug);
        expect(slugAtDay(dob, max + 1)).not.toBe(slug);
      }
    }
  });

  it("resolves each day of the early-puppy phase to the stage the gate settled on", () => {
    const dob = "2026-06-18";
    for (let days = 56; days <= 62; days += 1) {
      expect(slugAtDay(dob, days)).toBe("8-weeks");
    }
    for (let days = 63; days <= 83; days += 1) {
      expect(slugAtDay(dob, days)).toBe("9-11-weeks");
    }
    for (let days = 84; days <= 90; days += 1) {
      expect(slugAtDay(dob, days)).toBe("12-weeks");
    }
  });

  it("resolves the twelfth week to its own stage, and serves it a page", () => {
    const dob = "2026-06-18";
    for (let days = 84; days <= 90; days += 1) {
      expect(slugAtDay(dob, days)).toBe("12-weeks");
      expect(stageFor(ageOn(dob, dayAfter(dob, days)))?.slug).toBe("12-weeks");
    }

    // The neighbours are unmoved.
    expect(slugAtDay(dob, 83)).toBe("9-11-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 83)))?.slug).toBe("9-11-weeks");
    expect(slugAtDay(dob, 91)).toBe("3-months");
    expect(stageFor(ageOn(dob, dayAfter(dob, 91)))?.slug).toBe("3-months");

    // Eight weeks now has a page of its own.
    for (const days of [56, 59, 62]) {
      expect(slugAtDay(dob, days)).toBe("8-weeks");
      expect(stageFor(ageOn(dob, dayAfter(dob, days)))?.slug).toBe("8-weeks");
    }
    // And 55 days is still before the Journey starts.
    expect(roadmapStageFor(ageOn(dob, dayAfter(dob, 55)))).toBeNull();
    expect(stageFor(ageOn(dob, dayAfter(dob, 55)))).toBeNull();
  });

  it("keeps the exact week in the headline on the 12-week stage too", () => {
    // A single-week stage: exact age and stage label agree, and the headline
    // states the week either way.
    const dob = "2026-06-18";
    for (const days of [84, 87, 90]) {
      const age = ageOn(dob, dayAfter(dob, days));
      const roadmap = roadmapStageFor(age)!;
      expect(roadmap.slug).toBe("12-weeks");
      expect(journeyHeadlineAge(age, roadmap)).toBe("12 weeks old");
      expect(journeyMeta(age, roadmap)).toEqual(["Early puppy"]);
    }
  });

  it("keeps the exact week in the headline while three weeks share a stage", () => {
    // The distinction the revision turns on: exact age is a fact about this
    // reader's puppy and stays precise; the content stage is an editorial
    // unit and is shared. A ten-week-old is never told it is "9–11 weeks old".
    const dob = "2026-06-18";
    const expected: [number, string][] = [
      [65, "9 weeks old"],
      [73, "10 weeks old"],
      [80, "11 weeks old"],
    ];

    for (const [days, headline] of expected) {
      const age = ageOn(dob, dayAfter(dob, days));
      const roadmap = roadmapStageFor(age)!;
      expect(roadmap.slug).toBe("9-11-weeks");
      expect(journeyHeadlineAge(age, roadmap)).toBe(headline);
      // And the stage label is never the headline for a weekly stage.
      expect(journeyHeadlineAge(age, roadmap)).not.toContain("9–11");
      // The phase carries the meta row; the exact age is already up top.
      expect(journeyMeta(age, roadmap)).toEqual(["Early puppy"]);
    }
  });

  it("keeps the weekly stage in charge through day 90, even past the anniversary", () => {
    // Born 31 December 2025: three calendar months arrives on 31 March, which
    // is day 90 — inside the twelfth week. The weekly stage takes precedence
    // rather than cutting the week short.
    const dob = "2025-12-31";
    expect(ageOn(dob, "2026-03-31").days).toBe(90);
    expect(ageOn(dob, "2026-03-31").months).toBe(3);
    expect(slugOn(dob, "2026-03-31")).toBe("12-weeks");
    expect(slugOn(dob, "2026-04-01")).toBe("3-months");

    // Born 30 November 2025: three months arrives on 28 February, day 90 again.
    expect(ageOn("2025-11-30", "2026-02-28").days).toBe(90);
    expect(slugOn("2025-11-30", "2026-02-28")).toBe("12-weeks");
    expect(slugOn("2025-11-30", "2026-03-01")).toBe("3-months");
  });

  it("floors day 91 at three months when the anniversary has not arrived yet", () => {
    // Born 31 May 2026: three calendar months is 31 August, which is day 92.
    // On days 91 and 92 the calendar still says two months. The floor puts the
    // reader on the 3-month stage rather than back into a week they have left.
    const dob = "2026-05-31";
    expect(ageOn(dob, dayAfter(dob, 91)).months).toBe(2);
    expect(slugAtDay(dob, 90)).toBe("12-weeks");
    expect(slugAtDay(dob, 91)).toBe("3-months");
    expect(slugAtDay(dob, 92)).toBe("3-months");
    expect(ageOn(dob, "2026-08-31").months).toBe(3);
    expect(slugOn(dob, "2026-08-31")).toBe("3-months");
  });

  it("moves on calendar anniversaries through early development", () => {
    const dob = "2026-06-18";
    // Born 18 June, so day 90 is 16 September and the three-month anniversary
    // is 18 September. Day 91 falls in between: the weekly phase is over, and
    // the floor places the reader on the 3-month stage a day early rather than
    // leaving them in a gap.
    expect(slugOn(dob, "2026-09-16")).toBe("12-weeks");
    expect(slugOn(dob, "2026-09-17")).toBe("3-months");
    expect(slugOn(dob, "2026-09-18")).toBe("3-months");
    expect(slugOn(dob, "2026-10-17")).toBe("3-months");
    // Four and five months share a stage, so the boundary between them is
    // gone and the next move is at six months. Exact age stays precise —
    // see the display test below.
    expect(slugOn(dob, "2026-10-18")).toBe("4-6-months");
    expect(slugOn(dob, "2026-11-17")).toBe("4-6-months");
    expect(slugOn(dob, "2026-11-18")).toBe("4-6-months");
    expect(slugOn(dob, "2026-12-17")).toBe("4-6-months");
    // Six months is inside the stage now, not the start of a new one.
    expect(slugOn(dob, "2026-12-18")).toBe("4-6-months");
    expect(slugOn(dob, "2027-01-17")).toBe("4-6-months");
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months");
  });

  it("uses paired-month ranges through adolescence, on anniversaries", () => {
    const dob = "2026-06-18";
    // 7 → 8 stays put; 8 → 9 moves.
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months"); // 7 months
    expect(slugOn(dob, "2027-02-17")).toBe("7-8-months");
    expect(slugOn(dob, "2027-02-18")).toBe("7-8-months"); // 8 months
    expect(slugOn(dob, "2027-03-17")).toBe("7-8-months");
    expect(slugOn(dob, "2027-03-18")).toBe("9-12-months"); // 9 months

    // 10 → 11 moves.
    expect(slugOn(dob, "2027-04-18")).toBe("9-12-months"); // 10 months
    expect(slugOn(dob, "2027-05-17")).toBe("9-12-months");
    expect(slugOn(dob, "2027-05-18")).toBe("9-12-months"); // 11 months

    // 12 → 13 moves into maturity.
    expect(slugOn(dob, "2027-06-18")).toBe("9-12-months"); // 12 months
    expect(slugOn(dob, "2027-07-17")).toBe("9-12-months");
    expect(slugOn(dob, "2027-07-18")).toBe("beyond-the-first-year"); // 13 months
    expect(ageOn(dob, "2027-07-18").months).toBe(13);
  });

  it("holds those boundaries for a month-end date of birth too", () => {
    // Born 31 August: every anniversary in a 30-day month is clamped.
    const dob = "2026-08-31";
    expect(slugOn(dob, "2026-11-30")).toBe("3-months");
    expect(slugOn(dob, "2026-12-30")).toBe("3-months");
    expect(slugOn(dob, "2026-12-31")).toBe("4-6-months");
    expect(slugOn(dob, "2027-02-28")).toBe("4-6-months"); // clamped from 31 February
    expect(slugOn(dob, "2027-03-30")).toBe("4-6-months");
    expect(slugOn(dob, "2027-03-31")).toBe("7-8-months");
    // Thirteen months from 31 August is 30 September, clamped.
    expect(slugOn(dob, "2027-09-29")).toBe("9-12-months");
    expect(slugOn(dob, "2027-09-30")).toBe("beyond-the-first-year");
    expect(ageOn(dob, "2027-09-30").months).toBe(13);
  });

  it("resolves a leap-day date of birth without falling into a gap", () => {
    const dob = "2024-02-29";

    // Three months is 29 May, which is this puppy's day 90 — inside the
    // twelfth week, so the weekly stage takes precedence for one more day.
    expect(ageOn(dob, "2024-05-29").days).toBe(90);
    expect(ageOn(dob, "2024-05-29").months).toBe(3);
    expect(slugOn(dob, "2024-05-29")).toBe("12-weeks");
    expect(slugOn(dob, "2024-05-30")).toBe("3-months");

    expect(slugOn(dob, "2024-08-29")).toBe("4-6-months");
    expect(slugOn(dob, "2025-01-28")).toBe("9-12-months"); // 11 months is 29 January
    expect(slugOn(dob, "2025-01-29")).toBe("9-12-months");

    // Twelve months lands on 28 February, clamped; thirteen on 29 March, not.
    expect(ageOn(dob, "2025-02-28").months).toBe(12);
    expect(slugOn(dob, "2025-03-28")).toBe("9-12-months");
    expect(slugOn(dob, "2025-03-29")).toBe("beyond-the-first-year");
  });

  it("ends at eighteen months rather than running to the engine's limit", () => {
    const dob = "2026-06-18";
    expect(slugOn(dob, "2027-06-18")).toBe("9-12-months"); // 12 months
    expect(slugOn(dob, "2027-07-18")).toBe("beyond-the-first-year"); // 13 months
    expect(slugOn(dob, "2027-12-18")).toBe("beyond-the-first-year"); // 18 months
    expect(slugOn(dob, "2028-01-18")).toBeNull(); // 19 months — past the end

    // Past the end is "complete", not "unwritten" — different states.
    expect(isJourneyComplete(ageOn(dob, "2027-12-18"))).toBe(false);
    expect(isJourneyComplete(ageOn(dob, "2028-01-18"))).toBe(true);

    // `MAX_PLAUSIBLE_DAYS` is input validation, not the Journey's boundary.
    const birth = parseCivilDate(dob)!;
    const late = resolveAge(birth, civilFromDays(daysFromCivil(birth) + MAX_PLAUSIBLE_DAYS));
    expect(late.ok).toBe(true);
    expect(late.ok && roadmapStageFor(late.age)).toBeNull();
    expect(late.ok && isJourneyComplete(late.age)).toBe(true);
    expect(MAX_PLAUSIBLE_DAYS).toBeGreaterThan(JOURNEY_ENDS_AFTER_MONTHS * 31);
  });


  it("marks maturity as the one boundary that genuinely depends on size", () => {
    // Not implemented, and deliberately not promised to the reader — but the
    // place where a size-aware answer belongs is recorded rather than lost.
    const sizeDependent = roadmapStages.filter((stage) => stage.boundaryVariesBySize);
    expect(sizeDependent.map((stage) => stage.slug)).toEqual(["beyond-the-first-year"]);
  });

  it("resolves exactly one stage for every day of every date of birth in a leap year", () => {
    // The property that matters: no gap and no overlap, for any date of birth,
    // on any day of life from eight weeks to the engine's limit — including
    // across the weekly-to-monthly handover, which does not land on a fixed day.
    //
    // Written as a sweep that collects violations and asserts once, rather than
    // asserting inside the loop. That is not a style preference: this covers
    // roughly 380,000 (birth, day) pairs, and an `expect` per pair spends more
    // time building assertion objects than resolving ages — enough to blow
    // Vitest's five-second default on a CI runner while passing on a faster
    // laptop. A property test should be cheap enough that nobody is tempted to
    // shrink its input space to make it finish.
    const firstOf2024 = daysFromCivil({ year: 2024, month: 1, day: 1 });
    const order = new Map(roadmapStages.map((stage, index) => [stage.slug, index]));
    const unresolved: string[] = [];
    const wentBackwards: string[] = [];

    for (let offset = 0; offset < 366; offset += 1) {
      const birth = civilFromDays(firstOf2024 + offset);
      const birthDay = daysFromCivil(birth);
      let previousIndex = -1;

      for (let days = 56; days <= MAX_PLAUSIBLE_DAYS; days += 1) {
        const result = resolveAge(birth, civilFromDays(birthDay + days));
        if (!result.ok) {
          throw new Error("age did not resolve inside the plausible range");
        }

        const stage = roadmapStageFor(result.age);

        // Past the Journey's end there is deliberately no stage, and the
        // complete state must be the reason rather than a gap.
        if (result.age.months > JOURNEY_ENDS_AFTER_MONTHS) {
          if (stage) unresolved.push(`${formatCivilDate(birth)} day ${days}: stage past the end`);
          if (!isJourneyComplete(result.age)) {
            unresolved.push(`${formatCivilDate(birth)} day ${days}: past the end, not complete`);
          }
          continue;
        }

        if (!stage) {
          unresolved.push(`${formatCivilDate(birth)} on day ${days}`);
          continue;
        }

        if (isJourneyComplete(result.age)) {
          unresolved.push(`${formatCivilDate(birth)} day ${days}: complete but on a stage`);
        }

        // And the sequence only ever moves forwards: a reader never sees the
        // journey go backwards a stage because a boundary crossed badly.
        const index = order.get(stage.slug)!;
        if (index < previousIndex) {
          wentBackwards.push(`${formatCivilDate(birth)} on day ${days} → ${stage.slug}`);
        }
        previousIndex = index;
      }
    }

    expect(unresolved).toEqual([]);
    expect(wentBackwards).toEqual([]);
  });

  it("resolves nothing before eight weeks, rather than guessing a stage", () => {
    // Under eight weeks a puppy is normally still with its breeder. That is
    // the one age the Journey declines to place, and it degrades to the
    // "not written yet" state rather than to a wrong week.
    const dob = "2026-06-18";
    for (const days of [0, 20, 55]) {
      expect(roadmapStageFor(ageOn(dob, dayAfter(dob, days)))).toBeNull();
      expect(stageFor(ageOn(dob, dayAfter(dob, days)))).toBeNull();
    }
  });

  it("orders the timeline exactly as the journey runs", () => {
    expect(roadmapStages.map((stage) => stage.slug)).toEqual([
      "8-weeks",
      "9-11-weeks",
      "12-weeks",
      "3-months",
      "4-6-months",
      "7-8-months",
      "9-12-months",
      "beyond-the-first-year",
    ]);

    expect(roadmapStages.map((stage) => stage.label)).toEqual([
      "8 weeks",
      "9–11 weeks",
      "12 weeks",
      "3 months",
      "4–6 months",
      "7\u20138 months",
      "9\u201312 months",
      "Beyond the first year",
    ]);

    // And the rendered order matches the declared order, phase headings and all.
    expect(roadmapByPhase().flatMap((group) => group.stages.map((stage) => stage.slug))).toEqual(
      roadmapStages.map((stage) => stage.slug),
    );
  });

  it("groups the roadmap into four phases whose cadence widens in order", () => {
    const groups = roadmapByPhase();
    expect(groups.map((group) => group.phase.id)).toEqual([
      "early-puppy",
      "early-development",
      "adolescence",
      "handoff",
    ]);
    expect(groups.map((group) => group.phase.cadence)).toEqual([
      "weekly",
      "monthly",
      "milestone",
      "handoff",
    ]);

    // Grouping must not drop or duplicate an entry.
    expect(groups.flatMap((group) => group.stages)).toEqual([...roadmapStages]);

    // The premise of the hybrid model, stated as an assertion: each phase's
    // stages span more of a puppy's life than the last phase's did.
    const dob = "2026-06-18";
    const spanOf = (stage: RoadmapStage): number => {
      if (stage.range.unit === "weeks") {
        return stage.range.maxDays - stage.range.minDays + 1;
      }
      const birth = parseCivilDate(dob)!;
      const from = addCalendarMonths(birth, stage.range.minMonths);
      const to =
        stage.range.maxMonths === undefined
          ? civilFromDays(daysFromCivil(birth) + MAX_PLAUSIBLE_DAYS)
          : addCalendarMonths(birth, stage.range.maxMonths + 1);
      return daysBetween(from, to);
    };

    const spans = groups.map((group) => Math.min(...group.stages.map(spanOf)));
    for (let i = 1; i < spans.length; i += 1) {
      expect(spans[i]!).toBeGreaterThan(spans[i - 1]!);
    }
  });

  it("gives every roadmap entry a unique slug and a real phase", () => {
    const slugs = roadmapStages.map((stage) => stage.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const stage of roadmapStages) {
      expect(() => findPhase(stage.phase)).not.toThrow();
      expect(stage.label.trim()).not.toBe("");
    }
  });

  it("offers every phase reading that exists and suits the age", () => {
    // The coming-soon state hands the reader two articles chosen by phase.
    // Both must be real slugs, and an adolescent must not be sent to the
    // guide about a puppy's first month home.
    const source = readFileSync(join(FEATURE_DIR, "../../app/my-puppy/page.tsx"), "utf8");
    const table = source.slice(source.indexOf("const MEANTIME_READING"), source.indexOf("/** A page state"));
    const slugs = [...table.matchAll(/slug: "([a-z0-9-]+)"/g)].map((match) => match[1]);

    expect(slugs.length).toBe(8);
    for (const slug of slugs) {
      expect(articles.some((article) => article.slug === slug)).toBe(true);
    }

    const adolescence = table.slice(table.indexOf("adolescence:"), table.indexOf("maturity:"));
    expect(adolescence).not.toContain("first-30-days");
  });

  it("names the age by its stage, and never twice", () => {
    // The rule: the Journey stage is the primary label, the calculated age is
    // secondary context, and the page never shows two competing answers to
    // "how old is my puppy".
    const cases: [string, string, string, string[]][] = [
      // dob, today, headline phrase, meta row
      ["2026-06-18", "2026-09-05", "11 weeks old", ["Early puppy"]],
      ["2026-06-25", "2026-09-05", "10 weeks old", ["Early puppy"]],
      // Day 91, but the three-month anniversary is day 92 — so the stage is
      // "3 months" and the headline is not. This case was written the other
      // way round before the boundary gate, and was wrong by a day.
      ["2026-06-06", "2026-09-05", "13 weeks old", ["Early development"]],
      // The same puppy a day later, on its anniversary.
      ["2026-06-06", "2026-09-06", "3 months old", ["13 weeks", "Early development"]],
      // Exactly on the anniversary the two agree, so the age is not repeated.
      ["2026-05-05", "2026-09-05", "4 months old", ["Early development"]],
      // A range stage, so the headline is the month the reader is actually in
      // rather than the band the section is named after.
      ["2026-04-20", "2026-09-05", "4 months and 2 weeks old", ["Early development"]],
      // A range names a band, so the headline gives the month we actually know.
      ["2026-01-31", "2026-09-05", "7 months old", ["Adolescence"]],
      ["2025-08-31", "2026-09-05", "1 year old", ["Adolescence"]],
      ["2025-06-04", "2026-09-05", "1 year and 3 months old", ["Handoff"]],
    ];

    for (const [dob, today, phrase, meta] of cases) {
      const age = ageOn(dob, today);
      const roadmap = roadmapStageFor(age);
      expect(roadmap).not.toBeNull();
      expect(journeyHeadlineAge(age, roadmap)).toBe(phrase);
      expect(journeyMeta(age, roadmap)).toEqual(meta);
    }
  });

  it("drops the exact age from the meta row only when it repeats the stage", () => {
    // Weekly stages: headline and stage label say the same thing, so the meta
    // row carries the phase alone.
    const dob = "2026-06-18";
    for (const days of [56, 63, 70, 77, 84, 90]) {
      const age = ageOn(dob, dayAfter(dob, days));
      const roadmap = roadmapStageFor(age)!;
      // The headline states the exact week, so the meta row need not repeat it
      // — including on the three-week stage, where the label is a range.
      expect(journeyHeadlineAge(age, roadmap)).toBe(age.label);
      expect(journeyMeta(age, roadmap)).toEqual(["Early puppy"]);
    }

    // Anywhere the two differ, the exact age is kept — and it is never the
    // same string as the headline, which is what "competing labels" would be.
    // Only a single-month stage or maturity can name an age the exact figure
    // does not already state — a range stage puts the exact figure in the
    // headline, so there is nothing left for the meta row to add.
    // Only a single-month stage can name an age the exact figure does not
    // already state — every range puts the exact figure in the headline.
    for (const [birth, today] of [["2026-06-06", "2026-09-06"]]) {
      const age = ageOn(birth!, today!);
      const roadmap = roadmapStageFor(age)!;
      const meta = journeyMeta(age, roadmap);
      expect(meta).toHaveLength(2);
      expect(meta[0]).toBe(age.exact);
      expect(journeyHeadlineAge(age, roadmap)).not.toContain(age.exact);
    }
  });

  it("phrases every stage so it can finish the sentence it is put in", () => {
    // "Your puppy is …" has to read as English for all thirteen, which is why
    // maturity is phrased rather than suffixed.
    // `stageAgePhrase` is only ever used as a headline for a stage whose label
    // names one exact value — the single-month stages. Everything else falls
    // back to the exact age, which is why "Beyond the first year old" can
    // never reach a reader.
    const singleMonth = roadmapStages.filter(
      (stage) => stage.range.unit === "months" && stage.range.maxMonths === stage.range.minMonths,
    );
    expect(singleMonth.length).toBeGreaterThan(0);
    for (const stage of singleMonth) {
      expect(`Your puppy is ${stageAgePhrase(stage)}`.endsWith("months old")).toBe(true);
    }

    const terminal = findRoadmapStage("beyond-the-first-year")!;
    for (const dob of ["2026-06-18", "2026-01-31"]) {
      const age = ageOn(dob, dayAfter(dob, 400));
      expect(roadmapStageFor(age)!.slug).toBe("beyond-the-first-year");
      expect(journeyHeadlineAge(age, terminal)).not.toContain("Beyond the first year");
      expect(journeyHeadlineAge(age, terminal)).toBe(age.label);
    }
    expect(stageAgePhrase(findRoadmapStage("9-11-weeks")!)).toBe("9–11 weeks old");
    expect(stageAgePhrase(findRoadmapStage("3-months")!)).toBe("3 months old");
    expect(stageAgePhrase(findRoadmapStage("9-12-months")!)).toBe("9\u201312 months old");

    // But a band is never the headline: the reader is told the month they are
    // actually in, and the band stays in the eyebrow.
    const sevenMonths = ageOn("2026-01-31", "2026-09-05");
    const band = roadmapStageFor(sevenMonths)!;
    expect(band.slug).toBe("7-8-months");
    expect(journeyHeadlineAge(sevenMonths, band)).toBe("7 months old");
  });

  it("keeps the exact age available bare and in a sentence", () => {
    // `exact` is the meta-row form and `label` the sentence form. Splitting
    // them is what lets the meta row read "13 weeks" beside a "3 months"
    // headline without stripping a suffix back off.
    for (const [dob, today, exact] of [
      ["2026-09-04", "2026-09-05", "1 day"],
      ["2026-08-29", "2026-09-05", "1 week"],
      ["2026-06-06", "2026-09-05", "13 weeks"],
      ["2026-01-31", "2026-09-05", "7 months"],
      ["2025-09-05", "2026-09-05", "1 year"],
    ]) {
      const age = ageOn(dob!, today!);
      expect(age.exact).toBe(exact);
      expect(age.label).toBe(`${exact} old`);
      expect(age.exact.endsWith("old")).toBe(false);
    }
  });

  it("points every modifier at a stage and a section that exist", () => {
    // Modifiers key on `stageSlug` and `sectionId`. Renaming a stage silently
    // orphans every one of them — the prose still renders, just without the
    // layer that made it personal, which is the kind of failure nobody
    // notices. This is the guard for it.
    const stageSlugs = new Set(stages.map((stage) => stage.slug));
    const sectionIds = new Set(stages.flatMap((stage) => stage.sections.map((s) => s.id)));

    const modifiers = [
      ...sizeGroupModifiers,
      ...breedModifiers,
      ...provinceModifiers,
      ...seasonModifiers,
    ];
    expect(modifiers.length).toBeGreaterThan(0);

    for (const modifier of modifiers) {
      expect(stageSlugs.has(modifier.stageSlug)).toBe(true);
      expect(sectionIds.has(modifier.sectionId)).toBe(true);
    }
  });

  it("keeps each stage materially different from every other", () => {
    // The gate that approved a second stage set the condition: if more than
    // half of a stage's sections are substantively the same as another's, it
    // has not earned its own page and should be merged back. This is that
    // condition, kept as a test so it cannot erode one edit at a time.
    const contentWords = (section: { summary: string; body?: readonly string[]; points?: readonly string[] }) =>
      new Set(
        [section.summary, ...(section.body ?? []), ...(section.points ?? [])]
          .join(" ")
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 3),
      );

    // `red-flags` is exempt, and deliberately. Emergency criteria are a safety
    // floor: a reader must get the same list on every stage page, and
    // rewording it to look different would be worse than repeating it.
    const SAFETY_FLOOR = new Set(["red-flags"]);

    for (const a of stages) {
      for (const b of stages) {
        if (a.slug === b.slug) continue;

        const shared = b.sections.filter((section) => a.sections.some((other) => other.id === section.id));
        let tooSimilar = 0;

        for (const section of shared) {
          if (SAFETY_FLOOR.has(section.id)) continue;
          const counterpart = a.sections.find((other) => other.id === section.id)!;
          const A = contentWords(counterpart);
          const B = contentWords(section);
          const intersection = [...B].filter((word) => A.has(word)).length;
          const overlap = intersection / new Set([...A, ...B]).size;
          expect(overlap, `${a.slug} vs ${b.slug} — ${section.id} is ${(overlap * 100).toFixed(0)}% the same`)
            .toBeLessThanOrEqual(0.5);
          if (overlap > 0.5) tooSimilar += 1;
        }

        expect(tooSimilar).toBeLessThanOrEqual(shared.length / 2);
      }
    }
  });

  it("never treats twelve weeks as three calendar months", () => {
    // The bug this exists to prevent: twelve weeks is 84 days, and three
    // calendar months is never 84 days. Across every date of birth in a leap
    // year the anniversary lands between 89 and 92 days, so the whole
    // 12-week stage (days 84–90) straddles the line rather than sitting past
    // it. Nothing may convert one into the other.
    const start = daysFromCivil({ year: 2024, month: 1, day: 1 });
    let min = Infinity;
    let max = -Infinity;

    for (let offset = 0; offset < 366 * 2; offset += 1) {
      const birth = civilFromDays(start + offset);
      const days = daysBetween(birth, addCalendarMonths(birth, 3));
      min = Math.min(min, days);
      max = Math.max(max, days);
    }

    expect(min).toBeGreaterThanOrEqual(89);
    expect(max).toBeLessThanOrEqual(92);
    expect(min).toBeGreaterThan(84); // twelve weeks, and never equal to it
  });

  it("resolves Ontario's threshold from the calendar, not from the stage", () => {
    // Dates of birth chosen so the three-month anniversary lands at a
    // different day-of-life in each case: a February crossing, 30-day and
    // 31-day months, and a leap year.
    const cases: { dob: string; anniversary: string; daysOfLife: number; note: string }[] = [
      { dob: "2026-05-31", anniversary: "2026-08-31", daysOfLife: 92, note: "31-day months" },
      { dob: "2026-04-30", anniversary: "2026-07-30", daysOfLife: 91, note: "30-day month" },
      { dob: "2025-11-30", anniversary: "2026-02-28", daysOfLife: 90, note: "clamped into February" },
      { dob: "2025-12-01", anniversary: "2026-03-01", daysOfLife: 90, note: "across February" },
      { dob: "2023-11-29", anniversary: "2024-02-29", daysOfLife: 92, note: "leap day" },
      { dob: "2024-11-30", anniversary: "2025-02-28", daysOfLife: 90, note: "leap year, clamped" },
    ];

    for (const { dob, anniversary, daysOfLife, note } of cases) {
      const birth = parseCivilDate(dob)!;
      const expected = parseCivilDate(anniversary)!;

      expect(addCalendarMonths(birth, 3), note).toEqual(expected);
      expect(daysBetween(birth, expected), note).toBe(daysOfLife);
      // Every one of them is past twelve weeks, and none is at it.
      expect(daysOfLife, note).toBeGreaterThan(84);
    }
  });

  it("does not flip Ontario to the reached state merely because the stage did", () => {
    const ontario = { province: "ON" as const };

    for (const dob of ["2026-05-31", "2026-04-30", "2025-11-30", "2023-11-29"]) {
      const birth = parseCivilDate(dob)!;
      const anniversary = addCalendarMonths(birth, 3);
      const anniversaryDay = daysBetween(birth, anniversary);

      // Day 84 is the first day of the 12-week stage. On it, the threshold
      // has not been reached for any of these puppies.
      const onEntry = ageOn(dob, dayAfter(dob, 84));
      expect(roadmapStageFor(onEntry)!.slug).toBe("12-weeks");

      const blockOn = (days: number) => {
        const today = parseCivilDate(dayAfter(dob, days))!;
        const section = resolveStage(twelveWeeks, { ...ontario, birth, today }).find(
          (s) => s.id === "vaccine-questions",
        )!;
        const block = section.provinceBlocks.find((b) => b.kind === "legal")!;
        return block;
      };

      const atEntry = blockOn(84);
      expect(atEntry.heading, `${dob} at day 84`).toContain("reaches the legal threshold on");
      expect(atEntry.heading).toContain(formatCivilDate(anniversary));
      expect(atEntry.body.join(" ")).not.toContain("applies now");

      // The day before the anniversary: still approaching.
      const dayBefore = blockOn(anniversaryDay - 1);
      expect(dayBefore.heading, `${dob} day ${anniversaryDay - 1}`).toContain("reaches the legal threshold on");

      // The anniversary itself, and after it: reached.
      for (const days of [anniversaryDay, anniversaryDay + 1]) {
        const block = blockOn(days);
        expect(block.heading, `${dob} day ${days}`).toContain("is now past the legal threshold");
        expect(block.body.join(" ")).toContain(formatCivilDate(anniversary));
      }
    }
  });

  it("keeps the public stage page silent about which side of the line a reader is on", () => {
    // No date of birth, so no claim. This is the page a crawler and an
    // anonymous reader see, and it must not assert that twelve weeks is three
    // months for anyone.
    for (const stage of stages) {
      const section = resolveStage(stage, { province: "ON" }).find((s) => s.id === "vaccine-questions");
      if (!section) continue;
      const legal = section.provinceBlocks.find((b) => b.kind === "legal");
      if (!legal) continue;

      const text = [legal.heading, ...legal.body].join(" ");
      expect(text).not.toContain("{date}");
      expect(text).not.toContain("is now past");
      // R.R.O. 1990, Reg. 567, s. 1 — retrieved and quoted, 2026-09-06. The
      // anniversary day is inside the duty, which is why the resolver's test
      // is `>=` and why the copy may not say "over three months".
      expect(text).toContain("three months of age or over");
      expect(text).not.toContain("over three months of age");
      // It must not equate the two anywhere.
      expect(text.toLowerCase()).not.toMatch(/twelve weeks is that threshold/);
    }
  });

  it("keeps the legal and guidance distinction, and the sources, intact", () => {
    for (const stage of stages) {
      const blocks = resolveStage(stage, { province: "ON" }).flatMap((s) => s.provinceBlocks);
      expect(blocks.every((b) => b.kind === "legal")).toBe(true);

      const bc = resolveStage(stage, { province: "BC" }).flatMap((s) => s.provinceBlocks);
      expect(bc.every((b) => b.kind === "guidance")).toBe(true);
    }

    // The Ontario source is still attached wherever the block is shown.
    const sources = resolveSources(twelveWeeks, { province: "ON" });
    expect(sources.some((s) => s.url === "https://www.ontario.ca/page/rabies-pets")).toBe(true);
  });

  it("resolves the threshold from civil dates, not from a clock", () => {
    // Same guarantee as the rest of the engine: the process time zone cannot
    // change which side of a legal threshold a reader is told they are on.
    const birth = parseCivilDate("2026-05-31")!;
    const today = parseCivilDate("2026-08-31")!;
    const original = process.env.TZ;

    for (const tz of ["UTC", "America/St_Johns", "America/Vancouver", "Pacific/Auckland"]) {
      process.env.TZ = tz;
      const block = resolveStage(twelveWeeks, { province: "ON", birth, today })
        .find((s) => s.id === "vaccine-questions")!
        .provinceBlocks.find((b) => b.kind === "legal")!;
      expect(block.heading, tz).toContain("is now past the legal threshold");
    }

    process.env.TZ = original;
  });

  it("names only the province whose regulation was actually read", () => {
    // The 8-week stage is the one place a minimum-age rule is relevant, and
    // the one place it is easiest to over-claim. Quebec is named because the
    // regulation was read; no other province is asserted either way, and the
    // rule is about separation from the mother rather than about sale.
    const quebec = provinceModifiers.filter(
      (m) => m.stageSlug === "8-weeks" && m.provinces.includes("QC"),
    );
    expect(quebec).toHaveLength(1);

    const block = quebec[0]!;
    expect(block.kind).toBe("legal");
    expect(block.provinces).toEqual(["QC"]);
    expect(block.sources.some((source) => source.url.includes("legisquebec.gouv.qc.ca"))).toBe(true);

    const text = [block.heading, ...block.body].join(" ");
    expect(text).toContain("may not be separated from their mother before the age of 8 weeks");
    // It must not become a national claim, or a claim about selling.
    expect(text).not.toMatch(/\bin Canada\b/i);
    expect(text).not.toMatch(/across Canada|every province|Canadian law/i);
    expect(text).toContain("Other provinces are not claimed");

    // And no other stage makes a minimum-age claim at all.
    const others = provinceModifiers.filter((m) => m.stageSlug !== "8-weeks");
    for (const modifier of others) {
      expect(modifier.body.join(" ")).not.toContain("separated from their mother");
    }
  });

  it("does not assume the reader brought a puppy home today", () => {
    // The framing constraint of this stage: some puppies arrive later, some
    // arrived a fortnight ago, and a rescue puppy may have an estimated
    // birthday. The page is written around the age, not a moving day.
    const prose = eightWeeks.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    expect(prose).toMatch(/if (your puppy )?has just (come home|arrived)|If yours has just arrived/i);
    expect(prose).not.toMatch(/today you brought|you brought your puppy home today/i);
    expect(prose).toMatch(/some arrive later|rescue puppy may have an estimated birthday/i);
  });

  it("keeps the arrival stage lighter on training than the stage after it", () => {
    // Deliberate: eight weeks is not an obedience programme, and the Journey
    // should be able to show that rather than assert it.
    const trainingOf = (stage: (typeof stages)[number]) => {
      const section = stage.sections.find((s) => s.id === "training")!;
      return [...(section.body ?? []), ...(section.points ?? [])].join(" ").split(/\s+/).length;
    };
    expect(trainingOf(eightWeeks)).toBeLessThan(trainingOf(nineToElevenWeeks));

    const prose = eightWeeks.sections.map((s) => [s.summary, ...(s.body ?? []), ...(s.points ?? [])].join(" ")).join(" ");
    // No correction-based or dominance language anywhere on the arrival page.
    expect(prose).not.toMatch(/\bdominan|\balpha\b|\bpack leader\b|\bpunish(?!ing an accident)/i);
    expect(prose).not.toMatch(/scold|smack|choke chain|prong/i);
  });

  it("omits the sections that do not belong at eight weeks", () => {
    // Teething has not started and there is no walking to do. Leaving them out
    // is part of what makes this a different page rather than a shorter one.
    const ids = eightWeeks.sections.map((section) => section.id);
    expect(ids).not.toContain("teething");
    expect(ids).not.toContain("exercise");
    // Arrival and the records audit belong to this stage alone.
    for (const id of ["first-days", "paperwork"] as const) {
      expect(ids).toContain(id);
      for (const other of stages.filter((stage) => stage.slug !== "8-weeks")) {
        expect(other.sections.some((section) => section.id === id)).toBe(false);
      }
    }

    // House-training is shared with the 3-month stage on purpose — starting
    // from nothing and extending an uneven routine are different problems.
    // The differentiation guard is what keeps them different; this only
    // records that the sharing is deliberate.
    expect(ids).toContain("toilet-training");
    expect(threeMonths.sections.some((section) => section.id === "toilet-training")).toBe(true);
  });

  it("never claims more completed months than the puppy has lived", () => {
    // The 12-week stage ends on a fixed day and the third calendar month does
    // not: the anniversary lands between day 89 and day 92, and for most dates
    // of birth it falls after day 90. So a reader can enter the 3-month stage
    // before turning three months old. That is a content-stage assignment; the
    // headline must not turn it into an age claim.
    const start = daysFromCivil({ year: 2024, month: 1, day: 1 });
    const overstated: string[] = [];

    for (let offset = 0; offset < 366 * 2; offset += 1) {
      const birth = civilFromDays(start + offset);
      const birthDay = daysFromCivil(birth);

      for (let days = 56; days <= 400; days += 1) {
        const result = resolveAge(birth, civilFromDays(birthDay + days));
        if (!result.ok) continue;
        const stage = roadmapStageFor(result.age);
        if (!stage || stage.range.unit !== "months") continue;

        const headline = journeyHeadlineAge(result.age, stage);
        // If the headline names months, the puppy must have completed them.
        const claimed = /^(\d+)(?:–\d+)? months old$/.exec(headline);
        if (claimed && result.age.months < Number(claimed[1])) {
          overstated.push(`${formatCivilDate(birth)} day ${days}: "${headline}" at ${result.age.months} months`);
        }
      }
    }

    expect(overstated).toEqual([]);
  });

  it("hands over from 12 weeks to 3 months on day 91, whatever the anniversary", () => {
    // A fixed handover, so every public page means one stable thing. The four
    // dates of birth below put the three-month anniversary on days 90, 91 and
    // 92 respectively — February, a 30-day month, a 31-day month and a leap
    // year — and the stage boundary does not move.
    const cases: { dob: string; anniversary: number; note: string }[] = [
      { dob: "2025-11-30", anniversary: 90, note: "clamped into February" },
      { dob: "2026-04-30", anniversary: 91, note: "30-day month" },
      { dob: "2026-05-31", anniversary: 92, note: "31-day months" },
      { dob: "2023-11-29", anniversary: 92, note: "leap year" },
    ];

    for (const { dob, anniversary, note } of cases) {
      const birth = parseCivilDate(dob)!;
      expect(daysBetween(birth, addCalendarMonths(birth, 3)), note).toBe(anniversary);

      expect(slugAtDay(dob, 90), note).toBe("12-weeks");
      expect(slugAtDay(dob, 91), note).toBe("3-months");

      // Both sides of the handover now have a page, so the canonical moves
      // with the stage rather than falling back to the hub.
      expect(stageFor(ageOn(dob, dayAfter(dob, 90)))?.slug, note).toBe("12-weeks");
      expect(stageFor(ageOn(dob, dayAfter(dob, 91)))?.slug, note).toBe("3-months");

      // And the headline tracks the calendar rather than the stage.
      const onDay91 = ageOn(dob, dayAfter(dob, 91));
      const stage91 = roadmapStageFor(onDay91)!;
      const headline91 = journeyHeadlineAge(onDay91, stage91);

      if (anniversary <= 91) {
        expect(headline91, `${dob} (${note})`).toBe("3 months old");
      } else {
        // Not three months old yet — say the week instead.
        expect(headline91, `${dob} (${note})`).toBe("13 weeks old");
        expect(onDay91.months, note).toBe(2);
      }

      // Once the reader is on a month stage *and* past the anniversary, both
      // agree. Where the anniversary lands on day 89 or 90 the reader is still
      // on the 12-week stage that day, which the next test covers.
      const settled = Math.max(anniversary, 91);
      const onSettled = ageOn(dob, dayAfter(dob, settled));
      expect(journeyHeadlineAge(onSettled, roadmapStageFor(onSettled)!), note).toBe("3 months old");
    }
  });

  it("reaches three months on the calendar even while still on the 12-week stage", () => {
    // The other direction, and the one that proves stage assignment and
    // calendar age are independent: an anniversary at day 89 or 90 arrives
    // while the reader is still on the 12-week stage. The headline stays on
    // weeks, which is true, and nothing is claimed either way.
    const dob = "2025-11-30";
    const onDay90 = ageOn(dob, dayAfter(dob, 90));
    expect(roadmapStageFor(onDay90)!.slug).toBe("12-weeks");
    expect(onDay90.months).toBe(3);
    expect(journeyHeadlineAge(onDay90, roadmapStageFor(onDay90)!)).toBe("12 weeks old");
  });

  it("keeps the Ontario legal threshold independent of stage assignment", () => {
    // No legal state may be triggered by entering a content stage. The proof:
    // the threshold flips *inside* the 12-week stage for one date of birth and
    // has *not* flipped on day 91 of the 3-month stage for another.
    const legalOn = (dob: string, days: number) => {
      const birth = parseCivilDate(dob)!;
      const today = civilFromDays(daysFromCivil(birth) + days);
      const section = resolveStage(twelveWeeks, { province: "ON", birth, today }).find(
        (s) => s.id === "vaccine-questions",
      )!;
      return section.provinceBlocks.find((b) => b.kind === "legal")!;
    };

    // Anniversary on day 90: reached while still on the 12-week stage.
    expect(roadmapStageFor(ageOn("2025-11-30", dayAfter("2025-11-30", 90)))!.slug).toBe("12-weeks");
    expect(legalOn("2025-11-30", 90).heading).toContain("is now past the legal threshold");
    expect(legalOn("2025-11-30", 89).heading).toContain("reaches the legal threshold on");

    // Anniversary on day 92: still approaching on day 91, by which point the
    // Journey has already moved the reader to the 3-month stage.
    expect(roadmapStageFor(ageOn("2026-05-31", dayAfter("2026-05-31", 91)))!.slug).toBe("3-months");
    expect(legalOn("2026-05-31", 91).heading).toContain("reaches the legal threshold on");
    expect(legalOn("2026-05-31", 92).heading).toContain("is now past the legal threshold");
  });

  it("puts the anniversary day itself inside the Ontario duty", () => {
    // R.R.O. 1990, Reg. 567, s. 1, retrieved 2026-09-06: "a cat, dog or ferret
    // three months of age or over". "Or over" is inclusive, so the third
    // monthly anniversary is the first day the duty applies — not the day
    // after it. That is why the resolver tests `today >= anniversary`, and it
    // is the one-day question the copy used to get wrong by saying "over
    // three months of age".
    //
    // Every date of birth below is checked on the day before the anniversary,
    // on it, and the day after, with the anniversary computed on the calendar
    // rather than as a day count. Leap-day and month-end births are included
    // because they are where the clamp does the work.
    const blockOn = (dob: string, today: ReturnType<typeof civilFromDays>) => {
      const birth = parseCivilDate(dob)!;
      const result = resolveAge(birth, today);
      if (!result.ok) throw new Error(`${dob} did not resolve`);
      // Whichever stage the reader is actually on — the point is that the
      // legal answer does not depend on which one that is.
      const stage = stageFor(result.age)!;
      const section = resolveStage(stage, { province: "ON", birth, today }).find((s) =>
        s.provinceBlocks.some((b) => b.kind === "legal"),
      );
      return section?.provinceBlocks.find((b) => b.kind === "legal") ?? null;
    };

    for (const dob of [
      "2026-06-18", // ordinary
      "2024-02-29", // leap day — anniversary clamps to 29 May
      "2025-11-30", // month-end, short target month
      "2026-05-31", // month-end, 31 -> 31
      "2025-12-31", // year boundary
      "2026-01-31", // 31 January -> 30 April
    ]) {
      const birth = parseCivilDate(dob)!;
      const anniversary = addCalendarMonths(birth, 3);
      const anniversaryDay = daysFromCivil(anniversary);

      const dayBefore = blockOn(dob, civilFromDays(anniversaryDay - 1));
      const onDay = blockOn(dob, anniversary);
      const dayAfterIt = blockOn(dob, civilFromDays(anniversaryDay + 1));

      expect(dayBefore?.heading, `${dob} day before`).toContain("reaches the legal threshold on");
      expect(onDay?.heading, `${dob} on the anniversary`).toContain("is now past the legal threshold");
      expect(dayAfterIt?.heading, `${dob} day after`).toContain("is now past the legal threshold");

      // The date named is the real calendar anniversary, never a day count.
      expect(dayBefore?.body.join(" "), dob).toContain(formatCivilDate(anniversary));
      // And it is never 84 days, which is what twelve weeks actually is.
      expect(anniversaryDay - daysFromCivil(birth)).not.toBe(84);
      expect(anniversaryDay - daysFromCivil(birth)).toBeGreaterThanOrEqual(89);
      expect(anniversaryDay - daysFromCivil(birth)).toBeLessThanOrEqual(92);

      // The statutory wording, on both sides of the line.
      for (const block of [dayBefore, onDay]) {
        expect(block?.body.join(" "), dob).toContain("three months of age or over");
        expect(block?.body.join(" "), dob).not.toContain("over three months of age");
      }
    }
  });

  it("attributes the reimmunisation shape to the right source", () => {
    // s. 3 with s. 6 (i) and (l) is the duty: reimmunise by the date on the
    // certificate, and that date carries the product monograph's interval. The
    // regulation names no year and no one-to-three-year cycle — that is the
    // province's plain-language summary, and the fines warning is too. Both
    // must read as guidance rather than as statute.
    const legal = provinceModifiers.filter((m) => m.provinces.includes("ON") && m.kind === "legal");
    expect(legal.length).toBeGreaterThan(0);

    for (const block of legal) {
      const variants = [
        block.body,
        block.ageThreshold?.before.body ?? [],
        block.ageThreshold?.reached.body ?? [],
      ].filter((b) => b.length > 0);

      for (const body of variants) {
        const prose = body.join(" ");
        expect(prose, block.stageSlug).toMatch(/certificate of immunization|certificate for the date/i);
        // The summary shape is never asserted as the regulation's own words.
        if (/one to three years/i.test(prose)) {
          expect(prose, `${block.stageSlug} states the interval as statute`).toMatch(
            /Ontario's guidance summarises/i,
          );
        }
        if (/fined/i.test(prose)) {
          expect(prose, `${block.stageSlug} states the fine as statute`).toMatch(
            /The province warns/i,
          );
        }
        expect(prose, block.stageSlug).not.toMatch(/fines for non-compliance/i);
      }

      // Both sources travel with the claim.
      expect(block.sources.some((s) => s.url.includes("/laws/regulation/900567")), block.stageSlug).toBe(true);
      expect(block.sources.some((s) => s.url.includes("/page/rabies-pets")), block.stageSlug).toBe(true);
    }
  });

  it("gives every public stage page one meaning that does not depend on a reader", () => {
    // A public page has no date of birth, so its span must be expressible
    // without one. Weekly stages are day ranges; monthly stages are whole
    // completed months. Neither is a function of who is reading.
    for (const stage of roadmapStages) {
      if (stage.range.unit === "weeks") {
        expect(Number.isInteger(stage.range.minDays)).toBe(true);
        expect(Number.isInteger(stage.range.maxDays)).toBe(true);
      } else {
        expect(Number.isInteger(stage.range.minMonths)).toBe(true);
        expect(stage.range.maxMonths === undefined || Number.isInteger(stage.range.maxMonths)).toBe(true);
      }
    }

    // And resolution is a pure function of (days, months) — it takes no birth
    // date, so it cannot make a stage boundary vary by reader.
    expect(roadmapStageFor.length).toBe(1);
  });

  it("makes no permanent-tooth claim before the age the source supports", () => {
    // Merck places the appearance of the permanent teeth at around four to
    // five months, complete by about seven. Three stages sit entirely before
    // that, so none of them may describe eruption, replacement or teething as
    // under way — which three of them previously did.
    // Four to five months is deliberately absent: it is the stage Merck's
    // timing actually supports, and it says so.
    const early = [eightWeeks, nineToElevenWeeks, twelveWeeks, threeMonths];
    const forbidden = [
      /adult teeth (start|come|are coming) (moving )?(through|in)/i,
      /baby teeth start being replaced/i,
      /permanent teeth (are|start) (erupting|coming through|appearing)/i,
      /teething (moves|is under way|has (started|begun))/i,
      /chewing (peaks|is at its peak)/i,
      /at (or near )?its heaviest/i,
    ];

    for (const stage of early) {
      const prose = [
        stage.deck,
        stage.metaDescription,
        ...stage.sections.flatMap((section) => [
          section.title,
          section.summary,
          ...(section.body ?? []),
          ...(section.points ?? []),
        ]),
      ].join(" ");

      for (const pattern of forbidden) {
        expect(pattern.test(prose), `${stage.slug} matches ${pattern}`).toBe(false);
      }
    }
  });

  it("cites Merck wherever eruption timing is named", () => {
    // Two stages now state when the permanent teeth arrive, in order to say
    // that it has not happened yet. A claim about timing carries its source.
    const MERCK = "merckvetmanual.com";
    for (const stage of [nineToElevenWeeks, twelveWeeks, threeMonths, fourToSixMonths]) {
      const prose = stage.sections
        .flatMap((section) => [...(section.body ?? []), ...(section.points ?? [])])
        .join(" ");
      if (/four to five months|Merck/i.test(prose)) {
        expect(
          stage.sources.some((source) => source.url.includes(MERCK)),
          `${stage.slug} names eruption timing without citing Merck`,
        ).toBe(true);
      }
    }

    // And the register records the source rather than an open question.
    for (const stage of [nineToElevenWeeks, twelveWeeks, threeMonths, fourToSixMonths]) {
      expect(stage.needsVerification.join(" ")).toMatch(/Merck/);
    }
  });

  it("resolves months four, five and six to one shared content stage", () => {
    const dob = "2026-06-18";

    // Every day of the fourth, fifth and sixth months, for a date of birth
    // whose anniversaries are unremarkable.
    for (let days = 122; days <= 212; days += 1) {
      expect(slugAtDay(dob, days)).toBe("4-6-months");
    }

    // The neighbours are unmoved.
    expect(slugAtDay(dob, 121)).toBe("3-months");
    expect(slugAtDay(dob, 214)).toBe("7-8-months");

    // And on the anniversaries themselves, which is what actually moves it.
    expect(slugOn(dob, "2026-10-17")).toBe("3-months");
    expect(slugOn(dob, "2026-10-18")).toBe("4-6-months"); // 4 months
    expect(slugOn(dob, "2026-11-18")).toBe("4-6-months"); // 5 months
    expect(slugOn(dob, "2026-12-18")).toBe("4-6-months"); // 6 months
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months"); // 7 months
  });

  it("keeps the exact month in the headline across the shared 4–5 stage", () => {
    // The point of the merge: one editorial unit, two precise ages.
    const dob = "2026-06-18";
    const cases: [string, number, string][] = [
      ["2026-10-18", 4, "4 months old"],
      // Four weeks past the anniversary the label drops the weeks clause, by
      // design — "4 months and 4 weeks" is a worse way of saying five months
      // is nearly here.
      ["2026-11-17", 4, "4 months old"],
      ["2026-11-18", 5, "5 months old"],
      ["2026-12-17", 5, "5 months old"],
    ];

    for (const [today, months, headline] of cases) {
      const age = ageOn(dob, today);
      const stage = roadmapStageFor(age)!;
      expect(stage.slug, today).toBe("4-6-months");
      expect(age.months, today).toBe(months);
      expect(journeyHeadlineAge(age, stage), today).toBe(headline);
      // Never the band.
      expect(journeyHeadlineAge(age, stage)).not.toContain("4–5");
    }
  });

  it("leaves no gap or overlap where the two months used to meet", () => {
    // The merged range must tile exactly what the two separate ranges did.
    const merged = findRoadmapStage("4-6-months")!;
    if (merged.range.unit !== "months") {
      throw new Error("4-6-months is not a month range");
    }
    expect(merged.range.minMonths).toBe(4);
    expect(merged.range.maxMonths).toBe(6);

    for (const slug of ["4-months", "5-months", "6-months"]) {
      expect(findRoadmapStage(slug), slug).toBeNull();
    }
    expect(findRoadmapStage("3-months")).not.toBeNull();

    // Early development is two entries, in order.
    const earlyDevelopment = roadmapStages.filter((stage) => stage.phase === "early-development");
    expect(earlyDevelopment.map((stage) => stage.slug)).toEqual(["3-months", "4-6-months"]);
  });

  it("gives the merged stage a route, and later adolescence none yet", () => {
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    const puppyRoutes = readdirSync(join(appDir, "puppy"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const slug of ["4-6-months", "7-8-months", "9-12-months", "beyond-the-first-year"]) {
      expect(puppyRoutes).toContain(slug);
    }
    // The names that were merged away, and the one that was renamed.
    for (const slug of ["4-months", "5-months", "6-months", "9-10-months", "11-12-months", "young-adult"]) {
      expect(puppyRoutes).not.toContain(slug);
    }
    expect(puppyRoutes).toHaveLength(8);
  });

  it("links no reader at a path that only redirects", async () => {
    // Found the hard way: `/puppy` went on linking `/puppy/11-weeks` after the
    // rename, so the one link offered to an anonymous reader was a 308. A
    // redirect source must not appear as an href anywhere in the feature or
    // its routes.
    const { default: config } = (await import("../../../next.config")) as {
      default: { redirects?: () => Promise<{ source: string }[]> };
    };
    const retired = (await config.redirects!()).map((rule) => rule.source);
    expect(retired.length).toBeGreaterThan(0);

    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    const files = [
      join(FEATURE_DIR, "components/journey-timeline.tsx"),
      join(FEATURE_DIR, "components/stage-view.tsx"),
      join(appDir, "puppy/page.tsx"),
      join(appDir, "my-puppy/page.tsx"),
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const path of retired) {
        // Not as an href, and not as a bare literal either — the hrefs here
        // are built from slugs, so a retired path should not appear at all.
        expect(source.includes(`"${path}"`), `${file} mentions ${path}`).toBe(false);
        expect(source.includes(`'${path}'`), `${file} mentions ${path}`).toBe(false);
      }
    }
  });

  it("does not tell the reader a stale number of finished stages", () => {
    // The count is derived rather than written down, because it was wrong for
    // three shipped stages before anyone noticed.
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    for (const file of [
      join(FEATURE_DIR, "components/journey-timeline.tsx"),
      join(appDir, "puppy/page.tsx"),
      join(appDir, "my-puppy/page.tsx"),
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/One stage is written/);
      expect(source).not.toMatch(/The 11-week stage is (written|finished|the only)/);
    }
  });

  it("introduces no adolescence before the research puts it there", () => {
    // Asher et al. place the adolescent trainability dip at around eight
    // months and treat five months as pre-adolescence. Nothing at or before
    // 4–6 months may frame itself as adolescence, or describe the recall
    // collapse that belongs to it — and no stage may use "second fear period"
    // language, for which the gate found no peer-reviewed basis at any age.
    const beforeAdolescence = [eightWeeks, nineToElevenWeeks, twelveWeeks, threeMonths, fourToSixMonths];

    // Dominance framing is banned everywhere, adolescence included — except
    // where a stage names it as a misreading and rejects it, which is exactly
    // what the adolescence page opens by doing.
    for (const stage of stages) {
      const prose = stage.sections
        .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
        .join(" ");
      expect(prose, stage.slug).not.toMatch(/\balpha (?:dog|role)\b|pack leader/i);

      const sentences = prose.split(/(?<=[.?!])\s+/);
      for (const [index, sentence] of sentences.entries()) {
        if (!/\bdominan/i.test(sentence)) continue;
        // Either the sentence itself rejects it, or the next one does.
        const window = `${sentence} ${sentences[index + 1] ?? ""}`;
        expect(
          /none of those|\bnot\b|misread|mistake|wrong|rather than/i.test(window),
          `${stage.slug} uses dominance framing unrejected: ${sentence}`,
        ).toBe(true);
      }
    }

    for (const stage of beforeAdolescence) {
      const prose = [
        stage.deck,
        ...stage.sections.flatMap((section) => [
          section.summary,
          ...(section.body ?? []),
          ...(section.points ?? []),
        ]),
      ].join(" ");

      // Adolescence may be named as something ahead — "what arrives next is
      // adolescence" is fine — but never as something happening now.
      expect(prose).not.toMatch(/adolescence (?:has|is now|is already) (?:begun|started|here|arrived)/i);
      expect(prose).not.toMatch(/(?:your |the )?(?:puppy|dog) is (?:now )?(?:in |entering |an? )adolescen/i);
      expect(prose).not.toMatch(/this (?:is|stage is) adolescence/i);
      expect(prose).not.toMatch(/teenage (?:phase|dog|stage)/i);
      expect(prose).not.toMatch(/recall (?:will )?collapse/i);

      // "Stubborn" may appear only where it is named as a misreading and
      // rejected — which is the point the 3-month stage makes. It may never
      // be the page's own description of the dog.
      for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
        if (!/stubborn/i.test(sentence)) continue;
        expect(
          /misread|mistake|wrong|is not|not being|rather than/i.test(sentence),
          `${stage.slug} calls a dog stubborn without rejecting it: ${sentence}`,
        ).toBe(true);
      }
    }

    // And nowhere in the Journey at all.
    for (const stage of stages) {
      const all = JSON.stringify(stage.sections);
      expect(all).not.toMatch(/second fear period/i);
      expect(all).not.toMatch(/fear imprint/i);
    }
  });

  it("gives no universal neutering age, and splits it the way the guidance does", () => {
    const section = fourToSixMonths.sections.find((s) => s.id === "neutering")!;
    const prose = [section.summary, ...(section.body ?? []), ...(section.points ?? [])].join(" ");

    // The split, and the source, are both stated.
    expect(prose).toMatch(/45 pounds|45 lb/i);
    expect(prose).toMatch(/American Animal Hospital Association|AAHA/);
    expect(fourToSixMonths.sources.some((s) => s.url.includes("canine-life-stage"))).toBe(true);

    // No single age is offered to everyone, and nothing is booked.
    expect(prose).not.toMatch(/all (?:dogs|puppies) should be (?:neutered|spayed)/i);
    expect(prose).not.toMatch(/(?:neuter|spay) (?:your (?:dog|puppy) )?at (?:four|five|4|5) months/i);
    expect(prose).toMatch(/no universal age|depends on size|depends on projected adult/i);

    // Size decides it, and every size group says something different.
    const bySize = sizeGroupModifiers.filter(
      (m) => m.stageSlug === "4-6-months" && m.sectionId === "neutering",
    );
    expect(bySize.length).toBeGreaterThanOrEqual(3);
    const bodies = bySize.map((m) => m.body.join(" "));
    expect(new Set(bodies).size).toBe(bodies.length);
    // Small dogs get a decision now; large ones get months.
    expect(bodies.find((b) => b.includes("toy-breed") || b.includes("Small-breed") || b.includes("small-breed"))).toMatch(
      /five to six months|around six months/i,
    );
    expect(bodies.find((b) => b.includes("giant-breed"))).toMatch(/nine and fifteen|growth is complete/i);
  });

  it("does not infer that the vaccination series is finished", () => {
    const section = fourToSixMonths.sections.find((s) => s.id === "vaccine-questions")!;
    const prose = [section.summary, ...(section.body ?? []), ...(section.points ?? [])].join(" ");

    expect(prose).toMatch(/confirm|Is the primary series complete/i);
    expect(prose).not.toMatch(/is now fully vaccinated|your (?:puppy|dog) is fully vaccinated/i);
    expect(prose).not.toMatch(/by (?:four|five) months the series is (?:complete|finished)/i);
    // Still no schedule.
    expect(prose).not.toMatch(/every (?:two|three|four) weeks/i);
  });

  it("keeps the 26-week advice conditional, and never a universal dose", () => {
    // WSAVA advises *considering* revaccination at or after 26 weeks instead
    // of waiting for 12 to 16 months, to shorten the window for the minority
    // still carrying interfering maternal antibody at 16+ weeks. It replaces
    // an appointment rather than adding one, clinics differ, and there is a
    // serology alternative. All four must survive an edit.
    const section = fourToSixMonths.sections.find((s) => s.id === "vaccine-questions")!;
    const prose = [section.summary, ...(section.body ?? []), ...(section.points ?? [])].join(" ");

    expect(prose).toMatch(/26 weeks/);
    expect(prose).toMatch(/World Small Animal Veterinary Association/);
    expect(prose).toMatch(/as an alternative to waiting|instead of|rather than waiting/i);
    expect(prose).toMatch(/not as an addition to it|replaces an appointment/i);
    expect(prose).toMatch(/minority/i);
    expect(prose).toMatch(/replaces an appointment rather than adding one/i);
    expect(prose).toMatch(/practice genuinely differs|clinic that does not raise it/i);
    expect(prose).toMatch(/serolog/i);
    expect(prose).toMatch(/American Animal Hospital Association still frames it/i);

    // And never a universal instruction.
    expect(prose).not.toMatch(/every (?:puppy|dog) needs? (?:another |an? )?vaccin/i);
    expect(prose).not.toMatch(/(?:a|the) (?:six|6)[- ]month (?:vaccine|booster) is (?:due|required)/i);
    expect(prose).not.toMatch(/must be revaccinated at (?:six|6) months/i);

    // "Extra vaccine" may appear only where the page denies that is what this
    // is — which is the whole point of the section.
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      if (!/extra vaccine/i.test(sentence)) continue;
      expect(/\bnot\b|\bnor\b/i.test(sentence), `unqualified "extra vaccine": ${sentence}`).toBe(true);
    }

    expect(fourToSixMonths.sources.some((s) => s.url.includes("wsava.org"))).toBe(true);
  });

  it("makes no universal claim about neutering age or adult food", () => {
    const prose = fourToSixMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    // Neutering: a decision, split by size, never one age for everyone.
    expect(prose).toMatch(/no universal age/i);
    expect(prose).not.toMatch(/all (?:dogs|puppies) should be (?:neutered|spayed)/i);
    expect(prose).not.toMatch(/(?:neuter|spay) (?:your (?:dog|puppy) )?at (?:six|6) months\b(?! for)/i);

    // Adult food: the transition may only ever be ruled out, never advised.
    expect(prose).not.toMatch(/adult food at (?:six|6) months/i);
    expect(prose).toMatch(/too early to move to adult food/i);
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      if (!/(?:switch|move|change) to adult (?:food|diet)/i.test(sentence)) continue;
      expect(
        /too early|not yet|depends on|rather than/i.test(sentence),
        `unqualified adult-food transition: ${sentence}`,
      ).toBe(true);
    }

    // Teething does not end here.
    expect(prose).not.toMatch(/teething (?:ends|finishes|is over) at (?:six|6) months/i);
    expect(prose).toMatch(/progressing towards completion|by about seven months/i);
  });

  it("leaves adolescence to the stage that owns it", () => {
    const prose = fourToSixMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    // It may say adolescence is coming. It may not say it is here, and it may
    // not take the 7–8 month stage's material.
    expect(prose).toMatch(/adolescence is further off|still ahead/i);
    expect(prose).not.toMatch(/adolescence (?:has|is now|is already) (?:begun|started|here|arrived)/i);
    expect(prose).not.toMatch(/(?:your |the )?(?:puppy|dog) is (?:now )?(?:in |entering |an? )adolescen/i);
    expect(prose).not.toMatch(/second fear period|fear imprint/i);
    expect(prose).not.toMatch(/recall (?:will )?(?:suddenly )?(?:stops? working|collapse)/i);

    // The eight-month figure may be cited as what is ahead, and must stay
    // attributed rather than becoming this stage's own claim.
    expect(prose).toMatch(/around eight months/i);
    expect(fourToSixMonths.sources.some((s) => s.url.includes("PMC7280042"))).toBe(true);
  });

  it("resolves months seven and eight to the adolescence stage", () => {
    // Born 18 June, so the seventh anniversary is day 214 and the ninth is
    // day 273 — day counts and calendar anniversaries do not line up, which
    // is the whole reason months are resolved on the calendar.
    const dob = "2026-06-18";
    for (let days = 214; days <= 272; days += 1) {
      expect(slugAtDay(dob, days)).toBe("7-8-months");
    }
    expect(slugAtDay(dob, 213)).toBe("4-6-months");
    expect(slugAtDay(dob, 273)).toBe("9-12-months");

    // On the anniversaries, which is what actually moves it.
    expect(slugOn(dob, "2027-01-17")).toBe("4-6-months");
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months"); // 7 months
    expect(slugOn(dob, "2027-02-18")).toBe("7-8-months"); // 8 months
    expect(slugOn(dob, "2027-03-18")).toBe("9-12-months"); // 9 months
  });

  it("keeps the exact month in the headline across adolescence", () => {
    const dob = "2026-06-18";
    for (const [today, months, headline] of [
      ["2027-01-18", 7, "7 months old"],
      ["2027-02-18", 8, "8 months old"],
    ] as const) {
      const age = ageOn(dob, today);
      const stage = roadmapStageFor(age)!;
      expect(stage.slug).toBe("7-8-months");
      expect(age.months).toBe(months);
      expect(journeyHeadlineAge(age, stage)).toBe(headline);
      expect(journeyHeadlineAge(age, stage)).not.toContain("7–8");
      expect(journeyMeta(age, stage)).toEqual(["Adolescence"]);
    }
  });

  it("states the adolescence evidence as a finding, never as a universal age", () => {
    const prose = sevenToEightMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    // Attributed, hedged, and limited.
    expect(prose).toMatch(/Asher/);
    expect(prose).toMatch(/approximately eight months|around adolescence/i);
    expect(prose).toMatch(/guide dogs/i);
    expect(prose).toMatch(/German shepherds?|Labrador/i);
    expect(sevenToEightMonths.sources.some((s) => s.url.includes("PMC7280042"))).toBe(true);

    // Never a schedule.
    expect(prose).not.toMatch(/adolescence (?:begins|starts) at (?:seven|eight|7|8) months/i);
    expect(prose).not.toMatch(/every dog (?:becomes|is) adolescent/i);
    expect(prose).not.toMatch(/all dogs (?:lose|will lose) (?:their )?recall/i);
    expect(prose).not.toMatch(/by (?:seven|eight) months (?:every|all) dogs?/i);

    // The carer-specific finding is the page's spine and must stay.
    expect(prose).toMatch(/stranger/i);
    expect(prose).toMatch(/trainers? rated|professional trainers/i);
  });

  it("promises no recall reliability and no universal maturity", () => {
    const prose = sevenToEightMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    expect(prose).not.toMatch(/reliable (?:off[- ]l(?:ea|)sh|recall) by/i);
    expect(prose).not.toMatch(/(?:will|should) have (?:a )?reliable recall/i);
    expect(prose).toMatch(/Nothing on this list produces a reliable dog/i);

    // Sexual maturity is never given a universal age, and is separated from
    // adolescence explicitly.
    expect(prose).not.toMatch(/(?:sexually mature|sexual maturity) (?:at|by) \d/i);
    expect(prose).toMatch(/adolescence and sexual maturity are not the same/i);

    // No adult-food transition, and physical maturity is not claimed.
    expect(prose).not.toMatch(/adult food at (?:seven|eight|8|7) months/i);
    expect(prose).toMatch(/skeletal maturity rather than a number of months/i);
    expect(prose).toMatch(/Physical maturity has not arrived/i);

    // And the teeth section stays short — the hard part is over.
    const teeth = sevenToEightMonths.sections.find((s) => s.id === "teething")!;
    const teethWords = [...(teeth.body ?? []), ...(teeth.points ?? [])].join(" ").split(/\s+/).length;
    const fourToSix = fourToSixMonths.sections.find((s) => s.id === "teething")!;
    const fourToSixWords = [...(fourToSix.body ?? []), ...(fourToSix.points ?? [])].join(" ").split(/\s+/).length;
    expect(teethWords).toBeLessThan(fourToSixWords / 2);
  });

  it("owns adolescence without repeating the stage before it", () => {
    // The two sections that exist only here.
    const ids = sevenToEightMonths.sections.map((section) => section.id);
    expect(ids).toContain("freedom");
    expect(ids).toContain("social-behaviour");
    // `freedom` belongs to this stage alone. `social-behaviour` is shared with
    // 9–12 months on purpose — the same topic, in opposite directions — and
    // the differentiation guard is what keeps the two apart.
    for (const other of stages.filter((stage) => stage.slug !== "7-8-months")) {
      expect(other.sections.some((section) => section.id === "freedom"), other.slug).toBe(false);
    }
    expect(nineToTwelveMonths.sections.some((section) => section.id === "social-behaviour")).toBe(true);

    // And it does not re-run 4–6 months' material.
    const prose = sevenToEightMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");
    expect(prose).not.toMatch(/26 weeks/);
    expect(prose).not.toMatch(/permanent teeth (?:start|begin) (?:coming through|appearing)/i);
    expect(prose).not.toMatch(/primary (?:vaccination )?series is (?:complete|finished|finishing)/i);
  });

  it("resolves months nine through twelve to one shared stage", () => {
    const dob = "2026-06-18";
    // Anniversaries, which is what actually moves it.
    expect(slugOn(dob, "2027-02-18")).toBe("7-8-months"); // 8 months
    expect(slugOn(dob, "2027-03-18")).toBe("9-12-months"); // 9 months
    expect(slugOn(dob, "2027-04-18")).toBe("9-12-months"); // 10 months
    expect(slugOn(dob, "2027-05-18")).toBe("9-12-months"); // 11 months
    expect(slugOn(dob, "2027-06-18")).toBe("9-12-months"); // 12 months
    expect(slugOn(dob, "2027-07-18")).toBe("beyond-the-first-year"); // 13 months

    // And every day in between. Born 18 June, the ninth anniversary is day
    // 273 and the thirteenth is day 395 — day counts and calendar
    // anniversaries do not line up, which is why months resolve on the
    // calendar rather than on a day count.
    for (let days = 273; days <= 394; days += 1) {
      expect(slugAtDay(dob, days)).toBe("9-12-months");
    }
    expect(slugAtDay(dob, 272)).toBe("7-8-months");
    expect(slugAtDay(dob, 395)).toBe("beyond-the-first-year");
  });

  it("keeps the exact month in the headline across all four", () => {
    const dob = "2026-06-18";
    for (const [today, months, headline] of [
      ["2027-03-18", 9, "9 months old"],
      ["2027-04-18", 10, "10 months old"],
      ["2027-05-18", 11, "11 months old"],
      ["2027-06-18", 12, "1 year old"],
    ] as const) {
      const age = ageOn(dob, today);
      const stage = roadmapStageFor(age)!;
      expect(stage.slug, today).toBe("9-12-months");
      expect(age.months, today).toBe(months);
      expect(journeyHeadlineAge(age, stage), today).toBe(headline);
      expect(journeyHeadlineAge(age, stage)).not.toContain("9–12");
    }
  });

  it("makes no universal claim about maturity, food or neutering at this stage", () => {
    const prose = nineToTwelveMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    // No universal physical-maturity age, and the size fork is stated.
    expect(prose).not.toMatch(/(?:fully|physically) (?:grown|mature) (?:at|by) (?:nine|ten|eleven|twelve|12)\b/i);
    expect(prose).toMatch(/skeletal maturity/i);
    expect(prose).toMatch(/eight to twelve months/i);
    expect(prose).toMatch(/fifteen or sixteen/i);

    // No universal adult-food transition.
    expect(prose).not.toMatch(/switch to adult food at (?:nine|twelve|12)/i);
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      if (!/(?:move|switch|transition) (?:off|to) (?:growth|adult)/i.test(sentence)) continue;
      expect(
        /may be|question for|ask|depends|individual|not until|rather than/i.test(sentence),
        `unqualified food transition: ${sentence}`,
      ).toBe(true);
    }

    // No universal neutering age; the 45 lb split and AAHA are named.
    expect(prose).toMatch(/45 pounds|45 lb/i);
    expect(prose).toMatch(/nine to fifteen months/i);
    expect(prose).not.toMatch(/all (?:dogs|puppies) should be (?:neutered|spayed)/i);
    expect(prose).not.toMatch(/(?:neuter|spay) at (?:nine|twelve) months\b(?! for)/i);

    // No folklore.
    expect(prose).not.toMatch(/second fear period|testing boundaries|\balpha\b|pack leader/i);
    expect(prose).not.toMatch(/(?:sexually mature|sexual maturity) (?:at|by) \d/i);
  });

  it("states the recovery as a study finding, with its population", () => {
    const prose = nineToTwelveMonths.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");

    expect(prose).toMatch(/Asher/);
    expect(prose).toMatch(/guide dogs/i);
    expect(prose).toMatch(/German shepherds?|Labrador/i);
    expect(prose).toMatch(/twelve months/i);
    expect(nineToTwelveMonths.sources.some((s) => s.url.includes("PMC7280042"))).toBe(true);

    // Never an end date for adolescence, and nine months is never a milestone.
    expect(prose).not.toMatch(/adolescence (?:ends|is over|finishes) at (?:twelve|12) months/i);
    expect(prose).not.toMatch(/(?:at|by) nine months(?:,)? (?:a |your )?dog(?:s)? (?:is|are|becomes?)/i);
  });

  it("keeps the Ontario booster tied to the record, not to the stage", () => {
    // The booster runs from the vaccination date, so it must not be modelled
    // as an age threshold — nothing here may fire because a reader entered
    // this stage.
    const ontario = provinceModifiers.filter(
      (m) => m.stageSlug === "9-12-months" && m.provinces.includes("ON"),
    );
    expect(ontario).toHaveLength(1);
    const block = ontario[0]!;

    expect(block.kind).toBe("legal");
    expect(block.ageThreshold).toBeUndefined();
    // s. 3 with s. 6 (i) and (l): the duty is to reimmunise by the date on the
    // certificate, and that date carries the product monograph's interval. The
    // "within a year, then every one to three years" shape is the province's
    // plain-language guidance, and has to read as guidance.
    expect(block.body.join(" ")).toMatch(/certificate of immunization/i);
    expect(block.body.join(" ")).toMatch(/product monograph/i);
    expect(block.body.join(" ")).toMatch(/runs from the vaccination date/i);
    expect(block.body.join(" ")).toMatch(/Ontario's guidance summarises/i);
    expect(block.sources.some((s) => s.url.includes("ontario.ca/laws/regulation/900567"))).toBe(true);
    expect(block.sources.some((s) => s.url.includes("ontario.ca/page/rabies-pets"))).toBe(true);
  });

  it("resolves months thirteen through eighteen to the final stage", () => {
    for (const dob of ["2026-06-18", "2026-01-31", "2024-02-29", "2026-08-31"]) {
      for (let months = 13; months <= 18; months += 1) {
        const birth = parseCivilDate(dob)!;
        const on = addCalendarMonths(birth, months);
        const age = ageOn(dob, formatIso(on));
        expect(age.months, `${dob} +${months}`).toBe(months);
        expect(roadmapStageFor(age)?.slug, `${dob} +${months}`).toBe("beyond-the-first-year");
        expect(isJourneyComplete(age)).toBe(false);
      }

      // Twelve stays where it was; nineteen is past the end.
      const birth = parseCivilDate(dob)!;
      expect(slugOn(dob, formatIso(addCalendarMonths(birth, 12)))).toBe("9-12-months");
      expect(slugOn(dob, formatIso(addCalendarMonths(birth, 19)))).toBeNull();
      expect(isJourneyComplete(ageOn(dob, formatIso(addCalendarMonths(birth, 19))))).toBe(true);

      // No gap and no overlap at either boundary.
      const dayBefore13 = civilFromDays(daysFromCivil(addCalendarMonths(birth, 13)) - 1);
      expect(slugOn(dob, formatIso(dayBefore13))).toBe("9-12-months");
      const lastDay = civilFromDays(daysFromCivil(addCalendarMonths(birth, 19)) - 1);
      expect(slugOn(dob, formatIso(lastDay))).toBe("beyond-the-first-year");
    }
  });

  it("keeps the exact age truthful across the final stage", () => {
    const dob = "2026-06-18";
    for (const [months, headline] of [
      [13, "1 year and 1 month old"],
      [15, "1 year and 3 months old"],
      [18, "1 year and 6 months old"],
    ] as const) {
      const birth = parseCivilDate(dob)!;
      const age = ageOn(dob, formatIso(addCalendarMonths(birth, months)));
      const stage = roadmapStageFor(age)!;
      expect(stage.slug).toBe("beyond-the-first-year");
      expect(journeyHeadlineAge(age, stage)).toBe(headline);
      // The range label is never the age.
      expect(journeyHeadlineAge(age, stage)).not.toContain("Beyond the first year");
      expect(journeyMeta(age, stage)).toEqual(["Handoff"]);
    }
  });

  it("names no stage, route, phase or label 'Young adult'", () => {
    for (const stage of roadmapStages) {
      expect(stage.slug).not.toMatch(/young-adult/i);
      expect(stage.label).not.toMatch(/young adult/i);
    }
    for (const stage of stages) {
      expect(stage.slug).not.toMatch(/young-adult/i);
      expect(stage.label).not.toMatch(/young adult/i);
      expect(stage.title).not.toMatch(/young adult/i);
    }
    for (const phase of journeyPhases) {
      expect(phase.id).not.toMatch(/maturity|young/i);
      expect(phase.label).not.toMatch(/young adult|maturity/i);
    }

    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    const puppyRoutes = readdirSync(join(appDir, "puppy"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(puppyRoutes).not.toContain("young-adult");
    expect(puppyRoutes).toContain("beyond-the-first-year");

    // But the phrase is required where it quotes AAHA, and must survive.
    const prose = beyondTheFirstYear.sections
      .flatMap((section) => [section.summary, ...(section.body ?? []), ...(section.points ?? [])])
      .join(" ");
    expect(prose).toMatch(/young adult/i);
    expect(prose).toMatch(/American Animal Hospital Association/);
    expect(prose).toMatch(/cessation of rapid growth/i);
    expect(prose).toMatch(/editorial timeline/i);
    // And it may never say the life stage begins here.
    expect(prose).not.toMatch(/young adulthood begins/i);
    expect(prose).not.toMatch(/(?:becomes?|is now) a young adult/i);
  });

  it("claims nothing is finished on the final stage", () => {
    const prose = beyondTheFirstYear.sections
      .flatMap((section) => [
        section.summary,
        ...(section.body ?? []),
        ...(section.points ?? []),
      ])
      .concat(beyondTheFirstYear.deck, beyondTheFirstYear.metaDescription)
      .join(" ");

    // No universal fully-grown or maturity claim.
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      if (!/fully grown|finished growing|now (?:an )?adult/i.test(sentence)) continue;
      expect(
        /\bnot\b|\bnothing\b|\bno\b|never|refuses|may or may not|depends|probably|almost certainly|whether|\u201c/i.test(
          sentence,
        ),
        `unqualified maturity claim: ${sentence}`,
      ).toBe(true);
    }
    expect(prose).toMatch(/three to four years/i);
    expect(prose).toMatch(/fifteen or sixteen months/i);

    // No universal adult-food transition and no exercise clearance.
    expect(prose).not.toMatch(/switch to adult food (?:at|after)/i);
    expect(prose).toMatch(/skeletal maturity/i);
    expect(prose).toMatch(/no age at which a dog is issued a licence for adult exercise/i);

    // No folklore, and no preventive-care schedule.
    expect(prose).not.toMatch(/second fear period|testing boundaries|\bdominance\b|pack leader/i);
    expect(prose).not.toMatch(/every (?:six|12|twelve) months\b/i);
    expect(prose).toMatch(/not going to print one here|a conversation rather than a table/i);
  });

  it("separates the Journey's end from the input guard, and calls no dog senior", () => {
    // Two different limits, and they had been conflated in the copy: the
    // Journey ends editorially at eighteen months, while MAX_PLAUSIBLE_DAYS is
    // a typo guard on the date field. A dog between them is finished, not
    // implausible — and a dog past the guard is a date to re-check, not a
    // senior animal.
    const today = { year: 2026, month: 9, day: 6 };
    const at = (months: number) => {
      const birth = addCalendarMonths(today, -months);
      const result = resolveAge(birth, today);
      return result.ok ? result.age : null;
    };

    for (const months of [19, 24, 35]) {
      const age = at(months)!;
      expect(age, `${months} months`).not.toBeNull();
      expect(isJourneyComplete(age), `${months} months`).toBe(true);
      expect(isBeforeJourney(age), `${months} months`).toBe(false);
      expect(stageFor(age), `${months} months`).toBeNull();
      expect(age.days, `${months} months`).toBeLessThanOrEqual(MAX_PLAUSIBLE_DAYS);
    }

    // 18 months is still inside the Journey; 36 is past the input guard.
    expect(isJourneyComplete(at(18)!)).toBe(false);
    expect(stageFor(at(18)!)?.slug).toBe("beyond-the-first-year");
    expect(at(36)).toBeNull();
    expect(resolveAge(addCalendarMonths(today, -36), today)).toEqual({
      ok: false,
      problem: "implausible",
    });

    // The boundary is exactly MAX_PLAUSIBLE_DAYS, not a month count.
    const birth = civilFromDays(daysFromCivil(today) - MAX_PLAUSIBLE_DAYS);
    expect(resolveAge(birth, today).ok).toBe(true);
    expect(resolveAge(civilFromDays(daysFromCivil(birth) - 1), today).ok).toBe(false);
  });

  it("makes no senior claim and misstates no Journey length", () => {
    const page = readFileSync(
      fileURLToPath(new URL("../../app/my-puppy/page.tsx", import.meta.url)),
      "utf8",
    );
    // Everything after the JSX begins — the copy, not the reasoning above it.
    const copy = page
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
      .join("\n");

    expect(copy).not.toMatch(/senior/i);
    expect(copy).not.toMatch(/covers the first few years/i);
    expect(copy).not.toMatch(/guides on senior care/i);
    // And the honest replacement is there.
    expect(copy).toMatch(/Worth checking that date/);
    expect(copy).toMatch(/more than three years ago/);
  });

  it("keeps the three non-stage states distinct, and promises nothing", () => {
    // Before the Journey, finished with it, and a roadmap entry without a page
    // are three different facts. The failure this guards against is them
    // sharing copy: a nineteen-month-old dog's owner told their stage is
    // "being researched", or a four-week-old's owner told the same, when every
    // stage is written and the series simply starts at eight weeks.
    const { before, complete, noPage } = journeyStateCopy;

    for (const [name, state] of Object.entries(journeyStateCopy)) {
      expect(state.body, `${name} promises unwritten content`).not.toMatch(FORBIDDEN_PROMISE);
      expect(state.title, `${name} promises unwritten content`).not.toMatch(FORBIDDEN_PROMISE);
    }

    // Each says the thing only it is allowed to say.
    expect(before.title).toMatch(/starts at eight weeks/i);
    expect(before.body).toMatch(/before the start of this series/i);
    expect(before.body).toMatch(/Every stage of the Journey is written/i);
    expect(complete.body).toMatch(/no next stage/i);
    expect(complete.body).toMatch(/deliberate rather than an omission/i);

    // And none of them is a paraphrase of another.
    const bodies = [before.body, complete.body, noPage.body];
    expect(new Set(bodies).size).toBe(3);
    expect(complete.body).not.toMatch(/eight weeks/i);
    expect(before.body).not.toMatch(/complete|finished with/i);
  });

  it("routes every age to exactly one of stage, before, complete", () => {
    // The three states plus a stage must tile the plausible range with no
    // overlap and no hole, or a reader falls through to the defensive branch.
    const dobs = ["2026-06-18", "2026-01-31", "2024-02-29", "2026-08-31"];
    const holes: string[] = [];
    for (const dob of dobs) {
      const birth = parseCivilDate(dob)!;
      for (let days = 0; days <= MAX_PLAUSIBLE_DAYS; days += 1) {
        const result = resolveAge(birth, civilFromDays(daysFromCivil(birth) + days));
        if (!result.ok) continue;
        const age = result.age;
        const flags = [
          isBeforeJourney(age),
          isJourneyComplete(age),
          stageFor(age) !== null,
        ].filter(Boolean).length;
        if (flags !== 1) holes.push(`${dob} day ${days}: ${flags} states`);
      }
    }
    expect(holes.slice(0, 5)).toEqual([]);
  });

  it("places the pre-Journey boundary on the first stage's own first day", () => {
    expect(JOURNEY_BEGINS_AT_DAYS).toBe(56);
    const dob = "2026-07-12";
    for (const [days, before] of [[0, true], [30, true], [54, true], [55, true], [56, false], [70, false]] as const) {
      const birth = parseCivilDate(dob)!;
      const age = ageOn(dob, formatIso(civilFromDays(daysFromCivil(birth) + days)));
      expect(isBeforeJourney(age), `day ${days}`).toBe(before);
      // Before the Journey there is no stage and no roadmap entry, so the
      // canonical falls to the hub — which is intentional, not a fallback.
      expect(stageFor(age) === null, `day ${days}`).toBe(before);
      if (before) expect(roadmapStageFor(age)).toBeNull();
    }
  });

  it("keeps the implemented stage a strict subset of the roadmap", () => {
    // A page is not minted because an interval elapsed. Every implemented
    // stage must appear on the roadmap; the reverse must not hold.
    const roadmapSlugs = new Set(roadmapStages.map((stage) => stage.slug));
    for (const stage of stages) {
      expect(roadmapSlugs.has(stage.slug)).toBe(true);
    }
    // Every roadmap entry is now written. The Journey is finished, which is
    // the one state in which this is no longer a strict subset.
    expect(stages).toHaveLength(8);
    expect(roadmapStages).toHaveLength(8);
    expect(stages.length).toBe(roadmapStages.length);
  });

  it("takes its age range from the roadmap rather than restating it", () => {
    // A stage carries no bounds of its own, so a stage and its roadmap entry
    // cannot drift apart — and a future monthly stage page needs no day range
    // it could not express.
    for (const stage of stages) {
      const roadmap = findRoadmapStage(stage.slug);
      expect(roadmap).not.toBeNull();
      expect(stage).not.toHaveProperty("ageMinDays");
      expect(stage).not.toHaveProperty("ageMaxDays");
    }

    // The one implemented stage still covers exactly the eleventh week.
    const dob = "2026-06-18";
    expect(stageFor(ageOn(dob, dayAfter(dob, 63)))?.slug).toBe("9-11-weeks");
    expect(stageFor(ageOn(dob, dayAfter(dob, 83)))?.slug).toBe("9-11-weeks");
  });
});

describe("modifier composition", () => {
  it("returns universal content when no context is supplied", () => {
    const sections = resolveStage(nineToElevenWeeks);
    for (const section of sections) {
      expect(section.sizeGroupBlock).toBeUndefined();
      expect(section.breedBlock).toBeUndefined();
      expect(section.provinceBlocks).toEqual([]);
      expect(section.seasonBlock).toBeUndefined();
    }
  });

  it("takes size from the caller and never re-derives it from the breed", () => {
    // The breed is resolved to a size once, at the edge, by `resolveSizeGroup`
    // — because that is the only place the reader's own answer is in scope.
    // If this layer inferred size too, "not sure" would be undone here: a
    // Poodle owner who said they did not know would still get medium.
    const breed = findBreed("golden-retriever")!;

    const inferred = resolveStage(nineToElevenWeeks, {
      breedSlug: "golden-retriever",
      sizeGroup: resolveSizeGroup(null, breed),
    });
    expect(inferred.find((s) => s.id === "exercise")?.sizeGroupBlock).toBeDefined();

    // Breed alone says nothing about size at this layer.
    const breedOnly = resolveStage(nineToElevenWeeks, { breedSlug: "golden-retriever" });
    expect(breedOnly.find((s) => s.id === "exercise")?.sizeGroupBlock).toBeUndefined();

    // And an explicit "not sure" beats the breed, all the way down.
    const unsure = resolveStage(nineToElevenWeeks, {
      breedSlug: "golden-retriever",
      sizeGroup: resolveSizeGroup("unknown", breed),
    });
    for (const section of unsure) {
      expect(section.sizeGroupBlock, section.id).toBeUndefined();
    }
    // The breed layer itself is untouched by any of this.
    expect(breedOnly.some((s) => s.breedBlock)).toBe(
      inferred.some((s) => s.breedBlock),
    );
  });

  it("lets an explicit size group work without a breed", () => {
    const sections = resolveStage(nineToElevenWeeks, { sizeGroup: "giant" });
    expect(sections.find((s) => s.id === "exercise")?.sizeGroupBlock).toBeDefined();
    expect(sections.find((s) => s.id === "exercise")?.breedBlock).toBeUndefined();
  });

  it("adds no breed block, and no size, for a mixed breed", () => {
    const sections = resolveStage(nineToElevenWeeks, { breedSlug: "mixed" });
    for (const section of sections) {
      expect(section.breedBlock).toBeUndefined();
      expect(section.sizeGroupBlock, section.id).toBeUndefined();
    }
  });

  it("renders a province block only where that province changes the answer", () => {
    const ontario = resolveStage(nineToElevenWeeks, { province: "ON" });
    const vaccineON = ontario.find((s) => s.id === "vaccine-questions");
    expect(vaccineON?.provinceBlocks).toHaveLength(1);
    expect(vaccineON?.provinceBlocks[0]?.kind).toBe("legal");

    const bc = resolveStage(nineToElevenWeeks, { province: "BC" });
    expect(bc.find((s) => s.id === "vaccine-questions")?.provinceBlocks[0]?.kind).toBe("guidance");

    // Saskatchewan has no verified difference at this stage, so it gets none.
    const sask = resolveStage(nineToElevenWeeks, { province: "SK" });
    for (const section of sask) {
      expect(section.provinceBlocks).toEqual([]);
    }
  });

  it("adds a season block only for seasons that genuinely change the week", () => {
    expect(
      resolveStage(nineToElevenWeeks, { season: "winter" }).find((s) => s.id === "this-week")
        ?.seasonBlock,
    ).toBeDefined();
    expect(
      resolveStage(nineToElevenWeeks, { season: "spring" }).find((s) => s.id === "this-week")
        ?.seasonBlock,
    ).toBeUndefined();

    // Spring and autumn change nothing at any stage, and get nothing.
    for (const stage of stages) {
      for (const season of ["spring", "autumn"] as const) {
        for (const section of resolveStage(stage, { season })) {
          expect(section.seasonBlock, `${stage.slug}/${section.id} in ${season}`).toBeUndefined();
        }
      }
    }
  });

  it("attaches each stage's season block where that season actually bites", () => {
    // Not the same section on both stages, and deliberately: at 9–11 weeks
    // winter is a house-training problem and summer a walking one, so both
    // sit on "where you are now". At 12 weeks winter is what it does to a
    // closing socialisation window, and summer is what it does to the first
    // real walks — so they attach to different sections entirely.
    const blockOn = (stage: (typeof stages)[number], season: "winter" | "summer") =>
      resolveStage(stage, { season }).filter((section) => section.seasonBlock).map((s) => s.id);

    expect(blockOn(nineToElevenWeeks, "winter")).toEqual(["this-week"]);
    expect(blockOn(nineToElevenWeeks, "summer")).toEqual(["this-week"]);
    expect(blockOn(twelveWeeks, "winter")).toEqual(["socialisation"]);
    expect(blockOn(twelveWeeks, "summer")).toEqual(["exercise"]);

    // And a season block never repeats the prose it layers onto.
    for (const stage of stages) {
      for (const season of ["winter", "summer"] as const) {
        for (const section of resolveStage(stage, { season })) {
          for (const paragraph of section.seasonBlock?.body ?? []) {
            expect(section.body).not.toContain(paragraph);
          }
        }
      }
    }
  });

  it("never lets a modifier restate the prose it is layering onto", () => {
    // The rule that keeps this from becoming programmatic content: a modifier
    // adds information, it does not paraphrase the base. Any sentence shared
    // between a base section and one of its modifiers is a failure.
    const context = {
      breedSlug: "french-bulldog",
      province: "ON",
      season: "winter",
    } as const;

    for (const section of resolveStage(nineToElevenWeeks, context)) {
      const base = new Set(
        [...section.body, ...(section.points ?? [])].map((s) => s.trim().toLowerCase()),
      );

      const modifierProse = [
        ...(section.sizeGroupBlock?.body ?? []),
        ...(section.breedBlock?.body ?? []),
        ...section.provinceBlocks.flatMap((b) => b.body),
        ...(section.seasonBlock?.body ?? []),
      ];

      for (const sentence of modifierProse) {
        expect(
          base.has(sentence.trim().toLowerCase()),
          `${section.id}: a modifier restates the base prose`,
        ).toBe(false);
      }
    }
  });

  it("adds the province's own source when a province block is shown", () => {
    const base = resolveSources(nineToElevenWeeks);
    const withOntario = resolveSources(nineToElevenWeeks, { province: "ON" });
    // Two: the regulation itself, and the province's guidance page.
    expect(withOntario.length).toBe(base.length + 2);
    expect(withOntario.some((s) => s.url.includes("ontario.ca"))).toBe(true);

    // And de-duplicates rather than listing the same URL twice.
    expect(new Set(withOntario.map((s) => s.url)).size).toBe(withOntario.length);
  });
});

describe("invariants that must hold for every implemented stage", () => {
  it("gives every stage a safety floor", () => {
    // A reader can land on any stage page directly, so every one of them has
    // to answer "when do I call someone" without a second navigation. This is
    // a floor, not a differentiation target: the guard elsewhere that rejects
    // near-identical sections exempts red-flags for exactly this reason.
    for (const stage of stages) {
      const caution = stage.sections.filter((section) => section.tone === "caution");
      expect(caution.length, `${stage.slug} has no caution section`).toBeGreaterThan(0);

      const redFlags = stage.sections.find((section) => section.id === "red-flags");
      expect(redFlags, `${stage.slug} has no red-flags section`).toBeDefined();
      expect(redFlags!.tone, `${stage.slug} red-flags is not a caution`).toBe("caution");
    }
  });

  it("routes every stage to the emergency guide, exactly once", () => {
    for (const stage of stages) {
      const links = stage.sections.filter(
        (section) => section.guide?.slug === "emergency-vet-visits-in-canada",
      );
      expect(links.length, `${stage.slug} links the emergency guide ${links.length} times`).toBe(1);
      expect(links[0]!.id, `${stage.slug} links it from the wrong section`).toBe("red-flags");
    }
  });

  it("keeps the serious-symptom core intact on every stage, and never prescribes", () => {
    // The core does not get shorter because the dog got older, and no stage
    // may soften it for the sake of reading differently from its neighbour.
    const core = [
      /breathing with effort/i,
      /repeatedly vomiting/i,
      /diarrhoea/i,
      /straining without producing/i,
      /swallowed something it should not/i,
    ];

    for (const stage of stages) {
      const section = stage.sections.find((s) => s.id === "red-flags")!;
      const prose = [section.summary, ...section.body, ...(section.points ?? [])].join(" ");

      for (const pattern of core) {
        expect(pattern.test(prose), `${stage.slug} red-flags missing ${pattern}`).toBe(true);
      }

      // Never a diagnosis, a drug, a dose or a home remedy.
      expect(prose, stage.slug).not.toMatch(/\bmg\/kg\b|\bml per\b|\bdose of\b/i);
      expect(prose, stage.slug).not.toMatch(/give (?:him|her|it|your dog|your puppy) (?:some )?[a-z]+ (?:tablets?|syrup)/i);
      expect(prose, stage.slug).not.toMatch(/induce vomiting|hydrogen peroxide|at home you can treat/i);
      expect(prose, stage.slug).not.toMatch(/this (?:is|means) (?:probably |likely )?(?:parvo|bloat|gastroenteritis)/i);

      // And it always says it is not an examination.
      expect(prose, stage.slug).toMatch(/does not diagnose|not a substitute for examining/i);
    }
  });

  it("renders no markdown emphasis markers in any reader-facing string", () => {
    // Section bodies render as plain text, so a `*` or `**` in the source is a
    // `*` or `**` on the page. Four stages shipped them, including inside the
    // AAHA life-stage paragraph and the WSAVA revaccination paragraph.
    //
    // Deliberately scoped to prose the reader sees: `needsVerification` is
    // editorial-only and never rendered, and its notes may use emphasis.
    const emphasis = /(?:^|[\s(])\*{1,2}[^*\s][^*]{0,60}\*{1,2}(?:$|[\s.,;:)])/;
    const offenders: string[] = [];

    const check = (where: string, text: string | undefined) => {
      if (text && emphasis.test(text)) offenders.push(`${where}: ${emphasis.exec(text)![0].trim()}`);
    };

    for (const stage of stages) {
      check(`${stage.slug}/title`, stage.title);
      check(`${stage.slug}/deck`, stage.deck);
      check(`${stage.slug}/meta`, stage.metaDescription);
      check(`${stage.slug}/alt`, stage.mediaAlt);
      for (const section of stage.sections) {
        check(`${stage.slug}/${section.id}/title`, section.title);
        check(`${stage.slug}/${section.id}/summary`, section.summary);
        section.body.forEach((b, i) => check(`${stage.slug}/${section.id}/body[${i}]`, b));
        (section.points ?? []).forEach((x, i) => check(`${stage.slug}/${section.id}/point[${i}]`, x));
        if (section.guide) check(`${stage.slug}/${section.id}/guide`, section.guide.label);
      }
      for (const item of stage.checklist) {
        check(`${stage.slug}/checklist/${item.id}`, item.label);
        check(`${stage.slug}/checklist/${item.id}`, item.detail);
      }
    }

    // Every modifier layer is reader-facing too.
    for (const m of sizeGroupModifiers) m.body.forEach((b, i) => check(`size:${m.sizeGroup}/${m.stageSlug}/${i}`, b));
    for (const m of breedModifiers) m.body.forEach((b, i) => check(`breed:${m.breedSlug}/${m.stageSlug}/${i}`, b));
    for (const m of seasonModifiers) {
      check(`season:${m.season}/${m.stageSlug}`, m.heading);
      m.body.forEach((b, i) => check(`season:${m.season}/${m.stageSlug}/${i}`, b));
    }
    for (const m of provinceModifiers) {
      check(`province:${m.stageSlug}`, m.heading);
      m.body.forEach((b, i) => check(`province:${m.stageSlug}/${i}`, b));
      for (const variant of [m.ageThreshold?.before, m.ageThreshold?.reached]) {
        if (!variant) continue;
        check(`province:${m.stageSlug}/threshold`, variant.heading);
        variant.body.forEach((b, i) => check(`province:${m.stageSlug}/threshold/${i}`, b));
      }
    }

    expect(offenders).toEqual([]);
  });

  it("does not mistake ordinary punctuation for emphasis", () => {
    // The guard above has to survive real prose. These must not trip it.
    const emphasis = /(?:^|[\s(])\*{1,2}[^*\s][^*]{0,60}\*{1,2}(?:$|[\s.,;:)])/;
    for (const safe of [
      "A 3 * 4 grid of surfaces.",
      "See https://example.com/a*b for the schedule.",
      "The interval is 2*x weeks.",
      "Nothing here is emphasised at all.",
    ]) {
      expect(emphasis.test(safe), safe).toBe(false);
    }
    // And it does catch the shapes that actually shipped.
    for (const bad of ["the **young adult** stage as running", "waiting *instead of* moving"]) {
      expect(emphasis.test(bad), bad).toBe(true);
    }
  });
});

describe("size is an answer, never an inference from \"not sure\"", () => {
  it("gives the mixed/not-sure breed no size of its own", () => {
    const mixed = findBreed("mixed")!;
    expect(mixed.sizeGroup).toBeUndefined();
    expect(mixed.sizeNote).toBeUndefined();
    // Resolving with no explicit answer must stay unknown rather than medium.
    expect(resolveSizeGroup(null, mixed)).toBeUndefined();
  });

  it("renders no size-specific content when size is unknown", () => {
    // The failure this replaces: "Mixed breed or not sure" produced medium,
    // which produced medium skeletal-maturity and adult-food guidance for a
    // reader who had just said they did not know how big the dog would be.
    for (const stage of stages) {
      for (const context of [
        {},
        { breedSlug: "mixed" as const },
        { breedSlug: "mixed" as const, sizeGroup: undefined },
        // The leak this closes: a known breed plus an explicit "not sure".
        // The breed still implies a size, and it must not be reached for.
        { breedSlug: "poodle" as const, sizeGroup: resolveSizeGroup("unknown", findBreed("poodle")) },
        { breedSlug: "bernese-mountain-dog" as const, sizeGroup: resolveSizeGroup("unknown", findBreed("bernese-mountain-dog")) },
      ]) {
        for (const section of resolveStage(stage, context)) {
          expect(section.sizeGroupBlock, `${stage.slug}/${section.id}`).toBeUndefined();
        }
      }
    }
  });

  it("lets an explicit answer override the breed, including back to unknown", () => {
    const labrador = findBreed("labrador-retriever")!;
    expect(labrador.sizeGroup).toBe("large");

    // No answer: the breed's own size stands.
    expect(resolveSizeGroup(null, labrador)).toBe("large");
    // An explicit answer wins, even a contradictory one — the reader knows
    // their dog and the list of breeds is seven long.
    expect(resolveSizeGroup("toy", labrador)).toBe("toy");
    // And "not sure" must not be quietly refilled from the breed.
    expect(resolveSizeGroup("unknown", labrador)).toBeUndefined();
    expect(resolveSizeGroup("unknown", null)).toBeUndefined();
  });

  it("parses only real size answers", () => {
    for (const value of ["toy", "small", "medium", "large", "giant", "unknown"]) {
      expect(parseSizeAnswer(value)).toBe(value);
    }
    for (const value of ["", "MEDIUM", "huge", "mixed", undefined, null]) {
      expect(parseSizeAnswer(value as string | undefined | null)).toBeNull();
    }
  });

  it("makes all six size states reachable, and every size group used", () => {
    // The audit found toy and small unreachable: no offered breed mapped to
    // them and there was no size field, so nine written modifiers could never
    // render. The explicit field is what fixes that, so assert the whole set.
    const answers = [...Object.keys(sizeGroups), "unknown"];
    expect(answers).toHaveLength(6);

    for (const answer of answers) {
      const parsed = parseSizeAnswer(answer);
      expect(parsed, answer).not.toBeNull();
      const resolved = resolveSizeGroup(parsed, null);
      if (answer === "unknown") {
        expect(resolved).toBeUndefined();
        continue;
      }
      expect(resolved).toBe(answer);

      // And each reachable group actually has something to say somewhere.
      const blocks = stages.flatMap((stage) =>
        resolveStage(stage, { sizeGroup: resolved }).filter((s) => s.sizeGroupBlock),
      );
      expect(blocks.length, `${answer} resolves to no size content anywhere`).toBeGreaterThan(0);
    }
  });

  it("keeps a stored profile written before the size field safe", () => {
    // Size was never stored — it was derived from the breed at render time —
    // so the migration is that `mixed` stops implying medium. An old profile
    // parses, keeps its dob/breed/province, and carries no size.
    const legacy = parseStoredPuppy(
      JSON.stringify({ dob: "2026-06-18", breedSlug: "mixed", province: "ON" }),
    );
    expect(legacy).toEqual({
      dob: "2026-06-18",
      breedSlug: "mixed",
      province: "ON",
      sizeGroup: undefined,
    });
    expect(resolveSizeGroup(parseSizeAnswer(legacy!.sizeGroup), findBreed(legacy!.breedSlug!))).toBeUndefined();

    // A legacy profile with a known breed keeps behaving exactly as it did.
    const known = parseStoredPuppy(
      JSON.stringify({ dob: "2026-06-18", breedSlug: "bernese-mountain-dog" }),
    );
    expect(resolveSizeGroup(parseSizeAnswer(known!.sizeGroup), findBreed(known!.breedSlug!))).toBe("giant");

    // Anything unrecognised in storage degrades to unknown, never to a guess.
    const junk = parseStoredPuppy(JSON.stringify({ dob: "2026-06-18", sizeGroup: "enormous" }));
    expect(resolveSizeGroup(parseSizeAnswer(junk!.sizeGroup), null)).toBeUndefined();
  });
});

/**
 * Vaccine *prescription*, as opposed to vaccine discussion.
 *
 * The stages must be free to cite AAHA and WSAVA ranges, to explain the
 * conditional 26-week option, and to ask what a puppy's records show. What
 * they may never do is tell a reader something is due because their puppy has
 * reached an age. So `PRESCRIPTIVE` looks for an instruction or an assertion
 * of due-ness, and `DESCRIPTIVE` is the hedging, attribution or refusal that
 * turns a match back into a description. A sentence fails only when it matches
 * the first and not the second.
 */
const PRESCRIPTIVE = [
  /\bat \d+\s*(?:weeks?|months?)[^.]{0,50}\b(?:give|administer|vaccinate|inject)\b/i,
  /\b(?:give|administer|vaccinate|inject)\b[^.]{0,60}\bat \d+\s*(?:weeks?|months?)/i,
  /\bevery (?:puppy|dog|animal)\b[^.]{0,60}\b(?:needs|requires|must have|should have)\b[^.]{0,40}vaccin/i,
  /\bvaccin\w*[^.]{0,40}\bis due\b[^.]{0,30}\bat\b\s*\d+/i,
  /\b(?:is|are) due\b[^.]{0,25}\bat\s+(?:six|seven|eight|nine|ten|twelve|sixteen|\d+)\s*(?:weeks?|months?)/i,
  /\ball puppies\b[^.]{0,60}\b(?:same|one|single)\b[^.]{0,20}(?:schedule|timetable)/i,
  /\bdose (?:one|two|three|1|2|3)\b/i,
  /\bmg\/kg\b|\bml per\b/i,
  /\b(?:booster|vaccine|dose) (?:is|will be) (?:given|required|administered) at \d+/i,
];

const DESCRIPTIVE =
  /\b(?:not|never|no)\b|usually|typically|often|may|might|can |depends|guideline|recommends?|advises?|puts? (?:the|it)|American Animal Hospital|World Small Animal|AAHA|WSAVA|ask|question|your veterinarian|clinic|records|varies|rather than|instead of|conditional|considering/i;

/** Whether one sentence prescribes a vaccine rather than describing one. */
function prescribesVaccine(sentence: string): boolean {
  return PRESCRIPTIVE.some((pattern) => pattern.test(sentence)) && !DESCRIPTIVE.test(sentence);
}

describe("launch-readiness copy and media invariants", () => {
  it("claims no review the stages have not had", () => {
    // Every stage is `in-review`, so nothing may tell a reader they are
    // reviewed. The hub said "written and reviewed" while the status field
    // said otherwise, which is the kind of small overstatement that is only
    // ever found by reading the two together.
    const hub = readFileSync(fileURLToPath(new URL("../../app/puppy/page.tsx", import.meta.url)), "utf8");
    const copy = hub.slice(hub.indexOf("const principles"));

    expect(stages.every((stage) => stage.status === "in-review")).toBe(true);
    expect(copy).not.toMatch(/written and reviewed|reviewed and (?:published|sourced)|fully reviewed|peer[- ]reviewed by/i);
    expect(copy).toMatch(/stages are written/);
  });

  it("promises province and season help only where it exists", () => {
    // Spring and autumn carry no modifiers, and ten jurisdictions carry none
    // either. That is a deliberate state — there is nothing verified and
    // material to say — so the copy may describe the layers as conditional
    // and may not describe them as universal.
    const hub = readFileSync(fileURLToPath(new URL("../../app/puppy/page.tsx", import.meta.url)), "utf8");
    const copy = hub.slice(hub.indexOf("const principles"), hub.indexOf("export default"));

    expect(copy).toMatch(/appears where a verified difference materially changes/i);
    expect(copy).not.toMatch(/tells you what actually applies where you are/i);
    expect(copy).not.toMatch(/(?:every|each) (?:province|season|time of year)/i);
    expect(copy).not.toMatch(/always (?:personalis|personaliz|adapts)/i);

    // The absence itself is legitimate and must stay expressible.
    const seasons = new Set(seasonModifiers.map((m) => m.season));
    expect(seasons.has("spring") || seasons.has("autumn")).toBe(false);
    for (const season of ["spring", "autumn"] as const) {
      for (const stage of stages) {
        for (const section of resolveStage(stage, { season })) {
          expect(section.seasonBlock, `${stage.slug}/${section.id}`).toBeUndefined();
        }
      }
    }
    // And a province with nothing to say renders nothing, without error.
    for (const province of ["AB", "SK", "NU"] as const) {
      const blocks = stages.flatMap((stage) =>
        resolveStage(stage, { province }).flatMap((s) => s.provinceBlocks),
      );
      expect(blocks).toEqual([]);
    }
  });

  it("requires no province modifier on every stage", () => {
    // 7–8 months carries no Ontario block: the rabies duty was crossed months
    // earlier and the booster runs from the certificate date, so there is
    // nothing actionable to say that the stage either side does not already
    // say better. Coverage is a function of material difference, not of
    // filling a grid.
    const withOntario = stages.filter((stage) =>
      resolveStage(stage, { province: "ON" }).some((s) => s.provinceBlocks.length > 0),
    );
    expect(withOntario.length).toBeGreaterThan(0);
    expect(withOntario.length).toBeLessThan(stages.length);

    // Where a block does appear it is never decorative.
    for (const modifier of provinceModifiers) {
      expect(modifier.sources.length, `${modifier.stageSlug}/${modifier.sectionId}`).toBeGreaterThan(0);
      expect(modifier.body.join(" ").length).toBeGreaterThan(200);
    }
  });

  it("asserts no age or developmental status in hero alt text", () => {
    // Three stages already refused to, because the source described an adult
    // dog and the age could not be verified. Five others said "around the age
    // this stage covers", which is an age claim about a photograph nobody
    // verified. One standard now, for all eight.
    const ageClaim = [
      /around the age this stage covers/i,
      /\bat (?:about |around )?\w+[- ]?(?:weeks?|months?)\b/i,
      /\b\d+[- ](?:week|month)[- ]old\b/i,
      /\bat this (?:stage|age)\b/i,
      /\b(?:fully grown|not finished|still growing|looks grown|mature|adolescent)\b/i,
    ];

    for (const stage of stages) {
      for (const pattern of ageClaim) {
        expect(pattern.test(stage.mediaAlt), `${stage.slug}: ${stage.mediaAlt}`).toBe(false);
      }
      // It still has to describe the picture.
      expect(stage.mediaAlt.length, stage.slug).toBeGreaterThan(40);
      expect(stage.mediaAlt, stage.slug).toMatch(/dog|puppy|collie|labrador|husky/i);
      expect(stage.mediaAlt, stage.slug).toMatch(/\b(?:sitting|standing|lying|walking|lies|sits|stands)\b/i);
    }
  });

  it("sources or removes the wariness claim at nine to eleven weeks", () => {
    const section = nineToElevenWeeks.sections.find((s) => s.id === "development")!;
    const prose = [section.summary, ...section.body, ...(section.points ?? [])].join(" ");

    // The unsourced normalisation is gone.
    expect(prose).not.toMatch(/is a normal part of development rather than a sign/i);
    // What replaced it is attributed, and to the right things.
    expect(prose).toMatch(/McEvoy/);
    expect(prose).toMatch(/three to five weeks/i);
    expect(prose).toMatch(/Merck Veterinary Manual/);
    expect(prose).toMatch(/twelve weeks/i);
    expect(prose).toMatch(/varies from puppy to puppy|individual/i);
    // A physical cause is named, and there is a route to help.
    expect(prose).toMatch(/pain and illness|physical/i);
    expect(prose).toMatch(/qualified behaviour professional/i);
    // And none of the folklore came back.
    expect(prose).not.toMatch(/fear period|fear stage|second fear/i);

    // The sources are actually attached to the stage.
    const urls = nineToElevenWeeks.sources.map((s) => s.url).join(" ");
    expect(urls).toContain("PMC9655304");
    expect(urls).toContain("merckvetmanual.com/behavior");
  });

  it("says puppy before adolescence and dog from adolescence on", () => {
    const noun = (slug: string) => journeyAnimalNoun(findRoadmapStage(slug));
    expect(noun("8-weeks")).toBe("puppy");
    expect(noun("9-11-weeks")).toBe("puppy");
    expect(noun("12-weeks")).toBe("puppy");
    expect(noun("3-months")).toBe("puppy");
    expect(noun("4-6-months")).toBe("puppy");
    expect(noun("7-8-months")).toBe("dog");
    expect(noun("9-12-months")).toBe("dog");
    expect(noun("beyond-the-first-year")).toBe("dog");
    // Before the Journey there is no stage, and "puppy" is right there.
    expect(journeyAnimalNoun(null)).toBe("puppy");

    // The rule matches the line the stage titles already drew, so the headline
    // and the page it sits on can never disagree again.
    for (const stage of stages) {
      const expected = journeyAnimalNoun(findRoadmapStage(stage.slug));
      const wrong = expected === "dog" ? "puppy" : "dog";
      const title = stage.title.toLowerCase();
      // A title need not name the animal at all — "Beyond the First Year" does
      // not — but where it does, it must not name the other one.
      expect(title, stage.slug).not.toMatch(new RegExp(`\\b${wrong}\\b`));
      if (/\b(?:puppy|dog)\b/.test(title)) {
        expect(title, stage.slug).toContain(expected);
      }
    }
  });

  it("keeps the dental claim true at both ends of the final stage", () => {
    const section = beyondTheFirstYear.sections.find((s) => s.id === "teething")!;
    const prose = section.body.join(" ");
    // "The best part of a year" was about six months at the stage's entry.
    expect(prose).not.toMatch(/best part of a year/i);
    // The replacement is a fact about the teeth, not a duration to recompute.
    expect(prose).toMatch(/since well before this stage began/i);
    expect(prose).toMatch(/about seven months/i);
  });
});

describe("content integrity", () => {
  it("points every guide link at an article that exists", () => {
    const slugs = new Set(articles.map((article) => article.slug));

    for (const stage of stages) {
      for (const section of stage.sections) {
        if (section.guide) {
          expect(slugs.has(section.guide.slug), `${stage.slug}/${section.id}: ${section.guide.slug}`).toBe(true);
        }
      }

      // Season modifiers carry their own guide links.
      for (const season of ["winter", "summer"] as const) {
        for (const section of resolveStage(stage, { season })) {
          if (section.seasonBlock?.guide) {
            expect(slugs.has(section.seasonBlock.guide.slug)).toBe(true);
          }
        }
      }
    }
  });

  it("does not lean on any one article across a whole stage", () => {
    // A stage that links the same guide from five sections is a related-posts
    // block wearing a stage's clothes.
    for (const stage of stages) {
      const counts = new Map<string, number>();
      for (const section of stage.sections) {
        if (section.guide) {
          counts.set(section.guide.slug, (counts.get(section.guide.slug) ?? 0) + 1);
        }
      }
      for (const [slug, count] of counts) {
        expect(count, `${stage.slug} links ${slug} ${count} times`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("points every guide link at a live article, never at a redirect", () => {
    // Replaces an assertion that could not fail: `guide` is already optional
    // and singular in the type, so checking that it is either absent or a
    // string tested nothing. What is worth asserting is that the destination
    // still exists and is not a slug we have since retired.
    const live = new Set(articles.map((article) => article.slug));
    const retired = ["11-weeks", "4-5-months"];

    for (const stage of stages) {
      for (const section of stage.sections) {
        if (!section.guide) continue;
        expect(live.has(section.guide.slug), `${stage.slug}/${section.id}`).toBe(true);
        expect(retired).not.toContain(section.guide.slug);
        expect(section.guide.label.trim().length, `${stage.slug}/${section.id}`).toBeGreaterThan(8);
      }
    }
  });

  it("resolves every breed to a real size group and every province to a real code", () => {
    for (const breed of allBreeds) {
      expect(findBreed(breed.slug)).not.toBeNull();
    }
    for (const province of provinces) {
      expect(findProvince(province.code)?.name).toBe(province.name);
    }
    expect(findBreed("chihuahua")).toBeNull();
    expect(findProvince("XX")).toBeNull();
  });

  it("prescribes no vaccine, on any stage, at any age", () => {
    // The safety rule this product is built on, and the guard used to check
    // one stage of eight while its name claimed all of them.
    //
    // The line is not "never mention an age". Stages legitimately cite AAHA
    // and WSAVA ranges, discuss the 26-week option conditionally, and ask what
    // a puppy's records already show. What is forbidden is *prescription*:
    // telling a reader something is due because their puppy has reached an
    // age. So the patterns below look for an imperative or an assertion of
    // due-ness, and every sentence that matches is then checked for the
    // hedging or attribution that makes it a description instead.
    const offenders: string[] = [];
    for (const stage of stages) {
      const strings = [
        stage.deck,
        stage.metaDescription,
        ...stage.sections.flatMap((section) => [
          section.summary,
          ...section.body,
          ...(section.points ?? []),
        ]),
        ...stage.checklist.flatMap((item) => [item.label, item.detail ?? ""]),
      ];
      for (const text of strings) {
        for (const sentence of text.split(/(?<=[.?!])\s+/)) {
          for (const pattern of PRESCRIPTIVE) {
            if (pattern.test(sentence) && !DESCRIPTIVE.test(sentence)) {
              offenders.push(`${stage.slug}: ${sentence.slice(0, 110)}`);
            }
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("still allows the discussion the stages actually need", () => {
    // A guard that rejected these would be useless, because they are the
    // content. Proving it accepts them is what stops the next person from
    // loosening the prose to satisfy the test.
    const allowed = [
      "The American Animal Hospital Association recommends continuing the series until the puppy is older than sixteen weeks, and prefers eighteen to twenty weeks where distemper or parvovirus risk is high.",
      "The World Small Animal Veterinary Association advises considering revaccination at or after 26 weeks of age as an alternative to waiting until twelve to sixteen months, not as an addition to it.",
      "Which vaccines are core for this puppy, and which depend on where we live and what it will do?",
      "It is not that a dose is due, and it is not an extra vaccine bolted onto the schedule.",
      "Some have had a first vaccine from the breeder, some have not.",
    ];
    const rejected = [
      "Give the second vaccine at 12 weeks.",
      "Every puppy needs a booster vaccine at six months.",
      "The next vaccination is due at 16 weeks.",
      "All puppies follow the same schedule: dose one, dose two, dose three.",
    ];

    const flags = prescribesVaccine;

    for (const sentence of allowed) expect(flags(sentence), `wrongly rejected: ${sentence}`).toBe(false);
    for (const sentence of rejected) expect(flags(sentence), `wrongly allowed: ${sentence}`).toBe(true);
  });

  it("carries a review date and stays in review during this milestone", () => {
    for (const stage of stages) {
      expect(stage.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(stage.status).toBe("in-review");
    }
  });

  it("records open verification items, and never renders them", () => {
    expect(nineToElevenWeeks.needsVerification.length).toBeGreaterThan(0);

    // Same guard the article system uses: the queue is a work list for an
    // editor, and no component may read it.
    for (const file of [
      "components/stage-view.tsx",
      "components/stage-section.tsx",
      "components/journey-masthead.tsx",
      "components/stage-checklist.tsx",
    ]) {
      const source = readFileSync(`${FEATURE_DIR}${file}`, "utf8");
      expect(source.includes("needsVerification"), `${file} reads needsVerification`).toBe(false);
    }
  });
});

/**
 * The canonical on `/my-puppy`.
 *
 * The rule is narrow and worth stating plainly: a personalised page may claim
 * to be a duplicate of a public stage *only* when it genuinely resolves to
 * that stage. The first version canonicalised everything to `/puppy/11-weeks`,
 * which told a crawler that a five-month-old puppy's page was the same
 * document as an eleven-week-old's. It is not, and saying so is the kind of
 * quiet lie that costs a site its credibility with an index.
 */
describe("personalised canonical", () => {
  /** A `YYYY-MM-DD` date of birth for a puppy `days` old as of the resolved today. */
  function dobForAge(days: number, province?: string): string {
    const today = resolveToday({ province }).date;
    const { year, month, day } = civilFromDays(daysFromCivil(today) - days);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  async function canonicalFor(params: Record<string, string>): Promise<string> {
    const metadata = await myPuppyMetadata({ searchParams: Promise.resolve(params) });
    return String(metadata.alternates?.canonical ?? "");
  }

  it("canonicalises an 11-week puppy to the 11-week stage", async () => {
    const canonical = await canonicalFor({ dob: dobForAge(80, "ON"), province: "ON" });
    expect(canonical.endsWith("/puppy/9-11-weeks")).toBe(true);
  });

  it("holds that canonical across the whole of week 11", async () => {
    for (const days of [77, 78, 83]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/9-11-weeks")).toBe(true);
    }
  });

  it("canonicalises a 3-month puppy to the 3-month stage", async () => {
    for (const days of [91, 100, 118]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/3-months")).toBe(true);
    }
  });

  it("canonicalises 4-, 5- and 6-month puppies to the one shared stage", async () => {
    // Day 130 is inside the fourth month, 170 the fifth and 200 the sixth, for
    // any date of birth. All three are one page.
    for (const days of [130, 170, 200]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/4-6-months")).toBe(true);
    }
  });

  it("canonicalises 7- and 8-month dogs to the adolescence stage", async () => {
    // Day 230 is inside the seventh month and day 260 the eighth, for any
    // date of birth.
    for (const days of [230, 260]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/7-8-months")).toBe(true);
    }
  });

  it("canonicalises 9-, 10-, 11- and 12-month dogs to the one shared stage", async () => {
    // Days inside each of the ninth through twelfth months, for any DOB.
    for (const days of [290, 320, 350, 380]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/9-12-months"), `day ${days}`).toBe(true);
    }
  });

  it("canonicalises a dog in the final stage to the final stage", async () => {
    // Day 420 is past thirteen months and short of nineteen for any DOB.
    const canonical = await canonicalFor({ dob: dobForAge(420, "ON"), province: "ON" });
    expect(canonical.endsWith("/puppy/beyond-the-first-year")).toBe(true);
  });

  it("sends a dog past the Journey to the hub, not to a stage", async () => {
    // Day 700 is comfortably past eighteen months for any date of birth.
    const canonical = await canonicalFor({ dob: dobForAge(700, "ON"), province: "ON" });
    expect(canonical.endsWith("/puppy")).toBe(true);
  });

  it("canonicalises a 12-week puppy to the 12-week stage", async () => {
    for (const days of [84, 87, 90]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/12-weeks")).toBe(true);
    }
  });

  it("leaves the 9–11 week canonical exactly where it was", async () => {
    for (const days of [63, 73, 83]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/9-11-weeks")).toBe(true);
    }
  });

  it("canonicalises an 8-week puppy to the 8-week stage", async () => {
    for (const days of [56, 59, 62]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/8-weeks")).toBe(true);
    }
  });

  it("canonicalises a puppy of any other age to the Journey hub, not to a stage", async () => {
    // Day 76 is one day short of week 11; day 84 is one day past it; the rest
    // are ages we have written no stage for at all.
    for (const days of [1, 20, 40, 55, 700, 900]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy")).toBe(true);
      expect(canonical).not.toContain("9-11-weeks");
    }
  });

  it("canonicalises missing, unreadable and impossible dates to the hub", async () => {
    expect(await canonicalFor({})).toMatch(/\/puppy$/);
    expect(await canonicalFor({ dob: "not-a-date" })).toMatch(/\/puppy$/);
    expect(await canonicalFor({ dob: "2099-01-01" })).toMatch(/\/puppy$/);
    expect(await canonicalFor({ dob: dobForAge(4000) })).toMatch(/\/puppy$/);
  });

  it("never varies the canonical by breed or province, only by resolved stage", async () => {
    // Breed and province personalise the prose; they do not create a new
    // document. If they moved the canonical they would be minting index
    // entries, which is the whole thing this architecture refuses to do.
    const dob = dobForAge(80, "ON");
    const plain = await canonicalFor({ dob, province: "ON" });

    for (const breed of allBreeds) {
      expect(await canonicalFor({ dob, province: "ON", breed: breed.slug })).toBe(plain);
    }
    for (const province of provinces) {
      const canonical = await canonicalFor({ dob: dobForAge(80, province.code), province: province.code });
      expect(canonical.endsWith("/puppy/9-11-weeks")).toBe(true);
    }
  });

  it("stays noindex in every state, so no query string is ever independently indexable", async () => {
    const states: Record<string, string>[] = [
      {},
      { dob: "not-a-date" },
      { dob: dobForAge(80, "ON"), province: "ON" },
      { dob: dobForAge(80, "ON"), province: "ON", breed: "poodle" },
      { dob: dobForAge(200, "ON") },
    ];

    for (const state of states) {
      const metadata = await myPuppyMetadata({ searchParams: Promise.resolve(state) });
      expect(metadata.robots).toMatchObject({ index: false });
    }
  });

  it("ignores a repeated query parameter rather than concatenating it", async () => {
    const dob = dobForAge(80, "ON");
    const metadata = await myPuppyMetadata({
      searchParams: Promise.resolve({ dob: [dob, "2099-01-01"], province: "ON" }),
    });
    expect(String(metadata.alternates?.canonical ?? "").endsWith("/puppy/9-11-weeks")).toBe(true);
  });
});

describe("indexing", () => {
  it("keeps every Puppy Journey route out of the sitemap in this milestone", () => {
    const urls = buildSitemapEntries().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/puppy"))).toBe(false);
    expect(urls.some((url) => url.includes("/my-puppy"))).toBe(false);
  });

  it("adds no route to the site beyond the three the Journey needs", () => {
    // The blueprint's central risk is a combinatorial route explosion —
    // breed × age, province × age, and so on. There are exactly three routes:
    // the hub, the one public stage, and the noindex personalised view.
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    const routes = readdirSync(appDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(routes).toContain("puppy");
    expect(routes).toContain("my-puppy");

    const puppyRoutes = readdirSync(join(appDir, "puppy"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect([...puppyRoutes].sort()).toEqual([
      "12-weeks",
      "3-months",
      "4-6-months",
      "7-8-months",
      "8-weeks",
      "9-11-weeks",
      "9-12-months",
      "beyond-the-first-year",
    ]);
    expect(puppyRoutes).toHaveLength(8);

    // Every merged-away or renamed entry stayed unbuilt.
    for (const slug of ["4-months", "5-months", "6-months", "9-10-months", "11-12-months", "young-adult"]) {
      expect(puppyRoutes).not.toContain(slug);
    }

    // The roadmap grew to thirteen entries and the route count did not move.
    // An entry is a position on a journey; a page is a piece of writing that
    // earned one. Nothing here generates the second from the first.
    const implemented = new Set(stages.map((stage) => stage.slug));
    for (const stage of roadmapStages) {
      expect(puppyRoutes.includes(stage.slug)).toBe(implemented.has(stage.slug));
    }

    // No dynamic segment anywhere under the Journey, which is what a
    // breed × age surface would need in order to exist at all.
    expect(puppyRoutes.some((name) => name.includes("["))).toBe(false);
    expect(
      readdirSync(join(appDir, "my-puppy"), { withFileTypes: true })
        .some((entry) => entry.isDirectory()),
    ).toBe(false);
  });

  it("links only to stages that have a page, so the rail has no broken routes", () => {
    // The rail renders every roadmap entry, but only an implemented one may
    // become an `<a>`. Anything else must be inert text — a link to
    // `/puppy/young-adult` would be a 404 offered to a reader and a crawler.
    const source = readFileSync(join(FEATURE_DIR, "components/journey-timeline.tsx"), "utf8");
    expect(source).toContain("implemented.has(stage.slug)");
    expect(source).toContain("isLive && !isCurrent ? (");

    // And the one route that exists is the one the rail can reach.
    const implemented = stages.map((stage) => stage.slug);
    expect([...implemented].sort()).toEqual([
      "12-weeks",
      "3-months",
      "4-6-months",
      "7-8-months",
      "8-weeks",
      "9-11-weeks",
      "9-12-months",
      "beyond-the-first-year",
    ]);
    for (const slug of implemented) {
      expect(roadmapStages.some((stage) => stage.slug === slug)).toBe(true);
    }
  });

  it("redirects the retired stage path instead of serving it twice", async () => {
    // `/puppy/11-weeks` was the proof of concept. Its content now lives at
    // `/puppy/9-11-weeks`, and the old path must be a redirect rather than a
    // second copy — a canonical would mean serving the same writing twice,
    // which is the duplication this migration exists to remove.
    const { default: config } = (await import("../../../next.config")) as {
      default: { redirects?: () => Promise<{ source: string; destination: string; permanent: boolean }[]> };
    };

    expect(typeof config.redirects).toBe("function");
    const redirects = await config.redirects!();

    // Both stage merges left a redirect behind, and both are permanent.
    const expected: [string, string][] = [
      ["/puppy/11-weeks", "/puppy/9-11-weeks"],
      ["/puppy/4-5-months", "/puppy/4-6-months"],
    ];

    for (const [source, destination] of expected) {
      const rule = redirects.find((r) => r.source === source);
      expect(rule, source).toBeDefined();
      expect(rule!.destination).toBe(destination);
      expect(rule!.permanent).toBe(true);
      // The destination is a real implemented stage, not another redirect.
      expect(stages.some((stage) => `/puppy/${stage.slug}` === destination)).toBe(true);
    }

    // And nothing is left behind to serve: no route, no page file.
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    for (const [source, destination] of expected) {
      expect(existsSync(join(appDir, source.replace("/puppy/", "puppy/"))), source).toBe(false);
      expect(
        existsSync(join(appDir, `${destination.replace("/puppy/", "puppy/")}/page.tsx`)),
        destination,
      ).toBe(true);
    }

    // A redirect must not point at another redirect, or at itself.
    for (const rule of redirects) {
      expect(rule.destination).not.toBe(rule.source);
      expect(redirects.some((other) => other.source === rule.destination)).toBe(false);
    }
  });

  it("serves each implemented stage from exactly one path", () => {
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    const puppyRoutes = readdirSync(join(appDir, "puppy"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    // One directory per implemented stage, and no orphan left over from the
    // rename that would render the same prose at a second URL.
    expect(puppyRoutes.length).toBe(stages.length);
    expect(puppyRoutes.every((name) => stages.some((stage) => stage.slug === name))).toBe(true);
  });

  it("leaves the article library at exactly the 35 of this milestone", () => {
    // The Journey links into the library and must not have grown it.
    expect(articles.length).toBe(35);
  });

  it("keeps the stage in review, which is what drives noindex on the route", () => {
    // The route sets `noIndex: stage.status !== "published"`, so this is the
    // single source of truth for both the meta robots tag and the sitemap.
    for (const stage of stages) {
      expect(stage.status).toBe("in-review");
    }
  });
});
