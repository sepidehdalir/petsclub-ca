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

/** Amazon enrollment and SiteStripe destinations verified in the authenticated account.
 * approved authorizes this placement; Amazon final account review remains pending.
 */
export const affiliateOffers: readonly AffiliateOffer[] = [
  {
    "id": "amazon-catit-digger",
    "partner": "Amazon Canada",
    "label": "View on Amazon.ca",
    "href": "https://www.amazon.ca/Catit-42985W-Catit-42985-Senses-2-0-Digger/dp/B015P13QMM?dib=eyJ2IjoiMSJ9.k4o6ANz70Scc3ABAJcy_739L2tdIv68SKdOgyBIyBxpaG1cDpA7v37ALno0ZiHQhB_tlkWAyOIf_dphV23x6xayXVv88R_anNqGgIW4ijcvCl-HnfZRAC6fljldT9PtOiKskwGmbgAhFjaichDtgLThEVHcVx0VdG2fnf92Mv0DX2HQD5BDIF1c_v5Pw8vBFMH3ahg1qt0xlCHo76g641_1ktzT9xLRPtmARQFaLFPCBTezZz0hNjlQ826ufwJddpR6UJTZjLY0qe1UAdpTy-_aMZjFQvqyyHvyhE3cM0pk.iqpQ0Evj_1SxOa6MEKjechl8mBA1idrNjHCH3oGP8QA&dib_tag=se&keywords=Catit%2BSenses%2BDigger&qid=1791588026&sr=8-1&th=1&linkCode=ll2&tag=thepetclub09-20&linkId=4ef797058ee41b3051ec252143a15f09&gaOptInStatus=true&ref_=as_li_ss_tl",
    "approved": true,
    "allowedHost": "www.amazon.ca",
    "verifiedOn": "2026-10-09",
    "reviewBy": "2026-11-08",
    "disclosure": "Affiliate link: we may earn a commission from qualifying purchases. As an Amazon Associate I earn from qualifying purchases."
  },
  {
    "id": "amazon-catit-wave",
    "partner": "Amazon Canada",
    "label": "View on Amazon.ca",
    "href": "https://www.amazon.ca/Catit-43155-CA-Senses-2-0-Wave-Circuit/dp/B00D3NI7ZG?dib=eyJ2IjoiMSJ9.VVDXalKKkZHS3tTGBxZXHksgxvTCVO0GYNiL805XPvBGPYGDxZmLefI0s4fGRq36aKm2Qzs3aDxIEz3exYWgHfER9wz1DLeKUUVj5OUPp_DkLAJUe1ZUOkZKMTJYqz2I4Lo5TqpUzn1N9DIVdxoUjreQDkjiM7rOgG6G5vAxLIB9adUDBjzhnhg2ZF3KWQShiEn26SwFMmJDqk8VLZGg0QvhUaMrM3gs9CIwJi5p0J3QPfidaPq7ntX--BMolCLV9T7oOsuKi17WP7JKRyF4_34W_84FhkMqeb6Rv4nzD1M.AQb_ke8S9RX41bwZypccZIuYYpiFIvXW71M5DspQUYU&dib_tag=se&keywords=Catit%2BSenses%2BWave%2BCircuit&qid=1791588278&sr=8-6&th=1&linkCode=ll2&tag=thepetclub09-20&linkId=6f88f7cdde801291269e7bd217f25b7e&gaOptInStatus=true&ref_=as_li_ss_tl",
    "approved": true,
    "allowedHost": "www.amazon.ca",
    "verifiedOn": "2026-10-09",
    "reviewBy": "2026-11-08",
    "disclosure": "Affiliate link: we may earn a commission from qualifying purchases. As an Amazon Associate I earn from qualifying purchases."
  }
];

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
