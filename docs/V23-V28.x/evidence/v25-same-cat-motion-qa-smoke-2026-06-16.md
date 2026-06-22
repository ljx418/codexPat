# V25 Same-cat and Motion QA Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V25 verifies same-cat, motion, continuity, loop, and visibility QA before V22
visual review. It does not preview, apply, roll back, call providers, or unlock
V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
| V24 prerequisite evidence exists and passed | passed | docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md |
| accepted candidate proceeds to V22 visual review | passed | status=accepted_for_v22_review; v22=visual_review_required |
| identity drift rejected | passed | identity_drift_detected, safe_qa_snapshot_ready, same_cat_score_too_low |
| weak motion rejected | passed | motion_amplitude_too_low, safe_qa_snapshot_ready, same_cat_qa_passed |
| large frame delta rejected | passed | frame_delta_too_large, loop_closure_failed, safe_qa_snapshot_ready, same_cat_qa_passed |
| loop closure failure rejected | passed | frame_delta_too_large, loop_closure_failed, safe_qa_snapshot_ready, same_cat_qa_passed |
| blank transparent off-canvas rejected | passed | blank_frame_detected, missing_core_action, off_canvas_frame_detected, safe_qa_snapshot_ready, same_cat_qa_passed, transparent_frame_detected |
| desktop target test passed | passed | same-cat-motion-qa.test.ts passed |
| security scan | passed | no credential, auth header, private file identifiers, provider body, image bytes, geodata |
| claim scan | passed | forbidden claims are not used as passed |

## QA Scenario Table

| Scenario | Status | Reason codes | V22 status | Proceeds to V22 visual review |
| --- | --- | --- | --- | --- |
| accepted | accepted_for_v22_review | safe_qa_snapshot_ready, same_cat_qa_passed, v22_visual_review_ready | visual_review_required | true |
| identityDrift | rejected | identity_drift_detected, safe_qa_snapshot_ready, same_cat_score_too_low | visual_review_required | false |
| weakMotion | rejected | motion_amplitude_too_low, safe_qa_snapshot_ready, same_cat_qa_passed | motion_failed | false |
| jumpy | rejected | frame_delta_too_large, loop_closure_failed, safe_qa_snapshot_ready, same_cat_qa_passed | technical_failed | false |
| technicalBad | rejected | blank_frame_detected, missing_core_action, off_canvas_frame_detected, safe_qa_snapshot_ready, same_cat_qa_passed, transparent_frame_detected | technical_failed | false |

## PRD / Spec Review

V25 satisfies the PRD requirement to reject identity drift, weak motion,
jumpy adjacent frames, open loops, and invisible/off-canvas frames before user
preview or apply. V26 remains responsible for pack assembly, isolated preview,
target-only apply, and rollback.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA rejected candidate can still apply | High | V25 has no apply path; V26 must enforce approved-only apply |
| Motion too weak but counted as complete | High | rejected by motion_amplitude_too_low |
| Same-cat drift hidden by route success | High | rejected by identity_drift_detected |
| V25 accepted treated as final visual approval | Medium | accepted only means V22 visual_review_required |

## Allowed Claim

V25 same-cat and motion QA passed for tested candidate metrics and rejection scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
