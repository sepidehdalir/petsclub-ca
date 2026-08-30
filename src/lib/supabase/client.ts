"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requirePublicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components.
 *
 * Uses the anon key only. Every request it makes is subject to Row Level
 * Security, so the browser can never read or write beyond what the policies in
 * `supabase/migrations` allow.
 */
export function createSupabaseBrowserClient() {
  const env = requirePublicEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
