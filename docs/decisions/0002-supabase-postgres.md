# ADR 0002 — Supabase and PostgreSQL

**Status:** Accepted (Milestone 1)

## Context

A forum needs relational integrity (threads belong to categories, replies to
threads), authentication, file storage for avatars and photos, and an
authorisation model strong enough that a single application bug does not expose
other members' data.

## Decision

PostgreSQL via Supabase, using Supabase Auth, Supabase Storage and PostgreSQL
Row Level Security. Schema changes are versioned SQL migrations in
`supabase/migrations/`.

## Rationale

- **PostgreSQL fits the domain.** Categories are a self-referencing tree,
  threads and posts are a clear parent/child relationship, and moderation
  states are a natural enum. A document store would fake all three.
- **Row Level Security is the deciding factor.** Authorisation lives next to
  the data, so it applies to the browser client, Server Components and any
  future client equally. An application bug cannot bypass it.
- **Column-level `GRANT`s.** Native PostgreSQL privileges let us make `role`
  and denormalised counters unwritable by clients, which no ORM-level check can
  guarantee.
- **Auth and storage included.** Session refresh, email confirmation, password
  recovery and signed uploads are solved problems; reimplementing them would be
  the highest-risk code in the project.
- **Portability.** It is standard PostgreSQL. The schema and RLS policies move
  to any managed Postgres; only the auth and storage helpers are
  Supabase-specific.

## Alternatives considered

- **Firebase / Firestore.** No relational integrity, no SQL, weaker fit for a
  forum's join-heavy queries.
- **Managed Postgres + Prisma + a hand-rolled auth stack.** More control, but
  authorisation would move into application code, and the auth surface is where
  a solo project is most likely to ship a serious bug.
- **PlanetScale / MySQL.** No RLS equivalent, and no support for the partial
  indexes this schema relies on.

## Consequences

- Vendor coupling in `lib/supabase/` and in the auth flows. Deliberately
  confined to those modules.
- RLS policies must be reviewed as carefully as application code — a permissive
  `USING (true)` is a data breach. They are documented inline in the migration.
- Supabase Storage is the initial media store; `next.config.ts` derives its
  image host from configuration so moving to Cloudflare R2 later is a config
  change, not a refactor.
