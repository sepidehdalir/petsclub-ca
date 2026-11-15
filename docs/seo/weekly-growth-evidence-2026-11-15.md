# ThePetClub.ca — weekly growth evidence (15 November 2026)

**Disposition:** documentation-only draft for owner review. No production change, PR merge, publication-state/indexing/canonical change, paid connector purchase, partner application, emails, indexing request or outreach.

## Official Search Console source, dates and maturity

- First attempted direct GSC Wizard query for `sc-domain:thepetclub.ca`; server refused with `payment_required` (trial ended / no subscription). Do not buy or stop the periodic work.
- Successfully read the owner's first-party **Google Search Console → Search Analytics for Sheets** export. Native spreadsheet metadata, original `Chart`, dated query×page tabs, `Backup Totals`, `Backup Log`, and historical `SEO review` / `Indexing details` were checked. The 2026-11-13 tab was retrieved **2026-11-15**, per `Backup Log`. This is the newest date *present* at this review. 2026-11-14 is not yet present.
- Search type: **Web**. Latest 28-day reporting window: **2026-10-17 to 2026-11-13** inclusive. Use `Chart` for 2026-10-17..2026-10-29 and `Backup Totals` for 2026-10-30..2026-11-13, with **exactly one whole-property row per day**, to avoid double-counting 2026-10-30.
- Totals: **27 clicks, 5,743 impressions, 0.47% CTR** (27/5,743), approximately **18.64 average position** (impression-weighted; original Chart values are rounded). This position is not a particular query's rank.
- Latest date is **two calendar days behind 15 November**, consistent with the scheduled export lag, but no live Google data-state/completeness flag is available. Do not assert that it is final; values may be restated. The spreadsheet's Performance export does not update Page Indexing.

### Comparable, non-overlapping 14-day intervals

| Web period | Days | Whole-site clicks | Impressions | CTR | Impression-weighted mean position |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2026-10-17..2026-10-30 | 14 | 16 | 2,871 | 0.56% | ~20.61 |
| 2026-10-31..2026-11-13 | 14 | 11 | 2,872 | 0.38% | ~16.67 |

The same impression volume but fewer clicks deserves investigation; **16 and 11 clicks are too few to attribute a cause**, and position shifts are affected by query and page mix. The previous 2026-11-08 rolling period overlaps this one and is **not a valid independent before/after comparison**.

### Search queries / pages: limited visible query×page sample

- Inspected all **14 dated daily query×page tabs (2026-10-31..2026-11-13)**. Across those *visible* rows: **2 clicks and 1,431 impressions**, versus **11 whole-site clicks and 2,872 whole-site impressions** in `Backup Totals`. Many searches are anonymized, omitted, or otherwise not represented in the rows. **Never sum visible rows as actual site performance**.
- `cat carrier` → `/guides/choosing-a-cat-carrier-in-canada`: **208 visible impressions, 1 visible click, ~14.25 average position** across the 14 days. On **2026-11-13** alone: **7 impressions, 1 click, position 15.0**. URL overall (all visible queries): **252 impressions, 1 click, ~16.94 position** in those rows. Qualified product-selection intent, but still a tiny traffic sample.
- `cat carriers` (plural): **40 visible impressions, 0 click, ~30.88 average position**. Compare title, snippet, exact model sizing and search intent *after* editorial review; avoid duplicating the existing guide.
- `/community/pet-insurance`: **437 visible impressions, 0 visible clicks, ~40.95 average position**; commercial generic insurance terms are currently far from leading positions and this is a category hub, not a quote comparison. **Not** an immediate monetization projection.
- `pet insurance british columbia`: **55 visible impressions, 0 clicks, ~41.02 position**; `pet insurance canada bc`: **39, 0, ~32.46**. Competitive, high-stakes insurance content needs independently verified policy documents and commercial disclosure.
- `/guides/dog-trainers-greater-vancouver`: **102 visible impressions, 0 clicks, ~31 position**; verify local-intent relevance and listings before pursuing leads.
- High-impression `pet health club`, `j&j pet club`, `pets` may refer to competing brands, navigational intent or unrelated generic searches. **Do not optimize for them as if they were qualified customers**.

## Indexing (separate, older official evidence)

- Latest **Page Indexing** report preserved in the owner `SEO review` tab was updated **2026-10-22**: **66 indexed, 32 not indexed** (21 discovered-not-indexed, four font-file crawled-not-indexed, five noindex, two redirects). It is **24 days old on 2026-11-15**, and must not be called today's count.
- The site's sitemap or publication inventory is **not actual indexed coverage**, and search impressions or an indexable live test cannot be substituted for indexing totals. `/guides` was reported unknown/not indexed in a stored GSC URL Inspection on 2026-11-01; that day's live test said it was indexable, not indexed.
- Four held editorial URLs are `noindex`; do not publish or change their status without confirming editorial readiness. Some community category pages were not discovered in the older report; assess user value and publication stage rather than indiscriminately requesting indexing.
- Current Page Indexing totals and whether `/guides` has subsequently been indexed are **unverified** with today's authorized read access.

## Live-site and existing work review

- Public landing page exposes the Life.Unleashed experience and says **community posting and replies are not yet open**. `/guides` publishes a substantial linked guide hub. No fabricated member engagement.
- Public `/guides/choosing-a-cat-carrier-in-canada` (web crawl **2026-11-13**) shows a detailed hard/soft fit grid, exact-model buying checks, Canadian retailer links and an **Updated November 6** label. Main repository MDX also includes the decision grid; **PR #66 is still an open, non-mergeable draft** and overlaps live/main article content. Verify its exact outstanding diff and don't merge it blindly.
- Public `/guides/pet-insurance-in-canada` explains deductibles, exclusions, waiting periods, policy limits and percentages; it does not itself prove a current premium price or partnership.
- Public `/compare/catit-digger-vs-wave-circuit` includes prominent Amazon Associate disclosure and **ordinary Homes Alive retailer fallback links** when seen by the web crawler. This **does not independently establish** that every prerendered, cached or browser-hydrated link obeys the review expiry.
- Main `src/features/commerce/offers.ts` still has **two Amazon.ca Catit placements** (`amazon-catit-digger`, `amazon-catit-wave`) both `reviewBy=2026-11-08`; as of **2026-11-15** they fail date validation and **must not be treated as currently approved**. The unmerged **PR #71** addresses a potential expired-link exposure in cached/prerendered HTML, but still lacks real browser QA and verified production target. **Do not extend dates** absent real Amazon-account and destination verification.
- Public `/advertising-disclosure` declares a **draft pending legal review**. Before commercial scale-up, get owner/legal review and align actual placements and disclosures. Never imply final legal approval.
- Existing open PRs checked before new work: **#70** (weekly evidence documentation), **#71** (affiliate expiry rendering), **#66** (carrier and licensing), **#65** (affiliate deadline audit), **#52** (insurance partnership worksheet), and other prior drafts. This document is added to **existing PR #70** rather than opening an overlapping new PR.

## Current first-party SEO guidance and competitive monetization

- Google Search Central: helpful first-hand or independently sourced, original decision aids over mass search-engine-first pages: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google's spam policy prohibits scaled content with little user value: https://developers.google.com/search/docs/essentials/spam-policies
- Affiliate links need appropriate `rel="sponsored"` tagging: https://developers.google.com/search/blog/2021/07/link-tagging-and-link-spam-update
- Google product snippet markup must match *actual on-page information*: no fabricated reviews, aggregate ratings, product tests, prices or availability: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Competing Canadian pet-insurance roundups display rating/coverage/price comparison tables (e.g. https://petinsuranceguide.ca/blog/best-pet-insurance-canada-2026). Do not import their unsourced premium estimates, reviews or rankings. Differentiate using dated insurer-policy wording, province-specific exclusions and transparent citations, **without** insurance advice or hypothetical payouts passed off as quotes.
- Official public affiliate routes: https://www.trupanion.com/en-ca/affiliate (Impact) and https://www.fetchpet.com/canada/partner-with-us/affiliates (current Fetch page mentions Pepperjam). Neither route establishes ThePetClub's acceptance, allowed creative, attribution, revenue or commission terms. Review agreements and legal requirements before applying or placing links.

## Work completed in this weekly cycle, testing and gates

- **Completed:** read direct-connector error; read official first-party spreadsheet metadata and all daily tabs; independently deduplicated and recomputed 28-day totals and matched 14-day comparisons; separated incomplete query-page samples from site totals; inspected historical indexing evidence; reviewed live homepage, Guides, carrier, insurance, comparison and advertising pages; inspected open draft PRs and main affiliate registry; checked official Search Central and partner sources.
- **Preparation only:** added this dated evidence note to existing **draft PR #70**; no executable, editorial, indexing, canonical, navigation or commercial URL changes. Source arithmetic and GitHub file read-back/changed-file diff are the appropriate checks for this documentation-only change. Browser preview/end-to-end testing is **not** claimed.
- **Blocked:** direct GSC Wizard `payment_required`, Ahrefs plan access not re-authorized this cycle, no new Search Console Page Indexing export, no verified retailer/account re-approval, no complete real browser QA/production alias verification for #71, and no owner release permission. Do not automatically disable this recurring work or buy an upgrade.

### Next three priorities

1. **Protect the monetization path first:** verify exact Amazon account eligibility and both Catit destinations/terms. Keep expiry in place pending approval; separately finish #71 actual browser QA, target confirmation and owner-authorized release. No fake approvals or premature links.
2. **Convert the clearest qualified query:** evaluate the existing cat-carrier guide's mobile preview and its 208-impression `cat carrier` query×page cohort. Audit title/snippet/fit worksheet/link UX and approved calls-to-action; coordinate with existing main and stale #66 rather than creating duplicates. Monitor distinct post-change windows; no guaranteed rankings.
3. **Refresh indexing and build credible insurance intent:** check GSC Page Indexing and `/guides` URL Inspection using an owner-authorized first-party read (new official export only if none is available). Progress the #52 provider-policy worksheet and legal/partner due diligence, not auto-published generic insurance pages.

**Release gate stays unchanged:** current GSC reviewed, preview/mobile/desktop/canonical/robots/outbound-link QA finished, production target verified, editorial sign-off, and **explicit owner approval** before any production change.
