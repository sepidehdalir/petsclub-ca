import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Signs the current user out and clears the session cookies.
 *
 * POST-only and same-origin checked. Supabase's session cookies are
 * `SameSite=Lax`, so a cross-site form post would not carry them anyway, but
 * rejecting a foreign `Origin` outright removes the drive-by sign-out nuisance
 * without relying on that detail.
 *
 * Implemented as a route handler rather than a click handler so the sign-out
 * control in the header works as a plain form post, before hydration.
 */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && requestOrigin !== origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  // 303 forces the browser to follow up with a GET.
  return NextResponse.redirect(new URL("/", origin), { status: 303 });
}
