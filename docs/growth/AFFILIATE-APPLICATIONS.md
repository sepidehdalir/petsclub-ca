# Canadian affiliate applications

Five publisher routes were confirmed on October 9, 2026. None has received a ThePetClub application or approved this website. Advertised terms are not an accepted contract; activate tracking links only after the owner completes enrollment and the program supplies the real terms and identifiers.

## Verified routes and owner actions

| Program | Canadian route and public terms | Required next action |
| --- | --- | --- |
| Amazon Associates Canada | [Canada operating agreement](https://associates.amazon.ca/help/operating/agreement). Tagged Special Links and required Associate identification apply. No category commission or cookie duration is asserted here. | Owner registers or signs in, accepts the agreement, supplies payee, tax and banking details where required, lists the exact website and obtains its real tracking ID. Review the current participation and IP policies before activation. |
| Chewy Canada | [Canadian affiliate program](https://www.chewy.com/ca/app/content/affiliate), Impact. Public page advertises 4% for Canadian orders. The offered Impact contract inspected October 9 specifies last-click attribution within 15 days, excludes CA gift cards, locks actions 27 days after the tracking month ends and pays approved transactions 20 days after the locking month ends. CAD; reversals can reach 100%; advertiser completion-page partner pixels are not allowed. These are offered terms, not an accepted agreement. Application signup requires contract acceptance before proceeding. | Owner creates or accesses an Impact publisher account, verifies website ownership, completes account/payment requirements and requests Chewy Canada. Record the accepted rate and attribution window, not just the marketing page. |
| Fetch Canada | [Canadian affiliate program](https://www.fetchpet.com/canada/partner-with-us/affiliates), Pepperjam. Lead compensation and monthly reporting are advertised; no fixed payout or attribution duration established. | Owner opens the Canadian Apply route, completes the network account and agreement, then obtains Canadian lead eligibility, province restrictions and approved insurance wording. |
| Trupanion Canada | [Canada affiliate program](https://www.trupanion.com/en-ca/affiliate), Impact. No exact public commission or cookie duration established. | Owner applies through this publisher route; confirm provincial eligibility, approved creatives and conversion definition. Do not substitute member refer-a-friend rewards for publisher enrollment. |
| PetSafe | [Affiliate program](https://www.petsafe.com/about-us/petsafe-affiliate-program/), [Ascend application](https://www.ascendpartner.com/affiliate/registration?refid=141049). FAQ in the live page confirms US and Canadian residents. Advertises “+8% Commission” and up to 90-day attribution, subject to accepted terms. Trademark bidding and competing brand content restrictions apply. | Owner completes network registration and contract review. Confirm eligible Canadian transactions, destination storefront, shipping territory and the actual rate before creating offers. Canadian residence alone does not prove every Canadian transaction is eligible. |

Homes Alive's public ambassador form is an enquiry route, not proof of a publisher commission agreement. No primary Pet Valu affiliate agreement was established. Neither is counted among the five verified programs.

## Application fields ready to use

- Website: https://thepetclub.ca
- Publication: The Pet Club, English information for Canadian pet parents.
- Subjects: Canadian pet costs, insurance policy questions, indoor enrichment, adoption, travel and everyday pet ownership.
- Promotion model: contextual editorial references and disclosed comparisons; no purchased rankings, fabricated testing, trademark bidding or unsolicited outreach.
- Example placements: /guides/indoor-cat-enrichment-canadian-homes and /guides/cost-of-owning-a-cat-in-canada. Insurance education: /guides/pet-insurance-in-canada.
- Editorial policy: https://thepetclub.ca/editorial-policy
- Advertising disclosure: https://thepetclub.ca/advertising-disclosure
- Contact: https://thepetclub.ca/contact. Published address is hello@thepetclub.ca; ownership and inbox delivery must be confirmed by the owner before using it for account verification.
- Observed search traffic: Search Console export, September 6 through October 6, 2026: 8 clicks, 976 impressions. These are search metrics, not monthly sessions, subscribers or affiliate revenue. GA4 visitor counts are not available yet.

Suggested publisher description:

The Pet Club publishes Canadian pet ownership guides with source links, clear commercial disclosures and practical comparison criteria. We plan contextual links in relevant enrichment and budgeting guides and general education about insurance policy terms. We do not claim hands-on testing without evidence, accept payment for rankings, or present general information as individualized veterinary or insurance advice. Our current audience is small; the measured Search Console baseline is 8 clicks and 976 impressions for September 6 to October 6, 2026.

Owner-only fields: legal payee/entity name, residence, contact identity, mailing address, tax forms, banking details, authorized contract acceptance and ownership verification. Do not guess or store these in this public repository.

## Activation and measurement

Store every approved offer once in `src/features/commerce/offers.ts`, with exact allowed destination host, real tracking link, disclosure and review deadline. Product assignments live in `products.ts`; article bodies reference IDs. No link cloaking or invented IDs. The click handler rechecks expiry even if the page was built earlier. For Amazon, add the program's required identification exactly as specified in the current agreement once participation is real, and use only licensed program assets.

Affiliate clicks are intent signals. Partner dashboards establish attributed leads, qualifying orders, reversals and paid commissions. Reconcile anonymized aggregate reports with offer IDs; never invent site-side purchases or claim clicks are revenue. Configure GA4 custom dimensions for offer_id, partner, product_id and cta_id only when the correct Web stream exists. Confirm collection in Realtime or DebugView before marking it live.

Canadian disclosure reference: [Competition Bureau guidance](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/influencer-marketing-and-competition-act). A commission, gift or other material connection needs a clear disclosure with the placement; a bare brand link is not enough.
