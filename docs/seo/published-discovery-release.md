# Published-guide discovery: first SEO maintenance batch

Prepared against `main` commit `e37444cccad606d9eb2fc1e655b6d43bf82478c5`.
This document is a review checklist, not a claim that the changes are deployed.

## Evidence and scope

The homepage's guide section still used planned-title fixtures and claimed
that no article had been published. The shared guide listing used
`articlesForSurface`, and related-reading cards used `relatedArticles`; both
registry selectors include in-review records. The registry already has a
separate publication state, and the sitemap correctly applies an indexing gate.

This batch replaces the homepage placeholder with three published guide cards
and a route to the complete library, adds a hero link to `/guides`, and applies
a publication-only gate to shared listing and related-reading cards.

The raw registry selectors remain available for editorial tooling. Public
components use `published-discovery.ts`. Filtering happens before preview
limiting and preserves the editorial order. Published articles intentionally
held out of search remain eligible destinations: `public-noindex` must not be
confused with `in-review`.

No article is published, withdrawn, rewritten or given a new date by this
change. No canonical, robots policy, sitemap rule, Puppy Journey stage,
authentication flow, database, analytics tag or affiliate agreement is changed.
The gate covers the card surfaces named above, not an assertion that every
inline MDX link has been audited. `noindex` is not access control; this batch
does not turn publicly reachable review URLs into private previews.

## Acceptance checks before merge

- Run the existing CI workflow: lint, typecheck, tests and production build.
  A submitted PR or a queued check is not a passing result.
- Confirm `published-discovery.test.ts` passes, including the deliberate
  published/noindex fixture, draft filtering, ordering and preview limits.
- Review the diff: no article registry or body changes, no publication/indexing
  changes and no dependencies or environment variables added.
- On an authorized preview, inspect `/`, `/guides`, `/dogs`, `/cats` and one
  article with related reading at mobile and desktop widths. Click the new
  guide links, check that the preview is bounded and verify that no empty
  card grid appears when there are no published candidates.
- Fetch rendered HTML to verify the links have real hrefs and the homepage
  no longer contains the obsolete no-publications claim. Confirm preview
  indexing protections remain in place.
- Review fresh Search Console data and obtain owner approval before merge or
  any production deployment. A branch/PR is not a production release.

## After an approved release

Record the deployed commit and actual release time. Re-check the live homepage,
guide hub, representative article and sitemap; compare the canonical and
robots policy with the pre-release baseline. Reinspect `/guides` in Search
Console. A crawlable page and a request to index do not guarantee inclusion
or a particular ranking. Compare settled 7- and 28-day data at the next review,
keeping property-level metrics distinct from page-level totals and ignoring
single-impression rank spikes as evidence of a stable position.

Rollback is a revert of this batch's commit, followed by the same tests and
normal approved deployment process. Do not reset main or delete content.

## Next work, deliberately not bundled here

1. Review the existing in-review insurance and veterinary-cost content before
   commissioning potentially overlapping pages. Preserve the registry's
   pricing/evidence rules; no invented national averages, quotes or commissions.
2. Cross-check metadata, decks and key takeaways against the approved bodies.
   The summer-care registry still contains a seven-second pavement statement
   even though its own verification notes say that numeric rule was removed.
   Resolve against the approved text and primary source as a separate,
   explicitly reviewed content correction; do not silently call this fact-checked.
3. Verify the correct analytics property, measurement ID, consent behaviour and
   actual successful conversion events before adding or enabling measurement.
4. Confirm which Vercel project and production branch serve the live domain.
   Do not create a replacement project or duplicate deployment to solve an
   account-visibility problem.

## Technical references

- Google link best practices:
  https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google sitemap guidance:
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Next.js sitemap file convention:
  https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
