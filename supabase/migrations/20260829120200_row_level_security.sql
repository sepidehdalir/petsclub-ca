-- ============================================================================
-- ThePetClub.ca — Row Level Security and privilege model
-- ============================================================================
-- Authorisation is enforced in two independent layers:
--
--   1. Column-level GRANTs decide *which columns* a role may ever write.
--      This is what stops a member from escalating their own `role`, or from
--      inflating a denormalised counter, no matter what the API sends.
--
--   2. Row Level Security policies decide *which rows* a role may read or
--      write, using auth.uid() and the database-resolved is_moderator().
--
-- A bug in one layer does not by itself open a hole. Nothing here trusts a
-- value supplied by the browser.
--
-- Note on FORCE ROW LEVEL SECURITY: it is intentionally NOT enabled. The
-- table owner must retain bypass so that SECURITY DEFINER functions such as
-- handle_new_user() can provision a profile at sign-up, when no policy-visible
-- session exists yet.
-- ============================================================================

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.threads    enable row level security;
alter table public.posts      enable row level security;

-- ---------------------------------------------------------------------------
-- Layer 1 — column privileges
-- ---------------------------------------------------------------------------
-- Supabase grants ALL on new public tables to anon and authenticated by
-- default. Revoke that blanket grant and re-grant the minimum surface.
-- service_role is deliberately untouched: it is the privileged path and is
-- never exposed to a browser.

revoke all on public.profiles   from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.threads    from anon, authenticated;
revoke all on public.posts      from anon, authenticated;

-- Reads are open at the privilege layer; RLS narrows them per row.
grant select on public.profiles   to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.threads    to anon, authenticated;
grant select on public.posts      to anon, authenticated;

-- profiles: members edit presentation only. `id` and `role` are absent, so an
-- UPDATE touching either is rejected before RLS is even consulted.
-- Profiles are created exclusively by the on_auth_user_created trigger, so no
-- INSERT or DELETE is granted.
grant update (display_name, avatar_url, bio, province, city)
  on public.profiles to authenticated;

-- threads: authorship and counters are not client-writable.
-- `reply_count`, `view_count`, `last_activity_at` and `author_id` are omitted
-- on purpose and are maintained server-side.
grant insert (author_id, category_id, title, slug, body) on public.threads to authenticated;
grant update (title, body, status)                       on public.threads to authenticated;

-- posts: same shape.
grant insert (thread_id, author_id, body) on public.posts to authenticated;
grant update (body, status)               on public.posts to authenticated;

-- categories are taxonomy, changed through migrations or privileged tooling.
-- No write privilege is granted to anon or authenticated at all.

-- ---------------------------------------------------------------------------
-- Layer 2 — row policies: profiles
-- ---------------------------------------------------------------------------

-- Profiles are public community identities and contain no credentials or
-- contact details, so they are world-readable.
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "Members can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Row policies: categories
-- ---------------------------------------------------------------------------

create policy "Active categories are publicly readable"
  on public.categories
  for select
  to anon, authenticated
  using (is_active);

create policy "Moderators can read inactive categories"
  on public.categories
  for select
  to authenticated
  using (public.is_moderator());

-- ---------------------------------------------------------------------------
-- Row policies: threads
-- ---------------------------------------------------------------------------

create policy "Published threads in active categories are publicly readable"
  on public.threads
  for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.categories c
      where c.id = threads.category_id
        and c.is_active
    )
  );

create policy "Authors can read their own threads"
  on public.threads
  for select
  to authenticated
  using (author_id = (select auth.uid()));

create policy "Moderators can read all threads"
  on public.threads
  for select
  to authenticated
  using (public.is_moderator());

-- A new thread must be attributed to the caller, start published, and live in
-- a category that actually accepts posts.
create policy "Members can create their own threads"
  on public.threads
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and status = 'published'
    and exists (
      select 1
      from public.categories c
      where c.id = threads.category_id
        and c.is_active
    )
  );

-- Authors may edit a published thread and may soft-delete it. They cannot
-- lock or hide it — those are moderation states.
create policy "Authors can edit their own published threads"
  on public.threads
  for update
  to authenticated
  using (
    author_id = (select auth.uid())
    and status = 'published'
  )
  with check (
    author_id = (select auth.uid())
    and status in ('published', 'deleted')
  );

create policy "Moderators can moderate threads"
  on public.threads
  for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- No DELETE policy anywhere: removal is a status change, which preserves
-- reply threading and the moderation trail.

-- ---------------------------------------------------------------------------
-- Row policies: posts
-- ---------------------------------------------------------------------------

create policy "Published posts on published threads are publicly readable"
  on public.posts
  for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.threads t
      where t.id = posts.thread_id
        and t.status = 'published'
    )
  );

create policy "Authors can read their own posts"
  on public.posts
  for select
  to authenticated
  using (author_id = (select auth.uid()));

create policy "Moderators can read all posts"
  on public.posts
  for select
  to authenticated
  using (public.is_moderator());

-- Replying requires the parent thread to be published; a 'locked' thread
-- therefore rejects new replies at the database level, not just in the UI.
create policy "Members can reply to published threads"
  on public.posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and status = 'published'
    and exists (
      select 1
      from public.threads t
      where t.id = posts.thread_id
        and t.status = 'published'
    )
  );

create policy "Authors can edit their own published posts"
  on public.posts
  for update
  to authenticated
  using (
    author_id = (select auth.uid())
    and status = 'published'
  )
  with check (
    author_id = (select auth.uid())
    and status in ('published', 'deleted')
  );

create policy "Moderators can moderate posts"
  on public.posts
  for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());
