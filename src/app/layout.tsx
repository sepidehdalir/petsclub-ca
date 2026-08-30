import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { organizationSchema, webSiteSchema } from "@/lib/seo/structured-data";

import "./globals.css";

/**
 * Fonts are self-hosted by next/font: no third-party request on the critical
 * path, no FOUT from a late stylesheet, and `display: swap` keeps text
 * readable while the file loads. Only the weights actually used are shipped.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
  variable: "--font-source-serif",
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
    <html lang={siteConfig.language} className={`${inter.variable} ${sourceSerif.variable}`}>
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
