import { AffiliateLink } from "./affiliate-link";
import { findAffiliateOffer } from "./offers";

/** Unknown, unapproved and expired offers render nothing, including in MDX. */
export function AffiliateOffer({ offerId }: { offerId: string }) {
  const offer = findAffiliateOffer(offerId);
  if (!offer) return null;
  return (
    <aside className="my-8 rounded-card border border-border bg-surface-muted p-5" aria-label="Affiliate offer">
      <p className="mb-4 text-body-sm text-foreground-muted">{offer.disclosure}</p>
      <AffiliateLink offer={offer} />
      <p className="mt-3 text-body-sm text-foreground-muted">
        Check current price, availability and terms on the partner’s site.
      </p>
    </aside>
  );
}
