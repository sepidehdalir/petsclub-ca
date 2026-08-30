import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Advertising Disclosure",
  description:
    "How ThePetClub.ca will handle advertising, affiliate links and sponsored placements.",
  path: "/advertising-disclosure",
});

export default function AdvertisingDisclosurePage() {
  return (
    <PolicyPage
      title="Advertising Disclosure"
      description="How advertising and affiliate relationships will work on The Pet Club."
      path="/advertising-disclosure"
      pendingReview="legal"
    >
      <h2>Current status</h2>
      <p>
        The Pet Club does not currently run advertising, affiliate links or sponsored content. There
        is nothing to disclose today. This page states the commitments that will apply when
        monetisation begins, so they are on the record before any money is involved.
      </p>

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
