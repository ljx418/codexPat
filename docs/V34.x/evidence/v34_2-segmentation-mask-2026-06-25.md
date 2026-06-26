# V34.2 Segmentation Mask Evidence

Phase: V34.2
Date: 2026-06-25

## PRD / Spec Review
- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.
- Reviewed: `docs/V34.x/v34-target-architecture.md`.
- Reviewed: `docs/V34.x/v34-implementation-contract.md`.
- Reviewed: `docs/V34.x/v34_2-segmentation-mask-spec.md`.
- Audit opinion: no fatal or major V34.2 spec deviation found.

## Development Action
- Implemented `V34SegmentationMaskRecord` creation from V34.1 subject detection records.
- Mask records store safe quality buckets and sanitized derivative refs only.
- Kept V34.2 scoped to mask/crop evidence; no pose map, character asset, action generation, provider, runtime, or production claim is introduced.

## Acceptance Action
- Every V34.1 passed single-cat sample receives a mask record.
- Passed masks include transparent derivative refs and low/none background leakage buckets.
- High-leakage mask review case is blocked before character asset creation.
- Non-passed subject detection records do not become passed masks.

## Result Summary
- V34.1 passed single-cat detections: 3
- Mask records: 7
- Passed masks: 3
- Blocked masks: 2
- Failed masks: 2
- Eligible for later character asset contract: 3
- Internal forbidden-content flag: false
- Decision: passed scoped for V34.2 named-sample segmentation mask records.

## Mask Status
| sampleId | status | foreground | leakage | alpha | transparentCropEvidenceRef | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby | passed | complete | low | tight | docs/V34.x/evidence/derivatives/v34_clear_orange_tabby-transparent-crop |  |
| v34_clear_silver_tabby | passed | complete | low | tight | docs/V34.x/evidence/derivatives/v34_clear_silver_tabby-transparent-crop |  |
| v34_clear_calico | passed | complete | low | tight | docs/V34.x/evidence/derivatives/v34_clear_calico-transparent-crop |  |
| v34_clear_orange_tabby | blocked | complete | high | tight | docs/V34.x/evidence/derivatives/v34_review_high_leakage-transparent-crop | mask_background_leakage |
| v34_negative_multi_subject | failed | missing | unknown | missing | docs/V34.x/evidence/derivatives/v34_negative_multi_subject-transparent-crop | mask_background_leakage, segmentation_failed, subject_detection_failed |
| v34_negative_not_cat | failed | missing | unknown | missing | docs/V34.x/evidence/derivatives/v34_negative_not_cat-transparent-crop | mask_background_leakage, segmentation_failed, subject_detection_failed |
| v34_blocked_low_visible_single_cat | blocked | missing | unknown | missing | docs/V34.x/evidence/derivatives/v34_blocked_low_visible_single_cat-transparent-crop | mask_background_leakage, segmentation_failed, subject_detection_failed |

## Claim Scan
- Status: passed
- Boundary: named sample segmentation mask records only.

## Security Scan
- Status: passed
- Boundary: evidence records use safe sample IDs, quality buckets, and relative derivative refs only.

## Narrow Claim
V34.2 may claim scoped segmentation mask records for V34.1 passed named safe samples only.
