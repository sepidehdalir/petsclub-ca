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
 * time and no zone — and compared as a day count. The only place a real clock
 * is read is `todayInToronto()`, and even that returns a civil date.
 *
 * The consequence worth stating: this module is deterministic and has no
 * hidden dependency on where the server runs. `resolveAge` with the same two
 * civil dates returns the same answer in every deployment region.
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
 * Today, as a civil date in a fixed Canadian reference zone.
 *
 * One zone rather than the server's, so a deployment region change cannot
 * shift every reader's puppy by a day. `en-CA` with an explicit time zone
 * gives `YYYY-MM-DD` directly.
 */
export function todayInToronto(now: Date = new Date()): CivilDate {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  // `en-CA` is ISO-ordered, so this parse cannot fail for a valid Date.
  return parseCivilDate(formatted) ?? { year: 1970, month: 1, day: 1 };
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
const MAX_PLAUSIBLE_DAYS = 365 * 3;

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
export function resolveAge(birth: CivilDate, today: CivilDate = todayInToronto()): AgeResult {
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
export function resolveAgeFromInput(value: string, today?: CivilDate): AgeResult {
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
