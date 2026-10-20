import type { Metadata } from "next";
import { UnleashedContent } from "@/features/unleashed/content";
import { UnleashedExperience } from "@/features/unleashed/experience";
import { OptionalAnalytics } from "@/features/analytics/optional-analytics";
import { createMetadata } from "@/lib/seo/metadata";
import "@/features/unleashed/unleashed.css";


export const metadata: Metadata = createMetadata({
  path: "/",
  title: "Life. Unleashed.",
  description: "For the wonderfully messy, ridiculously lovely life you share. A Canadian home for pet people, practical guides and everyday inspiration.",
});

export default function HomePage() {
  return <>
    <link rel="preload" as="image" href="/unleashed/hero-poster.webp" />
    <UnleashedExperience>
      <UnleashedContent />
    </UnleashedExperience>
    <OptionalAnalytics measurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} allowedPaths={["/"]} />
  </>;
}
