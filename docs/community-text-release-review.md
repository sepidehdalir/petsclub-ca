# Text-only community release: draft for review

Base: c13df7c28d76ef8b350574a39cbb0aeef8f5141a. Application release remains draft and unmerged.

## Verified preparation status, 17 October 2026

The owner separately approved the bounded database change. The exact SQL from commit 0da337df9a85c703fc4a6ad32b1d585c2b607e52 (blob edb78f24b96ec4f8d6063d1f6960919d70c6cf4e) was manually applied to the existing Supabase project at 17:25 UTC. It was not registered as an automatic migration; do not run it again blindly. Before application, the affected policy definitions, grants and helper definition were captured for review. This targeted snapshot is not a full database backup.

Readback at 17:26 UTC confirmed the database feature flag is false, private tables use RLS and are inaccessible to authenticated members, anonymous RPC execution is denied, authenticated direct post/thread writes are denied, and the controlled RPC is available to authenticated sessions. Counts remained 1 profile, 30 categories and 0 threads/posts; new report/audit/operations tables were empty. No user role changed and no moderator exists. The public application is still the previous release with its community gate closed.

Required launch checks below are still outstanding unless explicitly marked completed. The privacy proposal remains a draft. This preparation is not evidence of a working public forum.

## What is implemented

- Existing category and editorial URLs remain intact. Categories gain real paginated discussions only when explicitly enabled.
- Stable `/community/discussions/<uuid>` pages; escaped plain text, no uploads, embedded HTML, MDX evaluation or external link auto-linking.
- Confirmed authenticated members can create threads, reply, edit their own published contributions and remove them from public view.
- Reports and moderator hide/lock/restore/remove controls; private report queue at `/community/moderation`. No invented members, replies or activity.
- Public locked threads remain readable; replies/edits stop. Hidden/deleted content is not readable even by its author; moderators can review it.
- User content has noindex metadata initially, no sitemap entries, and no shared user-specific cache.
- Existing guides, affiliate register, consent, authentication configuration and product URLs are untouched.

## Exact reviewed database/security delta (applied with feature disabled)

The SQL is deliberately in `supabase/drafts/community_text_release.sql`, not the automatic migrations folder.

1. Add private settings, idempotency/operations, report and moderation audit tables. Revoke public/anon/authenticated access, enable deny-by-default RLS. Settings starts disabled.
2. Revoke direct authenticated INSERT/UPDATE/DELETE on threads/posts and remove six old mutation policies. Members instead call a narrowly checked `SECURITY DEFINER` RPC through their existing session; no service key or new credential is used.
3. Remove author SELECT exceptions for hidden/deleted contributions. Replace public SELECT policies to allow locked threads and published replies on visible active-category threads. Existing moderator read policies remain but their is_moderator helper is tightened to require a confirmed, nondeleted, currently non-banned Auth user. This also changes inactive-category moderator access. Old JWTs from suspended moderators cannot read hidden content or the private report queue.
4. RPC checks live confirmed, non-banned, non-deleted auth user and database profile role, null-safe ownership, operation and length limits, category/status, per-user advisory serialization and target row locks. Unknown operation/keys fail closed. Request IDs bind to actor and a SHA-256 hash of the canonical payload; the ledger stores no duplicate message/reason text; retries return only an ID.
5. Successful changes limited to 20 per 10 minutes, 100 per day, and three new threads per hour. Defensive moderator actions are exempt so abuse cleanup cannot exhaust the member quota. These are proposed launch limits, not a complete edge/network abuse control. Failed requests roll back and do not consume these limits.
6. Moderator actions record actor, target, prior/new status and reason. Reports retain private reporter ID, exclude it from the moderator UI projection, and deduplicate by reporter/target. RPC execution is revoked from PUBLIC/anon and granted to authenticated only.
7. Reply counts and last activity recalculate transactionally for affected threads. No existing rows are deleted. Pre-existing stale counts still require a reviewed reconciliation before launch.

## Approval and release gates

- Completed: owner approval and bounded manual application of the exact database artifact above. Any new security change needs its own scoped approval.
- Completed: read-only inventory of the four foundation migrations, recovered schema, policies, effective grants and aggregate counts. Auth/real session behaviour still requires integration verification.
- Run the SQL in a disposable Supabase/PostgreSQL environment first, including real PostgREST permissions and two-session races. PGlite tests are useful but cannot prove those integrations.
- Confirm a real moderator and working report-handling coverage; approve privacy/terms/guidelines for stored member content/report data and retention. No role assignment is performed by this PR.
- Confirm backups/rollback and deployment source. Open BOTH gates only after approval: database settings row and server `COMMUNITY_ENABLED=true`. Neither is enabled here. Closing the app flag hides functionality without deleting member data.
- Preview infrastructure may automatically build this draft branch; its default closed gate preserves current public behaviour. Do not merge or promote without parent review.

## Test commands and known limits

`NEXT_PUBLIC_SITE_URL=https://thepetclub.ca npm run verify`

Disposable database harness (never touches a project): install pinned `@electric-sql/pglite@0.3.14` in a temporary directory, then run `PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node scripts/community-db-qa.mjs`. The harness creates mock auth roles/users, loads source migrations, and applies the draft to memory. Only pgcrypto extension setup is omitted because native gen_random_uuid is present.

Tests cover gate closed, confirmed/anonymous access, direct writes and role forgery, private table access, cross-user and null-author ownership, idempotent retries, locked/hidden visibility, moderator restore, reports and reply counters. Confirmed-role API integration, live cookies/login, actual member persistence across devices, physical mobile, multi-session races and deployment QA remain release gates.

Before launch also test expired sessions and preserved form text, double clicks, same request/different body, locked-thread navigation, screen reader labels, keyboard focus, 390px layout and empty/error states. No lead, visitor, sale or revenue result is implied by this draft.
