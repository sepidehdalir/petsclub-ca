import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { safeRedirectPath } from "@/features/auth/schemas";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth callback.
 *
 * Handles the two shapes of link Supabase Auth sends:
 *  - PKCE (`?code=`) — used for email confirmation and OAuth once providers
 *    are enabled.
 *  - OTP (`?token_hash=&type=`) — used by email templates that predate PKCE.
 *
 * Supporting both means an existing project's email templates keep working
 * without a template migration.
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

  const supabase = await createSupabaseServerClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // No usable credential, or the link has expired or already been used.
  return NextResponse.redirect(new URL("/sign-in?error=auth-callback", origin));
}
