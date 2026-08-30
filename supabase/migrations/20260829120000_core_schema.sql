-- ============================================================================
-- ThePetClub.ca — core community schema
-- ============================================================================
-- Creates the four foundation entities: profiles, categories, threads, posts.
--
-- Conventions used throughout:
--   * UUID primary keys (gen_random_uuid, from pgcrypto).
--   * timestamptz created_at / updated_at, with updated_at maintained by a
--     trigger so application code cannot forget it.
--   * Enumerated types for role and content status rather than free text.
--   * CHECK constraints mirroring the validation rules enforced in the
--     application layer (see src/lib/utils/slug.ts and
--     src/features/auth/schemas.ts).
--
-- Row Level Security is enabled in a later migration
-- (20260829120200_row_level_security.sql). This migration only defines shape.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enumerated types
-- ---------------------------------------------------------------------------

-- Roles are stored in the database and resolved server-side. They are never
-- read from a client-supplied value or from a user-writable JWT claim.
create type public.user_role as enum ('member', 'expert', 'moderator', 'admin');

-- Content lifecycle. 'deleted' is a soft delete so that reply threading and
-- moderation history stay intact.
create type public.content_status as enum ('published', 'locked', 'hidden', 'deleted');

-- ---------------------------------------------------------------------------
-- Shared trigger function: keep updated_at honest
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger. Forces updated_at to the server clock so clients cannot backdate rows.';

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- Extends auth.users with public, community-facing data.
--
-- Deliberately contains NO authentication material: passwords, email addresses
-- and identity providers stay in Supabase's auth schema. The primary key is a
-- 1:1 foreign key to auth.users so a deleted account cascades cleanly.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Lowercase-only handle. Enforcing case at the constraint level makes the
  -- UNIQUE index case-insensitive without needing the citext extension.
  username text not null unique
    constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$'),

  display_name text not null
    constraint profiles_display_name_length check (char_length(display_name) between 1 and 60),

  avatar_url text
    constraint profiles_avatar_url_format check (avatar_url is null or avatar_url ~ '^https?://'),

  bio text
    constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),

  -- Canadian province / territory code.
  province text
    constraint profiles_province_valid check (
      province is null
      or province in ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')
    ),

  city text
    constraint profiles_city_length check (city is null or char_length(city) between 1 and 85),

  role public.user_role not null default 'member',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public community profile for an authenticated user. Never stores credentials.';
comment on column public.profiles.role is
  'Authoritative role. Writable only by the service role; see column grants in the RLS migration.';

create index profiles_role_idx on public.profiles (role);
create index profiles_province_idx on public.profiles (province) where province is not null;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
-- Self-referencing tree. Milestone 1 uses two levels (group -> category); the
-- structure supports deeper nesting without a schema change.

create table public.categories (
  id uuid primary key default gen_random_uuid(),

  parent_id uuid references public.categories (id) on delete restrict,

  name text not null
    constraint categories_name_length check (char_length(name) between 1 and 80),

  -- Globally unique so category URLs stay flat and stable (/community/<slug>).
  slug text not null unique
    constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  description text
    constraint categories_description_length check (description is null or char_length(description) <= 500),

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A category cannot be its own parent. Deeper cycles are prevented by the
  -- application; a one-level guard covers the realistic failure mode.
  constraint categories_no_self_parent check (parent_id is null or parent_id <> id)
);

comment on table public.categories is
  'Hierarchical forum taxonomy. Mirrors src/features/community/taxonomy.ts.';

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_active_sort_idx on public.categories (parent_id, sort_order) where is_active;

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- threads
-- ---------------------------------------------------------------------------

create table public.threads (
  id uuid primary key default gen_random_uuid(),

  -- Nullable + ON DELETE SET NULL: removing an account must not destroy
  -- discussions that other members contributed to. The UI renders these as a
  -- deleted author.
  author_id uuid references public.profiles (id) on delete set null,

  category_id uuid not null references public.categories (id) on delete restrict,

  title text not null
    constraint threads_title_length check (char_length(title) between 5 and 160),

  slug text not null
    constraint threads_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  body text not null
    constraint threads_body_length check (char_length(body) between 1 and 20000),

  status public.content_status not null default 'published',

  -- Denormalised counters. Maintained server-side only; see the column grants
  -- in the RLS migration, which make them unwritable by clients.
  reply_count integer not null default 0
    constraint threads_reply_count_non_negative check (reply_count >= 0),
  view_count integer not null default 0
    constraint threads_view_count_non_negative check (view_count >= 0),

  last_activity_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Slugs only need to be unique within their category.
  constraint threads_category_slug_unique unique (category_id, slug)
);

comment on table public.threads is
  'A community discussion. Soft-deleted via status rather than removed.';
comment on column public.threads.reply_count is
  'Denormalised counter maintained server-side. Not writable by anon or authenticated roles.';

-- Primary listing access path: newest activity within a category.
create index threads_category_activity_idx
  on public.threads (category_id, last_activity_at desc)
  where status = 'published';

-- Global "latest across the site" feed.
create index threads_activity_idx
  on public.threads (last_activity_at desc)
  where status = 'published';

create index threads_author_id_idx on public.threads (author_id);

create trigger threads_set_updated_at
  before update on public.threads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
-- Replies within a thread.
--
-- Milestone 2+ will extend this area with reactions, best-answer selection,
-- edit history and moderation records. Those live in their own tables rather
-- than as columns here, so this table stays narrow and its indexes stay hot.

create table public.posts (
  id uuid primary key default gen_random_uuid(),

  thread_id uuid not null references public.threads (id) on delete cascade,

  author_id uuid references public.profiles (id) on delete set null,

  body text not null
    constraint posts_body_length check (char_length(body) between 1 and 20000),

  status public.content_status not null default 'published',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is
  'A reply to a thread. Deleting a thread cascades; deleting an author does not.';

-- Reading a thread: all published replies in chronological order.
create index posts_thread_created_idx
  on public.posts (thread_id, created_at)
  where status = 'published';

create index posts_author_id_idx on public.posts (author_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();
