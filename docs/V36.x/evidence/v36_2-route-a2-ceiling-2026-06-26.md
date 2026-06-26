# V36.2 Route A2 Ceiling Evidence

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.2 Route A2 ceiling.
- Spec: docs/V36.x/v36_2-route-a2-ceiling-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_2-route-a2-ceiling-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Route A2 Ceiling Matrix
| sampleId | candidateId | difficulty | status | templateSimilarity | identityDifferentiation | localMotionCeiling | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | v36_orange_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.62 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_calico_public | v36_calico_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.655 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_silver_tabby_public | v36_silver_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.69 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_black_cat_public | v36_black_cat_public_v34_character_asset_v35_route_a2_uplift_pack | partial | blocked | 0.805 | 0.88 | 0.787 | action_target_experience_thresholds_met, route_a2_template_similarity_high, v34_qa_blocked |
| v36_siamese_public | v36_siamese_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.76 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_complex_background_public | v36_complex_background_public_v34_character_asset_v35_route_a2_uplift_pack | complex_background | blocked | 0.875 | 0.76 | 0.787 | action_target_experience_thresholds_met, complex_background_requires_manual_review, route_a2_template_similarity_high, v34_qa_blocked |

## Result
- Recommendation: route_a2_continue
- Target-experience count: 4
- Engineering-only count: 0
- Reason codes: route_a2_scoped_continue_supported

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- passed scoped: Route A2 ceiling is measured; target-quality risk remains scoped.
