# ThePetClub.ca weekly organic-growth audit — 2026-09-27

Status: review-branch preparation only. Production is unchanged.

## 1. Search Console access and data maturity

Current read attempt: 2026-09-27.

- GSC Wizard refused the property-list read with `payment_required` because the connected trial/subscription is not active. No purchase, upgrade, reconnect, permission change, or workaround was attempted.
- Windsor.ai has a connected Search Console source, but the only account currently exposed to the authorized connector is `sc-domain:sunifygroup.ca`; `thepetclub.ca` is not available through that read path.
- Therefore no authorized current Search Console read for ThePetClub.ca is available in this run.
- The latest performance record available in this repository is PR #13's note about an owner-supplied official export with data **through 2026-09-18**. The accessible record does **not preserve the export's start date**, so this audit does not invent a date range.
- PR #13 records 24 insurance-related query rows, 89 impressions, 0 clicks, and an approximately 72.6 impression-weighted average position, with `average cost of pet insurance` at 15 impressions. Those figures are historical prioritization evidence only; they are not a current performance report and cannot measure releases after 2026-09-18.
- Data ending 2026-09-18 is well past the normal Search Console freshness window by 2026-09-27, but it is stale for evaluating changes released on 2026-09-21.

### Required minimal official export

Before any release decision, obtain an official Search Console export for `thepetclub.ca` covering **2026-09-06 through the latest available settled date**, including:

1. Performance > Search results: Queries, Pages, and Dates with clicks, impressions, CTR, and average position.
2. Page Indexing export with Google's actual indexed/excluded states.

Do not substitute sitemap URL counts, discovered URL counts, impressions, or site-search results for indexed-page coverage.

## 2. Existing pull requests inspected first

- PR #11 — Puppy Journey saved progress and public sharing. Draft; currently reports `mergeable: false`. It already changes homepage growth surfaces and removes the sample-activity block, so this branch does not duplicate that work.
- PR #13 — pet-insurance evidence correction. Draft; currently reports `mergeable: true`. It changes the in-review insurance guide, an evidence document, and the article registry. This audit does not publish that guide or add affiliate links.
- The current weekly branch began at the same commit as `main`: `928f0d20ebb7fe609d5be1835d3a17c8998b91cc`.

## 3. Live-site findings

Reviewed the live homepage, guide hub, Editorial Policy, Advertising Disclosure, and the published puppy-first-30-days guide.

### Trust defect: Editorial Policy state

The live Editorial Policy currently says it is “Draft — pending editorial review” and says it will be finalized before any guide is published, while the site already exposes published guides. This is a factual trust contradiction.

Prepared fix: remove only the obsolete editorial pending-review banner. The policy text and legal pages remain otherwise unchanged.

### Published safety/trust defect: puppy insurance timing

The published “Bringing Home a Puppy: The First 30 Days” currently says a condition noted at a first appointment is not pre-existing before the appointment and is afterward. That can mislead a reader into thinking appointment timing controls eligibility.

Current Fetch Canada material explicitly defines pre-existing conditions using signs or symptoms before enrollment/effective date or during the waiting period, and its waiting-period material says conditions occurring during the waiting period are excluded. Trupanion Canada's current material likewise describes separate waiting periods and says injuries/illnesses beginning during them are considered pre-existing. Exact rules are policy-specific.

Prepared fix:
- remove the appointment-date shortcut;
- state that policy definitions and waiting periods control;
- state that coverage for an existing symptom should not be assumed;
- explicitly say veterinary care should not be delayed for insurance timing;
- add a visible dated correction note because the site's Editorial Policy says published errors are not silently edited;
- set the article's revision date to 2026-09-27.

### Published consistency defect: sleep takeaway

The puppy article body correctly says widely repeated precise daily sleep figures exceed what has been directly established by the cited owner-reported cohort data, but the article's key-takeaway registry still says “Sixteen to eighteen hours ... is normal.”

Prepared fix: replace that precise takeaway with the more defensible statement already reflected by the article body.

### Homepage sample engagement

The live homepage clearly labels the discussion block as sample content, but still displays sample reply counts and recency labels. PR #11 already removes/replaces this surface, so no overlapping homepage patch is prepared here.

## 4. Current Google primary-source guidance reviewed

The current implementation direction is consistent with Google's own guidance:

- Create helpful, reliable, people-first content; original value and a clear user purpose matter more than producing search-engine-first volume.
- A sitemap helps discovery but does not guarantee crawling, indexing, or ranking. Search Console indexing/inspection data must be used for actual coverage.
- Comparison/review content should provide in-depth analysis, evidence, meaningful differentiators, pros/cons, and original research rather than thin summaries.
- Google's current AI-search guidance likewise emphasizes unique, non-commodity content and warns against making separate pages for every query variation merely to manipulate rankings.

Primary references:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/help/crawling-index-faq
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews
- https://developers.google.com/search/docs/appearance/reviews-system
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

## 5. Competitor and commercial-intent review

Current Canadian pet-insurance SERPs include dedicated comparison publishers such as PetAssured with 2026 comparison/chart pages. The existence of those pages confirms that the commercial query class is already served by structured comparison content; copying the same generic table would not create a defensible advantage.

The proposed ThePetClub advantage is:
- provider-primary policy evidence for every factual row;
- a disclosed comparison methodology;
- explicit policy/version/access dates;
- a normalized quote study only when like-for-like quote collection can be performed;
- clear separation of editorial conclusions from affiliate compensation;
- no fabricated market averages and no affiliate-driven ranking.

Competitor pages are used for SERP/format observation only, never as independent evidence of an insurer's current policy terms.

## 6. Legitimate monetization paths

No affiliate acceptance or revenue is assumed.

1. **Pet insurance — shortest high-intent path.**
   - Fetch Canada currently has an affiliate application and advertises monthly lead compensation through its affiliate program.
   - Trupanion Canada currently has an affiliate program powered by Impact.
   - The insurance guide must remain in review until provider evidence and editorial verification are complete.

2. **Product affiliate commerce — secondary.**
   - Amazon.ca Associates is open to qualifying publishers/content creators and requires original public content; commissions vary by category/program.
   - Use only where an existing guide genuinely helps a user choose a product. Avoid thin “best X” page factories.

3. **Advertising/sponsorship — later, not now.**
   - The live Advertising Disclosure correctly says there are currently no ads, affiliate links, or sponsored content and is still pending legal review.
   - Do not add monetized links until the disclosure/review state is ready and the relationship is actually approved.

Program references:
- https://www.fetchpet.com/canada/partner-with-us/affiliates
- https://www.trupanion.com/en-ca/affiliate
- https://associates.amazon.ca/

## 7. Changes prepared on review branch

Branch: `seo/weekly-growth-2026-09-27`

Completed:
- remove obsolete editorial-policy draft banner;
- correct the published puppy insurance-timing passage;
- revise the second insurance reminder in the puppy guide;
- add a visible 2026-09-27 correction note;
- add `updatedAt: "2026-09-27"` for that published guide;
- align insurance and sleep key takeaways with the revised body.

Explicitly unchanged:
- article publication states;
- canonicals;
- robots rules;
- sitemap rules;
- authentication/database;
- dependencies;
- homepage/Puppy Journey implementation;
- the in-review pet-insurance guide and PR #13's evidence scope;
- production.

## 8. Release gates and next actions

Do not merge/release this branch until all are true:

1. Fresh official ThePetClub Search Console performance + Page Indexing data has been reviewed.
2. CI passes at the exact proposed head.
3. Authorized Vercel preview QA confirms the changed pages at mobile and desktop widths, rendered metadata/revision state, links, canonical, robots, and no regressions.
4. Production target/rollback point is confirmed.
5. Owner explicitly approves release.

Next three priorities:
1. Obtain the minimal official GSC exports described above and identify pages/queries with the strongest near-term opportunity.
2. Finish PR #13's provider-by-provider evidence matrix and comparison methodology; keep the insurance page in review.
3. Rebase/split PR #11 as needed against current main and complete authorized preview QA before considering its growth loop for release.
