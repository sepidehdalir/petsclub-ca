# Browser QA for the published-guide release

This is test infrastructure only. It does not publish articles, deploy production,
change the database, add an analytics collector or change application dependencies.

The Browser QA pull-request workflow builds the locked application with the real
canonical origin, then serves that build on loopback inside a fresh GitHub runner.
Playwright 1.63.0 is installed in the runner's temporary directory, separately from
the application dependency tree. The existing lint/typecheck/unit/build workflow
is unchanged. No Supabase or Vercel credentials are supplied. Browser requests
are restricted to GET/HEAD on that loopback origin; forms and external services
cannot be exercised accidentally.

The script checks six paths in Chromium desktop (1440x900), Chromium mobile
(390x844) and WebKit mobile (390x844). It measures the applied viewport rather
than assuming a tool honoured a requested size. Checks include document status,
headings, canonical and robots metadata, horizontal overflow, image loading,
browser exceptions, homepage cards, guide navigation, mobile-menu close and
Escape, and suppression of the known inline in-review article link.

Screenshots and report.json are uploaded even when an assertion fails. They are
CI artifacts, not recordings of real users. Inspect the actual run before
reporting a pass. Mobile emulation is NOT physical iPhone/Safari certification.
A local production-mode response is NOT evidence about Vercel's deployed
X-Robots-Tag header, protection settings, routing, or analytics performance.
These remain separate release checks, alongside fresh Search Console data and
explicit owner approval. Do not promote the preview as a workaround.

The homepage assertions target the PR #10 discovery UI. PR #11 changes that UI
and must intentionally update/extend this test before incorporating it; do not
silently claim a passing run here covers the growth feature's storage/sharing.

Primary references:
- https://playwright.dev/docs/ci-intro
- https://playwright.dev/docs/emulation
- https://playwright.dev/docs/api/class-browser
- https://vercel.com/docs/headers/response-headers
