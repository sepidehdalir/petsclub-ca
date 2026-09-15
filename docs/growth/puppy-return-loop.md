# Puppy Return Loop: review and release gate

Base: 539a6862444582c58d97b77e87cfd481dc234179 (draft SEO PR #10).
Branch: growth/puppy-return-loop-2026-09-14.

This document describes the implementation scope, not a production release.
Preserve PR #10's published-guide discovery and draft-link guards. No merging,
production promotion, project creation, domain/DNS change or settings change
is authorised by this document. Obtain explicit release approval after QA.

## Scope

- Homepage directs visitors to the existing Puppy Journey and published guides,
  not sample member activity. Other topic routes remain reachable.
- Resume link validates the existing browser profile before navigation.
- Checklist state persists per public stage or single saved puppy/stage, locally.
  Quota/read/delete failures must not be represented as successful persistence.
- Optional PNG card is created on the device. An optional card name is neither
  uploaded nor saved. It is not a health or training assessment.
- Sharing uses a fixed-host allowlist of public stage URLs, never location.href
  or the personalised request query. Share handoff is not confirmed delivery.
- Browser CustomEvent hooks only. No analytics collector, tracking tags,
  identifiers, marketing email, payments, ads or referral rewards are enabled.

## Boundaries

No article bodies, publication dates/statuses, stage content, SEO route rules,
robots, sitemap, canonical logic, dependencies, auth or database changes.
/my-puppy remains private-noindex; held public stages remain public-noindex.
The new checklist namespace does not overwrite petclub.puppy.v1.

This is NOT multi-pet isolation: DOB is not a unique animal identifier.
Local browser storage is not account backup or cross-device synchronisation.
Clearing site data loses progress. The existing personalisation query reaches
hosting servers/browser history; do not claim all onboarding data is local.
The new sharing and event payloads exclude those query details.

## Required verification

- [ ] Existing CI lint, project typecheck, complete tests and Next.js build pass
      for the current head (not an earlier SEO-only commit).
- [ ] Confirm the changed-file list stays inside the approved scope.
- [ ] Homepage and public/personalised stages at real mobile and desktop widths.
- [ ] Tick, refresh, return, untick, clear, cross-tab update and denied-storage UI.
- [ ] Invalid/legacy saved profiles, stage changes and personal/public separation.
- [ ] Keyboard navigation, visible focus and readable live status messages.
- [ ] Downloaded card image, long/Unicode names and Safari/download fallback.
- [ ] Native-share cancellation, unsupported-share and denied-clipboard fallbacks.
- [ ] Share/event payloads contain no birth date, province, breed or card name.
- [ ] Actual preview HTTP noindex headers, rendered robots/canonicals and sitemap.
- [ ] Confirm production target, rollback deployment and fresh Search Console data.
- [ ] Explicit owner approval before merge/release.

The isolated helper tests and syntax checks do not establish full-build or
browser readiness. Record actual CI/browser results in the PR. Revenue,
retention and referral activation require a separately configured and verified
collector; local hooks by themselves produce none of those reports.

## Rollback after a separately approved release

Use an ordinary reviewed revert and versioned deployment, never force-reset a
shared branch. Record the previous production deployment before release.
A rollback of the code does not automatically remove browser-local progress.

## Technical references

https://react.dev/reference/react/useSyncExternalStore
https://nextjs.org/docs/app/getting-started/server-and-client-components
