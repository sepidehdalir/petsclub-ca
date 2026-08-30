# ADR 0003 — Column grants plus Row Level Security

**Status:** Accepted (Milestone 1)

## Context

Two failures would be serious enough to matter on their own:

1. A member escalating their `role` to `moderator` or `admin`.
2. A member writing denormalised counters (`reply_count`, `view_count`) or
   reassigning authorship.

Both are classically prevented by "the API does not expose that field". That is
one mistake away from failing: a new endpoint, a spread of `req.body` into an
update, or an ORM's `updateMany` is all it takes.

## Decision

Enforce authorisation in two independent database layers.

**Layer 1 — column privileges.** Revoke Supabase's default blanket grant and
re-grant only writable columns:

```sql
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, avatar_url, bio, province, city)
  on public.profiles to authenticated;
```

**Layer 2 — row policies.** RLS decides which rows, using `auth.uid()` and
`public.is_moderator()`.

## Rationale

- The layers fail independently. A permissive RLS policy still cannot let a
  member write `role`, because the statement is rejected before policies are
  evaluated. A missing column grant still cannot let a member edit someone
  else's row, because RLS rejects it.
- It is enforced for every client — browser, server, psql, a future mobile app.
  There is no path around it.
- `is_moderator()` resolves privilege from `profiles.role` in the database
  rather than from a JWT claim, which a client can stale-cache and an attacker
  will try to forge.
- Soft deletion only: no `DELETE` policy exists on `threads` or `posts`, so
  removal is a status change and the moderation trail survives.

## Consequences

- Adding a writable column means updating the `GRANT` as well as the schema.
  This is intentional friction on exactly the change that deserves review.
- `FORCE ROW LEVEL SECURITY` is not enabled, because the table owner must keep
  bypass for `handle_new_user()` to provision a profile at sign-up. Documented
  in the migration.
- Policy correctness is not covered by the unit suite. A migration test harness
  running the policies against a real database is scheduled for Milestone 2,
  when there is content to test against.
