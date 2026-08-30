import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "About",
  description:
    "ThePetClub.ca is a Canadian pet community and information platform for pet parents across the country.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PolicyPage
      title="About The Pet Club"
      description="A Canadian pet community and information platform, built for the questions that come up between vet visits."
      path="/about"
    >
      <h2>Why The Pet Club exists</h2>
      <p>
        Most pet information online is written for a United States audience. Prices are in the
        wrong currency, the products are not sold here, and the rules about licensing, travel
        and insurance do not apply. The Pet Club is being built specifically for Canadian pet
        parents, so that the answer you find is the answer that applies where you live.
      </p>

      <h2>What we are building</h2>
      <p>
        Two things that support each other. A community where pet owners across Canada compare
        real experiences, and an editorial library of researched Canadian guides on the topics
        that come up over and over — what food to buy, what care costs, and what to do when
        something goes wrong.
      </p>

      <h2>Where the project is today</h2>
      <p>
        The Pet Club is early. This release establishes the platform foundation: the community
        structure, the design system, the database and the security model. Discussion,
        publishing, member profiles and Lost &amp; Found follow in subsequent milestones. We
        would rather ship an honest, small product than a large one padded with placeholder
        content.
      </p>

      <h2>What we will not do</h2>
      <ul>
        <li>Publish generated articles to fill space.</li>
        <li>Present sample content as real community activity.</li>
        <li>Recommend a product because it pays the most, without disclosing the arrangement.</li>
        <li>Offer veterinary diagnosis. That is your veterinarian&rsquo;s job, not ours.</li>
      </ul>
    </PolicyPage>
  );
}
