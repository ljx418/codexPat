# V34.5 Rig/Frame Synthesis Evidence

Phase: V34.5
Date: 2026-06-25

## PRD / Spec Review
- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.
- Reviewed: `docs/V34.x/v34-target-architecture.md`.
- Reviewed: `docs/V34.x/v34-risk-burndown-and-route-decision.md`.
- Reviewed: `docs/V34.x/v34_5-rig-frame-synthesis-spec.md`.
- Route decision: Route A2 dual action contract selected; Route B professional assisted import is recorded as quality fallback for later acceptance comparison.
- Audit opinion: no fatal or major V34.5 Route A2 spec deviation found after explicit target/runtime action split.

## Development Action
- Implemented `V34RigFrameSeed`, `V34GeneratedActionPack`, target action records, runtime core projection, and `V34GenerationQaResult`.
- V34 target actions remain `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, `celebrate`.
- Runtime core projection remains `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping` for current V30/V31/V32/V33 gates.
- The mapping is a compatibility projection, not a semantic equivalence claim.

## Acceptance Action
- Two different named characterAssetId values produced Route A2 generated action candidates.
- Each passed candidate has all 8 V34 target actions and all 8 runtime projection actions.
- Contact sheet, playback summary, and manifest refs were generated as sanitized local evidence files.
- Transform-only negative candidate is rejected by V34/V30/V31/V32/V33 gates.
- Route B is not executed in this phase; it remains recorded for later target-quality comparison.

## Result Summary
- Passed upstream character contracts: 3
- Generated packs: 3
- Passed packs by V34 structure: 2
- Passed packs by V34/V30/V31/V32/V33 QA: 2
- Failed packs: 1
- Distinct passed character assets: 2
- Target action coverage passed: true
- Runtime projection coverage passed: true
- Route B quality fallback recorded: true
- Internal forbidden-content flag: false
- Decision: passed scoped for V34.5 Route A2 named-sample rig/frame synthesis candidates.

## Generated Pack Status
| candidateId | characterAssetId | status | V34 target actions | runtime projection actions | contactSheetEvidenceRef | Route B fallback recorded | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | v34_clear_orange_tabby_v34_character_asset | passed | idle, walk, jump, sleep, eat, play, alert, celebrate | idle, thinking, running, success, warning, error, need_input, sleeping | docs/V34.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack-contact-sheet.svg | true | sample_intake_passed |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | v34_clear_calico_v34_character_asset | passed | idle, walk, jump, sleep, eat, play, alert, celebrate | idle, thinking, running, success, warning, error, need_input, sleeping | docs/V34.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v34_route_a2_pack-contact-sheet.svg | true | sample_intake_passed |
| v34_clear_silver_tabby_v34_character_asset_v34_route_a2_pack | v34_clear_silver_tabby_v34_character_asset | failed | idle, walk, jump, sleep, eat, play, alert, celebrate | idle, thinking, running, success, warning, error, need_input, sleeping | docs/V34.x/evidence/derivatives/v34_clear_silver_tabby_v34_character_asset_v34_route_a2_pack-contact-sheet.svg | true | whole_image_transform |

## QA Status
| candidateId | overall | V30 semantic | V31 art | V32 frame | V33 identity | V34 reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | passed | passed | passed | passed | passed | sample_intake_passed |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | passed | passed | passed | passed | passed | sample_intake_passed |
| v34_clear_silver_tabby_v34_character_asset_v34_route_a2_pack | failed | failed | failed | failed | passed | generation_chain_incomplete, same_pack_reuse_identity_drift, weak_motion, whole_image_transform |

## Route B Comparison Note
- Route B remains a professional-assisted fallback candidate for target visual quality.
- Current Route A2 pass is scoped to local deterministic synthesis records and generated evidence refs.
- V34.7/V34.8 must compare whether Route B would produce better user-visible art/motion quality before any final claim.

## Claim Scan
- Status: passed
- Boundary: Route A2 named sample rig/frame synthesis candidates only.

## Security Scan
- Status: passed
- Boundary: evidence records use safe sample IDs, safe candidate IDs, safe action IDs, and relative evidence refs only.

## Narrow Claim
V34.5 may claim scoped Route A2 rig/frame synthesis candidates for named samples only.
