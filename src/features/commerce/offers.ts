export interface AffiliateOffer {
  id: string;
  partner: string;
  label: string;
  href: string;
  approved: boolean;
  /** Exact destination host reviewed against the partner agreement. */
  allowedHost: string;
  verifiedOn: string;
  reviewBy: string;
  disclosure: string;
}

/** Empty until an accepted program supplies a real, reviewed tracking link. */
export const affiliateOffers: readonly AffiliateOffer[] = [];

export function usableOffer(offer: AffiliateOffer, today = new Date().toISOString().slice(0, 10)): boolean {
  try {
    const url = new URL(offer.href);
    const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
    return offer.approved && /^[a-z0-9-]{1,64}$/.test(offer.id) &&
      url.protocol === "https:" && !url.username && !url.password && !url.port &&
      url.hostname === offer.allowedHost && validDate(offer.verifiedOn) && validDate(offer.reviewBy) &&
      offer.verifiedOn <= today && offer.reviewBy >= today &&
      Boolean(offer.label.trim() && offer.partner.trim() && offer.disclosure.trim());
  } catch {
    return false;
  }
}

export function findAffiliateOffer(id: string): AffiliateOffer | undefined {
  return affiliateOffers.find((offer) => offer.id === id && usableOffer(offer));
}
