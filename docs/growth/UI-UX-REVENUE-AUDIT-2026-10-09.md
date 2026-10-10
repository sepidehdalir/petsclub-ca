# ThePetClub.ca — UX, community and revenue audit (9 Oct 2026)

Status: evidence-based audit and implementation backlog. The companion changes on this branch are **not** production-deployed until reviewed/merged. This document distinguishes verified findings from assumptions requiring rendered browser tests.

## Evidence inspected

- Public routes: `/`, `/search`, `/community`, `/community/introduce-yourself`, `/community/pet-insurance`, `/dogs`, `/cats`, `/food`, `/guides`, `/lost-found`, `/puppy` and `/compare/catit-digger-vs-wave-circuit`.
- Source: shared `TopicPage`, editorial registry, product comparison components, search route and community taxonomy.
- Existing owner-supplied GSC export in `docs/growth/SEARCH-BASELINE.md`, date range September 6–October 6, 2026: **8 clicks, 976 impressions, ~0.82% CTR**; 39 indexed / 40 not indexed in Oct 3 indexing report. These are small figures; do not extrapolate revenue or conversion without real transactions.
- Verified that the Catit Amazon.ca product links contain tracking tag `thepetclub09-20`. This validates link construction, **not** sales or final program approval.

## P0 — remove dead ends / misrepresentations

| Issue | Evidence | Remedy | Verification |
| --- | --- | --- | --- |
| Search form says search unavailable even though published articles exist | `/search`, `src/app/search/page.tsx` | Published-only, metadata-scored search with image-rich result cards; leave community-post search explicitly unlaunched | Search `puppy vaccination`, `pet insurance`, empty and nonsense queries; no draft leaks |
| Community categories have only `No discussions yet` | 25 routes, e.g. `/community/pet-insurance` | Show linked approved editorial reading and clearly labelled editorial starter questions, with no fake posts | Each route has helpful prompts; relevant categories link to real published guides |
| `Ask the Community` implies posting works | shared `TopicPage` while posting is unavailable | Replace action with functional editorial browsing; state posting status honestly | Test every navigation CTA |
| Food/training topic pages have few/no guides | `/food` and shared `TopicPage` | Curate suitable already-published articles based on title and tags | Verify links and editorial appropriateness |
| Affiliate `Affiliate link` technical label repeats on product cards | `ProductAction` | Remove redundant label, keep conspicuous section-level disclosure and Amazon-required statement | Card review; compliant disclosure still visible |
| Product comparison lacks photos of the actual products | `Catit` comparison card | Source licensed manufacturer/approved affiliate imagery, display real model-specific photographs with responsive sizes and alt text | License provenance documented; actual photos render on mobile/desktop |

## P1 — high-value experience improvements

1. Make homepage a clear journey: enter Dogs/Cats/Canada Guides -> relevant editorial content -> a genuinely relevant commercial comparison. Feature a small number of useful articles instead of overemphasizing features that haven't launched.
2. Build a shared attractive product-card component with legally usable real product images and readable 390px-wide layouts; add a comparison summary, scannable attributes and one unambiguous CTA. No fake ratings, unverified price or fabricated tests.
3. Replace sample Lost & Found reports on high-visibility pages with links to the real missing-pet search/checklist and municipal shelter resources. Do not make fictional reports look current.
4. Sitewide content QA: source claims, veterinary cautions, duplicate editorial notices, dates, overlong introductions, inconsistent category promises and page-level reading experience.
5. Improve `/puppy` discovery from the homepage and relevant guides; it has a real useful age-based flow and local-only data. Do not describe this feature as a fake future feature.
6. Add helpful contextual cross-links between product guides, care articles, the puppy journey and future discussion categories.
7. Verify responsive imagery, cropping, nav, sticky elements, disclosure location, touch targets, focus management and core vitals in browser tests. No performance claim without measurement.
8. Reconcile outdated `docs/growth` descriptions with current production code and real external partner state.

## P1 — community launch rather than fake engagement

The currently visible sections can be useful **before** posting launches through editorial questions, FAQs, verified resources, shareable checklists and topical recommendations. Do not fabricate members, reply counts, timestamps, stories or user avatars.

Then launch a **small moderated beta** with actual authenticated posting and replies (e.g. Puppies, Cat Behaviour, Pet Insurance), with:
- verified author identity/attribution, moderation and reporting,
- secure RLS/authorization, anti-spam and rate limits,
- clear safety guidance against medical misinformation and private location disclosures,
- genuine member notifications only with opt-in,
- truthful empty states and only real counts.
Expand categories after real participation exists; do not try to simulate a populated forum.

## P1 — monetization and acquisition

- Preserve genuine Amazon.ca links and test their destinations, compliance, disclosure and real GA4 affiliate_click events (subject to consent). Clicks are not orders.
- Prioritize intent-rich pages (cat enrichment, puppy supplies, Canadian food-label reading, pet insurance method) with useful product recommendations and clear buyer checks.
- Confirm Impact and other partners from the actual dashboards before inserting links; never invent approval or commission rates.
- Finish privacy/consent, newsletter double opt-in/unsubscribe and CASL requirements before email acquisition.
- Track the funnel **impression -> organic click -> engaged guide view -> affiliate outbound click -> verified partner sale -> approved commission**.
- Distribute original Pinterest pins and genuinely useful community contributions without spamming; add UTM tags and track results.
- Do not buy paid traffic to pages primarily supported by display-ad RPM.

## Commercial reality and 30/60/90 day gates

The last verified GSC export shows very low search volume. Optimizing CTR and retention is useful, but revenue will not scale without **qualified traffic**. Do not claim current monthly income without actual account data.

- Day 7: useful search live, dead-end CTAs gone, community pages contain real guides, technical and mobile QA passed.
- Day 30: product images licensed and installed, top commercial pages redesigned, click measurement verified, indexing and query trends reviewed.
- Day 60: selected community beta active with moderation if safe, affiliate click rates assessed per page, distribution experiments measured.
- Day 90: prioritize channels and pages with verified traffic and conversions; consider AdSense only after compliance and policy approval. If no traction, change strategy rather than publishing filler.

## Verification and safety

Required before merge: lint, typecheck, unit tests, production build, mobile/desktop browser QA and a visual review of `/search?q=pet%20insurance`, `/community/pet-insurance`, `/food` and the Catit product comparison. Watch accessibility, layout shift and GA4/affiliate events. This is a preview-first change with an explicit production sign-off.

## Out of scope of this PR

No fake community posts, paid asset purchases, provider registrations, private database edits, publishing unreviewed veterinary advice, or production deployment before CI + preview review.
