import { z } from "zod";

/**
 * Public (browser-exposed) environment variables.
 *
 * Only `NEXT_PUBLIC_*` values belong here. They are inlined into the client
 * bundle at build time, so each one must be referenced as a static literal
 * (`process.env.NEXT_PUBLIC_X`) rather than through a dynamic key.
 *
 * Validation is intentionally **non-throwing at import time**. Milestone 1 is
 * fully renderable without Supabase (every page is static or fixture-backed),
 * which keeps CI and preview builds green without provisioning secrets. Code
 * that genuinely needs Supabase calls `requirePublicEnv()` and fails loudly.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * True when Supabase credentials are present and well-formed.
 *
 * The UI uses this to render an explicit "authentication is not configured"
 * state instead of crashing or pretending an integration works.
 */
export const isSupabaseConfigured = parsedPublicEnv.success;

/**
 * Returns validated public environment variables, or throws a descriptive
 * error. Call this only from code paths that cannot proceed without Supabase.
 */
export function requirePublicEnv(): PublicEnv {
  if (!parsedPublicEnv.success) {
    throw new Error(
      "Supabase environment variables are missing or invalid. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "(see .env.example).",
    );
  }

  return parsedPublicEnv.data;
}
