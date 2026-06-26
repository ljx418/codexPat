# V36.4 Same-Sample Route Comparison Evidence

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.4 same-sample comparison.
- Spec: docs/V36.x/v36_4-route-comparison-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_4-route-comparison-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Same-Sample Comparison Matrix
| sampleId | routeA2CandidateId | routeA2Status | routeBCandidateId | routeBStatus | winner | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | v36_orange_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v36_orange_tabby_public_route_b | blocked | route_b_blocked | route_b_blocked |
| v36_calico_public | v36_calico_public_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v36_calico_public_route_b | blocked | route_b_blocked | route_b_blocked |

## Result
- Status: blocked_scoped
- Completed comparison count: 0
- Reason codes: route_b_blocked_no_same_sample_comparison

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- blocked scoped: same-sample Route A2 / Route B comparison cannot pass because Route B assets are unavailable.
