"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { usableOffer, type AffiliateOffer } from "./offers";

/** Recheck open tabs at the UTC review boundary and when they resume. */
function subscribeToReviewDate(notify: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  function schedule() {
    const now = new Date();
    const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    timer = setTimeout(() => { notify(); schedule(); }, nextDay - now.getTime());
  }
  schedule();
  window.addEventListener("focus", notify);
  document.addEventListener("visibilitychange", notify);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("focus", notify);
    document.removeEventListener("visibilitychange", notify);
  };
}

/** A local measurement hook; no cookies, personal data or network collector. */
export function AffiliateLink({ offer }: { offer: AffiliateOffer }) {
  // Never bake an actionable affiliate URL into cached HTML. Hydration must
  // confirm the current review window; without JavaScript the link stays closed.
  const available = useSyncExternalStore(subscribeToReviewDate, () => usableOffer(offer), () => false);
  function guardNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (!usableOffer(offer)) event.preventDefault();
  }
  function recordClick(event: MouseEvent<HTMLAnchorElement>) {
    guardNavigation(event);
    if (event.defaultPrevented) return;
    try {
      window.dispatchEvent(new CustomEvent("thepetclub:affiliate-click", {
        detail: { offer_id: offer.id, partner: offer.partner },
      }));
    } catch {
      // Measurement must never prevent ordinary navigation.
    }
  }
  if (!available) return <p role="status">This offer is unavailable until its current review status can be confirmed.</p>;
  return (
    <div>
    <a href={offer.href} rel="sponsored nofollow noopener" onClick={recordClick}
      onAuxClick={guardNavigation} onContextMenu={guardNavigation}
      className="inline-flex rounded-md bg-pine-700 px-5 py-3 font-semibold text-white hover:bg-pine-800 focus-visible:outline-2 focus-visible:outline-offset-4">
      {offer.label}
    </a>
    </div>
  );
}
