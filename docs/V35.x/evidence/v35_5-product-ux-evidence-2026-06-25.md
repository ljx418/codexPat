# V35.5 Product UX Evidence

Date: 2026-06-25

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v35.md reviewed for V35.5 product UX evidence.
- Spec: docs/V35.x/v35_5-product-ux-evidence-spec.md reviewed and mapped to this evidence.
- Boundary: named samples only; no arbitrary-cat, provider, production, Windows, or cross-platform readiness claim.

## User-Visible Scenario Table
| Candidate | Sample | QA | Preview | Apply | Rollback | Failed Candidate Blocked |
| --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_orange_tabby | passed | ready | applied | rolled_back | false |
| v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_calico | passed | ready | applied | rolled_back | false |
| v34_clear_silver_tabby_v34_character_asset_v35_transform_only_negative | v34_clear_silver_tabby | failed | blocked | blocked | not-run | true |
| v34_clear_silver_tabby_v34_character_asset_v35_missing_action_negative | v34_clear_silver_tabby | failed | blocked | blocked | not-run | true |

## Route Assessments
| Route | Candidate | Sample | Rubric | QA | Avg Motion | Source | Reasons |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| route_a2_quality_uplift | v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_orange_tabby | target_experience | passed | 0.787 | local_project_authored | action_target_experience_thresholds_met |
| route_a2_quality_uplift | v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_calico | target_experience | passed | 0.787 | local_project_authored | action_target_experience_thresholds_met |
| route_b_professional_assisted | v34_clear_orange_tabby_v34_character_asset_v35_route_b_blocked_candidate | v34_clear_orange_tabby | blocked | failed | 0.787 | blocked_not_executed | action_target_experience_thresholds_met, route_b_source_boundary_blocked, v34_qa_failed, visual_evidence_missing |
| route_b_professional_assisted | v34_clear_calico_v34_character_asset_v35_route_b_blocked_candidate | v34_clear_calico | blocked | failed | 0.787 | blocked_not_executed | action_target_experience_thresholds_met, route_b_source_boundary_blocked, v34_qa_failed, visual_evidence_missing |

## HTML Report
- docs/V35.x/evidence/v35_5-product-ux-report-2026-06-25.html

## Decision
- Status: passed scoped
- Rationale: accepted Route A2 candidates can preview, target-apply, and rollback; Route B/failed candidates cannot silently apply.
## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed
