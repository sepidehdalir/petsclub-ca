"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";
import { discussionSchema, replySchema, type CommunityResult } from "./schemas";
import { z } from "zod";

const unavailable = { error: "The community could not be reached. Your text has not been published. Please try again." };

export async function createDiscussion(_state: CommunityResult, form: FormData): Promise<CommunityResult> {
  const parsed = discussionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  if (!isSupabaseConfigured) return unavailable;
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { error: "Sign in before publishing. Your draft is still here." };
    const { data: category, error: categoryError } = await db.from("categories").select("id").eq("slug", parsed.data.category).eq("is_active", true).maybeSingle();
    if (categoryError || !category) return unavailable;
    // This uses the member session and column grants/RLS, never the admin key.
    const { data, error } = await db.from("threads").insert({
      author_id: user.id, category_id: category.id, title: parsed.data.title,
      slug: `${slugify(parsed.data.title) || "discussion"}-${crypto.randomUUID()}`,
      body: parsed.data.body,
    }).select("id").single();
    if (error) { console.error("community_create_failed", { code: error.code }); return unavailable; }
    revalidatePath(`/community/${parsed.data.category}`);
    return { success: true, url: `/community/discussion/${data.id}` };
  } catch { console.error("community_create_unavailable"); return unavailable; }
}

export async function createReply(_state: CommunityResult, form: FormData): Promise<CommunityResult> {
  const parsed = replySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Add a reply of 1–10,000 characters." };
  if (!isSupabaseConfigured) return unavailable;
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { error: "Sign in before replying. Your draft is still here." };
    const { data: thread } = await db.from("threads").select("id").eq("id", parsed.data.threadId).eq("status", "published").maybeSingle();
    if (!thread) return { error: "This discussion is no longer accepting replies." };
    const { error } = await db.from("posts").insert({ thread_id: thread.id, author_id: user.id, body: parsed.data.body });
    if (error) { console.error("community_reply_failed", { code: error.code }); return unavailable; }
    revalidatePath(`/community/discussion/${thread.id}`);
    return { success: true };
  } catch { console.error("community_reply_unavailable"); return unavailable; }
}

export async function removeContribution(kind: "thread" | "reply", id: string): Promise<CommunityResult> {
  if (!isSupabaseConfigured || !z.uuid().safeParse(id).success || !["thread", "reply"].includes(kind)) return unavailable;
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { error: "Sign in to remove your contribution." };
    const table = kind === "thread" ? "threads" : "posts";
    const { data, error } = await db.from(table).update({ status: "deleted" }).eq("id", id).eq("author_id", user.id).eq("status", "published").select("id");
    if (error || !data?.length) return { error: "This contribution could not be removed." };
    revalidatePath("/community", "layout");
    return { success: true };
  } catch { return unavailable; }
}
