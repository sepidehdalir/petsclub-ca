import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, requirePublicEnv } from "@/lib/env/public";

/**
 * Session refresh at the network boundary.
 *
 * Named `proxy` because Next.js 16 renamed the `middleware` convention; the
 * behaviour is the same. Supabase access tokens are short-lived, and Server
 * Components cannot write cookies, so the refreshed token has to be written
 * here or a signed-in user silently drops to signed-out after an hour.
 *
 * Note what this does **not** do: it performs no authorisation. Route
 * protection lives in the pages themselves and, ultimately, in the database's
 * Row Level Security policies. Treating a proxy check as the security boundary
 * is a well-known way to ship an authorisation bypass — cookies here are
 * unverified input until Supabase validates them.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return response;
  }

  const env = requirePublicEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with the Auth server and triggers the
  // refresh, which is what writes the rotated cookies onto `response`.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  /**
   * Skip static assets, the image optimiser and common static file
   * extensions. Without this the proxy would run for every CSS, JS and image
   * request, adding an auth round trip to assets that have no session.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
