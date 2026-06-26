# V35.2 Route A2 Quality Uplift Evidence

Date: 2026-06-25

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v35.md reviewed for V35.2 Route A2 quality uplift.
- Spec: docs/V35.x/v35_2-route-a2-quality-uplift-spec.md reviewed and mapped to this evidence.
- Boundary: named samples only; no arbitrary-cat, provider, production, Windows, or cross-platform readiness claim.

## Development Result
- Implemented local Route A2 uplift candidate generation from V34 generated packs.
- Uplift adds higher local part motion scores, action symbols, expression/pose cues, contact sheet refs, playback refs, and product path evidence.
- Route A2 remains named-sample scoped and local project-authored.

## Route A2 Assessments
| Route | Candidate | Sample | Rubric | QA | Avg Motion | Source | Reasons |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| route_a2_quality_uplift | v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_orange_tabby | target_experience | passed | 0.787 | local_project_authored | action_target_experience_thresholds_met |
| route_a2_quality_uplift | v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_calico | target_experience | passed | 0.787 | local_project_authored | action_target_experience_thresholds_met |

## Product Path Summary
| Candidate | Sample | QA | Preview | Apply | Rollback | Failed Candidate Blocked |
| --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_orange_tabby | passed | ready | applied | rolled_back | false |
| v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack | v34_clear_calico | passed | ready | applied | rolled_back | false |
| v34_clear_silver_tabby_v34_character_asset_v35_transform_only_negative | v34_clear_silver_tabby | failed | blocked | blocked | not-run | true |
| v34_clear_silver_tabby_v34_character_asset_v35_missing_action_negative | v34_clear_silver_tabby | failed | blocked | blocked | not-run | true |

## Visual Evidence Refs
- docs/V35.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack-contact-sheet.svg
- docs/V35.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack-playback-summary.html
- docs/V35.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack-contact-sheet.svg
- docs/V35.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack-playback-summary.html

## Decision
- Status: passed scoped
- Rationale: Route A2 uplift is evaluated by V35.1 rubric and V33/V34 product path; human visual review remains a residual risk.
## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed
