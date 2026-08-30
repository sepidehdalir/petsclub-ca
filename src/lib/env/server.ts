import "server-only";

import { z } from "zod";

/**
 * Server-only environment variables.
 *
 * The `server-only` import is a hard build-time guard: importing this module
 * from a Client Component fails the build rather than leaking a secret into
 * the browser bundle.
 *
 * Values are read lazily so that a deployment which does not yet use a given
 * integration (for example transactional email) still builds and runs.
 */
const serverEnvSchema = z.object({
  /**
   * Supabase service-role key. Bypasses Row Level Security entirely and must
   * never be referenced from client code or exposed to the browser.
   */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Returns the validated service-role key, or throws.
 *
 * Only privileged server-side operations (future moderation and admin tooling)
 * should call this.
 */
export function requireServiceRoleKey(): string {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing or invalid. It is required only " +
        "for privileged server-side operations (see .env.example).",
    );
  }

  return parsed.data.SUPABASE_SERVICE_ROLE_KEY;
}

/** Optional Resend API key, used once transactional email is enabled. */
export function getResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY;
  return key && key.length > 0 ? key : null;
}
