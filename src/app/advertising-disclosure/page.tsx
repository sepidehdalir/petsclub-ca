import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Advertising Disclosure",
  description:
    "How ThePetClub.ca handles advertising, affiliate links and sponsored placements.",
  path: "/advertising-disclosure",
});

export default function AdvertisingDisclosurePage() {
  return (
    <PolicyPage
      title="Advertising Disclosure"
      description="How advertising and affiliate relationships work on The Pet Club."
      path="/advertising-disclosure"
      pendingReview="legal"
    >
      <h2>Current status</h2>
      <p>
        As an Amazon Associate I earn from qualifying purchases. We may earn a commission
        when you follow a disclosed affiliate link and make a qualifying purchase.
        Every affiliate placement carries a disclosure where it appears.
      </p>

      <h2>Product examples</h2>
      <p>Current enrichment examples include disclosed Amazon.ca affiliate links. We may earn a commission from qualifying purchases; ordinary source links earn no commission. Comparisons describe listed features and practical selection considerations; we have not tested the products. We do not publish customer star ratings, claimed therapeutic benefits, or guaranteed prices and availability.</p>

      <h2>Commitments</h2>
      <ul>
        <li>
          Advertising will be visually distinct from editorial and community content, and
          labelled as advertising.
        </li>
        <li>
          Affiliate links will be disclosed on the page where they appear, not only in a policy
          page nobody reads.
        </li>
        <li>
          A commercial relationship will never determine a recommendation or a ranking, and
          advertisers will not review guides before publication.
        </li>
        <li>Community discussion will never be sold, promoted or reordered for a sponsor.</li>
        <li>
          Members must disclose their own commercial relationships under the{" "}
          <a
            href="/community-guidelines"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Community Guidelines
          </a>
          .
        </li>
      </ul>

      <h2>Why this matters</h2>
      <p>
        Pet spending is emotional and expensive. A recommendation that quietly follows a
        commission is worth nothing to the person reading it, and the trust it costs is not
        recoverable.
      </p>
    </PolicyPage>
  );
}
