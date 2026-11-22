# ThePetClub.ca — verified weekly growth / revenue triage (22 November 2026)

**Status:** Owner-review-only research and quality work. **No production merge, new/public article, indexing, affiliate link activation, brand outreach, paid advertorial, account enrollment, email, or social post.**

## 1. Official Google Search Console data: dates, source, maturity

Owner-authorized Google Search Console → Search Analytics for Sheets native spreadsheet:
https://docs.google.com/spreadsheets/d/1ipsD0vgGjRNzpNJcX6VFPvwso0fDVz9Tphd1OJdSKoU/edit

- Checked dated tabs and source `Backup Totals`, `Chart`, `Backup Log`, `SEO review`. Search type recorded as **Web**. The **2026-11-20** tab is the last available and `Backup Log` records retrieval on **2026-11-22**. Export date lag **2 days**, and direct `dataState` / finalized flag is **not exposed**. Later corrections possible.
- Exact latest **28 independent calendar days, 2026-10-24..2026-11-20 inclusive**: **29 clicks**, **6,137 impressions**, calculated **0.4725% CTR**, approximately **16.54 average position** (impression-weighted daily rounded position values; not any specific query's ranking). Use `Chart` 2026-10-24..2026-10-29 and `Backup Totals` 2026-10-30..2026-11-20, deduplicating overlapping October 30.
- Two *non-overlapping* 14-day sub-periods (not overlapping 28-day weekly comparisons):

| Date range | Whole-site clicks | Whole-site impressions | CTR | Approx. daily-impression-weighted avg position |
| --- | ---: | ---: | ---: | ---: |
| 2026-10-24..2026-11-06 | 16 | 3,065 | 0.52% | 18.56 |
| 2026-11-07..2026-11-20 | 13 | 3,072 | 0.42% | 14.51 |

- Most recent individual weeks: **2026-11-07..13: 7 clicks / 1,493 impressions / 0.47% CTR / ~16.51 position**; **2026-11-14..20: 6 / 1,579 / 0.38% / ~12.63**. At very low click volumes a 1-click difference is weak evidence, and rank averages reflect search-query mix. Do **not** claim a causal decline or SEO recovery.
- The 14-day daily `Query × Page` sheets for **2026-11-07..2026-11-20** contain **636 visible rows, only 2 visible clicks and 1,328 visible impressions**, whereas whole-property daily totals are **13 clicks / 3,072 impressions**. Rows omit anonymized queries and/or low-volume data; they are a **partial diagnostic sample**, not a property-wide total. Never infer actual page click counts solely from it.

### Qualified search opportunities (query×page visible rows ONLY, 2026-11-07..20)

| Query or destination | Visible clicks | Visible impressions | Weighted position | Interpretation |
| --- | ---: | ---: | ---: | --- |
| `cat carrier` | 1 | 236 | ~14.44 | Qualified shopping/fit intent; existing canonical carrier guide. Most recent 7 days: **121 impressions, 0 visible clicks, position ~14.54**. |
| Existing `/guides/choosing-a-cat-carrier-in-canada` (all visible terms) | 1 | 287 | ~16.53 | Current strongest observed candidate for improved title/fit clarity and legitimate conversion; not 287 whole-page impressions. |
| `cat carriers` | 0 | 45 | ~27.69 | Plural intent/search-feature variation; do not create a duplicate guide without evidence. |
| `pet health club canada` | 0 | 101 | ~9.28 | **Potential third-party brand/navigation ambiguity**; not qualified commercial demand for our health content. |
| `puppy` | 0 | 56 | ~10.28 | Very broad and unlikely to convert; preserve puppy editorial status. |
| Existing `/community/pet-insurance` (all visible terms) | 0 | 264 | ~36.56 | Insurance category currently ranks poorly for many broad terms; not ready to forecast insurance affiliate earnings. |
| Existing `/guides/dog-trainers-greater-vancouver` (all visible terms) | 0 | 114 | ~29.87 | Qualified local-intent potential, but needs date-specific business verification and trustworthy referrals. |
| `/health` (all visible terms) | 0 | 193 | ~12.93 | Many branded searches for unrelated businesses; do not over-interpret this as commercial traction. |

`/guides/pet-licensing-across-canada` is still a useful citation/resource candidate, but current visible 14-day sample includes only **11 impressions, 0 clicks**; avoid prioritizing it ahead of carrier on this evidence alone.

## 2. True indexed-page coverage (separate source, older date)

- The newest accessible **official Page Indexing** snapshot remains **updated 2026-10-22: 66 indexed URLs / 32 not indexed**. It is **31 days old** on 22 November and **not a current index coverage claim**. Breakdown in owner `SEO review`: 21 discovered-not-indexed; 4 crawled-not-indexed **font assets**; 5 noindex; 2 intentional or potentially intentional redirects.
- A sitemap URL count, search impressions, an indexability test, or publication status **does not equal actual indexed-page coverage**.
- Historical 2026-11-01 URL inspection said `/guides` not indexed/unknown, with separate live test indexable. **Today’s actual Google-indexing status cannot be verified by the owner Sheets export.** No broad request-indexing or editorial noindex removal.
- Keep held editorial guide URLs `noindex` unless an owner/editor approves publication rules and content, including sensitive health material. Do not blindly push unlaunched community categories into the index.

## 3. Live-site/code/PR quality review

- Opened live `/`, `/guides`, `/guides/pet-licensing-across-canada`, `/community/pet-insurance`, `/guides/pet-insurance-in-canada`, and `/advertising-disclosure` on 2026-11-22. Public insurance community hub is a reading route, not proof of genuine member discussion. The advertising disclosure explicitly remains **Draft — pending legal review**. A direct web fetch for the canonical carrier guide failed transiently; do not interpret that as confirmed HTTP downtime. GitHub and official query-level data support the content opportunity. Public `/guides` remains navigable; index status is separate.
- Competitors: https://www.savvynewcanadians.com/best-pet-insurance-canada/ and https://pawrance.ca/best-pet-insurance-canada/ use deep insurer-by-insurer comparison grids, eligibility and dated policy distinctions. We cannot compete credibly with guessed premiums, fabricated tests, or unsupported scores. The existing insurer source worksheet remains in PR #52; prioritize validated quote prerequisites (pet age, province, claims terms) and first-party documented exclusions before promotion. No partnership income inferred.
- Open PRs checked before changes: #71 expired-affiliate SSR and QA; #70 weekly first-party reports; #66 carrier/licensing editorial (currently **non-mergeable**, overlaps main); #65 date audit; #52 partner/creator outreach drafts; #50 preview robots; #49 GSC export review; #30/#31 other guide metadata; #42 community UX. **Do not merge stale conflicting #66 or create a duplicate ranking article.**
- Existing Catit Amazon `src/features/commerce/offers.ts` has both affiliate link dates `reviewBy=2026-11-08` (expired). Prior cached SSR exposure is known. PR #71 is a targeted draft fix but its prior browser smoke suite was stale and asserted that expired links **must** exist, causing 24 failures while 413 cases passed on Nov 9. Separate work on PR #71 today updated test expectations to require **expired tagged URLs hidden and ordinary retailer fallbacks retained**; **this does not extend/validate the affiliate links or approve a deploy**. Its exact-head CI and desktop/mobile browser QA must pass, deployed preview and final alias must be verified, and owner must explicitly authorize release.

## 4. Evidence-based revenue and editorial direction

1. **Shortest route to qualified clicks and actual attribution:** improve the existing (not duplicate) cat-carrier choice guide: truthful hard/soft fitting and airline-source caveats, inspect title/meta against its query and a real mobile snippet, and maintain the current canonical/author/date. Convert buyer interest only via verified available retailer destinations and disclosed approved partner links. No invented first-hand product tests or bookings.
2. **Commercial partnerships separate from website traffic:** PR #52 already contains unsent TikTok creator pitch/media-kit drafts. Newly checked official examples (not approvals): [Cheerble](https://cheerble.com/en-ca/pages/influencer) offers creator content/gifting/affiliate routes with terms to confirm; [Red Dingo Canada](https://reddingo.ca/affiliate-programme/) advertises tiers starting at **2,500 followers** with engagement criteria and monthly payout under agreed terms. Do **not** claim account qualifications or contract acceptance; current TikTok analytics and brand account ownership unverified.
3. **Insurance:** high-value but regulated and presently low positions. [Fetch](https://www.fetchpet.com/canada/partner-with-us/affiliates) and [Trupanion](https://www.trupanion.com/en-ca/affiliate) public partner pages do not establish ThePetClub acceptance or commissions; no fake quotes or policy rankings.
4. **Paid advertorials only for qualified referral audiences:** independently verify Canadian readership, actual ad referral clicks, campaign economics, editorial quality and price; owner approves any payment. **Every paid link must be tagged `rel="sponsored"` or `nofollow`, never buy dofollow ranking-credit links**. Prior publisher options and outreach templates in PR #52; no purchases or outreach.
5. [Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link), [Google link spam policy](https://developers.google.com/search/docs/essentials/spam-policies), and [Canada influencer disclosure](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/influencer-marketing-and-competition-act) govern all proposals.

## 5. Access limits, test evidence, and next three priorities

- First-party Sheet and GitHub connectors **worked**; no manual performance export needed.
- Ahrefs API subscription response now succeeds and reports **Free, billed monthly; workspace units limit = 0**; this is not authorization to run paid Site Explorer/KD/backlink tools. No purchase/upgrade, no fabricated DR or revenue.
- Direct Page Indexing refresh not accessible from this owner-owned performance sheet. Request the minimal official new Page Indexing summary or direct owner-authenticated read *only if* another authorized read route becomes available; do not ask for a new Performance export while automated owner data is current.
- **Completed in this cycle:** recomputed GSC last 28 days and nonoverlapping comparisons, reviewed 14 daily query/page sheets and logs, inspected historical indexing, live pages, competing insurance reviews, primary SEO guidance, PR statuses, current affiliate registry and QA failure evidence, prepared targeted browser-test correction on draft #71, and added this dated record on existing **draft PR #70**.
- **Testing:** owner Sheet range arithmetic and readback; PR diff review and GitHub CI for exact commit heads only; do not claim a browser QA pass until checks report success. No Production change.

**Next three priorities**
1. **Clear a real safety/revenue blocker:** review PR #71 exact-head CI and local browser QA, confirm affected pages have no expired tracked links and retain normal merchant info, then separately verify Vercel preview URL/production alias and ask for owner approval to release. Amazon eligibility/destinations still require a fresh authenticated account review.
2. **Qualified existing ranking:** reconcile main vs conflicting #66 and prepare one owner-reviewed adjustment to the *same* cat-carrier canonical guide if title/snippet and mobile behavior warrant it. Validate actual preview, no false product experience, 200/canonical/robots, exact source links and CTA tracking. Measure distinct later weeks.
3. **Refresh indexing and channel revenue evidence:** get an updated official Page Indexing read for `/guides` and key hubs when authorized; verify actual TikTok account/media-kit analytics, then use PR #52's unsent drafts for specific genuinely relevant Canada partners (Cheerble, TIKIBOO, Canadian Pet Connection) after exact recipient/message/terms owner approval.

**Release guard:** Production untouched until fresh GSC reviewed, editorial and legal review complete, exact-head tests and mobile/desktop preview QA complete, production target confirmed and **explicit owner approval** obtained.


### Direct cat-carrier SERP competition and checked retailer destinations (22 November)

A newly published Canada-targeted competitor, [Canada News Media's November 16 guide](https://canadanewsmedia.ca/best-cat-carrier-canada/), compares six carriers with **dated Amazon.ca listing prices, size information and Amazon affiliate CTAs**. These are the *competitor's retailer-listing claims*, **not our independently verified prices, seller inventory, review statistics, tested products or recommended ratings**. Do not reproduce its ratings/price table or pretend hands-on testing. Our existing main-branch carrier guide already has an original practical decision grid and distinguishes airline, veterinary and home use, so **do not add a duplicate page**. Its commercial gap is verified approved referral attribution (currently ordinary, non-affiliate retailer references), not a lack of keywords.

Independently opened current public product pages for [Pet Valu Catit PIXI Mio](https://www.petvalu.ca/product/catit-pixi-mio-cat-bed-and-carrier/SCM15822), [PetSmart Sherpa Original Deluxe](https://www.petsmart.ca/dog/crates-gates-and-containment/carriers-and-backpacks/sherpa-original-deluxe-pet-carrier-guaranteed-on-board-dog-and-cat-carrier-16-lbs-max-black-537.html), [Homes Alive Catit Digger](https://www.homesalive.ca/cat/bowls-and-feeders/automatic/catit-senses-2-0-digger.html) and [Homes Alive Catit Wave](https://www.homesalive.ca/cat/toys/catit-senses/catit-senses-2-0-wave-circuit.html); the pages were retrievable publicly, but this does **not** confirm local stock, price at checkout, valid affiliate attribution or account acceptance. For travel claims, [Air Canada's official policy](https://www.aircanada.com/ca/en/aco/home/plan/special-assistance/pets.html) explicitly requires **soft-sided flexible cabin carriers** with aircraft/cabin-specific dimension rules. The existing carrier guide already cites this correctly. Preserve the page's distinct editorial value; seek approved monetization without changing the source's safety scope.
