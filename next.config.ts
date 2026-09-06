import createMDX from "@next/mdx";
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

  /**
   * Route history.
   *
   * `/puppy/11-weeks` was the proof-of-concept stage. The differentiation gate
   * found no sourceable difference between a nine-, ten- and eleven-week-old,
   * so the three collapsed into one stage at `/puppy/9-11-weeks` and the old
   * path became a redirect rather than a second copy of the same writing.
   *
   * A 308 rather than a 307: the move is permanent, and nothing was ever
   * indexed at the old path — the Journey has been `noindex` and out of the
   * sitemap since it was built — so there is no cached ranking to protect and
   * no ambiguity to leave behind. A redirect, not a canonical: a canonical
   * would require serving the content twice, which is the duplication this
   * change exists to remove.
   */
  async redirects() {
    return [
      {
        source: "/puppy/11-weeks",
        destination: "/puppy/9-11-weeks",
        permanent: true,
      },
    ];
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

/**
 * MDX support for the editorial article system.
 *
 * `pageExtensions` is deliberately left at its default (`tsx`/`ts`/`jsx`/`js`).
 * Article bodies live in `src/content/articles` and are pulled in by the
 * `/guides/[slug]` route as dynamic imports, so no `.mdx` file is ever a route
 * of its own — a stray content file cannot accidentally publish itself.
 *
 * No remark or rehype plugins are configured. Heading anchors and link
 * handling are done with typed React components in `src/mdx-components.tsx`,
 * which keeps the dependency surface to the four packages MDX itself needs and
 * avoids the Turbopack constraint that plugin options must be serialisable.
 */
const withMDX = createMDX();

export default withMDX(nextConfig);
