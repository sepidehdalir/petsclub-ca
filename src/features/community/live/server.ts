import "server-only";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Default closed. Enabling is a separate reviewed release, after database QA. */
export function communityEnabled() {
  return process.env.COMMUNITY_ENABLED === "true" && isSupabaseConfigured;
}
export async function communityClient() {
  if (!communityEnabled()) return null;
  return createSupabaseServerClient();
}
export async function communityIdentity() {
  const client = await communityClient();
  if (!client) return { client: null, user: null, moderator: false };
  const {
    data: { user },
  } = await client.auth.getUser();
  const { data: moderator } = user
    ? await client.rpc("is_moderator")
    : { data: false };
  return { client, user, moderator: moderator === true };
}
