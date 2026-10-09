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
