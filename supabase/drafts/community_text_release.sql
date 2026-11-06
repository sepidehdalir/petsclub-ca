-- DRAFT ONLY: intentionally outside migrations. Owner/security review and a
-- disposable database test run are required before manual promotion/application.
-- Additive data changes. Existing discussions are never deleted.
begin;
create schema if not exists community_private;
revoke all on schema community_private from public, anon, authenticated;
create table community_private.settings (singleton boolean primary key default true check(singleton), enabled boolean not null default false);
insert into community_private.settings values (true, false);
create table community_private.operations (
  actor uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null, payload_hash text not null, operation text not null, result uuid not null,
  created_at timestamptz not null default now(), primary key(actor,request_id)
);
create index operations_rate on community_private.operations(actor,created_at);
create table community_private.reports (
  id uuid primary key default gen_random_uuid(), actor uuid references auth.users(id) on delete set null,
  kind text not null check(kind in ('thread','post')), target uuid not null,
  reason text not null check(char_length(reason) between 5 and 1000),
  created_at timestamptz not null default now(), resolved_at timestamptz,
  unique(actor,kind,target)
);
create table community_private.audit (
  id uuid primary key default gen_random_uuid(), actor uuid references auth.users(id) on delete set null,
  kind text not null, target uuid not null, previous_status text, new_status text,
  reason text not null, created_at timestamptz not null default now()
);
alter table community_private.settings enable row level security;
alter table community_private.operations enable row level security;
alter table community_private.reports enable row level security;
alter table community_private.audit enable row level security;
revoke all on all tables in schema community_private from public, anon, authenticated;

-- Tighten existing moderator reads as well as mutations: old JWTs from banned,
-- deleted or unconfirmed moderators must not reveal hidden content or reports.
create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.id
 where p.id=auth.uid() and p.role in ('moderator','admin')
 and u.email_confirmed_at is not null and u.deleted_at is null
 and (u.banned_until is null or u.banned_until<=now()))
$$;
revoke all on function public.is_moderator() from public,anon;
grant execute on function public.is_moderator() to authenticated;

-- Remove bypassable direct mutation routes. The RPC is the only member writer.
revoke insert, update, delete on public.threads, public.posts from anon, authenticated;
drop policy "Members can create their own threads" on public.threads;
drop policy "Authors can edit their own published threads" on public.threads;
drop policy "Moderators can moderate threads" on public.threads;
drop policy "Members can reply to published threads" on public.posts;
drop policy "Authors can edit their own published posts" on public.posts;
drop policy "Moderators can moderate posts" on public.posts;
-- Hidden/deleted rows are moderator-only, including when the author requests them.
drop policy "Authors can read their own threads" on public.threads;
drop policy "Authors can read their own posts" on public.posts;
drop policy "Published threads in active categories are publicly readable" on public.threads;
create policy "Visible threads in active categories" on public.threads for select to anon,authenticated using (
 status in ('published','locked') and exists(select 1 from public.categories c where c.id=category_id and c.is_active)
);
drop policy "Published posts on published threads are publicly readable" on public.posts;
create policy "Visible replies on visible threads" on public.posts for select to anon,authenticated using (
 status='published' and exists(select 1 from public.threads t join public.categories c on c.id=t.category_id
 where t.id=thread_id and t.status in ('published','locked') and c.is_active)
);

create function public.community_mutate(request_id uuid, payload jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
<<mutation>>
declare
 actor uuid := auth.uid(); role_value public.user_role; op text := payload->>'operation';
 target_id uuid; result_id uuid; prior community_private.operations%rowtype;
 t public.threads%rowtype; p public.posts%rowtype; c public.categories%rowtype;
 r community_private.reports%rowtype; next_status public.content_status;
 is_mod boolean; body_value text := btrim(payload->>'body'); title_value text := btrim(payload->>'title');
 reason_value text := btrim(payload->>'reason'); old_status text;
begin
 if actor is null or request_id is null or jsonb_typeof(payload) is distinct from 'object'
 or octet_length(payload::text)>100000 or op is null
 or op not in ('thread','reply','edit_thread','edit_post','delete_thread','delete_post','report_thread','report_post','moderate_thread','moderate_post','resolve_report')
 then raise exception 'invalid_request'; end if;
 if exists(select 1 from jsonb_object_keys(payload) k where k not in ('requestId','operation','target','category','title','body','status','reason')) then raise exception 'invalid_request'; end if;
 if not exists(select 1 from community_private.settings where singleton and enabled) then raise exception 'community_closed'; end if;
 if not exists(select 1 from auth.users u where u.id=actor and u.email_confirmed_at is not null and u.deleted_at is null and (u.banned_until is null or u.banned_until <= now())) then raise exception 'confirmation_required'; end if;
 select role into role_value from public.profiles where id=actor;
 if not found then raise exception 'profile_required'; end if;
 is_mod := role_value in ('moderator','admin');
 -- User-wide transaction lock serializes idempotency and successful-write limits.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into prior from community_private.operations o where o.actor=mutation.actor and o.request_id=community_mutate.request_id;
 if found then
  if prior.payload_hash is distinct from encode(sha256(convert_to(payload::text,'UTF8')),'hex') then raise exception 'request_reused'; end if;
  return prior.result;
 end if;
 if not (is_mod and (op like 'moderate_%' or op='resolve_report')) and ((select count(*) from community_private.operations o where o.actor=mutation.actor and o.created_at>now()-interval '10 minutes') >= 20
 or (select count(*) from community_private.operations o where o.actor=mutation.actor and o.created_at>now()-interval '1 day') >= 100)
 then raise exception 'posting_limit'; end if;
 if op in ('thread','reply','edit_thread','edit_post') and (body_value is null or char_length(body_value) not between 1 and 20000) then raise exception 'invalid_body'; end if;
 if op in ('thread','edit_thread') and (title_value is null or char_length(title_value) not between 5 and 160) then raise exception 'invalid_title'; end if;
 if op like 'report_%' or op like 'moderate_%' or op='resolve_report' then
  if reason_value is null or char_length(reason_value) not between 5 and 1000 then raise exception 'invalid_reason'; end if;
 end if;
 if op='thread' then
  select * into c from public.categories where slug=payload->>'category' for share;
  if not found or not c.is_active or c.parent_id is null or exists(select 1 from public.categories where parent_id=c.id) then raise exception 'category_unavailable'; end if;
  if (select count(*) from community_private.operations o where o.actor=mutation.actor and o.operation='thread' and o.created_at>now()-interval '1 hour')>=3 then raise exception 'thread_limit'; end if;
  result_id:=gen_random_uuid();
  insert into public.threads(id,author_id,category_id,title,slug,body) values(result_id,actor,c.id,title_value,result_id::text,body_value);
 elsif op='resolve_report' then
  if not is_mod then raise exception 'not_allowed'; end if;
  select * into r from community_private.reports where id=(payload->>'target')::uuid for update;
  if not found then raise exception 'unavailable'; end if;
  update community_private.reports set resolved_at=now() where id=r.id;
  insert into community_private.audit(actor,kind,target,reason) values(actor,'resolve_report',r.id,reason_value);
  result_id:=r.id;
 else
  target_id:=(payload->>'target')::uuid;
  if target_id is null then raise exception 'invalid_target'; end if;
  -- All target changes take category -> thread -> post locks. Parent moderation
  -- therefore cannot race with replies/edits, even from a different user.
  if op in ('edit_post','delete_post','report_post','moderate_post') then
   select * into p from public.posts where id=target_id;
   if not found then raise exception 'unavailable'; end if;
   select * into t from public.threads where id=p.thread_id;
  else select * into t from public.threads where id=target_id; end if;
  if t.id is null then raise exception 'unavailable'; end if;
  select * into c from public.categories where id=t.category_id for share;
  if not found then raise exception 'unavailable'; end if;
  select * into t from public.threads where id=t.id for update;
  if not found or t.category_id is distinct from c.id then raise exception 'unavailable'; end if;
  if op in ('edit_post','delete_post','report_post','moderate_post') then
   select * into p from public.posts where id=target_id for update;
   if not found or p.thread_id is distinct from t.id then raise exception 'unavailable'; end if;
  end if;
  if not is_mod and (not c.is_active or t.status not in ('published','locked') or (p.id is not null and p.status<>'published')) then raise exception 'unavailable'; end if;
  result_id:=coalesce(p.id,t.id);
  if op='reply' then
   if not c.is_active or t.status<>'published' then raise exception 'thread_closed'; end if;
   insert into public.posts(thread_id,author_id,body) values(t.id,actor,body_value) returning id into result_id;
  elsif op in ('edit_thread','delete_thread') then
   if t.author_id is distinct from actor or t.status<>'published' then raise exception 'not_allowed'; end if;
   update public.threads set title=case when op='edit_thread' then title_value else title end,
    body=case when op='edit_thread' then body_value else body end,
    status=case when op='delete_thread' then 'deleted'::public.content_status else status end where id=t.id;
  elsif op in ('edit_post','delete_post') then
   if p.author_id is distinct from actor or p.status<>'published' or t.status<>'published' then raise exception 'not_allowed'; end if;
   update public.posts set body=case when op='edit_post' then body_value else body end,
    status=case when op='delete_post' then 'deleted'::public.content_status else status end where id=p.id;
  elsif op like 'report_%' then
   if not c.is_active or t.status not in ('published','locked') or (p.id is not null and p.status<>'published') then raise exception 'unavailable'; end if;
   insert into community_private.reports(actor,kind,target,reason) values(actor,case when p.id is null then 'thread' else 'post' end,result_id,reason_value)
    on conflict on constraint reports_actor_kind_target_key do update
     set reason=excluded.reason, resolved_at=null, created_at=now()
     where community_private.reports.resolved_at is not null;
  elsif op like 'moderate_%' then
   if not is_mod then raise exception 'not_allowed'; end if;
   next_status:=(payload->>'status')::public.content_status;
   if next_status is null or (p.id is not null and next_status='locked') then raise exception 'invalid_status'; end if;
   old_status:=case when p.id is null then t.status::text else p.status::text end;
   if p.id is null then update public.threads set status=next_status where id=t.id;
   else update public.posts set status=next_status where id=p.id; end if;
   insert into community_private.audit(actor,kind,target,previous_status,new_status,reason)
    values(actor,op,result_id,old_status,next_status::text,reason_value);
  else raise exception 'invalid_request'; end if;
  update public.threads set reply_count=(select count(*) from public.posts where thread_id=t.id and status='published'),
    last_activity_at=greatest(t.created_at,coalesce((select max(created_at) from public.posts where thread_id=t.id and status='published'),t.created_at)) where id=t.id;
 end if;
 insert into community_private.operations(actor,request_id,payload_hash,operation,result) values(actor,request_id,encode(sha256(convert_to(payload::text,'UTF8')),'hex'),op,result_id);
 return result_id;
end $$;
revoke all on function public.community_mutate(uuid,jsonb) from public,anon;
grant execute on function public.community_mutate(uuid,jsonb) to authenticated;

-- Moderator-only projection: reporter identity is deliberately excluded.
create function public.community_report_queue() returns table(id uuid,kind text,target uuid,thread_id uuid,reason text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select r.id,r.kind,r.target,case when r.kind='thread' then r.target else (select p.thread_id from public.posts p where p.id=r.target) end,r.reason,r.created_at from community_private.reports r
 where public.is_moderator() and r.resolved_at is null order by r.created_at limit 100
$$;
revoke all on function public.community_report_queue() from public,anon;
grant execute on function public.community_report_queue() to authenticated;
commit;
-- No enabling UPDATE here. A separate reviewed release must open BOTH gates.
