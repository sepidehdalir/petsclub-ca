import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articles } from "@/features/editorial/articles";
import { generateMetadata as myPuppyMetadata } from "@/app/my-puppy/page";
import {
  civilFromDays,
  daysBetween,
  daysFromCivil,
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
import { allBreeds, findBreed, findProvince, provinces } from "@/features/puppy/model";
import { resolveSources, resolveStage } from "@/features/puppy/resolve";
import {
  elevenWeeks,
  findPhase,
  roadmapByPhase,
  roadmapStageForDays,
  roadmapStages,
  stageForDays,
  stages,
} from "@/features/puppy/stages";
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

describe("stage resolution", () => {
  it("resolves the implemented stage from an age in days, and nothing outside it", () => {
    expect(stageForDays(77)?.slug).toBe("11-weeks");
    expect(stageForDays(83)?.slug).toBe("11-weeks");
    expect(stageForDays(76)).toBeNull();
    expect(stageForDays(84)).toBeNull();
  });

  it("still places an unimplemented age on the roadmap, so the reader is not stranded", () => {
    expect(roadmapStageForDays(60)?.slug).toBe("8-weeks");
    expect(roadmapStageForDays(200)?.slug).toBe("6-months");
    expect(stageForDays(60)).toBeNull();
  });

  it("keeps roadmap ranges contiguous and non-overlapping", () => {
    for (let i = 1; i < roadmapStages.length; i += 1) {
      const current = roadmapStages[i];
      const previous = roadmapStages[i - 1];
      if (!current || !previous) {
        throw new Error("roadmap index out of range");
      }
      expect(current.ageMinDays).toBe(previous.ageMaxDays + 1);
    }
  });

  it("has exactly one implemented stage in this milestone", () => {
    expect(stages).toHaveLength(1);
    expect(stages[0]?.slug).toBe("11-weeks");
  });
});

/**
 * The hybrid model.
 *
 * The cadence widens as development slows — a week early on, a month through
 * early development, paired months through adolescence. These tests pin every
 * boundary, because the whole model is boundaries and an off-by-one anywhere
 * puts a reader on the wrong stage.
 */
describe("hybrid age resolution", () => {
  const slugFor = (days: number) => roadmapStageForDays(days)?.slug ?? null;

  it("steps week by week from 8 to 12 weeks", () => {
    const weekly: [number, number, string][] = [
      [56, 62, "8-weeks"],
      [63, 69, "9-weeks"],
      [70, 76, "10-weeks"],
      [77, 83, "11-weeks"],
      [84, 90, "12-weeks"],
    ];

    for (const [min, max, slug] of weekly) {
      expect(max - min).toBe(6); // seven inclusive days, i.e. an actual week
      expect(slugFor(min)).toBe(slug);
      expect(slugFor(max)).toBe(slug);
      expect(slugFor(min - 1)).not.toBe(slug);
      expect(slugFor(max + 1)).not.toBe(slug);
    }
  });

  it("hands over from the weekly phase to the monthly one at thirteen weeks", () => {
    // Day 90 is the last day of week 12; day 91 is exactly thirteen weeks and
    // also the first day of the third month. The two schemes meet with no seam
    // and no overlap, which is the join most likely to be got wrong.
    expect(slugFor(90)).toBe("12-weeks");
    expect(slugFor(91)).toBe("3-months");
    expect(roadmapStageForDays(90)?.phase).toBe("early-puppy");
    expect(roadmapStageForDays(91)?.phase).toBe("early-development");
  });

  it("steps month by month from 3 to 6 months", () => {
    const monthly: [number, number, string][] = [
      [91, 121, "3-months"],
      [122, 152, "4-months"],
      [153, 182, "5-months"],
      [183, 212, "6-months"],
    ];

    for (const [min, max, slug] of monthly) {
      expect(slugFor(min)).toBe(slug);
      expect(slugFor(max)).toBe(slug);
      expect(slugFor(min - 1)).not.toBe(slug);
      expect(slugFor(max + 1)).not.toBe(slug);
      // A month, not a four-week block: every one of these is 30 or 31 days.
      expect(max - min + 1).toBeGreaterThanOrEqual(30);
      expect(max - min + 1).toBeLessThanOrEqual(31);
    }
  });

  it("uses paired-month ranges through adolescence", () => {
    const ranges: [number, number, string][] = [
      [213, 273, "7-8-months"],
      [274, 334, "9-10-months"],
      [335, 395, "11-12-months"],
    ];

    for (const [min, max, slug] of ranges) {
      expect(slugFor(min)).toBe(slug);
      expect(slugFor(max)).toBe(slug);
      expect(slugFor(min - 1)).not.toBe(slug);
      expect(slugFor(max + 1)).not.toBe(slug);
      expect(roadmapStageForDays(min)?.phase).toBe("adolescence");
    }

    // The bucket that used to swallow everything from five months to nine.
    expect(slugFor(200)).toBe("6-months");
    expect(slugFor(220)).toBe("7-8-months");
  });

  it("falls through to young adult past the last adolescent range, and no further", () => {
    expect(slugFor(395)).toBe("11-12-months");
    expect(slugFor(396)).toBe("young-adult");
    expect(slugFor(700)).toBe("young-adult");
    expect(slugFor(MAX_PLAUSIBLE_DAYS)).toBe("young-adult");

    // The roadmap stops exactly where the age engine stops accepting a date
    // of birth at all, so there is no age that resolves to nothing in between.
    expect(slugFor(MAX_PLAUSIBLE_DAYS + 1)).toBeNull();
    expect(resolveAge({ year: 2020, month: 1, day: 1 }, { year: 2026, month: 9, day: 5 }).ok).toBe(
      false,
    );
  });

  it("marks maturity as the one boundary that genuinely depends on size", () => {
    // Not implemented, and deliberately not promised to the reader — but the
    // place where a size-aware answer belongs is recorded rather than lost.
    const sizeDependent = roadmapStages.filter((stage) => stage.boundaryVariesBySize);
    expect(sizeDependent.map((stage) => stage.slug)).toEqual(["young-adult"]);
  });

  it("resolves every plausible age from eight weeks on to exactly one stage", () => {
    for (let days = 56; days <= MAX_PLAUSIBLE_DAYS; days += 1) {
      const matches = roadmapStages.filter(
        (stage) => days >= stage.ageMinDays && days <= stage.ageMaxDays,
      );
      expect(matches).toHaveLength(1);
    }
  });

  it("resolves nothing before eight weeks, rather than guessing a stage", () => {
    // Under eight weeks a puppy is normally still with its breeder. That is
    // the one age the Journey declines to place, and it degrades to the
    // "not written yet" state rather than to a wrong week.
    for (const days of [0, 20, 55]) {
      expect(roadmapStageForDays(days)).toBeNull();
      expect(stageForDays(days)).toBeNull();
    }
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

    // Each phase's stages are longer than the last phase's, which is the
    // entire premise of the hybrid model stated as an assertion.
    const spans = groups.map((group) =>
      Math.min(...group.stages.map((stage) => stage.ageMaxDays - stage.ageMinDays + 1)),
    );
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

  it("keeps the implemented stage a strict subset of the roadmap", () => {
    // A page is not minted because an interval elapsed. Every implemented
    // stage must appear on the roadmap; the reverse must not hold.
    const roadmapSlugs = new Set(roadmapStages.map((stage) => stage.slug));
    for (const stage of stages) {
      expect(roadmapSlugs.has(stage.slug)).toBe(true);
    }
    expect(stages.length).toBeLessThan(roadmapStages.length);
  });

  it("agrees with the implemented stage wherever both resolve", () => {
    for (const stage of stages) {
      for (const days of [stage.ageMinDays, stage.ageMaxDays]) {
        expect(roadmapStageForDays(days)?.slug).toBe(stage.slug);
      }
    }
  });
});

describe("modifier composition", () => {
  it("returns universal content when no context is supplied", () => {
    const sections = resolveStage(elevenWeeks);
    for (const section of sections) {
      expect(section.sizeGroupBlock).toBeUndefined();
      expect(section.breedBlock).toBeUndefined();
      expect(section.provinceBlocks).toEqual([]);
      expect(section.seasonBlock).toBeUndefined();
    }
  });

  it("applies a size group inferred from the breed", () => {
    const sections = resolveStage(elevenWeeks, { breedSlug: "golden-retriever" });
    const exercise = sections.find((s) => s.id === "exercise");
    expect(exercise?.sizeGroupBlock).toBeDefined();
  });

  it("lets an explicit size group work without a breed", () => {
    const sections = resolveStage(elevenWeeks, { sizeGroup: "giant" });
    expect(sections.find((s) => s.id === "exercise")?.sizeGroupBlock).toBeDefined();
    expect(sections.find((s) => s.id === "exercise")?.breedBlock).toBeUndefined();
  });

  it("adds no breed block for a mixed breed, only its size group", () => {
    const sections = resolveStage(elevenWeeks, { breedSlug: "mixed" });
    for (const section of sections) {
      expect(section.breedBlock).toBeUndefined();
    }
  });

  it("renders a province block only where that province changes the answer", () => {
    const ontario = resolveStage(elevenWeeks, { province: "ON" });
    const vaccineON = ontario.find((s) => s.id === "vaccine-questions");
    expect(vaccineON?.provinceBlocks).toHaveLength(1);
    expect(vaccineON?.provinceBlocks[0]?.kind).toBe("legal");

    const bc = resolveStage(elevenWeeks, { province: "BC" });
    expect(bc.find((s) => s.id === "vaccine-questions")?.provinceBlocks[0]?.kind).toBe("guidance");

    // Saskatchewan has no verified difference at this stage, so it gets none.
    const sask = resolveStage(elevenWeeks, { province: "SK" });
    for (const section of sask) {
      expect(section.provinceBlocks).toEqual([]);
    }
  });

  it("adds a season block only for seasons that genuinely change the week", () => {
    expect(
      resolveStage(elevenWeeks, { season: "winter" }).find((s) => s.id === "this-week")
        ?.seasonBlock,
    ).toBeDefined();
    expect(
      resolveStage(elevenWeeks, { season: "spring" }).find((s) => s.id === "this-week")
        ?.seasonBlock,
    ).toBeUndefined();
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

    for (const section of resolveStage(elevenWeeks, context)) {
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
    const base = resolveSources(elevenWeeks);
    const withOntario = resolveSources(elevenWeeks, { province: "ON" });
    expect(withOntario.length).toBe(base.length + 1);
    expect(withOntario.some((s) => s.url.includes("ontario.ca"))).toBe(true);

    // And de-duplicates rather than listing the same URL twice.
    expect(new Set(withOntario.map((s) => s.url)).size).toBe(withOntario.length);
  });
});

describe("content integrity", () => {
  it("points every guide link at an article that exists", () => {
    const slugs = new Set(articles.map((article) => article.slug));

    for (const section of elevenWeeks.sections) {
      if (section.guide) {
        expect(slugs.has(section.guide.slug), `${section.id}: ${section.guide.slug}`).toBe(true);
      }
    }

    // Season modifiers carry their own guide links.
    for (const season of ["winter", "summer"] as const) {
      for (const section of resolveStage(elevenWeeks, { season })) {
        if (section.seasonBlock?.guide) {
          expect(slugs.has(section.seasonBlock.guide.slug)).toBe(true);
        }
      }
    }
  });

  it("gives every section at most one guide link, so it is not a related-posts block", () => {
    for (const section of elevenWeeks.sections) {
      expect(section.guide === undefined || typeof section.guide.slug === "string").toBe(true);
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

  it("publishes no vaccination schedule anywhere in the stage", () => {
    // The safety rule this product is built on. The vaccine section asks
    // questions; it must never acquire a timetable.
    const prose = JSON.stringify(elevenWeeks.sections).toLowerCase();
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
    expect(elevenWeeks.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(elevenWeeks.status).toBe("in-review");
  });

  it("records open verification items, and never renders them", () => {
    expect(elevenWeeks.needsVerification.length).toBeGreaterThan(0);

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
    expect(canonical.endsWith("/puppy/11-weeks")).toBe(true);
  });

  it("holds that canonical across the whole of week 11", async () => {
    for (const days of [77, 78, 83]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy/11-weeks")).toBe(true);
    }
  });

  it("canonicalises a puppy of any other age to the Journey hub, not to a stage", async () => {
    // Day 76 is one day short of week 11; day 84 is one day past it; the rest
    // are ages we have written no stage for at all.
    for (const days of [1, 40, 76, 84, 150, 300]) {
      const canonical = await canonicalFor({ dob: dobForAge(days, "ON"), province: "ON" });
      expect(canonical.endsWith("/puppy")).toBe(true);
      expect(canonical).not.toContain("11-weeks");
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
      expect(canonical.endsWith("/puppy/11-weeks")).toBe(true);
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
    expect(String(metadata.alternates?.canonical ?? "").endsWith("/puppy/11-weeks")).toBe(true);
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
    expect(puppyRoutes).toEqual(["11-weeks"]);

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
    expect(implemented).toEqual(["11-weeks"]);
    expect(roadmapStages.some((stage) => stage.slug === "11-weeks")).toBe(true);
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
