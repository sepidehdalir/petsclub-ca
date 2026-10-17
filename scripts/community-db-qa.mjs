/** Disposable Postgres-WASM tests; never connects to Supabase. Install the pinned
 * QA dependency separately, then pass PGLITE_MODULE as its absolute index path.
 * Does not prove PostgREST behaviour, true multi-session races, or production state. */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
for (const name of [
  "20260829120000_core_schema.sql",
  "20260829120100_auth_profile_provisioning.sql",
  "20260829120200_row_level_security.sql",
]) {
  // pgcrypto is not bundled; gen_random_uuid is native in this PostgreSQL engine.
  await db.exec(
    readFileSync(`supabase/migrations/${name}`, "utf8").replace(
      'create extension if not exists "pgcrypto";',
      "",
    ),
  );
}
await db.exec(
  readFileSync("supabase/drafts/community_text_release.sql", "utf8"),
);
const a = "10000000-0000-4000-8000-000000000001",
  b = "10000000-0000-4000-8000-000000000002",
  m = "10000000-0000-4000-8000-000000000003",
  u = "10000000-0000-4000-8000-000000000004";
await db.exec(`insert into auth.users(id,email,email_confirmed_at) values('${a}','a@example.test',now()),('${b}','b@example.test',now()),('${m}','m@example.test',now()),('${u}','u@example.test',null);
 update public.profiles set role='moderator' where id='${m}';
 insert into public.categories(id,name,slug) values('20000000-0000-4000-8000-000000000001','Cats','cats');
 insert into public.categories(id,parent_id,name,slug) values('20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Cat care','cat-care');`);
let checks = 0;
const ok = (v) => {
  assert.ok(v);
  checks++;
};
async function as(id, sql, params = []) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    id || "",
  ]);
  await db.exec(`set role ${id ? "authenticated" : "anon"}`);
  return db.query(sql, params);
}
let sequence = 100;
function req() {
  return `30000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}`;
}
async function mutate(id, payload, key = req()) {
  return (
    await as(id, "select public.community_mutate($1,$2) result", [key, payload])
  ).rows[0].result;
}
async function denied(work) {
  await assert.rejects(work);
  checks++;
}
const threadInput = {
  operation: "thread",
  category: "cat-care",
  title: "A real question",
  body: "Plain text content",
};
await denied(() => mutate(a, threadInput)); // database defaults closed
await db.exec("reset role; update community_private.settings set enabled=true");
await denied(() => mutate(null, threadInput));
await denied(() => mutate(u, threadInput));
const key = req(),
  t = await mutate(a, threadInput, key);
ok(t);
assert.equal(await mutate(a, threadInput, key), t);
checks++;
await denied(() => mutate(a, { ...threadInput, body: "Changed" }, key));
await denied(() => mutate(a, { ...threadInput, category: "cats" }));
await denied(() =>
  mutate(b, {
    operation: "edit_thread",
    target: t,
    title: "Stolen title",
    body: "bad",
  }),
);
await denied(() =>
  as(a, "update public.threads set body='bypass' where id=$1", [t]),
);
await denied(() =>
  as(
    a,
    "insert into public.posts(thread_id,author_id,body) values($1,$2,'bypass')",
    [t, a],
  ),
);
await denied(() =>
  as(a, "update public.profiles set role='admin' where id=$1", [a]),
);
await denied(() => as(a, "select * from community_private.operations"));
const p = await mutate(b, {
  operation: "reply",
  target: t,
  body: "A useful reply",
});
ok(p);
ok(
  (await as(null, "select reply_count from public.threads where id=$1", [t]))
    .rows[0].reply_count === 1,
);
await denied(() =>
  mutate(a, { operation: "edit_post", target: p, body: "stolen" }),
);
await mutate(m, {
  operation: "moderate_thread",
  target: t,
  status: "locked",
  reason: "Review needed",
});
ok(
  (await as(null, "select id from public.threads where id=$1", [t])).rows
    .length === 1,
);
ok(
  (await as(null, "select id from public.posts where id=$1", [p])).rows
    .length === 1,
);
await denied(() =>
  mutate(b, { operation: "reply", target: t, body: "locked" }),
);
await denied(() =>
  mutate(b, { operation: "edit_post", target: p, body: "locked edit" }),
);
await mutate(m, {
  operation: "moderate_thread",
  target: t,
  status: "hidden",
  reason: "Review needed",
});
ok(
  (await as(a, "select id from public.threads where id=$1", [t])).rows
    .length === 0,
);
ok(
  (await as(b, "select id from public.posts where id=$1", [p])).rows.length ===
    0,
);
await mutate(m, {
  operation: "moderate_thread",
  target: t,
  status: "published",
  reason: "Review complete",
});
await mutate(a, {
  operation: "report_post",
  target: p,
  reason: "Needs moderator review",
});
ok(
  (await as(a, "select * from public.community_report_queue()")).rows.length ===
    0,
);
const reports = (await as(m, "select * from public.community_report_queue()"))
  .rows;
ok(
  reports.length === 1 &&
    reports[0].thread_id === t &&
    !("actor" in reports[0]),
);
await mutate(m, {
  operation: "resolve_report",
  target: reports[0].id,
  reason: "Reviewed report",
});
ok(
  (await as(m, "select * from public.community_report_queue()")).rows.length ===
    0,
);
await mutate(a, {
  operation: "report_post",
  target: p,
  reason: "New issue after resolution",
});
ok(
  (await as(m, "select * from public.community_report_queue()")).rows.length ===
    1,
);
await mutate(m, {
  operation: "moderate_post",
  target: p,
  status: "hidden",
  reason: "Hide this reply",
});
ok(
  (await as(b, "select id from public.posts where id=$1", [p])).rows.length ===
    0,
);
ok(
  (await as(null, "select reply_count from public.threads where id=$1", [t]))
    .rows[0].reply_count === 0,
);
await mutate(m, {
  operation: "moderate_post",
  target: p,
  status: "published",
  reason: "Restore reply",
});
await mutate(b, { operation: "delete_post", target: p });
ok(
  (await as(null, "select reply_count from public.threads where id=$1", [t]))
    .rows[0].reply_count === 0,
);
await db.exec(
  `reset role; update public.threads set author_id=null where id='${t}'`,
);
await denied(() =>
  mutate(a, {
    operation: "edit_thread",
    target: t,
    title: "A new title",
    body: "Orphan claim",
  }),
);
await denied(() =>
  mutate(a, {
    operation: "moderate_thread",
    target: t,
    status: "published",
    reason: "Fake moderator",
  }),
);
await denied(() => mutate(a, { ...threadInput, body: "x".repeat(20001) }));
await db.exec("reset role");
ok(
  (
    await db.query(
      "select has_any_column_privilege('authenticated','public.threads','INSERT') allowed",
    )
  ).rows[0].allowed === false,
);
await db.exec(
  `reset role; update auth.users set banned_until=now()+interval '1 hour' where id='${a}'`,
);
await denied(() => mutate(a, threadInput));
await db.exec(
  `reset role; update auth.users set banned_until=null,deleted_at=now() where id='${a}'`,
);
await denied(() => mutate(a, threadInput));
await db.exec(
  `reset role; insert into community_private.operations(actor,request_id,payload,result) select '${m}',gen_random_uuid(),'{}','${t}' from generate_series(1,100)`,
);
await mutate(m, {
  operation: "moderate_thread",
  target: t,
  status: "hidden",
  reason: "Emergency moderation beyond member quota",
});
checks++;
for (const state of [
  "banned_until=now()+interval '1 hour'",
  "banned_until=null,deleted_at=now()",
  "deleted_at=null,email_confirmed_at=null",
]) {
  await db.exec(`reset role; update auth.users set ${state} where id='${m}'`);
  ok(
    (await as(m, "select * from public.community_report_queue()")).rows
      .length === 0,
  );
  ok(
    (await as(m, "select id from public.threads where id=$1", [t])).rows
      .length === 0,
  );
}
await db.exec(
  `reset role; update auth.users set deleted_at=null,banned_until=null where id='${a}'; delete from community_private.operations where actor='${a}'; update public.threads set status='published' where id='${t}'`,
);
await mutate(a, threadInput);
await mutate(a, threadInput);
await mutate(a, threadInput);
await denied(() => mutate(a, threadInput));
await db.exec(
  `reset role; delete from community_private.operations where actor='${b}'; insert into community_private.operations(actor,request_id,payload,result) select '${b}',gen_random_uuid(),'{}','${t}' from generate_series(1,20)`,
);
await denied(() =>
  mutate(b, { operation: "reply", target: t, body: "quota bypass" }),
);
await db.exec(
  `reset role; update community_private.operations set created_at=now()-interval '1 hour' where actor='${b}'; insert into community_private.operations(actor,request_id,payload,result,created_at) select '${b}',gen_random_uuid(),'{}','${t}',now()-interval '1 hour' from generate_series(1,80)`,
);
await denied(() =>
  mutate(b, { operation: "reply", target: t, body: "daily quota bypass" }),
);
console.warn(
  JSON.stringify({
    checks,
    result: "passed",
    engine: "PGlite disposable PostgreSQL",
    liveDatabaseTouched: false,
  }),
);
await db.close();
