import { NextResponse, type NextRequest } from "next/server";

import { safeRedirectPath } from "@/features/auth/schemas";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth / PKCE callback.
 *
 * Handles the `?code=` exchange, which is what an OAuth provider redirects to
 * once external providers are enabled. That exchange is safe to perform on GET
 * because it is bound to the `code_verifier` cookie set when the flow started:
 * a prefetching scanner has no such cookie and cannot complete it.
 *
 * Emailed one-time tokens are a different matter and are **not** redeemed here.
 * Mail providers and security appliances prefetch links, so any endpoint that
 * spends a token on GET spends it for the scanner rather than the person. A
 * `?token_hash=` request is therefore forwarded, unspent, to `/auth/confirm`,
 * which redeems it only behind an explicit POST. Links generated before that
 * route existed keep working, and keep working *safely*.
 *
 * The destination always passes through `safeRedirectPath`, so `?next=` can
 * only ever point at a path on this site — the classic open-redirect hole in
 * auth callbacks is closed here.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"), "/account");

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL("/sign-in?error=not-configured", origin));
  }

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Forward, do not redeem. `/auth/confirm` validates both values itself.
  if (tokenHash && type) {
    const handoff = new URL("/auth/confirm", origin);
    handoff.searchParams.set("token_hash", tokenHash);
    handoff.searchParams.set("type", type);
    handoff.searchParams.set("next", next);
    return NextResponse.redirect(handoff);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // No usable credential, or the link has expired or already been used.
  return NextResponse.redirect(new URL("/sign-in?error=auth-callback", origin));
}
