# V24 Multi-route Generation Orchestrator Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V24 verifies route registration, route budgets, safe candidate metadata, and
non-mutating orchestration. It does not run provider generation, does not run
V25 QA, does not preview/apply assets, and does not unlock V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
| V23 prerequisite evidence exists and passed | passed | docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md |
| all five routes represented | passed | route_a_provider_key_pose, route_b_provider_action_sheet, route_c_local_rig, route_d_image_to_video, route_e_local_fallback_style_pack |
| unsupported routes fail safely | passed | route_b/route_d return route_unavailable |
| provider credential missing is stable and redacted | passed | provider route blocked without credential value |
| local route creates safe candidate | passed | safeCandidateCount=2 |
| safe candidate metadata only | passed | actionCoverage,candidateId,rendererKind,safePackId / actionCoverage,candidateId,rendererKind,safePackId |
| attempt budgets enforced | passed | total=5/6 |
| failure does not mutate live pet | passed | no PetEvent, no notify, no CatStateMachine write, no live PetInstance mutation |
| desktop target test passed | passed | multi-route-generation-orchestrator.test.ts passed |
| security scan | passed | no credential, auth header, private file identifiers, provider body, image bytes, geodata |
| claim scan | passed | forbidden claims are not used as passed |

## Route Table

| Route | State | Reason codes | Candidate |
| --- | --- | --- | --- |
| route_a_provider_key_pose | blocked | provider_credential_missing, route_registered | none |
| route_b_provider_action_sheet | unavailable | route_registered, route_unavailable | none |
| route_c_local_rig | candidate_created | candidate_created, route_registered, safe_candidate_metadata_ready | v24_route_c_safe_pack |
| route_d_image_to_video | unavailable | route_registered, route_unavailable | none |
| route_e_local_fallback_style_pack | candidate_created | candidate_created, route_registered, safe_candidate_metadata_ready | v24_route_e_safe_pack |

## Safe Candidate Metadata

The route orchestrator exposes only candidateId, safePackId, rendererKind, and
actionCoverage for created candidates. Candidate output is not QA approved and
cannot be applied at V24.

## PRD / Spec Review

V24 satisfies the PRD requirement to avoid single-route dependency and to record
honest route states. V25 remains responsible for same-cat, motion, flicker, loop,
and V22 quality review gates.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Route candidate treated as QA approved asset | High | blocked by scope and candidate status |
| Provider unavailable treated as route passed | High | provider route uses blocked/unavailable reasonCodes |
| Route orchestration mutates live pet | High | smoke proves no mutation flags and no provider execution |
| Local fallback hides provider failure | Medium | provider routes retain explicit blocked/unavailable reasonCodes |

## Allowed Claim

V24 multi-route generation orchestrator passed for tested local route registration, safe candidate metadata, and non-mutating route state scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
