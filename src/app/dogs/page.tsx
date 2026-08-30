import type { Metadata } from "next";

import { TopicPage } from "@/components/shared/topic-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Dogs in Canada",
  description:
    "Puppies, health, nutrition, training and breeds — discussion and guides for Canadian dog owners.",
  path: "/dogs",
});

export default function DogsPage() {
  return <TopicPage path="/dogs" />;
}
