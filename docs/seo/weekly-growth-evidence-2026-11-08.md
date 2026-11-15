# ThePetClub.ca — weekly growth evidence (8 November 2026)

**Status:** research / owner review only. No publication, index request, PR merge, email, outreach, partnership application or production change authorized by this document.

## Data source, exact period, and maturity

- Primary first-party source: owner's **official Google Search Console → Search Analytics for Sheets** automated exports for property `sc-domain:thepetclub.ca`, search type **Web**. Spreadsheet ID and any private Google credentials are intentionally not committed.
- The original GSC `Chart` export covers **2026-10-03 to 2026-10-30**. Automated day tabs and independent `Backup Totals` run through **2026-11-06**, with the 2026-11-06 tab logged as retrieved on **2026-11-08**.
- To avoid double counting, this rolling **2026-10-10 through 2026-11-06** 28-day calculation uses `Chart` **2026-10-10..2026-10-30** and `Backup Totals` **2026-10-31..2026-11-06**, one daily total per date.
- Latest imported day 2026-11-06 is **two calendar days behind this review**; 2026-11-07 is **not** present. Automated retrieval suggests normal GSC lag but does **not** expose Google's day-level provisional/final flag. Treat newest figures as **subject to revision**, and do not claim a direct current Search Console API read.
- Property-wide 28-day Web total: **32 clicks / 5,030 impressions / 0.64% CTR** (=32/5,030) and **approximately 19.1 mean position**, reconstructed using the GSC daily position rounded to one decimal and impression-weighted. This is *not* keyword-specific rank.
- Earlier fixed original `2026-10-03..2026-10-30` export: 31 clicks, 3,936 impressions, 0.79% CTR, approx 19.8 position. It heavily **overlaps** the rolling window, so do not call its differences a before/after growth trend.

### Non-overlapping six-day pulse (small sample, not a trend claim)

| GSC Web dates | Whole-property clicks | Impressions | CTR | Approx. impression-weighted average position |
| --- | ---: | ---: | ---: | ---: |
| 2026-10-25..2026-10-30 | 11 | 1,482 | 0.74% | 19.7 |
| 2026-11-01..2026-11-06 | 4 | 1,245 | 0.32% | 17.3 |

With only 15 clicks across both periods, **do not assign a cause to the difference or promise recovery**. Google may revise recent day totals.

### Query×page export caveats

- Dated daily tabs are **query–page** rows, not complete whole-site totals. Google anonymizes some queries; aggregating visible query/page rows can **omit clicks and impressions** or otherwise not reconcile exactly to site totals. For example 2026-11-06 `Backup Totals` records **1 click, 245 impressions**, whereas all 56 visible query×page rows for that date have **0 clicks**. **Never interpret those zeroes as zero site clicks.**
- In the 8 retrieved dated tabs (2026-10-30..2026-11-06), the visible `cat carrier` query associated with the existing carrier guide has **104 impressions, 0 recorded row clicks, and approximately 14.3 query×page position**. Its **2026-11-06 single-day row** has 31 impressions and position 13.3. Do not claim this is exact current rank or a proven improvement.
- `/community/pet-insurance`: **230 visible query×page impressions, 0 visible row clicks, approximate 45.2 position** across the same eight day tabs. The live page is a category hub, **not** a price-quote comparison or an active discussion forum. Its broad generic commercial queries have intent mismatch / tougher competition; not a quick-win paid-traffic estimate.
- `/guides/choosing-a-cat-carrier-in-canada`: **126 visible query×page impressions** in that eight-day group; draft carrier decision-aid improvements already exist in **PR #66**. Do not start a duplicate article or release unreviewed shopping claims.
- `/guides/pet-licensing-across-canada`: the original 28-day URL report (Oct 3–30) has **5 clicks / 458 impressions / 7.67 URL-average position**; current correction already resides in **PR #66**. The page's average position is **not** the ranking for `animal license canada`.
- `pet health club`, `j&j pet club`, `pets` and other broad/other-brand queries can mislead headline opportunity scores. Require a matched query, matched page, geographic intent and a SERP check before writing for them.

## Indexing: historical GSC evidence, not an inference

- The *separate Page Indexing report* recorded in the owner spreadsheet was last **updated 2026-10-22**, with **66 indexed / 32 not indexed**. It is a **historical snapshot**, not current coverage.
- Prior breakdown: 21 discovered-not-indexed, 4 crawled-not-indexed (all recorded as font assets), 5 noindex, 2 redirects. The spreadsheet separately notes one account URL indexed despite a robots block. These statuses require case-by-case editorial/technical interpretation.
- Owner's **2026-11-01** recorded URL Inspection for `https://thepetclub.ca/guides`: stored index verdict **not indexed / unknown to Google**, while live test showed the page available and indexable, self canonical and linked to many guides. **A successful live test does not mean it was indexed.** Reinspect in official GSC before any request to index.
- The recorded **92 discovered sitemap URLs as of 2026-11-01** are **not** 92 indexed pages, and search impressions are **not** a measure of indexed-page coverage. The automated daily Performance reports do not refresh Page Indexing.
- Do not remove the noindex status of the four editorially held URLs or change community publication gates merely to boost indexed counts. Require owner/editorial review.

## Live site and competitive/monetization checks

- Home `https://thepetclub.ca/` currently exposes an Unleashed landing page and explicitly says public community posting/replies are not open. `/guides` contains the published guide hub; `/community/pet-insurance` is an editorial reading category with placeholder discussion questions, not genuine member activity. Do not fabricate posts or endorsements.
- Existing `/guides/pet-insurance-in-canada` explains claim policy mechanics and explicitly does **not** quote premiums; competitor comparison pages often feature product tables, premium ranges and decision questions. To differentiate responsibly: develop a fact-checked, dated *policy-wording comparison worksheet* (deductible reset, limits, exam fees, dental illness, waiting periods, direct payment, pre-existing conditions, geography) **before** publishing any provider rankings or prices. No synthesized quotes, third-party ratings or unverified coverage claims.
- Google's current primary-source guidance prefers genuinely helpful, original information rather than search-engine-first bulk articles, and marks monetized links `rel="sponsored"`: https://developers.google.com/search/docs/fundamentals/creating-helpful-content and https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links.
- Official Canadian partner routes exist at https://www.trupanion.com/en-ca/affiliate (Impact) and https://www.fetchpet.com/canada/partner-with-us/affiliates (Fetch). **A publicly advertised partner route is not evidence of application, approval, a unique tracking URL, commission rate, revenue or legal permission for a particular placement.** Owner must verify agreements and applicable referral/marketing compliance before a launch.
- Main currently registers **two Amazon.ca Catit affiliate placements** in `src/features/commerce/offers.ts`: IDs `amazon-catit-digger` and `amazon-catit-wave`. Both have `reviewBy=2026-11-08`. `usableOffer()` rejects dates after that date, so **on 2026-11-09 they become ineligible unless independently reverified and reviewed**. **Do not automatically extend the date**, imply final Associates acceptance or bypass affiliate disclosures. The read-only deadline checker is already covered by **draft PR #65**, with CI previously passing.
- The latest PR #66 CI run succeeded but **Browser QA was cancelled**. This does not satisfy mobile/desktop preview QA; PR #66 also remains draft. The new report does not edit any of PR #66's editorial and test files.

## Non-overlap and delivery gates

Prior open PRs reviewed: **#11, #30, #31, #35, #42, #49, #50, #52, #65, #66**. Relevant overlaps: #66 carrier/licensing draft, #65 affiliate review tooling, #52 insurance partner research, #49 GSC CSV triage, #50 preview robots guard, #42 design/community flows. This report changes **documentation only**, in its own draft branch.

Before any production release:
1. Inspect the **latest Google Search Console Performance and Page Indexing** reports (current report dates and completeness flag). Continue using authorized free daily first-party export if the direct paid connectors remain blocked.
2. Run branch CI and fully verify Vercel preview robots, canonical URL, responsive experience, outbound links, and editorial source accuracy.
3. Confirm production target and obtain explicit owner release approval. No auto-merge, no email, no outreach, no affiliate application or purchase.

## Next three specific actions

1. **Today (2026-11-08):** Verify both Amazon.ca Catit placements against actual destination, account standing and current Amazon program terms; decide whether they can remain enabled past **2026-11-08**. Keep original registry expiry if not verified. PR #65 provides read-only tooling only.
2. **Next release candidate:** Complete preview Browser QA and editorial verification for **PR #66** (carrier fit worksheet and municipal licensing correction); after release approval, monitor the matched `cat carrier` URL/query pair against an adequate post-release baseline. No new overlapping article.
3. **Indexation + revenue pipeline:** Reinspect `/guides` and refresh the **Page Indexing** overview; then prepare one evidence-rich insurance policy comparison and official partner due-diligence checklist (building on **PR #52**) instead of bulk low-value insurance pages. Measure actual events and approved affiliate performance before asserting revenue.

**Limitations:** GSC Wizard returns `payment_required`; Ahrefs returns `Insufficient plan`. The owned first-party Google Sheet was successfully read and is the data source above. No paid upgrade attempted. GA4 conversion/revenue and direct latest URL inspection were not retrieved; no sales or new backlinks are claimed.
