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

/** Why an age could not be resolved. Rendered as a message, never thrown. */
export type AgeProblem = "invalid" | "future" | "implausible";

export interface PuppyAge {
  /** Whole days lived. Zero on the day of birth. */
  days: number;
  /** Completed weeks. */
  weeks: number;
  /** Days past the last completed week, 0–6. */
  remainderDays: number;
  /** Completed calendar months, for older puppies. */
  months: number;
  /** "11 weeks", "4 months and 2 weeks" — the phrase the UI shows. */
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

/** Completed calendar months between two civil dates. */
function completedMonths(birth: CivilDate, today: CivilDate): number {
  let months = (today.year - birth.year) * 12 + (today.month - birth.month);
  if (today.day < birth.day) {
    months -= 1;
  }
  return Math.max(0, months);
}

function describe(days: number, months: number): string {
  if (days < 7) {
    return days === 1 ? "1 day old" : `${days} days old`;
  }

  if (days < 112) {
    // Under 16 weeks, weeks are the unit everyone actually uses.
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week old" : `${weeks} weeks old`;
  }

  if (months < 12) {
    const leftoverWeeks = Math.floor((days - months * 30.44) / 7);
    if (leftoverWeeks >= 1 && leftoverWeeks <= 3) {
      return `${months} months and ${leftoverWeeks} week${leftoverWeeks === 1 ? "" : "s"} old`;
    }
    return `${months} months old`;
  }

  const years = Math.floor(months / 12);
  const leftoverMonths = months % 12;
  if (leftoverMonths === 0) {
    return years === 1 ? "1 year old" : `${years} years old`;
  }
  return `${years} year${years === 1 ? "" : "s"} and ${leftoverMonths} month${leftoverMonths === 1 ? "" : "s"} old`;
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

  const months = completedMonths(birth, today);

  return {
    ok: true,
    age: {
      days,
      weeks: Math.floor(days / 7),
      remainderDays: days % 7,
      months,
      label: describe(days, months),
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
