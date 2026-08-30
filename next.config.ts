import type { NextConfig } from "next";

/**
 * Allows `next/image` to optimise avatars and future media served from this
 * deployment's Supabase Storage bucket.
 *
 * The host is derived from the configured project URL rather than hard-coded,
 * so local, preview and production deployments each permit exactly their own
 * origin and nothing else. Storage can later move behind a CDN (Cloudflare R2)
 * by adding that host here — no component changes required.
 */
function supabaseImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return [];
  }

  try {
    const { hostname } = new URL(supabaseUrl);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    // A malformed URL is reported by the zod env check; do not fail the build
    // here as well.
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Never ship a build that does not typecheck. Linting is a separate CI step:
  // Next.js 16 removed `next lint`, so ESLint runs via `npm run lint`.
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: supabaseImagePatterns(),
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Defence in depth: these are cheap, static, and independent of any
          // application logic.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
