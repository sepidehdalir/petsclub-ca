import type { Metadata, Viewport } from "next";
import { Newsreader, Public_Sans } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { organizationSchema, webSiteSchema } from "@/lib/seo/structured-data";

import "./globals.css";

/**
 * Fonts are self-hosted by next/font: no third-party request on the critical
 * path, no FOUT from a late stylesheet, and `display: swap` keeps text
 * readable while the file loads.
 *
 * Both faces are variable, so the entire weight range arrives in one file per
 * style rather than one file per weight — fewer requests than the two static
 * serif weights this replaces, not more.
 *
 * Newsreader also carries an optical-size axis. With `font-optical-sizing`
 * left at its default of `auto`, the browser draws headlines from the display
 * cut and running text from the text cut of the same file. That is why it
 * replaces Source Serif 4, which was loaded at 600/700 only and so could set
 * neither body copy nor italics — the gap that blocked the article template.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  // Resolves every relative metadata URL (Open Graph images, canonicals)
  // against the production origin.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "Pets",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfcfa",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteConfig.language}
      className={`${publicSans.variable} ${newsreader.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/*
          Keyboard users reach the main content without tabbing the whole
          header. Visually hidden until focused.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-pine-700 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>

        <SiteHeader />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <SiteFooter />

        {/*
          Site-level structured data. Only Organization and WebSite are
          emitted here: both describe the site itself, which unambiguously
          exists. Content-level schemas ship with the content.
        */}
        <JsonLd schema={[organizationSchema(), webSiteSchema()]} />
      </body>
    </html>
  );
}
