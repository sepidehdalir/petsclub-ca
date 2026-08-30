import { siteConfig } from "@/config/site";

/**
 * Formatting helpers shared by server and client components.
 *
 * All formatting is locale-pinned to `en-CA` and rendered from an explicit
 * reference time where relevant, so server and client output cannot disagree
 * and cause a hydration mismatch.
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

/**
 * Formats a past timestamp as a short relative label ("3 days ago").
 *
 * `now` is an explicit parameter rather than an internal `Date.now()` call so
 * that callers control the reference point and the function stays pure and
 * testable.
 */
export function formatRelativeTime(isoDate: string, now: Date): string {
  const elapsedSeconds = Math.round((now.getTime() - new Date(isoDate).getTime()) / 1000);

  if (elapsedSeconds < MINUTE) {
    return "just now";
  }

  const units: Array<[seconds: number, label: string]> = [
    [YEAR, "year"],
    [MONTH, "month"],
    [WEEK, "week"],
    [DAY, "day"],
    [HOUR, "hour"],
    [MINUTE, "minute"],
  ];

  for (const [seconds, label] of units) {
    if (elapsedSeconds >= seconds) {
      const value = Math.floor(elapsedSeconds / seconds);
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
