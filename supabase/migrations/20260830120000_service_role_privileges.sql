-- ============================================================================
-- PetsClub.ca — restore the privileged path for service_role
-- ============================================================================
-- 20260829120200_row_level_security.sql states that service_role is left
-- "deliberately untouched" because it is the privileged path. That was true of
-- older Supabase projects, which granted ALL on new public tables to anon,
-- authenticated and service_role via ALTER DEFAULT PRIVILEGES.
--
-- Current projects do not. When a table in `public` is created by the
-- `postgres` role, the default ACL grants only Dxtm — TRUNCATE, REFERENCES,
-- TRIGGER and MAINTAIN — to those three roles. No SELECT, INSERT, UPDATE or
-- DELETE. So "untouched" now means "unprivileged", and the admin client in
-- src/lib/supabase/admin.ts would fail with `permission denied` the first time
-- Milestone 6 moderation tooling used it.
--
-- Verified against the live database on 2026-08-30, before this migration:
--   relacl on all four tables read `service_role=Dxtm/postgres`.
--
-- Note that Row Level Security was never the obstacle: service_role carries
-- rolbypassrls, so policies do not apply to it. Only the table grants were
-- missing, which is why this migration adds nothing else.
--
-- anon and authenticated are untouched here. Their privileges are stated
-- explicitly in the RLS migration and are already correct; re-granting them
-- from a second place would make the privilege model harder to audit.
-- ============================================================================

grant select, insert, update, delete
  on public.profiles, public.categories, public.threads, public.posts
  to service_role;
