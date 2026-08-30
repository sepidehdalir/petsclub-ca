import type { Metadata } from "next";

import { PolicyPage } from "@/components/shared/policy-page";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contact",
  description: "How to reach the PetsClub team about the community, editorial or partnerships.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PolicyPage
      title="Contact"
      description="How to reach us, and what to expect when you do."
      path="/contact"
    >
      <h2>General enquiries</h2>
      <p>
        Email{" "}
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
        >
          {siteConfig.contactEmail}
        </a>
        . A contact form with routing for editorial corrections, moderation appeals and
        partnership enquiries is planned; until then a single inbox is the honest answer.
      </p>

      <h2>Editorial corrections</h2>
      <p>
        If a published guide contains an error, tell us what is wrong and where you saw it. We
        publish corrections rather than quietly editing pages.
      </p>

      <h2>Urgent pet health concerns</h2>
      <p>
        We cannot help with a medical emergency. Contact your veterinarian or your nearest
        emergency animal hospital directly.
      </p>
    </PolicyPage>
  );
}
