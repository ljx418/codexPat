# V34.1 Subject Detection Evidence

Phase: V34.1
Date: 2026-06-25

## PRD / Spec Review
- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.
- Reviewed: `docs/V34.x/v34-target-architecture.md`.
- Reviewed: `docs/V34.x/v34-implementation-contract.md`.
- Reviewed: `docs/V34.x/v34_1-subject-detection-spec.md`.
- Audit opinion: no fatal or major V34.1 spec deviation found.

## Development Action
- Implemented `V34PhotoSampleSetRecord` and `V34SubjectDetectionRecord` creation from safe V33 intake records.
- Kept V34.1 scoped to subject detection; no segmentation, pose map, character asset, action generation, provider, runtime, or production claim is introduced.

## Acceptance Action
- Named sample set includes three single-cat positives and two negative samples.
- Multi-subject and not-cat samples are rejected with reasonCodes.
- Low-visibility single-cat samples are blocked before segmentation.

## Result Summary
- Total samples: 6
- Single-cat passed samples: 3
- Negative rejected samples: 2
- Blocked samples: 1
- Failed samples: 2
- Internal forbidden-content flag: false
- Decision: passed scoped for named V34.1 subject detection records.

## Sample Status
| sampleId | status | subjectCount | confidence | visibleRatio | reasonCodes |
| --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby | passed | one | high | high | sample_intake_passed |
| v34_clear_silver_tabby | passed | one | high | high | sample_intake_passed |
| v34_clear_calico | passed | one | high | high | sample_intake_passed |
| v34_negative_multi_subject | failed | multiple | low | low | multi_subject, sample_failed |
| v34_negative_not_cat | failed | none | low | low | multi_subject, not_cat, sample_failed |
| v34_blocked_low_visible_single_cat | blocked | one | high | low | insufficient_body_visibility |

## Claim Scan
- Status: passed
- Boundary: named sample subject detection only.

## Security Scan
- Status: passed
- Boundary: evidence records use safe sample IDs, safe buckets, and relative evidence refs only.

## Narrow Claim
V34.1 may claim scoped subject detection records for the named safe sample set only.
