<div align="center">

# PetsClub.ca

**Canada's community for pet parents.**

A production-grade Canadian pet community and editorial platform.

[![CI](https://github.com/sepidehdalir/petsclub-ca/actions/workflows/ci.yml/badge.svg)](https://github.com/sepidehdalir/petsclub-ca/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Overview

PetsClub.ca is a community and editorial platform built specifically for
Canadian pet owners. Most authoritative pet content online is written for a
United States audience — the prices are in the wrong currency, the products are
not sold here, and the rules on licensing, insurance and travel do not apply.
PetsClub combines a discussion community with a Canada-specific editorial
library so the answer you find is the answer that applies where you live.

This repository is the real codebase, developed in public. It is built to
commercial standards rather than as a demonstration, and the commit history is
intended to read as a record of how the platform was actually assembled.

> **Current status — Milestone 1: Production Foundation, complete.**
> The platform, design system, database schema, authorisation model,
> authentication and SEO architecture are in place. The community engine —
> posting and replying — is Milestone 2 and is **not** implemented yet.
> Sections that will hold user content render honest empty states, and the
> handful of illustrative fixtures are labelled as samples everywhere they
> appear. Nothing on this site presents fabricated activity as real.

**Live site:** https://petsclub.ca *(not yet deployed — see [Deployment](#deployment))*

---

## Screenshots

Screenshots have not been captured yet. `docs/screenshots/README.md` lists
exactly which views to capture and at which viewports. Committing an image that
was not taken from a running build would misrepresent the project, so the
directory documents the intent instead.

---

## Features

### Implemented (Milestone 1)

| Area | What is built |
| --- | --- |
| **Application shell** | Sticky responsive header, modal mobile drawer, structured footer, skip link |
| **Homepage** | Hero, trending discussions, topic explorer, editorial preview, Lost & Found preview, join CTA |
| **Community** | `/community` hub plus 25 prerendered category pages with breadcrumbs and sibling navigation |
| **Topic sections** | `/dogs`, `/cats`, `/health`, `/food`, `/training`, `/guides`, `/lost-found` |
| **Search** | Working GET form and category index; full-text search is Milestone 2 |
| **Design system** | 15+ accessible primitives built on native elements |
| **Database** | `profiles`, `categories`, `threads`, `posts` — constraints, partial indexes, triggers |
| **Authorisation** | Column-level `GRANT`s **and** Row Level Security; roles resolved in the database |
| **Authentication** | Email/password sign up, sign in, sign out, forgot and reset password |
| **Account** | Protected `/account` page reading the caller's profile through RLS |
| **SEO** | Canonical URLs, metadata factory, `robots.ts`, sitemap builder, generated OG card, structured data |
| **Policy pages** | About, Contact, Community Guidelines, Editorial Policy, Privacy, Terms, Advertising Disclosure |
| **Quality** | 67 unit tests, GitHub Actions CI running lint, typecheck, tests and build |

### Planned

Thread creation and replies · forum search · reactions and bookmarks ·
published editorial guides · member and pet profiles · structured Lost & Found
reports · moderation tooling · analytics · monetisation.

Full detail in [`docs/roadmap.md`](docs/roadmap.md).

---

## Architecture

Full write-up in [`docs/architecture.md`](docs/architecture.md).

```
                    ┌──────────────────────────────────────┐
   Visitor  ───────▶│  Vercel edge / CDN                   │
                    │  • Static HTML for every public page │
                    └───────────────┬──────────────────────┘
                                    │ dynamic routes only
                    ┌───────────────▼──────────────────────┐
                    │  Next.js 16 (App Router, Node)       │
                    │  • Server Components render pages    │
                    │  • Server Actions handle mutations   │
                    │  • src/proxy.ts refreshes sessions   │
                    └───────────────┬──────────────────────┘
                                    │ anon key + user JWT
                    ┌───────────────▼──────────────────────┐
                    │  Supabase                            │
                    │  • PostgreSQL + Row Level Security   │
                    │  • Auth (email/password)             │
                    │  • Storage (avatars, future media)   │
                    └──────────────────────────────────────┘
```

The central property: **the database is the last line of authorisation, not the
application.** Browser requests and Server Components both use the anon key
plus the caller's JWT, so PostgreSQL decides what is readable and writable.
Server rendering is not a privilege escalation.

**28 of 31 routes ship as static HTML.** Only `/account`, `/search` and the
auth endpoints are rendered per request. Four small Client Components carry all
of the client-side JavaScript.

---

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Per-route static/dynamic rendering, first-class SEO primitives |
| Language | TypeScript, strict + `noUncheckedIndexedAccess` | No `any` in the codebase |
| UI | React 19 Server Components | Client JS is opt-in, per component |
| Styling | Tailwind CSS v4 | Design tokens in `@theme`; no component library |
| Variants | `class-variance-authority`, `tailwind-merge` | Typed variants, caller overrides always win |
| Database | PostgreSQL (Supabase) | Relational integrity plus Row Level Security |
| Auth | Supabase Auth + `@supabase/ssr` | Cookie sessions that work with Server Components |
| Validation | Zod v4 | One schema for environment and form validation |
| Testing | Vitest | Fast, no DOM needed for the logic under test |
| Hosting | Vercel | Reference target for the App Router |
| Email | Resend-ready | Architecture in place; Supabase's sender is used today |

Runtime dependencies: **9**. There is no icon library, no UI kit and no state
manager — none were needed, and each would have been a permanent cost.

---

## Project Structure

```
src/
├── app/                     Routes only — no business logic
├── components/
│   ├── ui/                  Design system primitives (no domain knowledge)
│   ├── layout/              Header, footer, navigation, wordmark
│   └── shared/              Cross-feature composites and page templates
├── features/                Vertical slices: auth, community, editorial, lost-found
├── lib/
│   ├── env/                 Validated environment (public / server split)
│   ├── seo/                 Metadata, canonical URLs, structured data, sitemap
│   ├── supabase/            Browser, server and admin clients
│   └── utils/               Pure helpers
├── config/                  Site, navigation and topic configuration
├── types/                   Database contract
└── proxy.ts                 Session refresh at the network boundary

supabase/migrations/         Versioned SQL — the source of truth for the schema
docs/                        Architecture, roadmap, ADRs
```

Dependencies flow one way: `app → features → components/ui → lib → config`.
`lib/` and `config/` never import from `features/`, which keeps the pure,
testable core free of React and free of cycles.

---

## Database

Four tables, defined in `supabase/migrations/`:

```
auth.users ──1:1──▶ profiles ──▶ threads ──▶ posts
                                    ▲
                              categories (self-referencing tree)
```

Decisions worth calling out:

- **UUID primary keys** — sequential IDs leak volume and complicate future
  sharding.
- **Author deletion sets NULL; thread deletion cascades** — removing an account
  must not destroy a discussion others contributed to.
- **Soft deletion only** — no `DELETE` policy exists on `threads` or `posts`, so
  reply threading and the moderation trail survive.
- **Lowercase-only usernames** via `CHECK`, making the `UNIQUE` index
  case-insensitive without the `citext` extension.
- **Partial indexes** on the real access paths, e.g.
  `(category_id, last_activity_at DESC) WHERE status = 'published'`.
- **Denormalised counters** on `threads`, maintained server-side and unwritable
  by clients.

---

## Authentication

Email/password, with the architecture for OAuth providers in place.

```
Sign up ──▶ Server Action ──▶ zod ──▶ supabase.auth.signUp
                                            │
                        auth.users INSERT ──▶ trigger handle_new_user()
                                            │
                                        profiles row (role always defaults)
                                            │
        confirmation email ──▶ /auth/callback ──▶ session ──▶ /account
```

- Profiles are created by a **database trigger**, never by the client, and the
  trigger ignores any `role` in sign-up metadata.
- `getUser()` is used rather than `getSession()`, so the token is revalidated
  with the Auth server instead of trusted from a cookie.
- Every `?next=` value passes `isSafeRedirectPath()`, which rejects absolute,
  protocol-relative and backslash-escaped targets — unit-tested against the
  payloads actually used against redirect parameters.
- Sign-up and forgot-password return identical responses whether or not an
  account exists, so neither is an enumeration oracle.
- Password policy is length-only (10 characters), following current NIST
  guidance; composition rules push people toward shorter, more predictable
  passwords.
- Forms are Server Actions and sign-out is a POST route handler, so both work
  before hydration.

---

## SEO Architecture

| Concern | Implementation |
| --- | --- |
| Origin | `config/site.ts` — env → Vercel production URL → localhost |
| Canonicals | Query strings dropped, so filtered variants point at the clean URL |
| Metadata | One `createMetadata()` factory per route |
| robots.txt | Blocks preview deployments entirely |
| Sitemap | Pure, unit-tested builder driven by navigation and taxonomy |
| Social card | Generated by `next/og` from site config — cannot drift from the tagline |
| Structured data | `Organization`, `WebSite`, `BreadcrumbList` |

**Structured data honesty rule.** Only schemas describing things that genuinely
exist are emitted. The `Article`, `DiscussionForumPosting` and `ProfilePage`
builders are written and tested but rendered nowhere, because there is no
article, thread or member profile to describe yet. `WebSite` deliberately omits
`SearchAction` until search is a working endpoint.

---

## Security

| Risk | Mitigation |
| --- | --- |
| Service-role key in the browser | `import "server-only"` fences; build fails on a client import |
| Privilege escalation via `role` | Column-level `GRANT` excludes it; sign-up metadata ignored |
| Forged role claims | `is_moderator()` reads the database, not the JWT |
| Open redirect | `isSafeRedirectPath()` on every `?next=`, unit-tested |
| Account enumeration | Identical responses from sign-up and forgot-password |
| Counter tampering | Counters not granted to any client-facing role |
| XSS | No `dangerouslySetInnerHTML` on user data; no rich text yet |
| Cross-site sign-out | POST-only handler with an `Origin` check |
| Clickjacking / sniffing | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| Secrets in git | `.env*` ignored except `.env.example`; no key has ever been committed |

---

## Accessibility

- Semantic landmarks, one `<h1>` per page, labelled `<nav>` and `<section>`.
- Skip link, visually hidden until focused.
- A single always-visible `:focus-visible` treatment. Focus is never removed.
- The mobile drawer is a native `<dialog>` — platform focus trapping, Escape
  and background inertness.
- `<select>` stays native, keeping the platform picker on mobile.
- Labels, hints and errors wired together with matching `id`s;
  `aria-invalid` and `aria-describedby` driven by the same state as the visible
  message.
- 44 px minimum interactive targets; global `prefers-reduced-motion` override.

---

## Local Development

**Requirements:** Node.js 20.9+ (CI uses 22), npm 10+.

```bash
git clone https://github.com/sepidehdalir/petsclub-ca.git
cd petsclub-ca
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The application **runs without Supabase**. Every Milestone 1 page is static or
fixture-backed, and the auth screens state plainly that accounts are not
configured rather than failing silently. That is also why CI needs no secrets.

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and anon key into `.env.local`.
3. Apply the schema, in order:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120000_core_schema.sql
   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120100_auth_profile_provisioning.sql
   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120200_row_level_security.sql
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```

   Or, with the Supabase CLI linked to the project: `npx supabase db push`.

4. In **Authentication → URL Configuration**, set the site URL and add
   `<origin>/auth/callback` as a redirect URL.

---

## Environment Variables

Documented in [`.env.example`](.env.example).

| Variable | Required | Exposed to browser | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Yes | Canonical origin for metadata, sitemap and Open Graph |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth | Yes | Anon key — protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | No (Milestone 6) | **Never** | Bypasses RLS; privileged server operations only |
| `SUPABASE_DB_URL` | Local tooling only | No | Applying migrations and the seed |
| `RESEND_API_KEY` | No | No | Reserved for custom transactional email |

Environment variables are validated with Zod and split into
`lib/env/public.ts` and `lib/env/server.ts`. The server module begins with
`import "server-only"`, so importing a secret from a Client Component fails the
build rather than shipping it to the browser.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run verify` | Lint → typecheck → test → build. The full gate. |

---

## Testing

67 unit tests across four suites, run with Vitest. They target logic where a
regression would be a genuine defect rather than a snapshot diff:

| Suite | What it protects |
| --- | --- |
| `features/auth/schemas.test.ts` | Open-redirect payloads, credential validation. A regression here is a vulnerability. |
| `lib/seo/seo.test.ts` | Canonical URLs, metadata, sitemap completeness, structured-data shape |
| `features/community/taxonomy.test.ts` | Cross-reference integrity — slugs referenced as strings from navigation, config and fixtures, which TypeScript cannot check |
| `lib/utils/utils.test.ts` | Slug generation against the database `CHECK` constraint, relative-time formatting, active-path matching |

Component and end-to-end tests are deferred to Milestone 2, when there is
behaviour worth driving a browser for. Coverage percentage is not a target.

---

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to
`main` and every pull request:

```
npm ci → lint → typecheck → test → build
```

- Node 22 with npm cache keyed on `package-lock.json`.
- In-progress runs on the same ref are cancelled when superseded.
- `permissions: contents: read` — least privilege.
- **No secrets are configured.** The Milestone 1 site builds without
  credentials, so pull requests from forks cannot leak anything, because there
  is nothing to leak.

---

## Deployment

Targets Vercel. Not yet deployed.

```bash
npm i -g vercel
vercel link
vercel --prod
```

Then, in the Vercel project settings:

1. Add `NEXT_PUBLIC_SITE_URL=https://petsclub.ca` for Production.
2. Add the Supabase variables once a project exists.
3. Add `petsclub.ca` under **Domains** and point DNS at Vercel.
4. Add `https://petsclub.ca/auth/callback` to the Supabase redirect allow-list.

`robots.ts` returns `Disallow: /` for any origin that is not the production
domain, so preview deployments cannot be indexed alongside the real site.

---

## Engineering Decisions

Five decisions are recorded as ADRs in [`docs/decisions/`](docs/decisions):

| ADR | Decision | The trade-off |
| --- | --- | --- |
| [0001](docs/decisions/0001-nextjs-app-router.md) | Next.js App Router, server-first | Per-route rendering strategy in one codebase, at the cost of tracking a fast-moving framework |
| [0002](docs/decisions/0002-supabase-postgres.md) | Supabase and PostgreSQL | RLS puts authorisation next to the data, at the cost of vendor coupling confined to `lib/supabase/` |
| [0003](docs/decisions/0003-defence-in-depth-authorisation.md) | Column grants **plus** RLS | Two layers that fail independently, at the cost of friction when adding a writable column |
| [0004](docs/decisions/0004-client-side-header-auth-state.md) | Client-side header auth state | Keeps 28 routes static, at the cost of a brief placeholder for signed-in users |
| [0005](docs/decisions/0005-community-and-editorial-architecture.md) | Community and editorial on one domain | Each solves the other's cold-start problem; both must share one brand |

Three further choices, made deliberately rather than by default:

- **No UI component library.** Fifteen primitives built on native elements —
  `<dialog>`, `<select>`, real anchors — get platform accessibility for free and
  keep the bundle honest. A kit would have been faster on day one and a
  permanent constraint afterwards.
- **Fixture data is fenced off.** Every placeholder surface carries a visible
  notice, planned guides are non-interactive because no article exists behind
  them, and the sample Lost & Found reports are non-clickable with no contact
  details — nobody can be sent searching for an animal that does not exist.
  Deleting three files removes all demo content.
- **No fabricated legal documents.** The privacy policy and terms describe the
  intended approach behind an explicit "pending legal review" banner. A
  plausible-looking invented policy is worse than an honest placeholder, because
  a visitor could reasonably rely on it.

---

## License

[MIT](LICENSE)

The PetsClub name, wordmark and brand are not covered by the MIT licence.
