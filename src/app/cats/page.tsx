import type { Metadata } from "next";

import { TopicPage } from "@/components/shared/topic-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Cats in Canada",
  description:
    "Kittens, behaviour, health and nutrition — discussion and guides for Canadian cat owners.",
  path: "/cats",
});

export default function CatsPage() {
  return <TopicPage path="/cats" />;
}
