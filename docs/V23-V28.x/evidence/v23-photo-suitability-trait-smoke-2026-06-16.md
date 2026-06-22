# V23 Photo Suitability and Trait Extraction Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V23 verifies local photo suitability and safe cat trait extraction only. It does
not generate animation assets, does not call a provider, does not preview/apply
assets, and does not unlock V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
| real local cat photos evaluated | passed | 3/3 real samples evaluated |
| clear single-cat photo accepted | passed | sample_1_orange_cat:clear:photo_suitability_clear, sample_2_yellow_cat:clear:photo_suitability_clear, sample_3_gray_cat:clear:photo_suitability_clear |
| blurry fixture blocked | passed | stable reasonCode photo_blurry |
| low-resolution fixture blocked | passed | stable reasonCode photo_low_resolution |
| cropped or occluded fixture blocked | passed | stable reasonCodes cat_cropped/cat_occluded |
| multi-cat fixture blocked | passed | stable reasonCode multi_cat_ambiguous |
| complex background marked risky | passed | usable_with_risk rather than silent clear |
| safe trait summary generated | passed | trait fields are bucketed and path-free |
| no provider execution or live pet mutation | passed | V23 only evaluates intake quality and traits |
| security scan | passed | no credential, auth header, image bytes, private file identifiers, provider response, geodata |
| claim scan | passed | forbidden claims are not used as passed |

## Real Local Photo Samples

| Safe sample | Status | Primary reason | Media | Size | Dimension buckets | Trait confidence |
| --- | --- | --- | --- | --- | --- | --- |
| sample_1_orange_cat | clear | photo_suitability_clear | jpeg | small | large/large/portrait | high |
| sample_2_yellow_cat | clear | photo_suitability_clear | jpeg | small | large/large/landscape | high |
| sample_3_gray_cat | clear | photo_suitability_clear | jpeg | small | large/large/portrait | high |

## Rejected / Risk Fixture Table

| Fixture | Status | Reason codes |
| --- | --- | --- |
| fixture_blurry | unsuitable | photo_blurry, trait_summary_low_confidence |
| fixture_low_resolution | unsuitable | photo_low_resolution, trait_summary_low_confidence |
| fixture_cropped_or_occluded | unsuitable | cat_cropped, cat_occluded, trait_summary_low_confidence |
| fixture_multi_cat | unsuitable | multi_cat_ambiguous, trait_summary_low_confidence |
| fixture_complex_background | usable_with_risk | background_too_complex, trait_summary_ready |

## Safe Trait Fields

The trait summary uses bucketed safe labels only:
coatColorBucket, patternBucket, faceShapeBucket, eyeColorBucket, earShapeBucket,
tailVisibility, bodyPose, confidence, source.

## PRD / Spec Review

V23 satisfies the PRD requirement to screen source photos before spending
provider attempts and to produce a safe cat trait summary. V24 remains dependent
on this evidence and is not started by this smoke.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Treating V23 suitability as generated asset readiness | High | blocked by scope and claim scan |
| Using unsafe source metadata in evidence | High | blocked by security scan |
| Heuristic quality signals mistaken for full computer vision QA | Medium | documented as V23 intake gate; V25 owns visual QA |
| Complex background silently accepted as clear | Medium | mitigated by usable_with_risk status |

## Allowed Claim

V23 photo suitability and safe trait extraction passed for tested local photo samples and quality fixtures.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
