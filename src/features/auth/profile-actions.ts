"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ display_name: z.string().trim().min(2).max(60), bio: z.string().trim().max(500).transform(value => value || null), city: z.string().trim().max(80).transform(value => value || null), province: z.enum(["", "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]).transform(value => value || null) });
export async function updateProfile(form: FormData): Promise<{ error?: string; success?: boolean }> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Check your details. Your name needs 2–60 characters and your bio can contain up to 500 characters." };
  if (!isSupabaseConfigured) return { error: "Accounts are temporarily unavailable." };
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { error: "Please sign in again before saving." };
    // Only presentation fields, under the member's RLS session. No role or ID changes.
    const { data, error } = await db.from("profiles").update(parsed.data).eq("id", user.id).select("id").maybeSingle();
    if (error || !data) return { error: "Your profile could not be saved. Please try again." };
    revalidatePath("/account");
    return { success: true };
  } catch { return { error: "Your profile could not be saved. Please try again." }; }
}
