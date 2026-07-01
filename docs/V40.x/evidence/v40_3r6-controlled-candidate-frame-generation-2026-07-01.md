# V40.3R6 Controlled Candidate Frame Generation Evidence

Date: 2026-07-01

## Decision
- Status: failed.
- V40.3R5 pass ref: docs/V40.x/evidence/v40_3r5-direct-runner-predev-audit-2026-07-01.json.
- V40.4 entry: no_go.

## PRD / Spec Review
- R6 ran only after R5 passed scoped.
- R6 output is candidate evidence only; normalization remains gated by explicit visual pass records.
- The blocked negative sample remains outside candidate generation.

## Generation Result
- Generated: yes.
- Candidate count: 2.
- Manifest ref: docs/V40.x/evidence/assets/v40-3r6-controlled-candidates/manifest.json.
- Stable reason: candidate_outputs_reviewed.

## Candidate Refs
- v40r-v38-a-cat-public-ip-adapter-candidate: docs/V40.x/evidence/assets/v40-3r6-controlled-candidates/v38-a-cat-public-contact-sheet.png; sample v38_a_cat_public.
- v40r-v38-tuxedo-public-ip-adapter-candidate: docs/V40.x/evidence/assets/v40-3r6-controlled-candidates/v38-tuxedo-public-contact-sheet.png; sample v38_tuxedo_public.


## Visual Review
- v40r-v38-a-cat-public-ip-adapter-candidate: failed; reasons action_semantics_unclear, target_experience_quality_failed.
  - Generated same-sample action images are present as review candidates. The tabby candidate remains photo-like, includes scene/background content, and shows visible style/artifact drift across actions. Each action is represented as a single still image rather than a reviewable multi-frame action sequence. The output is not preferred over the same-sample V39 baseline for desktop-pet target use. Candidate is kept out of V40.4 normalization.
- v40r-v38-tuxedo-public-ip-adapter-candidate: failed; reasons action_semantics_unclear, target_experience_quality_failed.
  - Generated same-sample action images are present as review candidates. The tuxedo candidate uses complex indoor photo backgrounds and does not present clean desktop-pet transparent or sprite-like frames. Each action is represented as a single still image rather than a reviewable multi-frame action sequence. The output is not preferred over the same-sample V39 baseline for desktop-pet target use. Candidate is kept out of V40.4 normalization.


## V39 Same-Sample Comparison
- v38_a_cat_public: not_better_than_v39; baseline /v39/v38_a_cat_public/contact-sheet.svg; reasons visual_preference_not_better_than_v39.
- v38_tuxedo_public: not_better_than_v39; baseline /v39/v38_tuxedo_public/contact-sheet.svg; reasons visual_preference_not_better_than_v39.


## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Final Phase Result
- Decision: failed.
- Accepted visual count: 0.
- V40.4 remains No-Go unless this count reaches at least two.
