import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articles } from "@/features/editorial/articles";
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
  findPhase,
  findRoadmapStage,
  journeyMeta,
  roadmapByPhase,
  breedModifiers,
  eightWeeks,
  provinceModifiers,
  roadmapStageFor,
  roadmapStages,
  seasonModifiers,
  sizeGroupModifiers,
  journeyHeadlineAge,
  stageAgePhrase,
  stageFor,
  stages,
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

  it("still places an unimplemented age on the roadmap, so the reader is not stranded", () => {
    const dob = "2026-06-18";
    expect(slugAtDay(dob, 60)).toBe("8-weeks");
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months");
    // Adolescence is on the roadmap and has no page — the reader is placed
    // without being sent anywhere that does not exist.
    expect(stageFor(ageOn(dob, "2027-01-18"))).toBeNull();
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

    // Exactly one open-ended stage, and it is the last one.
    const openEnded = roadmapStages.filter(
      (stage) => stage.range.unit === "months" && stage.range.maxMonths === undefined,
    );
    expect(openEnded.map((stage) => stage.slug)).toEqual(["young-adult"]);
    expect(roadmapStages.at(-1)?.slug).toBe("young-adult");
  });

  it("has exactly the two implemented stages of this milestone", () => {
    expect(stages.map((stage) => stage.slug)).toEqual(["8-weeks", "9-11-weeks", "12-weeks"]);
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
    expect(stageFor(ageOn(dob, dayAfter(dob, 91)))).toBeNull();

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
    expect(slugOn(dob, "2026-10-18")).toBe("4-months");
    expect(slugOn(dob, "2026-11-17")).toBe("4-months");
    expect(slugOn(dob, "2026-11-18")).toBe("5-months");
    expect(slugOn(dob, "2026-12-17")).toBe("5-months");
    expect(slugOn(dob, "2026-12-18")).toBe("6-months");
    expect(slugOn(dob, "2027-01-17")).toBe("6-months");
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months");
  });

  it("uses paired-month ranges through adolescence, on anniversaries", () => {
    const dob = "2026-06-18";
    // 7 → 8 stays put; 8 → 9 moves.
    expect(slugOn(dob, "2027-01-18")).toBe("7-8-months"); // 7 months
    expect(slugOn(dob, "2027-02-17")).toBe("7-8-months");
    expect(slugOn(dob, "2027-02-18")).toBe("7-8-months"); // 8 months
    expect(slugOn(dob, "2027-03-17")).toBe("7-8-months");
    expect(slugOn(dob, "2027-03-18")).toBe("9-10-months"); // 9 months

    // 10 → 11 moves.
    expect(slugOn(dob, "2027-04-18")).toBe("9-10-months"); // 10 months
    expect(slugOn(dob, "2027-05-17")).toBe("9-10-months");
    expect(slugOn(dob, "2027-05-18")).toBe("11-12-months"); // 11 months

    // 12 → 13 moves into maturity.
    expect(slugOn(dob, "2027-06-18")).toBe("11-12-months"); // 12 months
    expect(slugOn(dob, "2027-07-17")).toBe("11-12-months");
    expect(slugOn(dob, "2027-07-18")).toBe("young-adult"); // 13 months
    expect(ageOn(dob, "2027-07-18").months).toBe(13);
  });

  it("holds those boundaries for a month-end date of birth too", () => {
    // Born 31 August: every anniversary in a 30-day month is clamped.
    const dob = "2026-08-31";
    expect(slugOn(dob, "2026-11-30")).toBe("3-months");
    expect(slugOn(dob, "2026-12-30")).toBe("3-months");
    expect(slugOn(dob, "2026-12-31")).toBe("4-months");
    expect(slugOn(dob, "2027-02-28")).toBe("6-months"); // clamped from 31 February
    expect(slugOn(dob, "2027-03-30")).toBe("6-months");
    expect(slugOn(dob, "2027-03-31")).toBe("7-8-months");
    // Thirteen months from 31 August is 30 September, clamped.
    expect(slugOn(dob, "2027-09-29")).toBe("11-12-months");
    expect(slugOn(dob, "2027-09-30")).toBe("young-adult");
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

    expect(slugOn(dob, "2024-08-29")).toBe("6-months");
    expect(slugOn(dob, "2025-01-28")).toBe("9-10-months"); // 11 months is 29 January
    expect(slugOn(dob, "2025-01-29")).toBe("11-12-months");

    // Twelve months lands on 28 February, clamped; thirteen on 29 March, not.
    expect(ageOn(dob, "2025-02-28").months).toBe(12);
    expect(slugOn(dob, "2025-03-28")).toBe("11-12-months");
    expect(slugOn(dob, "2025-03-29")).toBe("young-adult");
  });

  it("falls through to young adult and stays there to the engine's own limit", () => {
    const dob = "2026-06-18";
    expect(slugOn(dob, "2027-07-18")).toBe("young-adult");
    expect(slugAtDay(dob, 800)).toBe("young-adult");
    expect(slugAtDay(dob, MAX_PLAUSIBLE_DAYS)).toBe("young-adult");

    // Past the engine's limit there is no age to resolve at all, so the
    // roadmap does not need — and must not have — an entry for it.
    const birth = parseCivilDate(dob)!;
    const past = civilFromDays(daysFromCivil(birth) + MAX_PLAUSIBLE_DAYS + 1);
    expect(resolveAge(birth, past).ok).toBe(false);
  });

  it("marks maturity as the one boundary that genuinely depends on size", () => {
    // Not implemented, and deliberately not promised to the reader — but the
    // place where a size-aware answer belongs is recorded rather than lost.
    const sizeDependent = roadmapStages.filter((stage) => stage.boundaryVariesBySize);
    expect(sizeDependent.map((stage) => stage.slug)).toEqual(["young-adult"]);
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
        if (!stage) {
          unresolved.push(`${formatCivilDate(birth)} on day ${days}`);
          continue;
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
      "4-months",
      "5-months",
      "6-months",
      "7-8-months",
      "9-10-months",
      "11-12-months",
      "young-adult",
    ]);

    expect(roadmapStages.map((stage) => stage.label)).toEqual([
      "8 weeks",
      "9–11 weeks",
      "12 weeks",
      "3 months",
      "4 months",
      "5 months",
      "6 months",
      "7\u20138 months",
      "9\u201310 months",
      "11\u201312 months",
      "Young adult",
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
      "maturity",
    ]);
    expect(groups.map((group) => group.phase.cadence)).toEqual([
      "weekly",
      "monthly",
      "milestone",
      "maturity",
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
      // Part-way through the month it says something the headline does not.
      ["2026-04-20", "2026-09-05", "4 months old", ["4 months and 2 weeks", "Early development"]],
      ["2026-01-31", "2026-09-05", "7\u20138 months old", ["7 months", "Adolescence"]],
      ["2025-08-31", "2026-09-05", "11\u201312 months old", ["1 year", "Adolescence"]],
      ["2024-02-29", "2026-09-05", "a young adult", ["2 years and 6 months", "Maturity"]],
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
    for (const [birth, today] of [
      ["2026-06-06", "2026-09-06"],
      ["2026-01-31", "2026-09-05"],
      ["2024-02-29", "2026-09-05"],
    ]) {
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
    for (const stage of roadmapStages) {
      const sentence = `Your puppy is ${stageAgePhrase(stage)}`;
      expect(sentence).not.toContain("Young adult old");
      expect(sentence.endsWith("old") || sentence.endsWith("a young adult")).toBe(true);
    }
    expect(stageAgePhrase(findRoadmapStage("young-adult")!)).toBe("a young adult");
    expect(stageAgePhrase(findRoadmapStage("9-11-weeks")!)).toBe("9–11 weeks old");
    expect(stageAgePhrase(findRoadmapStage("3-months")!)).toBe("3 months old");
    expect(stageAgePhrase(findRoadmapStage("9-10-months")!)).toBe("9\u201310 months old");
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
      expect(text).toContain("over three months of age");
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
    // And it carries three that no other stage does.
    for (const id of ["first-days", "toilet-training", "paperwork"] as const) {
      expect(ids).toContain(id);
      for (const other of stages.filter((stage) => stage.slug !== "8-weeks")) {
        expect(other.sections.some((section) => section.id === id)).toBe(false);
      }
    }
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

  it("keeps the implemented stage a strict subset of the roadmap", () => {
    // A page is not minted because an interval elapsed. Every implemented
    // stage must appear on the roadmap; the reverse must not hold.
    const roadmapSlugs = new Set(roadmapStages.map((stage) => stage.slug));
    for (const stage of stages) {
      expect(roadmapSlugs.has(stage.slug)).toBe(true);
    }
    expect(stages.length).toBeLessThan(roadmapStages.length);
    expect(stages).toHaveLength(3);
    expect(roadmapStages).toHaveLength(11);
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

  it("applies a size group inferred from the breed", () => {
    const sections = resolveStage(nineToElevenWeeks, { breedSlug: "golden-retriever" });
    const exercise = sections.find((s) => s.id === "exercise");
    expect(exercise?.sizeGroupBlock).toBeDefined();
  });

  it("lets an explicit size group work without a breed", () => {
    const sections = resolveStage(nineToElevenWeeks, { sizeGroup: "giant" });
    expect(sections.find((s) => s.id === "exercise")?.sizeGroupBlock).toBeDefined();
    expect(sections.find((s) => s.id === "exercise")?.breedBlock).toBeUndefined();
  });

  it("adds no breed block for a mixed breed, only its size group", () => {
    const sections = resolveStage(nineToElevenWeeks, { breedSlug: "mixed" });
    for (const section of sections) {
      expect(section.breedBlock).toBeUndefined();
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
    expect(withOntario.length).toBe(base.length + 1);
    expect(withOntario.some((s) => s.url.includes("ontario.ca"))).toBe(true);

    // And de-duplicates rather than listing the same URL twice.
    expect(new Set(withOntario.map((s) => s.url)).size).toBe(withOntario.length);
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

  it("gives every section at most one guide link, so it is not a related-posts block", () => {
    for (const stage of stages) {
      for (const section of stage.sections) {
        expect(section.guide === undefined || typeof section.guide.slug === "string").toBe(true);
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

  it("publishes no vaccination schedule anywhere in any stage", () => {
    // The safety rule this product is built on. The vaccine section asks
    // questions; it must never acquire a timetable.
    const prose = JSON.stringify(nineToElevenWeeks.sections).toLowerCase();
    for (const pattern of [
      /at \d+ weeks[^.]{0,40}(give|administer|vaccinate)/,
      /\bdose (one|two|three|1|2|3)\b/,
      /\bmg\/kg\b/,
      /\bml per\b/,
    ]) {
      expect(pattern.test(prose), `stage prose matches ${pattern}`).toBe(false);
    }
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
    for (const days of [1, 40, 55, 91, 150, 300]) {
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
    expect([...puppyRoutes].sort()).toEqual(["12-weeks", "8-weeks", "9-11-weeks"]);
    expect(puppyRoutes).toHaveLength(3);

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
    expect([...implemented].sort()).toEqual(["12-weeks", "8-weeks", "9-11-weeks"]);
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
    const retired = redirects.find((rule) => rule.source === "/puppy/11-weeks");

    expect(retired).toBeDefined();
    expect(retired!.destination).toBe("/puppy/9-11-weeks");
    expect(retired!.permanent).toBe(true);

    // And nothing is left behind to serve: no route, no page file.
    const appDir = fileURLToPath(new URL("../../app/", import.meta.url));
    expect(existsSync(join(appDir, "puppy/11-weeks"))).toBe(false);
    expect(existsSync(join(appDir, "puppy/9-11-weeks/page.tsx"))).toBe(true);

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
