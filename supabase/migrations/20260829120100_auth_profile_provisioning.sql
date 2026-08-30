-- ============================================================================
-- PetsClub.ca — automatic profile provisioning + authorisation helpers
-- ============================================================================
-- Every authenticated user must have exactly one public profile. Creating it
-- from the client would mean trusting the client with the moment of account
-- creation, so it is done inside the database on auth.users insert.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Username derivation
-- ---------------------------------------------------------------------------
-- Produces a valid, unique handle from an email address or requested name.
-- Kept separate from the trigger so it is independently testable in psql.

create or replace function public.generate_unique_username(seed text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  suffix integer := 0;
begin
  -- Fold to the character class allowed by profiles_username_format.
  base := lower(coalesce(seed, ''));
  base := regexp_replace(base, '[^a-z0-9_]+', '_', 'g');
  base := regexp_replace(base, '^_+|_+$', '', 'g');
  base := left(base, 24);

  if char_length(base) < 3 then
    base := 'member_' || left(replace(gen_random_uuid()::text, '-', ''), 8);
  end if;

  candidate := base;

  -- Bounded probing, then fall back to a collision-resistant random handle.
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix := suffix + 1;

    if suffix > 25 then
      candidate := left(base, 16) || '_' || left(replace(gen_random_uuid()::text, '-', ''), 10);
      exit;
    end if;

    candidate := left(base, 26) || '_' || suffix::text;
  end loop;

  return candidate;
end;
$$;

comment on function public.generate_unique_username(text) is
  'Derives a unique, constraint-valid username from arbitrary seed text.';

-- ---------------------------------------------------------------------------
-- Profile creation on sign-up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_display_name text;
  resolved_username text;
begin
  requested_display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  resolved_username := public.generate_unique_username(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      requested_display_name,
      split_part(new.email, '@', 1)
    )
  );

  -- Note the absence of `role`: it always falls back to the column default
  -- ('member'). Sign-up metadata is attacker-controlled, so it must never be
  -- able to influence authorisation.
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    resolved_username,
    left(coalesce(requested_display_name, resolved_username), 60)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public profile for a newly registered auth user. Never assigns a role from user metadata.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Authorisation helper
-- ---------------------------------------------------------------------------
-- Moderation privileges are resolved from the profiles table, not from a JWT
-- claim. A client can forge or stale-cache a claim; it cannot forge this.
--
-- SECURITY DEFINER is required so that policies calling this function do not
-- recurse into the profiles policies that reference it. STABLE lets the
-- planner call it once per statement rather than once per row.

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('moderator', 'admin')
  );
$$;

comment on function public.is_moderator() is
  'True when the current session belongs to a moderator or admin, resolved from the database.';

revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to authenticated;
