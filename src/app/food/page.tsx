import { KitchenBanner } from "@/features/kitchen/kitchen-banner";
import { Container } from "@/components/ui/layout-primitives";
import type { Metadata } from "next";

import { TopicPage } from "@/components/shared/topic-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Pet food and nutrition",
  description:
    "Kibble, raw, fresh and prescription diets available in Canada, compared by the people feeding them.",
  path: "/food",
});

export default function FoodPage() {
  return <><Container><KitchenBanner /></Container><TopicPage path="/food" /></>;
}
