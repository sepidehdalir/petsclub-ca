import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/shared/policy-page";
import { ProductComparison } from "@/features/commerce/product-components";
import { products } from "@/features/commerce/products";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Catit Digger vs Wave Circuit: food puzzle or ball track?",
  description: "Compare the listed features of the Catit Senses 2.0 Digger and Wave Circuit, with Canadian shopping links and clear affiliate disclosures.",
  path: "/compare/catit-digger-vs-wave-circuit",
});

export default function CatitComparisonPage() {
  return <PolicyPage title="Catit Digger vs Wave Circuit" description="A food puzzle and a ball track serve different activities. Compare their design before buying." path="/compare/catit-digger-vs-wave-circuit">
    <h2>Start with the activity</h2>
    <p>The Digger holds dry food or treats in cups. The Wave Circuit is an enclosed ball track, not a feeder. Neither is a replacement for time spent playing with your cat, and buying both is optional.</p>
    <ProductComparison productIds={["catit-digger", "catit-wave"]} />
    <h2>What to check before ordering</h2>
    <ul><li>Check the assembled dimensions against your available floor space.</li><li>For the Digger, check that your cat can reach the cups comfortably.</li><li>Supervise use, remove damaged parts and follow the product cleaning instructions.</li><li>Confirm the exact model, current price, Canadian shipping and return policy on the retailer page.</li></ul>
    <h2>Our comparison sources</h2>
    <p>Features were checked against retailer listings on October 9, 2026. We have not tested either product and do not rank them or claim medical benefits.</p>
    <ul>{products.map(product => <li key={product.id}><a href={product.source} rel="noopener">{product.name}: retailer specifications</a> (ordinary source link)</li>)}</ul>
    <h2>Plan the wider routine</h2>
    <p>Read our <Link href="/guides/indoor-cat-enrichment-canadian-homes">indoor cat enrichment guide</Link> for the household routine, or the <Link href="/guides/cost-of-owning-a-cat-in-canada">Canadian cat budget guide</Link> to plan ongoing costs.</p>
  </PolicyPage>;
}
