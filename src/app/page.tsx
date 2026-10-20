import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Instrument_Serif } from "next/font/google";
import { UnleashedContent } from "@/features/unleashed/content";
import { UnleashedExperience } from "@/features/unleashed/experience";
import { OptionalAnalytics } from "@/features/analytics/optional-analytics";
import { createMetadata } from "@/lib/seo/metadata";
import "@/features/unleashed/unleashed.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-bricolage" });
const body = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-instrument" });

export const metadata: Metadata = createMetadata({
  path: "/",
  title: "Life. Unleashed.",
  description: "For the wonderfully messy, ridiculously lovely life you share. A Canadian home for pet people, practical guides and everyday inspiration.",
});

export default function HomePage() {
  return <>
    <link rel="preload" as="image" href="/unleashed/hero-poster.webp" />
    <UnleashedExperience className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <UnleashedContent />
    </UnleashedExperience>
    <OptionalAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} allowedPaths={["/"]} />
  </>;
}
