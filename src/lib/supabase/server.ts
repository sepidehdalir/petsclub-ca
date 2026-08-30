import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requirePublicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Still anon-key based, so RLS applies exactly as it does in the browser —
 * server rendering is not a privilege escalation. The session is read from and
 * written back to Next.js cookies.
 */
export async function createSupabaseServerClient() {
  const env = requirePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot mutate cookies. Session refresh is
            // handled in `src/proxy.ts`, so this is safe to ignore here.
          }
        },
      },
    },
  );
}
