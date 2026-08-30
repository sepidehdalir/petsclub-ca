import type { Metadata } from "next";

import { TopicPage } from "@/components/shared/topic-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Pet health",
  description:
    "Symptoms, preventative care, vet costs and insurance, discussed by pet owners across Canada.",
  path: "/health",
});

export default function HealthPage() {
  return <TopicPage path="/health" />;
}
