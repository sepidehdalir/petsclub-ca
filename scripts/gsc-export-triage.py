#!/usr/bin/env python3
"""Triage official Google Search Console Performance CSV exports, offline.

This intentionally does NOT estimate property-wide totals from query/page rows
or infer indexed pages from Performance or sitemap data.
No dependencies, network calls, credentials, or production writes.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import asdict, dataclass
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlsplit


class ExportError(ValueError):
    """An export has ambiguous, missing, or inconsistent data."""


@dataclass(frozen=True)
class PerformanceRow:
    key: str
    clicks: int
    impressions: int
    ctr_percent: float
    position: float


KEY_HEADERS = {
    "query": {"top queries", "queries", "query"},
    "page": {"top pages", "pages", "page"},
}
METRIC_HEADERS = {
    "clicks": {"clicks"},
    "impressions": {"impressions"},
    "ctr_percent": {"ctr"},
    "position": {"position", "average position"},
}
COMMERCIAL_INTENT = re.compile(
    r"\b(best|buy|price|prices|cost|compare|comparison|review|reviews|"
    r"vs\.?|insurance|harness|carrier|scratch(?:ing)? post|puzzle feeder|dog boots)\b",
    re.IGNORECASE,
)


def parse_day(raw: str, label: str) -> date:
    try:
        day = date.fromisoformat(raw)
    except ValueError as exc:
        raise ExportError(f"{label}: expected YYYY-MM-DD, received {raw!r}") from exc
    if day.isoformat() != raw:
        raise ExportError(f"{label}: expected YYYY-MM-DD, received {raw!r}")
    return day


def interval(start: str, end: str, label: str) -> dict[str, object]:
    first, last = parse_day(start, f"{label} start"), parse_day(end, f"{label} end")
    if first > last:
        raise ExportError(f"{label}: start date is after end date")
    return {"start": first.isoformat(), "end": last.isoformat(), "days": (last - first).days + 1}


def nonnegative_integer(raw: str, label: str) -> int:
    value = raw.strip().replace(",", "")
    if not re.fullmatch(r"\d+", value):
        raise ExportError(f"{label}: expected nonnegative integer, got {raw!r}")
    return int(value)


def decimal(raw: str, label: str) -> float:
    value = raw.strip().replace("%", "").replace(",", ".")
    try:
        number = float(value)
    except ValueError as exc:
        raise ExportError(f"{label}: expected decimal, got {raw!r}") from exc
    if not 0 <= number < float("inf"):
        raise ExportError(f"{label}: invalid decimal {raw!r}")
    return number


def read_export(path: Path, dimension: str) -> list[PerformanceRow]:
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames:
            raise ExportError(f"{path}: no CSV headers")
        columns = {name.strip().casefold(): name for name in reader.fieldnames if name}
        mapping: dict[str, str] = {}
        for semantic, aliases in [(dimension, KEY_HEADERS[dimension]), *METRIC_HEADERS.items()]:
            matches = [columns[a] for a in aliases if a in columns]
            if len(matches) != 1:
                raise ExportError(f"{path}: expected one {semantic} column (English GSC CSV)")
            mapping[semantic] = matches[0]
        result: list[PerformanceRow] = []
        keys: set[str] = set()
        for line_number, item in enumerate(reader, start=2):
            key = (item.get(mapping[dimension]) or "").strip()
            if not key:
                raise ExportError(f"{path}:{line_number}: empty {dimension}")
            if key in keys:
                raise ExportError(f"{path}:{line_number}: duplicate {dimension} {key!r}")
            keys.add(key)
            if dimension == "page":
                address = urlsplit(key)
                host = (address.hostname or "").lower()
                if address.scheme != "https" or not (host == "thepetclub.ca" or host.endswith(".thepetclub.ca")):
                    raise ExportError(f"{path}:{line_number}: page outside ThePetClub.ca property: {key!r}")
            label = f"{path}:{line_number}"
            clicks = nonnegative_integer(item.get(mapping["clicks"]) or "", f"{label} clicks")
            impressions = nonnegative_integer(item.get(mapping["impressions"]) or "", f"{label} impressions")
            ctr = decimal(item.get(mapping["ctr_percent"]) or "", f"{label} CTR")
            position = decimal(item.get(mapping["position"]) or "", f"{label} position")
            if ctr > 100 or position <= 0 or clicks > impressions:
                raise ExportError(f"{label}: invalid CTR, position, or clicks>impressions")
            result.append(PerformanceRow(key, clicks, impressions, ctr, position))
    return result


def serialize(rows: list[PerformanceRow], limit: int) -> list[dict[str, object]]:
    return [asdict(row) for row in rows[:limit]]


def opportunities(rows: list[PerformanceRow], limit: int) -> dict[str, list[dict[str, object]]]:
    # Descriptive triage thresholds; NOT estimated click lift or a Google ranking promise.
    by_exposure = lambda item: (-item.impressions, -item.clicks, item.key)
    near = sorted(
        (r for r in rows if 5 <= r.position <= 20 and r.impressions >= 30),
        key=by_exposure,
    )
    low_ctr = sorted(
        (r for r in rows if r.position <= 10 and r.impressions >= 50 and r.ctr_percent < 2),
        key=by_exposure,
    )
    commercial = sorted((r for r in rows if COMMERCIAL_INTENT.search(r.key)), key=by_exposure)
    return {
        "near_first_page_heuristic": serialize(near, limit),
        "high_exposure_low_ctr_heuristic": serialize(low_ctr, limit),
        "commercial_intent_heuristic": serialize(commercial, limit),
    }


def row_deltas(current: list[PerformanceRow], earlier: list[PerformanceRow], limit: int) -> list[dict[str, object]]:
    prior = {item.key: item for item in earlier}
    changes = []
    for row in current:
        old = prior.get(row.key)
        if not old:
            continue
        changes.append({
            "key": row.key,
            "row_click_change": row.clicks - old.clicks,
            "row_impression_change": row.impressions - old.impressions,
            "current_position": row.position,
            "previous_position": old.position,
        })
    changes.sort(key=lambda d: (-abs(d["row_impression_change"]), d["key"]))
    return changes[:limit]


def build_report(args: argparse.Namespace) -> dict[str, object]:
    current_window = interval(args.start_date, args.end_date, "current")
    current_queries, current_pages = read_export(args.queries, "query"), read_export(args.pages, "page")
    previous_args = [args.previous_queries, args.previous_pages, args.previous_start, args.previous_end]
    if any(previous_args) and not all(previous_args):
        raise ExportError("Previous comparison requires both CSVs plus previous start and end dates")
    previous_window = None
    previous_queries = previous_pages = None
    if all(previous_args):
        previous_window = interval(args.previous_start, args.previous_end, "previous")
        if previous_window["days"] != current_window["days"]:
            raise ExportError("Comparison windows must have the same number of calendar days")
        if parse_day(args.previous_end, "previous end") >= parse_day(args.start_date, "current start"):
            raise ExportError("Comparison windows must not overlap")
        previous_queries = read_export(args.previous_queries, "query")
        previous_pages = read_export(args.previous_pages, "page")

    indexing_args = [args.indexed_pages, args.not_indexed_pages, args.indexing_report_date]
    if any(item is not None for item in indexing_args) and not all(item is not None for item in indexing_args):
        raise ExportError("Indexing requires both official Page Indexing counts and its report date")
    if all(item is not None for item in indexing_args):
        if args.indexed_pages < 0 or args.not_indexed_pages < 0:
            raise ExportError("Indexing counts must be nonnegative")
        indexing = {
            "source": "operator_transcribed_official_gsc_page_indexing_overview",
            "as_of": parse_day(args.indexing_report_date, "indexing report date").isoformat(),
            "indexed_pages": args.indexed_pages,
            "not_indexed_pages": args.not_indexed_pages,
            "caveat": "Overview counts only; not a URL-level URL Inspection result.",
        }
    else:
        indexing = {
            "source": "not_provided",
            "indexed_pages": None,
            "not_indexed_pages": None,
            "caveat": "No indexed-page count may be inferred from sitemap URLs or Performance impressions.",
        }

    settled = parse_day(args.settled_through, "settled through").isoformat() if args.settled_through else None
    if settled and settled < args.end_date:
        maturity = "contains_dates_after_operator_supplied_settled_through"
    else:
        maturity = "operator_supplied_cutoff_not_api_verified" if settled else "unknown_not_api_verified"
    return {
        "property": "sc-domain:thepetclub.ca",
        "source": "locally_supplied_official_gsc_csv_exports_not_live_api",
        "window_supplied_by_operator": current_window,
        "previous_window_supplied_by_operator": previous_window,
        "data_maturity": {"state": maturity, "operator_supplied_settled_through": settled},
        "queries": {
            "rows_in_export": len(current_queries),
            "highest_impression_rows": serialize(sorted(current_queries, key=lambda r: (-r.impressions, -r.clicks)), args.top),
            "opportunities": opportunities(current_queries, args.top),
            "same_query_row_deltas": row_deltas(current_queries, previous_queries, args.top) if previous_queries is not None else None,
        },
        "pages": {
            "rows_in_export": len(current_pages),
            "highest_click_rows": serialize(sorted(current_pages, key=lambda r: (-r.clicks, -r.impressions)), args.top),
            "highest_impression_rows": serialize(sorted(current_pages, key=lambda r: (-r.impressions, -r.clicks)), args.top),
            "same_page_row_deltas": row_deltas(current_pages, previous_pages, args.top) if previous_pages is not None else None,
        },
        "indexing": indexing,
        "sitewide_performance_totals": None,
        "limitations": [
            "Rows in Performance exports are not guaranteed to be complete: anonymized queries and export row limits apply.",
            "Do not sum query/page rows and label them property-level Search Console totals.",
            "Date window and settled-through are operator inputs; this tool cannot validate them against Search Console.",
            "Heuristic opportunity labels are leads for manual SERP/editorial assessment, not ranking or revenue predictions.",
            "To assess true Page Indexing coverage, capture the official overview counts and exclusion reasons; sitemap size is not indexed coverage.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--queries", required=True, type=Path, help="GSC Performance Queries.csv")
    parser.add_argument("--pages", required=True, type=Path, help="GSC Performance Pages.csv")
    parser.add_argument("--start-date", required=True, help="Dates chosen in GSC Performance export, YYYY-MM-DD")
    parser.add_argument("--end-date", required=True, help="Last day chosen in GSC Performance export")
    parser.add_argument("--settled-through", help="Official settled cutoff only if independently verified")
    parser.add_argument("--previous-queries", type=Path)
    parser.add_argument("--previous-pages", type=Path)
    parser.add_argument("--previous-start")
    parser.add_argument("--previous-end")
    parser.add_argument("--indexed-pages", type=int, help="GSC Page Indexing overview indexed total, NOT sitemap count")
    parser.add_argument("--not-indexed-pages", type=int, help="GSC Page Indexing overview not indexed total")
    parser.add_argument("--indexing-report-date", help="Date displayed on official GSC Page Indexing overview")
    parser.add_argument("--top", type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.top <= 100:
        parser.error("--top must be from 1 to 100")
    try:
        report = build_report(args)
    except (ExportError, OSError, UnicodeError) as exc:
        parser.error(str(exc))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
