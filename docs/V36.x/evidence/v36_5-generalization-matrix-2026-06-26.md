# V36.5 Generalization Matrix Evidence

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.5 generalization matrix.
- Spec: docs/V36.x/v36_5-generalization-matrix-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_5-generalization-matrix-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Generalization Matrix
| sampleId | difficulty | routeId | rubricStatus | humanReviewStatus | productPathStatus | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_calico_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_silver_tabby_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_black_cat_public | partial | route_a2_quality_uplift | engineering_only | engineering_only | not_attempted | sample_intake_passed |
| v36_siamese_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_longhair_public | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_tail_hidden_public | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_complex_background_public | complex_background | route_a2_quality_uplift | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, sample_intake_passed |
| v36_public_ginger_profile | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_calico_yawning | complex_background | not_attempted | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_black_portrait | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_siamese_pose | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_tortoiseshell | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_white_cat | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_bicolor | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_kitten | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_cropped_face | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_multi_cat | multi_cat | not_attempted | failed | failed | not_attempted | multi_subject, not_in_route_a2_ceiling_set |
| v36_public_longhair_gray | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_outdoor_shadow | complex_background | not_attempted | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, not_in_route_a2_ceiling_set, sample_intake_passed |

## Result
- Status: partial_scoped
- Sample count: 20
- Target-experience count: 4
- Engineering-only count: 11
- Blocked count: 0
- Failed count: 5
- Reason codes: generalization_matrix_scoped_only

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- passed scoped: generalization matrix records tested sample statuses and risks.
