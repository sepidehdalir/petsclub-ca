"use client";

import type { AffiliateOffer } from "./offers";

/** A local measurement hook; no cookies, personal data or network collector. */
export function AffiliateLink({ offer }: { offer: AffiliateOffer }) {
  function recordClick() {
    try {
      window.dispatchEvent(new CustomEvent("thepetclub:affiliate-click", {
        detail: { offer_id: offer.id, partner: offer.partner },
      }));
    } catch {
      // Measurement must never prevent ordinary navigation.
    }
  }
  return (
    <a href={offer.href} rel="sponsored nofollow noopener" onClick={recordClick}
      className="inline-flex rounded-md bg-pine-700 px-5 py-3 font-semibold text-white hover:bg-pine-800 focus-visible:outline-2 focus-visible:outline-offset-4">
      {offer.label}
    </a>
  );
}
