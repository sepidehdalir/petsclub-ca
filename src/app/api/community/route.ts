import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findCommunityCategory } from "@/features/community/taxonomy";

export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const threadId = request.nextUrl.searchParams.get("thread");
  const page = Math.floor(Math.min(1000, Math.max(0, Number(request.nextUrl.searchParams.get("page")) || 0)));
  if (threadId ? !z.uuid().safeParse(threadId).success : !category || !findCommunityCategory(category)) return json({ error: "Not found" }, 404);
  if (!isSupabaseConfigured) return json({ available: false, threads: [], posts: [] });
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    const { data: cat, error: catError } = threadId
      ? { data: null, error: null }
      : await db.from("categories").select("id").eq("slug", category!).eq("is_active", true).maybeSingle();
    if (!threadId && (catError || !cat)) { console.error("community_category_unavailable", { code: catError?.code }); return json({ available: false, threads: [], posts: [] }); }
    let query = db.from("threads").select("id,title,body,author_id,created_at,category_id").eq("status", "published");
    query = threadId ? query.eq("id", threadId) : query.eq("category_id", cat!.id);
    const { data: threads, error } = await query.order("created_at", { ascending: false }).range(threadId ? 0 : page * 20, threadId ? 0 : page * 20 + 20);
    if (error) { console.error("community_read_failed", { code: error.code }); return json({ available: false, threads: [], posts: [] }); }
    if (threadId && !threads?.length) return json({ error: "This discussion is unavailable." }, 404);
    const { data: posts, error: postsError } = threadId
      ? await db.from("posts").select("id,body,author_id,created_at").eq("thread_id", threadId).eq("status", "published").order("created_at").range(page * 50, page * 50 + 50)
      : { data: [], error: null };
    if (postsError) { console.error("community_posts_failed", { code: postsError.code }); return json({ available: false, threads: [], posts: [] }); }
    const ids = [...new Set([...(threads ?? []), ...(posts ?? [])].map(row => row.author_id).filter((id): id is string => Boolean(id)))];
    const { data: profiles } = ids.length ? await db.from("profiles").select("id,display_name").in("id", ids) : { data: [] };
    const names = new Map(profiles?.map(profile => [profile.id, profile.display_name]));
    const named = <T extends { author_id: string | null }>(row: T) => ({ ...row, author: names.get(row.author_id ?? "") ?? "Pet Club member" });
    return json({ available: true, viewerId: user?.id ?? null, threads: (threads ?? []).slice(0, 20).map(named), posts: (posts ?? []).slice(0, 50).map(named), more: threadId ? (posts?.length ?? 0) > 50 : (threads?.length ?? 0) > 20 });
  } catch { console.error("community_read_unavailable"); return json({ available: false, threads: [], posts: [] }); }
}
