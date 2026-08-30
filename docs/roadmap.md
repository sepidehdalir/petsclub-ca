# ThePetClub.ca — Roadmap

Milestones are ordered so that each one is independently shippable and none
requires rewriting the last. Only Milestone 1 is complete; everything below it
is a plan, not a promise of a date.

| Milestone | Scope | Status |
| --- | --- | --- |
| 1 | Production Foundation | ✅ **Complete** |
| 2 | Community Engine | ⏭️ Next |
| 3 | Editorial Platform | Planned |
| 4 | Member and Pet Profiles | Planned |
| 5 | Lost & Found | Planned |
| 6 | Admin and Moderation | Planned |
| 7 | Launch SEO and Analytics | Planned |
| 8 | Monetisation | Planned |

---

## ✅ Milestone 1 — Production Foundation

**Complete.**

- Next.js 16 App Router, React 19, TypeScript in strict mode, Tailwind CSS v4.
- Accessible design system: 15+ primitives, native `<dialog>` and `<select>`,
  a single focus treatment, reduced-motion support.
- Responsive application shell — sticky header, modal mobile drawer, structured
  five-group footer, skip link.
- Homepage, `/community` hub, 25 prerendered category pages, five topic
  sections, `/guides`, `/lost-found`, `/search`, and seven company and policy
  pages.
- PostgreSQL schema for `profiles`, `categories`, `threads` and `posts`, with
  constraints, partial indexes and `updated_at` triggers.
- Two-layer authorisation: column-level `GRANT`s plus Row Level Security, with
  roles resolved in the database rather than from a JWT claim.
- Email/password authentication — sign up, sign in, sign out, forgot password,
  reset password — with server-side validation, open-redirect protection and no
  account-enumeration oracle.
- SEO foundation: canonical URLs, metadata factory, `robots.ts`, a pure sitemap
  builder, generated Open Graph card, and structured data restricted to content
  that actually exists.
- 67 unit tests, GitHub Actions CI running lint, typecheck, tests and build.
- Architecture documentation and five ADRs.

**Explicitly not built:** thread creation, replies, search, profile editing,
moderation tooling, Lost & Found reports, published articles, monetisation.

---

## ⏭️ Milestone 2 — Community Engine

Turning the taxonomy into a working forum. This is the next milestone.

**Recommended scope**

1. **Categories from the database.** Replace the taxonomy constant with a
   cached query. Consumers already take the same shape, so this is a data-source
   swap, not a refactor.
2. **Thread creation.** Composer with server-side validation, slug generation
   via `slugify()` (already constraint-matched and tested), rate limiting, and
   `/community/[categorySlug]/[threadSlug]` routes.
3. **Replies.** Posting, editing within a window, soft deletion, pagination.
4. **Counter maintenance.** Triggers for `reply_count` and `last_activity_at`;
   a `SECURITY DEFINER` RPC for `view_count`, which must not be client-writable.
5. **Real listings.** Category and homepage listings backed by real threads,
   with sorting by activity. Delete the three fixture files and their
   `DemoContentNotice` call sites.
6. **`DiscussionForumPosting` structured data.** The builder exists and is
   tested; it starts being emitted once real threads exist.
7. **Forum search.** PostgreSQL full-text search (`tsvector` + GIN), replacing
   the `/search` placeholder.
8. **Reporting.** Let members flag content; queue it for Milestone 6 tooling.
9. **Policy testing.** A migration test harness that runs RLS policies against a
   real database — the gap called out in ADR 0003.

**Recommended GitHub issues**

- Community: load categories and threads from the database
- Community: thread composer with server-side validation and slug generation
- Community: reply system with edit window and soft delete
- Community: `reply_count` / `last_activity_at` triggers and a `view_count` RPC
- Community: full-text search over threads and posts
- Community: content reporting flow
- Community: emit `DiscussionForumPosting` structured data
- Community: remove homepage and category fixtures
- Testing: RLS policy test harness against a live Postgres instance

**Deferred to later milestones:** reactions, bookmarks, best answers, following
and notifications. Each depends on threads existing first.

---

## Milestone 3 — Editorial Platform

- Article schema, editorial workflow (draft → review → published), and a
  review-date field surfaced on every guide.
- `/guides/[slug]` routes with `Article` structured data and author attribution.
- Table of contents, related-discussion links from guide to forum category.
- Corrections log, published rather than silently edited.
- Replace the "planned guide" placeholders with real articles.

## Milestone 4 — Member and Pet Profiles

- Public profiles at `/members/[username]` with `ProfilePage` structured data.
- Profile editing (the column grants for this already exist).
- Pet profiles: species, breed, age, photos.
- Avatar and photo upload via Supabase Storage with signed URLs.
- Member activity feeds.

## Milestone 5 — Lost & Found

- Structured reports: species, description, last-seen location and time, photos.
- Province and city filtering, map view, resolved/reunited states.
- Local alerting for members in the area.
- Abuse controls, since this feature is the most sensitive to fabricated posts.

## Milestone 6 — Admin and Moderation

- Moderator queue backed by Milestone 2 reports.
- Content actions: lock, hide, soft delete, restore — the policies exist
  already.
- Role management through the service-role client (`lib/supabase/admin.ts`, the
  single reviewed privileged entry point).
- Audit log of every moderation action.
- Appeals process, as promised in the Community Guidelines.

## Milestone 7 — Launch SEO and Analytics

- Privacy-respecting analytics and Core Web Vitals field data.
- Search Console integration and indexing monitoring.
- Internal linking review across guides and categories.
- Indexed sitemaps via `generateSitemaps` once thread URLs approach the 50,000
  entry limit.
- Performance budget enforced in CI.

## Milestone 8 — Monetisation

- Advertising placements that are visually distinct and labelled.
- Affiliate links with per-page disclosure, per the Advertising Disclosure.
- Sponsored content clearly separated from editorial.
- Reporting and revenue attribution.

The commitments in `/advertising-disclosure` are binding on this milestone: a
commercial relationship never determines a recommendation, and advertisers do
not review guides before publication.

---

## Out of scope

Deliberately excluded from the current plan: mobile apps, marketplace, direct
messages, real-time chat, sitter or vet booking, ecommerce, video hosting,
gamification, and AI-generated content or an "AI veterinarian".

`catbar.ca` and `petbar.ca` are reserved for potential future vertical brands.
They are not part of ThePetClub.ca and traffic is not split across them — see
[ADR 0005](decisions/0005-community-and-editorial-architecture.md).
