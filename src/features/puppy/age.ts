/**
 * Puppy age resolution.
 *
 * ## Why this file does its own date arithmetic
 *
 * A date of birth is a *calendar* fact, not an instant. "Born 18 June" means
 * the same thing in Victoria and in St John's, and a puppy does not become a
 * week older when its owner flies east. Doing this with `Date` arithmetic in
 * local time is where the off-by-one lives: `new Date("2026-06-18")` parses as
 * midnight **UTC**, which is the evening of the 17th in every Canadian time
 * zone, so any comparison against a locally-constructed "today" is a day out
 * for most of the country for most of the day.
 *
 * So every date here is reduced to a *civil date* — year, month, day, with no
 * time and no zone — and compared as a day count. A real clock is read in
 * exactly two places, `todayInZone` and `todayLocal`, and both return civil
 * dates.
 *
 * The consequence worth stating: `resolveAge` is pure. It takes two civil
 * dates and returns the same answer in every deployment region, which is why
 * "what is today" is a separate decision made by `resolveToday` and passed in
 * rather than reached for. See the note above `TodaySource`.
 */

/** A calendar date with no time and no zone. */
export interface CivilDate {
  year: number;
  /** 1–12, unlike `Date.getMonth()`. */
  month: number;
  /** 1–31. */
  day: number;
}

/**
 * Days since an arbitrary fixed epoch, for a civil date.
 *
 * Howard Hinnant's `days_from_civil`. It is exact for all dates in range and,
 * critically, involves no `Date` object and therefore no time zone at all.
 */
export function daysFromCivil({ year, month, day }: CivilDate): number {
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Whole days between two civil dates. Negative if `to` precedes `from`. */
export function daysBetween(from: CivilDate, to: CivilDate): number {
  return daysFromCivil(to) - daysFromCivil(from);
}

/**
 * Parses a `YYYY-MM-DD` string — the value an `<input type="date">` produces.
 *
 * Deliberately does not use `Date.parse`, which would reintroduce the time
 * zone problem this module exists to avoid. Rejects anything that is not a
 * real calendar date, so 31 February and month 13 fail rather than rolling
 * over into March.
 */
export function parseCivilDate(value: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Round-trip through the day count: a date that does not exist normalises to
  // a different one, and that mismatch is the check.
  const candidate = { year, month, day };
  const roundTripped = civilFromDays(daysFromCivil(candidate));
  if (
    roundTripped.year !== year ||
    roundTripped.month !== month ||
    roundTripped.day !== day
  ) {
    return null;
  }

  return candidate;
}

/** Inverse of `daysFromCivil`, used to validate that a date really exists. */
export function civilFromDays(days: number): CivilDate {
  const z = days + 719468;
  const era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp + (mp < 10 ? 3 : -9);
  return { year: y + (month <= 2 ? 1 : 0), month, day };
}

/**
 * ## Deciding what "today" is
 *
 * This is the part that was wrong in the first version, which read today as a
 * Toronto civil date for every reader. Canada spans six time zones: at 01:30
 * UTC it is already tomorrow in Toronto and still today in Vancouver, so a
 * fixed Eastern reference ages a Vancouver puppy a day early for several
 * hours every night — and does the reverse in Newfoundland.
 *
 * There is no single correct answer available on a server, so the resolution
 * is a documented preference order and every result says which rung it came
 * from:
 *
 *  1. **The browser's own local date.** Correct by construction, because it
 *     is the reader's actual calendar. Available anywhere client-side.
 *  2. **The province's representative zone**, where one defensibly exists.
 *     Used for server rendering when a province has been supplied.
 *  3. **UTC.** The last resort, and deterministic — which matters more than
 *     being close, because a server-rendered value that varies with the
 *     deployment region is a hydration bug waiting to happen.
 */

/** Which rung of the preference order produced a date. */
export type TodaySource = "client" | "province" | "utc";

export interface ResolvedToday {
  date: CivilDate;
  source: TodaySource;
}

/**
 * Representative IANA zone for a province or territory.
 *
 * "Representative" is doing real work in that sentence. Several provinces are
 * not internally uniform, and the entries below are the zone the overwhelming
 * majority of the population is in rather than a claim about every community:
 *
 *  - **British Columbia** is Pacific except the Peace River region, which is
 *    Mountain year-round.
 *  - **Ontario** is Eastern except the northwest beyond about 90°W, which is
 *    Central.
 *  - **Quebec** is Eastern except the far east around Blanc-Sablon, which is
 *    Atlantic and does not observe DST.
 *  - **Saskatchewan** is Central year-round with no DST, except Lloydminster,
 *    which keeps Alberta time.
 *
 * Each of those is wrong for a minority of readers for at most one hour a
 * day, and is strictly better than UTC — which is wrong for *everyone* in the
 * country every evening. The client's own date supersedes all of it whenever
 * it is available.
 *
 * **Nunavut is deliberately absent.** It spans three zones with no dominant
 * one, so there is nothing defensible to map it to and it falls through to
 * UTC rather than being guessed at.
 */
const PROVINCE_TIME_ZONES: Readonly<Record<string, string>> = {
  AB: "America/Edmonton",
  BC: "America/Vancouver",
  MB: "America/Winnipeg",
  NB: "America/Moncton",
  NL: "America/St_Johns",
  NS: "America/Halifax",
  NT: "America/Edmonton",
  ON: "America/Toronto",
  PE: "America/Halifax",
  QC: "America/Toronto",
  SK: "America/Regina",
  YT: "America/Whitehorse",
  // NU intentionally omitted — see the note above.
};

/** Whether a province maps to a single defensible zone. */
export function hasRepresentativeTimeZone(province: string): boolean {
  return province in PROVINCE_TIME_ZONES;
}

/**
 * The civil date in a named IANA zone.
 *
 * `en-CA` formats as `YYYY-MM-DD`, so the parse below cannot fail for a valid
 * Date and a valid zone.
 */
export function todayInZone(timeZone: string, now: Date = new Date()): CivilDate {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return parseCivilDate(formatted) ?? { year: 1970, month: 1, day: 1 };
}

/**
 * The browser's own local civil date.
 *
 * Uses the local-time accessors rather than a formatter, so it reflects
 * whatever zone the reader's device is actually set to — including one that
 * is not Canadian at all. This is the accurate answer and the one to prefer
 * wherever client code can supply it.
 */
export function todayLocal(now: Date = new Date()): CivilDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export interface ResolveTodayOptions {
  /** The browser's local civil date, where the caller has one. Wins outright. */
  clientDate?: CivilDate | null;
  /** Province or territory code, used for server rendering. */
  province?: string | null;
  /** Injectable clock, for tests. */
  now?: Date;
}

/** Applies the preference order above and reports which rung answered. */
export function resolveToday({
  clientDate,
  province,
  now = new Date(),
}: ResolveTodayOptions = {}): ResolvedToday {
  if (clientDate) {
    return { date: clientDate, source: "client" };
  }

  const zone = province ? PROVINCE_TIME_ZONES[province] : undefined;
  if (zone) {
    return { date: todayInZone(zone, now), source: "province" };
  }

  return { date: todayInZone("UTC", now), source: "utc" };
}

/* --------------------------------------------- calendar-month arithmetic */

/**
 * ## Why months are not 30.44 days
 *
 * An owner asked "how old is your puppy" answers in calendar months, not in
 * thirtieths of a year. A puppy born on 3 June is three months old on
 * 3 September — not on 2 September because ninety-one and a third days have
 * elapsed, and not on 4 September either. The mean month is a fine unit for
 * an *average*; it is the wrong unit for an anniversary, and this product's
 * whole input is a specific date of birth.
 *
 * The difference is not cosmetic. Depending on which months a puppy's life
 * happens to span, a mean-month rule lands its three-month anniversary
 * anywhere from a day early to two days late, and every later boundary drifts
 * further. A reader who checks on the morning of the anniversary and is told
 * they are still in last month's stage has been told something they can see
 * is wrong.
 *
 * So the anniversary is computed on the calendar, in civil dates, with no
 * `Date` object anywhere in it.
 */

/** Days in a civil month. Leap years by the proleptic Gregorian rule. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/**
 * A date `months` calendar months later, clamped to the end of the month.
 *
 * The clamp is the standard rule and the only one that keeps the sequence
 * monotonic: where the target month has no such day-of-month, the last day of
 * that month is used.
 *
 *   31 January + 1 month → 28 February (29 February in a leap year)
 *   30 January + 1 month → 28 February — the same day, and deliberately so
 *   31 August  + 1 month → 30 September
 *   29 February 2024 + 12 months → 28 February 2025
 *
 * The consequence worth stating out loud: two different dates of birth can
 * share an anniversary. A puppy born on 30 January and one born on 31 January
 * both turn one month old on 28 February. That is not a bug to be worked
 * around — it is what "a month later" means when the month is short, and the
 * alternative (rolling into March) would claim a puppy is a month old on a day
 * *after* the anniversary of a puppy born a day later.
 */
export function addCalendarMonths(date: CivilDate, months: number): CivilDate {
  const zeroBased = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(zeroBased / 12);
  const month = zeroBased - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/**
 * Completed calendar months between two civil dates, never negative.
 *
 * Defined against `addCalendarMonths` rather than by arithmetic on the day
 * fields, so the month-end clamp is applied once and cannot disagree with
 * itself: a puppy born on 31 January *is* one month old on 28 February,
 * which a naive `today.day < birth.day` test gets wrong.
 */
export function completedCalendarMonths(birth: CivilDate, today: CivilDate): number {
  const approximate = (today.year - birth.year) * 12 + (today.month - birth.month);
  const months =
    daysFromCivil(today) < daysFromCivil(addCalendarMonths(birth, approximate))
      ? approximate - 1
      : approximate;
  return Math.max(0, months);
}

/** Days since the most recent monthly anniversary. */
export function daysSinceMonthAnniversary(birth: CivilDate, today: CivilDate): number {
  const months = completedCalendarMonths(birth, today);
  return daysBetween(addCalendarMonths(birth, months), today);
}

/** Why an age could not be resolved. Rendered as a message, never thrown. */
export type AgeProblem = "invalid" | "future" | "implausible";

export interface PuppyAge {
  /** Whole days lived. Zero on the day of birth. */
  days: number;
  /** Completed weeks. */
  weeks: number;
  /** Days past the last completed week, 0–6. */
  remainderDays: number;
  /** Completed calendar months, on calendar anniversaries rather than a mean month. */
  months: number;
  /** Days since the most recent monthly anniversary. */
  remainderDaysInMonth: number;
  /** "11 weeks", "4 months and 2 weeks" — the age with no trailing "old". */
  exact: string;
  /** `exact` plus "old", for a sentence. */
  label: string;
}

export type AgeResult =
  | { ok: true; age: PuppyAge }
  | { ok: false; problem: AgeProblem };

/**
 * An upper bound on what this product will treat as a puppy date of birth.
 *
 * Three years. Past that the entry is far likelier to be a typo or an adult
 * dog than a puppy, and quietly rendering a "156 weeks old" Journey would be
 * worse than saying so.
 */
export const MAX_PLAUSIBLE_DAYS = 365 * 3;

/**
 * The exact age as a noun phrase, with no trailing "old".
 *
 * Returned bare because the interface needs it both ways: "Your puppy is 11
 * weeks old" in a sentence, and a plain "13 weeks" in a meta row beside a
 * stage label. Appending "old" at the call site is cheaper and safer than
 * stripping it off again.
 */
function describe(days: number, months: number, remainderDaysInMonth: number): string {
  if (days < 7) {
    return days === 1 ? "1 day" : `${days} days`;
  }

  if (days < 112) {
    // Under 16 weeks, weeks are the unit everyone actually uses.
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }

  if (months < 12) {
    const leftoverWeeks = Math.floor(remainderDaysInMonth / 7);
    if (leftoverWeeks >= 1 && leftoverWeeks <= 3) {
      return `${months} months and ${leftoverWeeks} week${leftoverWeeks === 1 ? "" : "s"}`;
    }
    return `${months} months`;
  }

  const years = Math.floor(months / 12);
  const leftoverMonths = months % 12;
  if (leftoverMonths === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${years} year${years === 1 ? "" : "s"} and ${leftoverMonths} month${leftoverMonths === 1 ? "" : "s"}`;
}

/**
 * Resolves a date of birth to an age.
 *
 * Never throws. A bad date is a state the interface renders, not an exception
 * — someone mistyping a year should get a sentence, not a stack trace.
 */
export function resolveAge(birth: CivilDate, today: CivilDate): AgeResult {
  const days = daysBetween(birth, today);

  if (days < 0) {
    return { ok: false, problem: "future" };
  }

  if (days > MAX_PLAUSIBLE_DAYS) {
    return { ok: false, problem: "implausible" };
  }

  const months = completedCalendarMonths(birth, today);
  const remainderDaysInMonth = daysBetween(addCalendarMonths(birth, months), today);
  const exact = describe(days, months, remainderDaysInMonth);

  return {
    ok: true,
    age: {
      days,
      weeks: Math.floor(days / 7),
      remainderDays: days % 7,
      months,
      remainderDaysInMonth,
      exact,
      label: `${exact} old`,
    },
  };
}

/** Parses and resolves in one step, for a raw form value. */
export function resolveAgeFromInput(value: string, today: CivilDate): AgeResult {
  const birth = parseCivilDate(value);
  if (!birth) {
    return { ok: false, problem: "invalid" };
  }
  return resolveAge(birth, today);
}

/** Formats a civil date for display. */
export function formatCivilDate(date: CivilDate): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${date.day} ${months[date.month - 1]} ${date.year}`;
}

/**
 * The meteorological season a civil date falls in, for the seasonal layer.
 *
 * Meteorological rather than astronomical because the boundaries are whole
 * months, which is both simpler and closer to how the weather actually
 * behaves in this country.
 */
export type Season = "winter" | "spring" | "summer" | "autumn";

export function seasonOf({ month }: CivilDate): Season {
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}
