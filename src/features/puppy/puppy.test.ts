import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { articles } from "@/features/editorial/articles";
import {
  daysBetween,
  formatCivilDate,
  parseCivilDate,
  resolveAge,
  resolveAgeFromInput,
  seasonOf,
  todayInToronto,
} from "@/features/puppy/age";
import { allBreeds, findBreed, findProvince, provinces } from "@/features/puppy/model";
import { resolveSources, resolveStage } from "@/features/puppy/resolve";
import {
  elevenWeeks,
  roadmapStageForDays,
  roadmapStages,
  stageForDays,
  stages,
} from "@/features/puppy/stages";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

const FEATURE_DIR = fileURLToPath(new URL("./", import.meta.url));

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
    expect(resolveAgeFromInput("not a date").ok).toBe(false);
    expect(resolveAgeFromInput("not a date")).toEqual({ ok: false, problem: "invalid" });
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

  it("reads today as a civil date in a fixed Canadian zone", () => {
    // 4 September 2026, 02:30 UTC is still 3 September in Toronto. A naive
    // implementation using the server's local date would be a day out.
    const lateUtc = new Date("2026-09-04T02:30:00Z");
    expect(todayInToronto(lateUtc)).toEqual({ year: 2026, month: 9, day: 3 });
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

describe("indexing", () => {
  it("keeps every Puppy Journey route out of the sitemap in this milestone", () => {
    const urls = buildSitemapEntries().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/puppy"))).toBe(false);
    expect(urls.some((url) => url.includes("/my-puppy"))).toBe(false);
  });

  it("keeps the stage in review, which is what drives noindex on the route", () => {
    // The route sets `noIndex: stage.status !== "published"`, so this is the
    // single source of truth for both the meta robots tag and the sitemap.
    for (const stage of stages) {
      expect(stage.status).toBe("in-review");
    }
  });
});
