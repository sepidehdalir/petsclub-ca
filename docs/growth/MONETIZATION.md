# Monetization implementation — 2026-10-09

## Existing implementation

`src/features/commerce/offers.ts` is an empty typed registry. Each future offer needs confirmed acceptance, a real partner link, an exact allowed HTTPS host, verification/review dates and visible disclosure. Unknown, unapproved, malformed and overdue records render nothing. No prices or ratings are displayed. `AffiliateOffer` is registered in MDX. Use `<AffiliateOffer offerId="approved-offer-id" />` only after the record and content placement are reviewed.

Links use `sponsored nofollow noopener`, following Google's link qualification guidance: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links . Navigation works without JavaScript; local click notification is best-effort.

`thepetclub:affiliate-click` CustomEvent contains offer_id and partner only. It is a hook, NOT stored analytics, a conversion, or revenue. No collector, cookies or personal identifiers have been enabled. A consent-aware real analytics adapter must be configured and tested before reporting click totals. Associate an offer with its article in the approved registry/report mapping; do not include personal URL queries in analytics.

Static offer dates are checked at render/build time. A future activation must schedule regular verification/rebuilds, or move offer validity to a dynamic server lookup. Do not rely on runtime expiry of cached static HTML.

## Programs verified on primary pages

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
