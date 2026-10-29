# October 28, 2026: evidence-led content expansion

## Intent and URL ownership
- `/guides/cat-pregnancy-signs-and-tests`: refresh existing Oct25 guide with gestation and care needs; no competing cat-pregnancy URL.
- `/guides/dog-pregnancy-signs-and-tests`: refresh existing Oct25 guide with care needs; distinguish ovulation from mating and false pregnancy.
- `/guides/spaying-and-neutering-in-canada`: retain combined existing owner with cat and dog sections. Cat timing CVMA by5months; dog timing individualized, not a universal age. Preserve original Sep6 date.
- `/guides/dog-trainers-greater-vancouver`: new initial Vancouver-focused directory, five verified Maps entries, alphabetical, not “best” or paid rankings. Separate from training technique guides.
- `/guides/raw-pet-food-canada-risks-nutrition`: new evidence/risks/adequacy guide plus limited five-province manufacturer directory; distinct from food-label reading/storage pages.

## Publication state
Owner approved release of PR55 on October 29, 2026 at 02:19:44 UTC. Only the two new records are activated, with first-publication dates October 29. The three existing refreshes carry October 29 revision dates while preserving original October 25 pregnancy and September 6 spay/neuter publication dates. Seven unrelated clinical holds remain byte-for-byte unchanged. Directory observations remain explicitly dated October 28; release follows the next morning, without a prolonged delay or any claim that ratings were reobserved October 29. No commercial enrollment or outbound message is part of this PR. Release QA and deployment receipts are recorded separately after execution.

## Evidence and boundaries
Medical copy uses CVMA, AAHA, Merck, VCA, PDSA and UC Davis sources cited inline. No veterinarian review claimed. No dosing, home diagnosis or assisted-birth protocol. Raw guide cites CVMA/PHAC/WSAVA, presents risks before manufacturer links and does not claim raw is healthier. No affiliate arrangement, referral revenue or approved products asserted. Manufacturer geographic statements are sourced to official pages and do not imply national shipping.

Maps observations October28,2026: Canine Connection Vancouver5.0/106; Honourable Hound5.0/167; KRU5.0/39; Raintown4.9/210; ZenDog5.0/78. Exact Maps and official method/contact URLs appear in article. Ratings are Google observations, not ThePetClub ratings; no AggregateRating schema or review copying. Credentials and availability not audited. Initial coverage is not exhaustive GreaterVancouver coverage.

## Design and image provenance
Five records opt into homepage families BricolageGrotesque,DM Sans,InstrumentSerif and cream/paper/ink/lime palette. Existing article grid, readable prose, sources and veterinary notice retained. Unrelated page chrome, auth, homepage motion and video untouched. Existing Pexels assets retained with manifest source/license/photographer and visible credit. Training photo29590678 source/free-license freshly checked; it is illustrative, not a listed trainer. Raw guide uses veterinary-exam6235650 photo, not a product test or veterinary endorsement. Dog5255155 source checked. No image fetched from Maps or trainer/manufacturer websites. Attempted new Pexels download returned403; not bypassed or substituted with unlicensed imagery.

## Verification
Exact main source a67a65d and66binary assets recovered with Gitblob hash checks. npm lockfile unchanged. Local verify: lint/types/533tests/build; rendered-page audit separately recorded. Existing credential-free GitHub browser workflow extended to cover new routes, homepage font/palette, ratings and raw boundaries at six viewport/browser scenarios. Local Chromium cannot start due environment socket policy; no bypass. Hosted preview may require Vercel login; protected access does not count as application QA. No physical-device, ranking/indexing/conversion or veterinary-review claim.

## Approved release preparation — October 29, 2026
- Isolated Mac checkout at reviewed head `ca6560d0ecb1d26befb49fd71ffd5b150bf2c625`; no existing local work was present or changed.
- Locked dependency install; lint, typecheck and 534 tests pass using the production origin. Initial verification had two stale pregnancy revision-date expectations and a missing local origin setting; corrected and rerun without suppressing assertions. Sandboxed build stalled during compilation and was interrupted; the same production build passed with normal local execution permissions.
- Fresh rendered audit: 104 prerendered pages, 6,234 internal links, 518 local asset/font references, zero issues. Registry comparison confirms all seven unrelated held records byte-for-byte unchanged.
- Fresh remote CI/browser runs and production checks must be tied to the release commit. Prior head receipts remain historical evidence, not results for this release edit. Production deployment is automatic from this repository's `main` branch to `thepetclub.ca`; verified Vercel project `prj_jRTKhzOue12m99El0EEX35wkPQxD`, team `team_hb2Wt5KYTbwTo3M8mqhFT2wY`.
