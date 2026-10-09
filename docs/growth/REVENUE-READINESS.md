# Revenue activation requirements

Product cards, comparisons and the partnership enquiry composer can operate without claiming affiliate enrollment or confirmed inbox delivery. Paid commissions, newsletter subscriptions and advertising require their real external account configuration before they can be counted as live revenue features.

## Advertising

[AdSense eligibility](https://support.google.com/adsense/answer/9724) requires the applicant to meet Google's age, ownership and content requirements. The owner must confirm eligibility, account/payee details, terms and the correct site. Approval is Google's decision; the number of articles alone does not establish it. Do not insert an invented publisher ID, ads.txt seller record or empty display slots. Add the exact verification and seller records only from the actual account after approval, then test layout shift and mobile readability.

The authenticated existing Google publisher account currently lists AdMob as its only active product. Its application wizard offers adding AdSense to that existing Canadian account; no duplicate account was created and no payee details or agreement were submitted. Owner action: follow [Google’s AdMob account upgrade instructions](https://support.google.com/adsense/answer/6023158), confirm the existing payee/account information, enter https://thepetclub.ca, review the final terms and complete the site verification/review flow. Do not treat the existing AdMob publisher ID as approval to display ads on this website.

Other networks remain candidates, not approved relationships. [Raptive's creator route](https://raptive.com/creators/) has traffic and audience requirements that need actual Analytics evidence. A Search Console click count is not a pageview or session count. Do not apply claiming unverifiable traffic, or add network scripts before accepted terms and eligibility checks.

The current privacy and terms pages contain explicit drafts. Complete the owner identity, privacy contact, actual data practices and policy review before an ad or newsletter launch. Clinical drafts remain excluded from public discovery; display advertisements must not imply veterinary endorsement.

## Newsletter

The Resend domain thepetclub.ca is verified for sending. That does not supply the site's server credential, establish a subscriber list or prove newsletter delivery. Provide a restricted RESEND_API_KEY in Vercel through the owner's secret settings; never paste it into a public file or chat. Confirm the sender, the legal sender identity and mailing address, actual privacy notice and withdrawal route before collecting marketing consent.

[CRTC guidance](https://crtc.gc.ca/eng/internet/anti.htm) explains the Canadian anti-spam requirements. The acquisition flow needs meaningful consent, sender identification, consent records and a working unsubscribe mechanism. A production-ready implementation should confirm the email address before marketing, rate-limit submissions, avoid email enumeration, persist consent and unsubscribe state, and test a controlled confirmation and withdrawal. No subscription success event may be sent until the provider and confirmation state actually establish success.

No public newsletter signup has been activated. This avoids collecting addresses without a complete consent and delivery flow. Partnership enquiries are prepared locally and sent only by the visitor through their own email service; they do not create a subscriber or send a server-side message.
