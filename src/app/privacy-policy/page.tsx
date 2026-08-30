import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description: "How ThePetClub.ca handles personal information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="How we handle your personal information."
      path="/privacy-policy"
      pendingReview="legal"
    >
      <h2>Status of this page</h2>
      <p>
        The Pet Club is a Canadian platform and will comply with the Personal Information Protection
        and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. The
        final policy will be drafted with legal counsel and published before public sign-ups
        open. What follows describes our intended practice so that it can be reviewed, not a
        binding legal document.
      </p>

      <h2>What we intend to collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — the email address and password you register
          with. Credentials are handled by our authentication provider; we never store your
          password.
        </li>
        <li>
          <strong>Profile information</strong> — the display name, biography and general
          location you choose to publish. All of it is optional beyond a display name.
        </li>
        <li>
          <strong>Content you post</strong> — discussions and replies, which are public by
          design.
        </li>
        <li>
          <strong>Basic technical data</strong> — the information any web server receives in
          order to serve a page.
        </li>
      </ul>

      <h2>What we do not intend to do</h2>
      <ul>
        <li>Sell your personal information.</li>
        <li>Publish your email address.</li>
        <li>Require a precise location. Province and city are optional and free text.</li>
      </ul>

      <h2>Data processors</h2>
      <p>
        The Pet Club is hosted on Vercel and uses Supabase for its database, authentication and file
        storage. The final policy will name every processor, the data each receives, and where
        it is stored.
      </p>

      <h2>Your rights</h2>
      <p>
        You will be able to access, correct, export and delete your account and its personal
        information. Deleting an account removes your profile; discussions you started are
        retained without attribution so that replies from other members remain readable.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions can be sent to the address on our contact page. A named privacy
        contact will be published alongside the final policy.
      </p>
    </PolicyPage>
  );
}
