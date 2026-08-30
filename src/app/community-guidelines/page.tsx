import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Community Guidelines",
  description: "The rules that keep The Pet Club a useful, kind place for Canadian pet parents.",
  path: "/community-guidelines",
});

export default function CommunityGuidelinesPage() {
  return (
    <PolicyPage
      title="Community Guidelines"
      description="What we expect from members, and what we will act on."
      path="/community-guidelines"
      pendingReview="editorial"
    >
      <h2>The short version</h2>
      <p>
        Be useful and be kind. People often post here because something is wrong with an animal
        they love, and they are worried. Answer the question that was asked.
      </p>

      <h2>What is expected</h2>
      <ul>
        <li>Share your own experience, and be clear about when you are guessing.</li>
        <li>Say where in Canada you are when it affects the answer — costs and rules vary.</li>
        <li>Disclose any commercial relationship with a product or service you recommend.</li>
        <li>Respect that other owners make different, reasonable choices.</li>
      </ul>

      <h2>What is not allowed</h2>
      <ul>
        <li>Harassment, abuse or personal attacks.</li>
        <li>Presenting yourself as a veterinarian or other professional when you are not.</li>
        <li>Advertising, affiliate spam or undisclosed promotion.</li>
        <li>Posting anyone else&rsquo;s personal information.</li>
        <li>Content promoting cruelty or neglect.</li>
      </ul>

      <h2>Medical advice</h2>
      <p>
        The Pet Club is not a substitute for veterinary care. Members may share experiences, but no
        one here can examine your animal. If something is urgent, contact a veterinarian.
      </p>

      <h2>Moderation</h2>
      <p>
        Moderators may hide, lock or remove content that breaks these guidelines, and may
        suspend accounts for repeated or serious breaches. Moderation tooling and a documented
        appeals process ship with a later milestone; this section will be expanded then.
      </p>
    </PolicyPage>
  );
}
