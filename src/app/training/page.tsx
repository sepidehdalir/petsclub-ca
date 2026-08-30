import type { Metadata } from "next";

import { TopicPage } from "@/components/shared/topic-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Training and behaviour",
  description:
    "Practical training and behaviour help for dogs and cats, from owners and trainers across Canada.",
  path: "/training",
});

export default function TrainingPage() {
  return <TopicPage path="/training" />;
}
