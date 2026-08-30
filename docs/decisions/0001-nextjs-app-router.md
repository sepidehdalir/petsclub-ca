# ADR 0001 — Next.js App Router with server-first rendering

**Status:** Accepted (Milestone 1)

## Context

The Pet Club is two products in one: an editorial library that lives or dies by
organic search, and a community that needs authenticated, interactive writing.
Those pull in different directions. Editorial wants static HTML on a CDN.
Community wants per-request session state.

## Decision

Next.js 16 with the App Router, rendering server-first. React Server Components
are the default; Client Components are opted into per component.

## Rationale

- **Per-route rendering strategy.** The same codebase serves 28 static routes
  and 3 dynamic ones without two applications or a separate static generator.
  A category page is prerendered; `/account` is per-request. That is exactly the
  split the product needs.
- **The client boundary is explicit.** `"use client"` makes the JavaScript cost
  of a component visible in review. Four islands ship JS today; nothing else
  does.
- **SEO primitives are first-class.** Metadata, `sitemap.ts`, `robots.ts` and
  `next/og` are framework features, not plugins that break on upgrade.
- **Server Actions remove an API layer.** Auth mutations are typed functions
  with server-side validation, not hand-written route handlers plus fetch
  wrappers plus a second set of types.
- **Vercel is the reference deployment target**, so preview deployments, image
  optimisation and edge caching need no configuration.

## Alternatives considered

- **Remix / React Router.** Comparable server-first model, weaker built-in SEO
  and image tooling, smaller hosting story for this stack.
- **Astro.** Excellent for the editorial half; the community half would need a
  separate application.
- **Vite SPA + separate API.** Loses server rendering, which is not negotiable
  for a search-dependent content site.

## Consequences

- Tied to the App Router's evolution, including renames like `middleware` →
  `proxy` in v16.
- Contributors must understand the server/client boundary; the layout section
  of `docs/architecture.md` documents which components are islands and why.
- Static-first means content changes require a rebuild or revalidation. That is
  acceptable now and is why the taxonomy is a typed constant.
