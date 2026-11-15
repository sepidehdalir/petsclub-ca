# Fetch + Trupanion evidence and affiliate readiness — 2026-10-25

**Status: research / application preparation only.** This file does not rank insurers, quote premiums, claim affiliate acceptance, or authorize publication/deployment. The published educational insurance guide stays unchanged.

## Why these two first

These are the two insurance partners with current official public affiliate routes that map directly to ThePetClub's existing `/guides/pet-insurance-in-canada` intent:

- Fetch Canada: current official brand/affiliate intake page plus a legacy official Pepperjam/Ascend affiliate route.
- Trupanion Canada: official Canada affiliate page; technology provided by Impact.

No commission rate for either insurance partner is assumed here. Program existence is not approval.

## Current primary-source comparison worksheet

Checked 2026-10-25. Provider marketing/FAQ pages are evidence only for that provider and can differ from the issued policy or province. Before any consumer-facing comparison row, re-check the applicable policy/declarations.

| Field | Fetch Canada | Trupanion Canada | Editorial rule |
| --- | --- | --- | --- |
| Deductible structure | Annual deductible on current Canada reimbursement/terms pages. | Current Canada deductible FAQ describes a lifetime per-condition deductible, customizable subject to plan/jurisdiction. | Do not call one structure universally better. |
| Payout / reimbursement | Current Canada page offers selectable reimbursement rates of 70%, 80% or 90% for accident/illness claims. | Current Canada deductible/payout pages describe selectable payout up to 90%; exact options can vary. | Quote only current official options and date them. |
| Limits | Fetch uses a selectable maximum annual payout; exact available levels depend on the policy/quote. | Current Canada pages describe no annual/lifetime payout limits for eligible covered costs. | Never flatten this into “unlimited coverage”; exclusions and eligibility still apply. |
| Claim payment | Current Canada workflow says customer pays the vet in full, submits the paid invoice/records, then receives reimbursement by deposit/check. | VetDirect Pay can pay participating hospitals at checkout; Trupanion software and veterinarian approval are required. Reimbursement remains possible when direct pay is unavailable. | “Direct pay” is not universal clinic acceptance. |
| Exam fees | Current Fetch Canada terms/FAQ says eligible sick-visit exam fees are covered; routine exam benefits require the wellness endorsement. | Current Canada exclusion page says exam fees and taxes are not covered. | This is a meaningful comparison row if current policy documents support it. |
| Waiting periods | Current Canada reimbursement FAQ says accident coverage can begin on the effective date/day after signup, illness has a 15-day wait; a separate current waiting-period FAQ describes a 6-month orthopaedic wait and a possible knee waiver path. | Current Canada FAQ states 5 days for injuries and 30 days for illnesses; location can affect effective dates. | Use issued/province policy to resolve any marketing-page wording differences before publication. |
| Dental | Current Fetch Canada materials describe eligible dental injury/disease coverage, subject to policy terms and limits. | Current Canada dental FAQ describes new dental illness/injury coverage conditional on annual dental exams and following recommended dental care; routine cleanings are not a covered routine expense. | Avoid “full dental” shorthand without the conditions. |
| Wellness / routine care | Optional Fetch Wellness is described as insurance coverage added by endorsement, with separate benefit limits. | Current Canada pages say routine/wellness/preventive care is not covered. | Keep wellness separate from accident/illness comparison. |
| Pre-existing conditions | Current Canada materials define pre-existing conditions broadly around prior signs/symptoms and waiting periods; policy-specific reconsideration rules may apply. | Current Canada materials exclude conditions diagnosed or showing clinical signs before coverage / during applicable waiting periods. | Never imply diagnosis date alone controls eligibility. |
| Renewal / continuing conditions | Do not publish a generalized lifetime-continuity claim from marketing alone; use current policy wording/declarations. | Current Canada pages market continuing coverage for covered conditions while coverage remains in force; issued policy controls. | Keep renewal treatment as a policy-document row, not a slogan. |
| Geography | Canada product pages carry province-specific caveats; Fetch pages state some programs/products are unavailable in New Brunswick and Quebec. | Canada site says policies vary by province and directs users to set region. | State the jurisdiction being compared. |

## Primary sources checked

Fetch Canada:
- https://www.fetchpet.com/canada/claims/reimbursement
- https://www.fetchpet.com/canada/pet-insurance-terms
- https://www.fetchpet.com/canada/faqs/waiting-period
- https://www.fetchpet.com/canada/faqs/pet-exam-cost-pet-insurance-coverage
- https://www.fetchpet.com/canada/partner/pet-insurance-affiliate-programs
- Legacy official affiliate page: https://www.fetchpet.com/canada/partner-with-us/affiliates

Trupanion Canada:
- https://www.trupanion.com/en-ca/pet-insurance-faq/article/deductibles
- https://www.trupanion.com/en-ca/pet-insurance-faq/article/when-does-my-coverage-begin
- https://www.trupanion.com/en-ca/pet-insurance-faq/article/what-trupanion-does-not-cover
- https://www.trupanion.com/en-ca/pet-insurance-faq/article/dental
- https://www.trupanion.com/en-ca/affiliate

## Affiliate application status — attempted 2026-10-25

### Fetch Canada

The current official affiliate/brand page contains a simple intake form for name, email, title and company website. The public site provides the non-sensitive brand details needed for a first-contact submission: The Pet Club, `hello@thepetclub.ca`, Publisher, `https://thepetclub.ca`.

A browser-form submission was attempted through the authorized automation tool, but the run **did not start** because the browser automation wallet balance was insufficient. Therefore:
- no form was submitted;
- no acceptance, tracking ID, contract, or compensation terms exist;
- do not add a Fetch affiliate link.

The older official affiliate page still points to Pepperjam/Ascend. That route is not treated as a completed application and should not be used to create a duplicate network account without confirming the current official onboarding path.

### Trupanion Canada

The official Canada affiliate page sends applicants to Impact. The repository's prior affiliate audit records an existing Impact account and no confirmed pet-insurance partnership. Do not create a duplicate Impact account.

The application cannot be completed safely in this run because:
- no authenticated Impact browser session/connector is available here;
- the Impact flow can contain program-specific agreement terms that need owner review before acceptance.

Therefore:
- no Trupanion application or agreement acceptance is claimed;
- no Trupanion tracking URL exists;
- do not publish Trupanion as an affiliate partner.

## Release / monetization gate

Only after a program is actually accepted:
1. retain editorial independence and do not change factual scoring because of compensation;
2. add the exact allowed tracking destination to the centralized offer registry;
3. display a nearby commission disclosure;
4. use `rel="sponsored"` (the existing affiliate component already enforces this pattern);
5. QA destination host, disclosure, canonical/robots and mobile rendering;
6. distinguish clicks from approved leads/policies/revenue in reporting.

## GSC dependency

Fresh ThePetClub Search Console data is still unavailable on 2026-10-25:
- GSC Wizard: `payment_required`;
- Windsor Search Console: only `sc-domain:sunifygroup.ca`;
- TinyFish profile: no recorded Google sign-in.

Do not choose a provider CTA or alter the published insurance page based on the old 15-impression BC query alone. Use the official Performance + Page Indexing exports described in PR #49 before selecting the first conversion experiment.
