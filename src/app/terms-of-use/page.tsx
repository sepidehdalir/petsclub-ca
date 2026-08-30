import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Use",
  description: "The terms that will govern use of ThePetClub.ca.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return (
    <PolicyPage
      title="Terms of Use"
      description="The terms that govern your use of ThePetClub.ca."
      path="/terms-of-use"
      pendingReview="legal"
    >
      <h2>Status of this page</h2>
      <p>
        Final terms will be drafted with legal counsel and published before The Pet Club accepts
        public sign-ups. This page outlines the intended terms so they can be reviewed. It is
        not yet an enforceable agreement.
      </p>

      <h2>Intended terms, in outline</h2>
      <ul>
        <li>
          <strong>Eligibility.</strong> Accounts are for individuals old enough to consent to a
          contract in their province.
        </li>
        <li>
          <strong>Your content.</strong> You keep ownership of what you post, and grant The Pet Club
          a licence to display and distribute it on the platform.
        </li>
        <li>
          <strong>Acceptable use.</strong> The{" "}
          <a
            href="/community-guidelines"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Community Guidelines
          </a>{" "}
          form part of these terms.
        </li>
        <li>
          <strong>Moderation.</strong> We may remove content or suspend accounts that breach the
          guidelines.
        </li>
        <li>
          <strong>No professional advice.</strong> Nothing on The Pet Club is veterinary, legal or
          financial advice.
        </li>
        <li>
          <strong>Governing law.</strong> Canadian law, with the specific province named in the
          final document.
        </li>
      </ul>

      <h2>Availability</h2>
      <p>
        The Pet Club is provided as-is while it is in active development. Features described as
        planned may change.
      </p>
    </PolicyPage>
  );
}
