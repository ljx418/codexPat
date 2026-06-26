# V36.6 Human Visual Review Evidence

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.6 human visual review gate.
- Spec: docs/V36.x/v36_6-human-visual-review-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_6-human-visual-review-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Human Visual Review Table
| sampleId | identityScore | motionReadabilityScore | visualPolishScore | conflictWithAutomatedScore | finalStatus | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | 0.88 | 0.79 | 0.82 | false | target_experience | sample_intake_passed |
| v36_calico_public | 0.88 | 0.79 | 0.82 | false | target_experience | sample_intake_passed |
| v36_silver_tabby_public | 0.88 | 0.79 | 0.82 | false | target_experience | sample_intake_passed |
| v36_black_cat_public | 0.72 | 0.79 | 0.72 | false | engineering_only | human_review_not_target_experience, sample_intake_passed |
| v36_siamese_public | 0.88 | 0.79 | 0.82 | false | target_experience | sample_intake_passed |
| v36_longhair_public | 0.3 | 0.48 | 0.62 | false | failed | human_review_not_target_experience, insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_tail_hidden_public | 0.3 | 0.48 | 0.62 | false | failed | human_review_not_target_experience, insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_complex_background_public | 0.72 | 0.79 | 0.62 | false | engineering_only | complex_background_generalization_risk, human_review_not_target_experience, sample_intake_passed |
| v36_public_ginger_profile | 0.72 | 0.48 | 0.82 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_calico_yawning | 0.72 | 0.48 | 0.62 | false | engineering_only | complex_background_generalization_risk, human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_black_portrait | 0.72 | 0.48 | 0.72 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_siamese_pose | 0.72 | 0.48 | 0.82 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_tortoiseshell | 0.72 | 0.48 | 0.72 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_white_cat | 0.72 | 0.48 | 0.72 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_bicolor | 0.72 | 0.48 | 0.82 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_kitten | 0.72 | 0.48 | 0.72 | false | engineering_only | human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_cropped_face | 0.3 | 0.48 | 0.62 | false | failed | human_review_not_target_experience, insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_multi_cat | 0.3 | 0.48 | 0.62 | false | failed | human_review_not_target_experience, multi_subject, not_in_route_a2_ceiling_set |
| v36_public_longhair_gray | 0.3 | 0.48 | 0.62 | false | failed | human_review_not_target_experience, insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_outdoor_shadow | 0.72 | 0.48 | 0.62 | false | engineering_only | complex_background_generalization_risk, human_review_not_target_experience, not_in_route_a2_ceiling_set, sample_intake_passed |

## Result
- Status: partial_scoped
- Target-experience count: 4
- Conflict count: 0
- Reason codes: human_review_completed

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- passed scoped: human review gate is applied and conflicts are recorded.
