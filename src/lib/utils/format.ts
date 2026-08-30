import { siteConfig } from "@/config/site";

/**
 * Formatting helpers shared by server and client components.
 *
 * Locale is pinned to `en-CA` and no function reads the clock internally, so
 * server and client output cannot disagree and cause a hydration mismatch.
 */

const dateFormatter = new Intl.DateTimeFormat(siteConfig.language, {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const compactNumberFormatter = new Intl.NumberFormat(siteConfig.language, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats an ISO timestamp as a long, human-readable date. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** Formats large counts compactly (`1200` -> `1.2K`). */
export function formatCount(value: number): string {
  return compactNumberFormatter.format(value);
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const UNITS: ReadonlyArray<readonly [seconds: number, label: string]> = [
  [YEAR, "year"],
  [MONTH, "month"],
  [WEEK, "week"],
  [DAY, "day"],
  [HOUR, "hour"],
  [MINUTE, "minute"],
];

/**
 * Formats an elapsed duration in seconds as a short relative label.
 *
 * The single source of truth for relative time wording. Anything under a
 * minute, or in the future, reads as "just now" rather than producing a
 * negative or zero-valued phrase.
 */
export function formatElapsed(elapsedSeconds: number): string {
  if (elapsedSeconds < MINUTE) {
    return "just now";
  }

  for (const [seconds, label] of UNITS) {
    if (elapsedSeconds >= seconds) {
      const value = Math.floor(elapsedSeconds / seconds);
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

/**
 * Formats a past timestamp relative to `now`.
 *
 * `now` is an explicit parameter rather than an internal `Date.now()` call, so
 * the function stays pure and testable and callers control the reference point.
 */
export function formatRelativeTime(isoDate: string, now: Date): string {
  return formatElapsed(Math.round((now.getTime() - new Date(isoDate).getTime()) / 1000));
}

/** Formats a whole number of elapsed hours as a relative label. */
export function formatRelativeHours(hours: number): string {
  return formatElapsed(hours * HOUR);
}

/** Formats a whole number of elapsed days as a relative label. */
export function formatRelativeDays(days: number): string {
  return formatElapsed(days * DAY);
}
