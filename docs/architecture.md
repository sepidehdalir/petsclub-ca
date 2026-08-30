# ThePetClub.ca — Architecture

This document describes how ThePetClub.ca is built and, more importantly, *why*
each significant decision was made. It is intended to be readable by someone
joining the project, and to stand up to questions in a technical review.

**Status:** Milestone 1 — Production Foundation.

---

## 1. System overview

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

The central property of this design: **the database is the last line of
authorisation, not the application.** Every request from a browser or from a
Server Component carries the anon key and the caller's JWT, so PostgreSQL's
Row Level Security policies decide what is readable and writable. Server
rendering is not a privilege escalation.

---

## 2. Frontend architecture

### Directory layout

```
src/
├── app/                     Next.js App Router — routes only
│   ├── layout.tsx           Root shell, fonts, site-level JSON-LD
│   ├── page.tsx             Homepage
│   ├── community/           Community hub + [categorySlug] pages
│   ├── auth/                Route handlers (callback, sign-out)
│   ├── sitemap.ts robots.ts opengraph-image.tsx
│   └── error.tsx not-found.tsx loading.tsx
├── components/
│   ├── ui/                  Design system primitives (no domain knowledge)
│   ├── layout/              Header, footer, navigation, wordmark
│   └── shared/              Cross-feature composites (breadcrumbs, page
│                            templates, JSON-LD)
├── features/                Vertical slices, one folder per domain
│   ├── auth/                schemas, actions, hooks, components
│   ├── community/           taxonomy, fixtures, components
│   ├── editorial/           planned guides, components
│   └── lost-found/          fixtures, components
├── lib/
│   ├── env/                 Validated environment (public / server split)
│   ├── seo/                 Metadata, canonical URLs, structured data
│   ├── supabase/            Browser, server and admin clients
│   └── utils/               Pure helpers (cn, slug, format)
├── config/                  Site, navigation and topic configuration
├── types/                   Database contract
└── proxy.ts                 Session refresh at the network boundary
```

**Why feature folders rather than type folders.** A `components/`,
`hooks/`, `utils/` split scales poorly: adding a feature touches every folder,
and nothing tells you which files belong together. Here, deleting
`src/features/lost-found/` removes the Lost & Found feature completely. The
`components/ui` layer is the deliberate exception — primitives have no domain
knowledge and are shared by everything.

Feature folders exist only where there is real code today. Empty placeholder
directories for `users/`, `pets/`, `search/`, `moderation/` and
`notifications/` would be noise; the roadmap records where those slices go.

### Import direction

```
app/  →  features/  →  components/ui  →  lib/  →  config/
              ↘  components/shared  ↗
```

Dependencies flow one way. `lib/` and `config/` never import from `features/`
or `components/`, which keeps the pure, testable core free of React and free
of cycles.

---

## 3. Server / client boundary

Milestone 1 ships **28 of 31 routes as static HTML**. That is a deliberate
architectural outcome, not a coincidence.

| Rendering | Routes |
| --- | --- |
| Static (prerendered) | homepage, all topic sections, policy pages, sign-up, forgot/reset password |
| SSG via `generateStaticParams` | all 25 `/community/[categorySlug]` pages |
| Dynamic (per request) | `/account`, `/search`, `/sign-in`, `/auth/*` |

Only four components are Client Components, each for a specific reason:

| Component | Why it needs the browser |
| --- | --- |
| `NavLink` | Reads `usePathname()` to set `aria-current` on the active section |
| `MobileNav` | Opens a modal `<dialog>`; needs local UI state |
| `AuthNav` | Resolves the session after hydration |
| Auth forms | `useActionState` / `useFormStatus` for pending and error state |

**The header auth trade-off.** Reading the session in the root layout would
call `cookies()`, which opts *every* page out of static rendering — the whole
site would become per-request server rendering for one line of header text.
Instead the auth slot is a small hydrated island that renders a fixed-width
placeholder and fills in after hydration. Pages stay on the CDN; the header
catches up in milliseconds. Recorded as
[ADR 0004](decisions/0004-client-side-header-auth-state.md).

Server-side auth is still exercised properly: `/account` is a Server Component
that calls `getUser()` and reads the profile through RLS.

---

## 4. Supabase architecture

Three clients, three privilege levels, enforced at build time:

| Module | Key | Runs in | RLS applies |
| --- | --- | --- | --- |
| `lib/supabase/client.ts` | anon | Browser | Yes |
| `lib/supabase/server.ts` | anon | Server Components, Actions, Handlers | Yes |
| `lib/supabase/admin.ts` | **service role** | Server only, `import "server-only"` | **No — bypasses RLS** |

`lib/supabase/admin.ts` and `lib/env/server.ts` both begin with
`import "server-only"`. If a Client Component ever imports them, the build
fails rather than shipping a service-role key to the browser. The admin client
is unused in Milestone 1; it exists so that Milestone 6 has one reviewed entry
point for privileged access instead of ad-hoc clients scattered around.

**Session refresh** happens in `src/proxy.ts` (Next.js 16 renamed the
`middleware` convention to `proxy`). Supabase access tokens are short-lived and
Server Components cannot write cookies, so the rotated token has to be written
at the network boundary or signed-in users silently drop to signed-out.

The proxy performs **no authorisation**. Treating a middleware check as the
security boundary is a well-known source of authorisation bypasses; here,
route protection lives in the page and, ultimately, in RLS.

**Storage.** Avatars use Supabase Storage. `next.config.ts` derives the allowed
`next/image` remote pattern from `NEXT_PUBLIC_SUPABASE_URL`, so each
environment permits exactly its own origin. Moving to Cloudflare R2 later means
adding a host there and changing the upload helper — no component changes,
because components only ever receive a URL string.

---

## 5. Database model

```
auth.users (Supabase-managed)
     │ 1:1, ON DELETE CASCADE
     ▼
  profiles ──────┐
     │           │ author_id, ON DELETE SET NULL
     │           ▼
     │        threads ─────────┐
     │           ▲             │ thread_id, ON DELETE CASCADE
     │           │             ▼
     │           │           posts
     │           │ category_id, ON DELETE RESTRICT
     │      categories ──┐
     │           ▲       │ parent_id (self-referencing tree)
     └───────────┴───────┘
```

Migrations live in `supabase/migrations/`, applied in filename order.

### Design decisions

**UUID primary keys.** Sequential integers leak volume (`/threads/4` tells you
the site has four threads) and make future sharding or client-side ID
generation painful.

**Author deletion sets NULL, thread deletion cascades.** Deleting an account
must not destroy a discussion other members contributed to — the thread stays,
attributed to a deleted author. Deleting a *thread* legitimately removes its
replies, so that side cascades.

**Category deletion is `RESTRICT`.** Silently removing a category with
discussions in it is not a recoverable mistake.

**Soft deletion only.** `content_status` is `published | locked | hidden |
deleted`. There is no `DELETE` policy on `threads` or `posts` at all; removal
is a status change, which keeps reply threading intact and preserves the
moderation trail.

**Lowercase-only usernames.** A `CHECK` constraint enforces
`^[a-z0-9_]{3,30}$`, which makes the `UNIQUE` index case-insensitive by
construction without needing the `citext` extension.

**Partial indexes on the real access paths.** For example:

```sql
create index threads_category_activity_idx
  on public.threads (category_id, last_activity_at desc)
  where status = 'published';
```

The `WHERE` clause keeps the index to just the rows a listing query actually
scans.

**Denormalised counters.** `reply_count` and `view_count` live on `threads`
because listing pages need them and a `COUNT(*)` per row does not scale. They
are maintained server-side and are unwritable by clients (see below).

---

## 6. Authorisation model

Two independent layers. A bug in one does not by itself open a hole.

### Layer 1 — column privileges

PostgreSQL column-level `GRANT`s decide which columns a role may *ever* write.
The RLS migration revokes whatever Supabase's default privileges gave `anon` and
`authenticated` on a new table, then re-grants a minimum surface:

```sql
grant update (display_name, avatar_url, bio, province, city)
  on public.profiles to authenticated;
```

`role` is not in that list. A member cannot escalate their own privileges no
matter what the API sends, because the *statement* is rejected before RLS is
even consulted. The same technique makes `reply_count`, `view_count`,
`last_activity_at` and `author_id` unwritable by clients.

A note on defaults, because they have changed. Older Supabase projects granted
`ALL` on new `public` tables to `anon`, `authenticated` *and* `service_role`.
Current projects do not: when `postgres` creates the table, the default ACL
grants only `Dxtm` — TRUNCATE, REFERENCES, TRIGGER, MAINTAIN — with no DML at
all. For `anon` and `authenticated` this is immaterial, since the RLS migration
states their privileges explicitly. For `service_role` it meant the privileged
client in `lib/supabase/admin.ts` had no access to any table, which
`20260830120000_service_role_privileges.sql` corrects. Row Level Security was
never the constraint there: `service_role` carries `rolbypassrls`, so only the
table grants were missing.

### Layer 2 — row policies

RLS decides which rows. Examples:

- Published threads in active categories are readable by anyone.
- Authors can read their own threads in any status.
- Authors can edit a published thread and soft-delete it, but cannot set
  `locked` or `hidden` — those are moderation states.
- Replying requires the parent thread to be `published`, so a locked thread
  rejects new replies *at the database level*, not just in the UI.

### Where roles come from

`public.is_moderator()` is a `STABLE SECURITY DEFINER` function that reads
`profiles.role` for `auth.uid()`. Roles are never read from a JWT claim, which
a client can stale-cache or an attacker can attempt to forge. `SECURITY
DEFINER` also stops policies that call it from recursing into the `profiles`
policies.

`FORCE ROW LEVEL SECURITY` is intentionally *not* enabled: the table owner must
retain bypass so `handle_new_user()` can provision a profile at sign-up, when
no policy-visible session exists yet.

---

## 7. Authentication flow

```
Sign up
  form ──▶ signUpAction (server) ──▶ zod validation ──▶ supabase.auth.signUp
                                                              │
                             auth.users INSERT ──▶ trigger on_auth_user_created
                                                              │
                                            handle_new_user() ──▶ profiles row
                                                              │
  confirmation email ──▶ /auth/callback ──▶ exchangeCodeForSession ──▶ /account
```

Profiles are created by a database trigger, never by the client. The trigger
reads `display_name` from sign-up metadata and **ignores any `role`** supplied
there — sign-up metadata is attacker-controlled.

Notable choices:

- **`getUser()`, not `getSession()`.** `getUser()` revalidates the token with
  the Auth server; `getSession()` trusts the cookie.
- **Redirect safety.** Every `?next=` value passes through
  `isSafeRedirectPath()`, which rejects absolute, protocol-relative and
  backslash-escaped targets. This is unit-tested against the payloads that are
  actually used against redirect parameters.
- **No enumeration oracle.** Sign-up and forgot-password return identical
  responses whether or not the address is registered.
- **Password policy is length-only** (10 characters minimum, no composition
  rules), following current NIST guidance.
- **Progressive enhancement.** Forms are Server Actions and sign-out is a POST
  route handler, so both work before hydration.

---

## 8. SEO architecture

SEO is treated as an engineering concern with a single source of truth, not as
per-page copy-paste.

| Concern | Implementation |
| --- | --- |
| Origin | `config/site.ts` — `NEXT_PUBLIC_SITE_URL` → Vercel production URL → localhost |
| Canonicals | `lib/seo/urls.ts` — query strings dropped so filtered variants point at the clean URL |
| Page metadata | `lib/seo/metadata.ts` — one `createMetadata()` per route |
| Title template | `%s \| The Pet Club`, set once in the root layout |
| robots.txt | `app/robots.ts` — blocks preview deployments entirely |
| Sitemap | `lib/seo/sitemap.ts` — pure builder, unit-tested |
| Social card | `app/opengraph-image.tsx` — generated by `next/og` from site config |
| Structured data | `lib/seo/structured-data.ts` |

**Structured data honesty rule.** Only `Organization`, `WebSite` and
`BreadcrumbList` are emitted, because they describe things that genuinely
exist. `Article`, `DiscussionForumPosting` and `ProfilePage` builders are
written and tested but **not rendered anywhere**, since there is no article,
thread or member profile to describe yet. `WebSite` deliberately omits
`SearchAction` until search is a working endpoint.

**Breadcrumbs** render the visible trail and the JSON-LD from the same array,
so what a crawler reads and what a person sees cannot disagree.

**Preview deployments** return `Disallow: /` so a `*.vercel.app` copy of the
site cannot be indexed alongside the production domain.

---

## 9. Performance

- Static-first: 28 of 31 routes are prerendered.
- Client JavaScript is limited to four small islands.
- Fonts are self-hosted by `next/font` with `display: swap` — no third-party
  request on the critical path, and no layout shift from a late stylesheet.
- The wordmark is text, not an image: no request, no shift, crisp at any
  density.
- No icon library. The handful of icons used are inline SVG.
- Relative timestamps are computed from fixed offsets rather than a clock read,
  so static output is deterministic and cannot cause a hydration mismatch.
- `next/image` handles the only remote images (avatars), with AVIF/WebP
  negotiation and per-environment remote patterns.

---

## 10. Accessibility

- Semantic landmarks: one `<header>`, `<main id="main-content">`, `<footer>`,
  and labelled `<nav>` and `<section>` elements.
- A skip link, visually hidden until focused.
- Exactly one `<h1>` per page, via the shared `PageHeader`.
- A single always-visible `:focus-visible` treatment. Focus is never removed.
- The mobile drawer is a native `<dialog>`, so focus trapping, Escape and
  background inertness come from the platform.
- `<select>` stays native — platform picker on mobile, full screen-reader
  support.
- `Field` wires label, hint and error `id`s together; auth inputs set
  `aria-invalid` and `aria-describedby` from the same state that renders the
  visible message.
- Interactive targets are at least 44 px.
- A global `prefers-reduced-motion` override.

---

## 11. Security summary

| Risk | Mitigation |
| --- | --- |
| Service-role key in the browser | `import "server-only"` fences; no `NEXT_PUBLIC_` prefix |
| Privilege escalation via `role` | Column-level `GRANT` excludes `role`; sign-up metadata ignored |
| Forged role claims | `is_moderator()` reads the database, not the JWT |
| Open redirect | `isSafeRedirectPath()` on every `?next=`, unit-tested |
| Account enumeration | Identical responses from sign-up and forgot-password |
| Counter tampering | `reply_count` / `view_count` not granted to any client role |
| XSS via user content | No `dangerouslySetInnerHTML` on user data; no rich text yet |
| XSS via JSON-LD | Typed builders only, `JSON.stringify` with `<` escaped |
| Cross-site sign-out | POST-only handler with an `Origin` check |
| Clickjacking / sniffing | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| Secrets in git | `.env*` ignored except `.env.example`; no key has ever been committed |

---

## 12. Testing

Vitest, Node environment, no DOM — the tests target logic where a regression
would be a real defect rather than a snapshot diff:

- **`features/auth/schemas.test.ts`** — open-redirect payloads and credential
  validation. A regression here is a vulnerability.
- **`lib/seo/seo.test.ts`** — canonical URLs, metadata, sitemap completeness,
  structured-data shape.
- **`features/community/taxonomy.test.ts`** — cross-reference integrity. Slugs
  are referenced as strings from navigation, topic config and fixtures, and
  TypeScript cannot catch a rename; these tests turn a dead link into a failing
  build.
- **`lib/utils/utils.test.ts`** — slug generation against the database `CHECK`
  constraint, relative-time formatting, and active-path matching.

Component and end-to-end tests are deferred to Milestone 2, when there is
behaviour worth driving a browser for.

---

## 13. Future scaling considerations

- **Sitemap size.** `buildSitemapEntries()` is already a pure function;
  splitting into indexed sitemaps via `generateSitemaps` is a local change when
  thread URLs approach the 50,000-entry limit.
- **Taxonomy source.** `features/community/taxonomy.ts` mirrors the shape of
  `public.categories`. Milestone 2 replaces the constant with a cached query;
  consumers do not change.
- **Search.** Postgres full-text search (`tsvector` + GIN) first; a dedicated
  search service only if relevance demands it.
- **Counters.** `reply_count` is maintained by trigger. If contention appears
  on hot threads, move to a periodic rollup.
- **Storage.** The `next/image` remote-pattern indirection means moving to
  Cloudflare R2 is a config and upload-helper change.
- **Caching.** Static pages are CDN-cached today. Once threads are live,
  category listings become the first candidates for tag-based revalidation.

---

## 14. Local development

```bash
npm install
cp .env.example .env.local     # fill in Supabase values
npm run dev
```

The application runs without Supabase — every Milestone 1 page is static or
fixture-backed, and the auth screens say plainly that accounts are not
configured. That is also why CI needs no secrets.

Applying the schema:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120000_core_schema.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120100_auth_profile_provisioning.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260829120200_row_level_security.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260830120000_service_role_privileges.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Or, with the Supabase CLI linked to the project: `npx supabase db push`.

`SUPABASE_DB_URL` must be the **session pooler** connection string. The direct
connection host is IPv6-only, and the transaction pooler on port 6543 does not
support the DDL these migrations run. See the README for where to find it.

---

## 15. Architecture decision records

| ADR | Decision |
| --- | --- |
| [0001](decisions/0001-nextjs-app-router.md) | Next.js App Router with server-first rendering |
| [0002](decisions/0002-supabase-postgres.md) | Supabase and PostgreSQL |
| [0003](decisions/0003-defence-in-depth-authorisation.md) | Column grants plus RLS |
| [0004](decisions/0004-client-side-header-auth-state.md) | Client-side header auth state |
| [0005](decisions/0005-community-and-editorial-architecture.md) | Community and editorial as one platform |
