# V35.4 Same-Sample Route Comparison Evidence

Date: 2026-06-25

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v35.md reviewed for V35.4 same-sample route comparison.
- Spec: docs/V35.x/v35_4-same-sample-route-comparison-spec.md reviewed and mapped to this evidence.
- Boundary: named samples only; no arbitrary-cat, provider, production, Windows, or cross-platform readiness claim.

## Comparison Table
| Sample | Route A2 Candidate | Route A2 Status | Route B Candidate | Route B Status | Winner | Reasons |
| --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby | v34_clear_orange_tabby_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v34_clear_orange_tabby_v34_character_asset_v35_route_b_blocked_candidate | blocked | route_b_blocked | route_b_blocked |
| v34_clear_calico | v34_clear_calico_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v34_clear_calico_v34_character_asset_v35_route_b_blocked_candidate | blocked | route_b_blocked | route_b_blocked |

## Decision
- Status: passed scoped
- Rationale: both routes are evaluated against the same sample IDs and V35.1 rubric; Route B remains blocked when no professional asset is available.
## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed
