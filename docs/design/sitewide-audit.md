# Site-wide audit — 20 October 2026

## Scope and evidence
- Live crawl: 83 sitemap URLs plus 5 linked URL variants; all returned HTTP 200. Account access is a streamed redirect to sign-in, not a public profile.
- Fresh production build: 95 prerendered pages, 5,628 internal link references, 302 local asset/font references; no unresolved paths, missing anchors/assets, duplicate IDs or canonical issues.
- ESLint, TypeScript/build and 510 unit tests passed locally.
- Browser QA now discovers every prerendered page plus dynamic auth/search/journey screens, tests all at 320px and 1440px, and exercises representative routes at 390px (Chromium/WebKit), 768px and 1024px. Workflow artifacts record per-route results and screenshots; the release requires a successful run.
- 148 distinct external URLs probed from the fresh build (141 successful, 7 HTTP 403/503); response exceptions are recorded in external-link-audit.json.

- Live checks: 10 media/robots/sitemap endpoints returned 200; unknown page, guide and community routes returned real 404s.
- First expanded browser run: 347/352 passed; five Chromium checks read the Puppy Journey loading state before content arrived. The test now waits for the destination heading, preserving its content assertion.

## Repairs
- Puppy Journey now explains a missing required birth date instead of silently ignoring submit.
- Search results wrap long unbroken queries.
- Replaced the obsolete BC SPCA cat-enrichment URL in article body and source registry with the current relevant article.
- Account fallback has a proper page heading. Unconfigured auth deployments offer public guides instead of nonfunctional forms and developer setup instructions.
- Sign-in/sign-up copy no longer promises community posting, which is not implemented.
- Every build in Browser QA now checks all prerendered links, anchors and local assets; browser checks also catch duplicate IDs and missing anchors.

## Verification limits and unfinished features
- Community posts/replies and Lost & Found report submissions/alerts are not implemented; current pages disclose that explicitly. This audit does not mark them operational.
- Production authentication is configured; no real account was created and no reset/confirmation email was sent. End-to-end delivery and authenticated profile access remain unverified.
- Contact prepares a local email draft; it does not send mail from the website. Draft preparation is browser-tested.
- Third-party 403/503 responses cannot be repaired in this repository or treated as proof of permanent link failure.
- Browser tests run against a credential-free production build in CI, not a physical iPhone or the signed-in production database.
- A successful audit cannot guarantee the absence of every future or environment-specific defect.
