# Monetization implementation — 2026-10-09

## Existing implementation

`src/features/commerce/offers.ts` is an empty typed registry. Each future offer needs confirmed acceptance, a real partner link, an exact allowed HTTPS host, verification/review dates and visible disclosure. Unknown, unapproved, malformed and overdue records render nothing. No prices or ratings are displayed. `AffiliateOffer` is registered in MDX. Use `<AffiliateOffer offerId="approved-offer-id" />` only after the record and content placement are reviewed.

Links use `sponsored nofollow noopener`, following Google's link qualification guidance: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links . Navigation works without JavaScript; local click notification is best-effort.

`thepetclub:affiliate-click` CustomEvent contains offer_id and partner only. It is a hook, NOT stored analytics, a conversion, or revenue. No collector, cookies or personal identifiers have been enabled. A consent-aware analytics adapter is deployed but inactive; a real GA4 stream must be configured and collection tested before reporting click totals. Associate an offer with its article in the approved registry/report mapping; do not include personal URL queries in analytics.

Offer dates are checked at render/build time and rechecked on actual client interaction. Expired offers prevent navigation and show an accessible explanation. Keep regular source/contract reviews and rebuilds for cached content.

## Programs verified on primary pages

Five routes are now verified: Amazon Canada, Chewy Canada, Fetch Canada, Trupanion Canada and PetSafe. The three-row table below preserves the first research batch; see [the complete application register](AFFILIATE-APPLICATIONS.md) for all five, offered terms and owner actions. Zero applications submitted and zero approvals established.

| Program | Verified public information | Still unknown / not approved |
| --- | --- | --- |
| Amazon.ca Associates | Canadian operating agreement and commission policies exist | Account status; current category rates, session rules, payout eligibility and prohibited channels must be reviewed before application/activation |
| Fetch Canada | Affiliate application through Pepperjam; monthly lead compensation and tracking advertised | Rate, attribution window, provincial eligibility, payout minimum and traffic restrictions |
| Trupanion Canada | Canadian affiliate application; technology provided by Impact | Rate, cookie window, publisher acceptance, geographic restrictions and payout terms |

Sources checked 2026-10-09:
- https://associates.amazon.ca/help/operating/agreement
- https://associates.amazon.ca/help/operating/policies
- https://www.fetchpet.com/canada/partner-with-us/affiliates
- https://www.trupanion.com/en-ca/affiliate

Do not submit contractual applications or invent publisher IDs. Public application pages are evidence of availability, not enrollment. Insurance lead generation needs policy evidence and review of applicable provincial marketing rules before launch.

## Revenue record

Affiliate acceptance, clicks, sales, commissions and paid cash are unknown. No revenue demonstrated. Maintain distinct columns for estimated, approved and paid commission; report refunds/reversals and expenses separately.

Display advertising thresholds were checked below; site eligibility is not demonstrated. No ads or scripts added. Sponsorships/newsletter wait for audience measurement and verified consent infrastructure.

## Display eligibility check — 2026-10-09

Primary sources reviewed:
- Journey: https://help.mediavine.com/what-does-it-take-to-get-approved-by-mediavine — over 1,000 sessions plus review; session volume unverified here.
- Raptive: https://help.raptive.com/hc/en-us/articles/360032840891-Who-is-eligible-for-Raptive — minimum 25,000 monthly pageviews plus other eligibility requirements. Pageviews unverified here.
- AdSense: https://support.google.com/adsense/answer/9724 — original policy-compliant content, site access and adult account holder requirements; approval not automatic.

Eight Google search clicks do not prove eligibility or ineligibility for session/pageview thresholds. No ad account applications, terms acceptance or ad tags performed. Measure the actual audience and complete privacy-policy work before activation.

## Live continuation

Two ordinary unpaid product references and a comparison are live in the indoor enrichment and cat-budget guides. No approved affiliate offer exists. The contact page prepares partnership/sponsorship email drafts locally; it sends nothing and inbox delivery is unverified. The existing Google publisher account has AdMob only; AdSense for Content requires the owner’s account/payee confirmation and application. Newsletter delivery requires a restricted Resend key, confirmed consent/unsubscribe infrastructure and an authorized sender identity/address. See REVENUE-READINESS.md.
