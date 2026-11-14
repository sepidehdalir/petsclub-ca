# ThePetClub.ca — official Search Console export triage (review-only)

This is a no-cost, local read-only fallback when the authorized Search Console
API does not expose `sc-domain:thepetclub.ca`. **It does not connect to Google,
write to the website, submit URLs, or manufacture Search Console numbers.**

## Minimum official export

1. Open **Google Search Console → ThePetClub.ca → Performance → Search results**,
   with Search type **Web**. Choose **Last 28 days** and note the **exact dates
   displayed**. Use **Export** to obtain the **Queries** and **Pages** CSV tabs.
   Record whether any days are marked fresh/preliminary. For a comparison,
   export a separate equal-length preceding date window, again both tabs.
2. Open **Indexing → Pages**. Record the displayed **Indexed** and **Not
   indexed** totals, the report update date, and the main exclusion reasons.
   Export the report if offered. These are separate coverage statistics, not
   derived from Performance reports, `site:` searches, sitemap line counts, or
   rows with impressions.
3. Save files locally. Never commit actual Search Console exports (potentially
   sensitive search terms and business performance) or account credentials.

Example (dates below are **illustrative CLI inputs**, NOT observed GSC coverage):

```bash
python3 scripts/gsc-export-triage.py \
  --queries ~/Downloads/Queries.csv \
  --pages ~/Downloads/Pages.csv \
  --start-date 2026-09-25 --end-date 2026-10-22 \
  > /tmp/petclub-gsc-triage.json
```

Optional: add `--previous-queries`, `--previous-pages`, `--previous-start`,
`--previous-end` for **row-level** same-query/page differences. Only if the
official Page Indexing overview has been independently checked, add
`--indexed-pages`, `--not-indexed-pages`, `--indexing-report-date`. Only if a
settled cutoff is explicitly confirmed, use `--settled-through YYYY-MM-DD`.
The script marks it operator-supplied rather than claiming API validation.

All query/page metrics are **exported rows**, not necessarily property totals:
Search Console anonymizes some queries, and UI/API exports can truncate rows.
The report deliberately outputs `sitewide_performance_totals: null` and does
not infer indexed-page counts. For property-wide clicks/impressions/CTR/
weighted position, retain the unfiltered **Performance chart totals** from
Search Console separately; do **not** sum query or page rows and rename them.

Opportunity labels use transparent heuristics (e.g. positions 5–20 and at
least 30 impressions). They are **editorial triage only**: manually inspect
SERP intent, page quality, source freshness, business relevance and any
cannibalization before writing a content change. None implies a ranking lift,
conversion rate, or affiliate revenue.

## Tests

```bash
python3 -m unittest discover -s scripts/tests -p 'test_gsc_export_triage.py' -v
python3 -m py_compile scripts/gsc-export-triage.py
```

The tests use synthetic fixture data. In particular, they check that absent
indexing/total data remains absent and that another site's page CSV is refused.
Do not merge or release changes on the basis of this helper: current GSC,
preview QA, confirmed production target and explicit owner approval remain
mandatory for any site-facing release.
