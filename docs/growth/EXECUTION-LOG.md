# Execution log

## 2026-10-09 — first authorized execution cycle

- Cloned the real repository into an isolated local checkout; source mirror and synced references untouched.
- Confirmed GitHub write access and Vercel project/domain identity; production architecture is Next.js 16, React 19, Supabase integration and MDX registry.
- Rechecked GSC Wizard: expired subscription. Alternative Windsor property discovery has no ThePetClub account. No spending or invented metrics.
- Confirmed Resend production domain verified, sending enabled. No email sent.
- Crawled 63 sitemap entries and 5 linked pages; all returned 200. Recorded per-page title/H1/canonical/robots/description/schema presence. No known analytics tag detected.
- Inventoried all 35 registered articles: 15 published, 20 in review. No new articles approved or published.
- Removed fabricated activity and recency from sample-card components; clarified unavailable posting/report functions.
- Added an inactive-by-default affiliate offer component, approved-link guard, local click event and guard tests. No fake links, tags, enrollment or revenue.
- Reviewed current primary affiliate program pages and documented unknown contractual terms.
- Inspected open draft PRs #11 and #13; preserved both.
- Installed locked dependencies; npm audit found framework/security advisories requiring follow-up.

Validation, commit and deployment evidence will be appended after actual completion. Current work is on growth/foundation-2026-10-09; production unchanged at this point.

## Direct Search Console access recovered

See SEARCH-BASELINE.md and search-baseline.json. Authenticated browser access and official CSV export supersede the earlier connector-only access blocker. Current metrics: 8 clicks / 976 impressions over exported dates 2026-09-06–2026-10-06; 39 indexed and 40 not indexed as of the 2026-10-03 indexing report. Analytics sessions, conversions and revenue still unavailable.

### Security and data follow-up

- Direct GSC browser session recovered; downloaded official performance CSV export. Baseline stored in search-baseline.json and DASHBOARD.md.
- GSC sitemap report: submitted 2026-09-06, last read 2026-10-03, Success, 63 discovered URLs. No redundant submission performed.
- Direct Analytics account picker search for thepetclub returned no results in the current account. No unrelated property's data used.
- Next.js, @next/mdx and eslint-config-next updated together to exact 16.3.8; compatible transitive fixes applied without forcing a major change. Critical framework advisory removed. Remaining audit findings are development lint-tool dependencies; no forced framework downgrade performed.
- Previous production/rollback reference confirmed: dpl_GynJYuHdbQUSmEs6nsVZUCMyo1LJ, commit 13841acf57bdeb1c3e083a5939ee4d65a8419fe8. Vercel Git integration follows main.
- Preliminary checks before the framework patch passed lint, types, 484 tests and static generation 99/99. Final patched-head checks pending; preliminary pass is not final release validation.

- Checked all 20 in-review guide routes separately: HTTP 200 and noindex confirmed for every one (`draft-route-audit.json`). No pending guide mistakenly indexed by its own metadata.
- Final runtime dependency audit (`npm audit --omit=dev`): zero reported vulnerabilities. Five development lint-chain advisories remain documented.
- Vercel environment-name listing confirmed only site URL and Supabase public credentials in Production. No analytics property identifier or Resend API key listed in the application deployment; secret values not read or printed.

### Local validation

Patched dependency run completed: lint passed, typecheck passed, 484 tests in 13 files passed, Next.js 16.3.8 production build generated 99/99 pages. Code review confirmed serializable client props, ordinary anchor fallback, bounded event payload, no collector/storage, and per-card example disclosure. One final CSS radius token correction is included in the committed head and will be checked by CI.

### First commit and preview evidence

Commit 190b9c6679e320d195edc50aead54211ab976ba6 pushed; PR #16 created. Exact-head CI and Desktop/mobile Browser QA passed (runs 37974854292 and 37974854271). Preview dpl_EZo619vZS6cuJ6joafTySqbM1kP6 READY at https://petsclub-91lvrd0v0-celinadalir-stacks-projects.vercel.app.

Authenticated browser preview check: correct example labels, no fictional reply/time strings, 390px viewport and 390px document width; local mobile menu opens and Escape closes it. Preview canonical points to https://thepetclub.ca. Authenticated HTTP fetch returns 200; preview has X-Robots-Tag: noindex. Preview robots inherits production origin and allows crawling; exclusion is supplied by the Vercel header, not Disallow / on this build. No project protection setting disabled. CLI authenticated fetch generated its supported project bypass credential without printing its value.

Browser review found category description strings still telling users to post missing-pet reports. They were corrected in the taxonomy as a final follow-up. Lint, types and 484 tests passed again; final commit/preview CI must pass before merge.

### Final release and next indexing action

Final head 38ae0e599d6ec927b031d6ef33e7aac19cc8a22d passed CI run 37975347416 and desktop/mobile Browser QA run 37975347272. Final preview dpl_6n9r5YyWEknwMiEuhQp4B3zQCg3s was READY and manually verified. PR #16 merged at 2026-10-09T18:48:28Z, merge commit 1a44f3dee78b7214e11da54b6511f5b78a609dc9.

Production deployment dpl_26saN5WX2TnLKjpozXjfnPnJb4Dt became READY and thepetclub.ca resolved to it. Public production browser confirms corrected community/example-report copy; 390px mobile viewport has 390px document width. Post-release public crawl: 63 sitemap routes + 5 linked routes, all HTTP 200, every sitemap route one H1. robots.txt retains correct production origin and sitemap. OG image returns HTTP 200 image/png. Pending cat-cost guide retains noindex. No article publication decision changed. Updated live-audit.json contains the post-release crawl.

GSC live URL test for https://thepetclub.ca/guides/cost-of-owning-a-dog-in-canada on Oct 9 at 11:45 AM reported available to Google, page can be indexed, and one valid Breadcrumbs item. Request indexing returned “Indexing requested” and accepted the URL into the priority crawl queue. It was not yet indexed in inspection; this action is not indexing confirmation. Screenshot evidence retained locally outside the repository.

Next dependencies: correct GA4 property identifier/access, accepted affiliate account and approved real link, and factual/editorial review before publishing any of the 20 pending guides. There is still no stored affiliate analytics or demonstrated revenue. Five development lint-chain advisories remain; runtime audit has zero reported vulnerabilities.
