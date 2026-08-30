import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requirePublicEnv } from "@/lib/env/public";
import { requireServiceRoleKey } from "@/lib/env/server";
import type { Database } from "@/types/database";

/**
 * Privileged Supabase client backed by the service-role key.
 *
 * **This client bypasses Row Level Security entirely.**
 *
 * Rules for using it:
 *  - Never import it from a Client Component (the `server-only` guard above
 *    turns any such import into a build error).
 *  - Never construct it in response to unauthenticated input.
 *  - Always re-check the caller's authorisation in application code first,
 *    because the database will not do it for you on this connection.
 *
 * It is unused in Milestone 1 and exists so that Milestone 6 (Admin and
 * Moderation) has one reviewed, documented entry point for privileged access
 * rather than ad-hoc clients scattered through the codebase.
 */
export function createSupabaseAdminClient() {
  const env = requirePublicEnv();

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, requireServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
