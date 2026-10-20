# Life. Unleashed. integration audit

Date: 20 October 2026

The approved immersive homepage now runs inside the existing Next.js application. Editorial routes, authentication, puppy tools, metadata and optional analytics remain in the original application.

## Changes

- Server-rendered homepage content with an isolated client animation controller; no iframe or external preview dependency.
- Self-hosted Bricolage Grotesque, DM Sans and Instrument Serif through next/font.
- Local, precompressed WebP images and separate desktop/mobile muted films. Reduced motion and Save Data avoid automatic video loading.
- Native dialogs, keyboard controls, expanded menu state and full-site search access alongside featured-story filtering.
- Page-unmount cleanup for listeners, frames, timers, observers and video playback.
- Scoped homepage CSS; narrow-width wrapping and minimum-width fixes.
- “Designed & developed by Arvinify Technology Inc.” footer link on homepage and editorial pages.
- Fixed a one-pixel editorial-header overflow at 320px, consistent Escape dismissal from search inputs, and small-text contrast on the orange footer. Hero poster loads eagerly.
- Fixed duplicate desktop/mobile timeline IDs on eight existing puppy-stage pages.

## Evidence

- ESLint: passed.
- Existing unit suite: 510 tests passed across 19 files with NEXT_PUBLIC_SITE_URL=https://thepetclub.ca.
- Production build: passed, 106 generated outputs.
- Prerendered audit: 95 HTML pages, 5,631 internal link references, 302 local asset/font references, zero issues. See rendered-audit.json.
- DOM/physics checks: ball bounds/settling, recommendations, filters, search, dialogs, reduced motion, offscreen suspension and unmount cancellation passed. These are simulated DOM checks, not a browser rendering claim.
- Browser QA script updated for Chromium widths 320, 390, 768 and 1440, plus WebKit mobile. Covers fonts, horizontal overflow, image responses, menu, discovery, search and navigation. Passed: 90 browser scenarios, zero failures, in GitHub Actions run 39451079493 for application commit 9c62ce5c15dd811007f464e8361a47e91f7dc4da. Motion-on tests also verify film source selection, six scroll positions, moving ball, pause and a real server-rendered search request.

## Browser evidence

- CI: https://github.com/sepidehdalir/petsclub-ca/actions/runs/39451079481
- Browser QA: https://github.com/sepidehdalir/petsclub-ca/actions/runs/39451079493
- Screenshots/report artifact: seo-browser-qa-39451079493 (GitHub retention: 14 days).
- Desktop and 320px mobile screenshots inspected visually; approved art direction and footer attribution preserved.

## Limits

Physical iPhone playback/touch behavior, production authentication with a real account, outbound email delivery and field Core Web Vitals have not been verified. Community posting remains explicitly unavailable; no fake activity was added. External editorial source availability is outside the rendered internal-link audit.
