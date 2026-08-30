# ADR 0004 — Client-side header auth state

**Status:** Accepted (Milestone 1)

## Context

The header shows "Sign in" to visitors and a user menu to members. The obvious
implementation reads the session in the root layout with `getUser()`.

That call reads cookies. In the App Router, any `cookies()` access in a shared
layout makes every route beneath it dynamic. One line of header text would
convert the entire site — homepage, 25 category pages, every topic and policy
page — from CDN-cached static HTML to per-request server rendering.

## Decision

Render the auth slot as a small Client Component (`AuthNav`) that resolves the
session in the browser via `useSupabaseSession`. The root layout stays static.

## Rationale

- **The cost is asymmetric.** Server-rendered auth state buys a marginally
  faster first paint of one header element for signed-in users, and costs
  static rendering for every page, for everyone, including the anonymous search
  traffic the business depends on.
- **Layout shift is avoidable.** The component renders a fixed-width
  placeholder while loading, so resolving the session cannot move the header.
- **Server-side auth is still real.** `/account` is a Server Component that
  calls `getUser()` and reads the profile through RLS. This ADR is about a
  header label, not about where authorisation happens.
- **Sign-out degrades gracefully.** It is a form POST to a route handler, so it
  works even if this island has not hydrated.

## Alternatives considered

- **Session in the root layout.** Rejected: opts the whole site out of static
  rendering.
- **Partial Prerendering.** The right long-term answer — a static shell with the
  auth slot streamed from the server. Revisit when PPR is stable for this
  version.
- **Duplicated layouts** for public and authenticated route groups. Doubles the
  shell and still cannot handle a signed-in visitor reading a public page.

## Consequences

- Signed-in users briefly see a placeholder in the header on first load.
- The Supabase browser client is in the client bundle. It is needed for
  interactive features from Milestone 2 onward regardless.
- Revisit when Partial Prerendering is stable.
