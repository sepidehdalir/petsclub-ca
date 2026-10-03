import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Editorial Policy",
  description:
    "Sourcing, publication status, AI assistance and corrections for Canadian pet guides.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <PolicyPage
      title="Editorial Policy"
      description="Our approach to sourcing, publication status and corrections."
      path="/editorial-policy"
    >
      <h2>Scope</h2>
      <p>
        This policy covers guides published by the Pet Club editorial team. It does not cover
        member-written community posts, which are governed by the{" "}
        <a
          href="/community-guidelines"
          className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
        >
          Community Guidelines
        </a>
        .
      </p>

      <h2>Sourcing</h2>
      <ul>
        <li>
          Claims about health, medication or procedure are checked against veterinary
          guidelines or a government source, and the guide links to the ones a reader can
          follow. Where we cannot support a specific figure or rule, we write the durable
          general version and say what we have not established, rather than estimating.
        </li>
        <li>
          Rules that differ by province or municipality are named as such. We identify the
          jurisdictions we have actually confirmed, and we do not generalise from them to
          the rest of the country.
        </li>
        <li>
          We publish a price only where the body that sets it publishes it — a municipality&rsquo;s
          own licence fee, for instance. Such a figure is named with the place it applies to, dated,
          and linked to the page it came from, and it is offered as one example rather than as a
          Canadian price. We do not publish national averages, typical ranges, or veterinary,
          insurance or grooming costs, because nobody sets those centrally and a figure you could
          plan against would be a figure we had invented.
        </li>
        <li>Products are only described as available if they are sold in Canada.</li>
      </ul>

      <h2>Review and dating</h2>
      <p>
        A published guide carries the date it was published and, where it has been revised,
        the date of that revision. Guides marked in review carry no publication date.
        Publication status and dates do not establish that a named person or qualified
        professional has reviewed a guide. Rules, costs and products can change; check
        the linked source for current information.
      </p>

      <h2>Corrections</h2>
      <p>
        When we get something wrong we correct the page and say what changed. We do not silently
        edit a published claim.
      </p>

      <h2>Commercial relationships</h2>
      <p>
        Advertising and affiliate arrangements are disclosed on the page where they appear — see
        the{" "}
        <a
          href="/advertising-disclosure"
          className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
        >
          Advertising Disclosure
        </a>
        . A commercial relationship never determines a recommendation, and advertisers do not
        review guides before publication.
      </p>

      <h2>Artificial intelligence</h2>
      <p>
        AI tools may assist with research, drafting and editing. A published guide or house
        byline does not establish human authorship or human review. Consult the guide&rsquo;s
        sources and any explicitly named review credit when assessing its claims.
      </p>

      <h2>Who writes these guides</h2>
      <p>
        The Pet Club Editorial Team is a house byline for the publication, not a named
        individual or a claim of professional credentials. No guide is described as veterinary-reviewed
        unless a licensed veterinarian has read it and agreed to be named on it, with their
        licensing college and registration number shown so a reader can check. No guide currently
        carries such a review.
      </p>

      <h2>Not veterinary advice</h2>
      <p>
        The Pet Club guides are general information. They do not diagnose, and they do not replace an
        examination by a licensed veterinarian.
      </p>
    </PolicyPage>
  );
}
