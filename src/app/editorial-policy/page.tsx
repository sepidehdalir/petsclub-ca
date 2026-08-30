import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Editorial Policy",
  description:
    "How PetsClub researches, reviews, sources and corrects its Canadian pet guides.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <PolicyPage
      title="Editorial Policy"
      description="How our guides are researched, reviewed and corrected."
      path="/editorial-policy"
      pendingReview="editorial"
    >
      <h2>Scope</h2>
      <p>
        This policy covers guides published by the PetsClub editorial team. It does not cover
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
        <li>Claims about health, medication or procedure are attributed to a named source.</li>
        <li>Prices are Canadian, dated, and identified by province where they vary.</li>
        <li>Products are only described as available if they are sold in Canada.</li>
      </ul>

      <h2>Review and dating</h2>
      <p>
        Every guide shows when it was last reviewed. Guides covering costs, regulations or
        products are reviewed on a schedule, because a stale price is a wrong price.
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
        We do not publish machine-generated articles. Tools may assist with research or editing,
        but every published guide is written and reviewed by a person who is accountable for it.
      </p>

      <h2>Not veterinary advice</h2>
      <p>
        PetsClub guides are general information. They do not diagnose, and they do not replace an
        examination by a licensed veterinarian.
      </p>
    </PolicyPage>
  );
}
