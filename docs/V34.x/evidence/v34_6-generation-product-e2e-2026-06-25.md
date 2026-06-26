# V34.6 Generation Product E2E Evidence

Phase: V34.6
Date: 2026-06-25

## PRD / Spec Review
- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.
- Reviewed: `docs/V34.x/v34-target-architecture.md`.
- Reviewed: `docs/V34.x/v34-development-and-acceptance-plan.md`.
- Reviewed: `docs/V34.x/v34_6-generation-product-e2e-spec.md`.
- Audit opinion: V34.6 may start from V34.5 Route A2 passed candidates only; Route B is recorded for later comparison and is not executed here.

## Development Action
- Added a V34 product-path gate that treats `V34GenerationQaResult.overallStatus` as the highest acceptance boundary.
- A candidate can enter V33 preview/apply/rollback only when V34 QA is `passed`.
- Failed Route A2 candidates, including transform-only and missing-target-action candidates, are blocked before preview and apply.

## Acceptance Action
- Two named Route A2 candidates entered preview, target-only apply, and rollback.
- Transform-only negative and missing-target-action negative were blocked.
- Product flow preserved default and unrelated pet assignments.
- Evidence uses safe IDs and relative refs only.

## Result Summary
- Passed character contracts: 3
- Passed Route A2 candidates: 2
- Preview ready count: 2
- Applied count: 2
- Rolled back count: 2
- Blocked failed-candidate count: 2
- Target-only apply passed: true
- Rollback passed: true
- Diagnostics safe: true
- Decision: passed scoped for V34.6 product E2E

## Product Path Table
| candidateId | sampleId | characterAssetId | V34 QA | preview | apply | rollback | failedCandidateBlocked | diagnosticsSafe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | v34_clear_orange_tabby | v34_clear_orange_tabby_v34_character_asset | passed | ready | applied | rolled_back | false | true |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | v34_clear_calico | v34_clear_calico_v34_character_asset | passed | ready | applied | rolled_back | false | true |
| v34_clear_silver_tabby_v34_character_asset_v34_route_a2_pack | v34_clear_silver_tabby | v34_clear_silver_tabby_v34_character_asset | failed | blocked | blocked | not-run | true | true |
| v34_clear_silver_tabby_v34_character_asset_v34_route_a2_pack | v34_clear_silver_tabby | v34_clear_silver_tabby_v34_character_asset | failed | blocked | blocked | not-run | true | true |

## Target Action Table
| candidateId | V34 target action | runtime core projection | frames | localPartMotionScore | transformOnly |
| --- | --- | --- | --- | --- | --- |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | idle | idle | 12 | 0.22 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | walk | running | 12 | 0.72 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | jump | success | 8 | 0.72 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | sleep | sleeping | 12 | 0.22 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | eat | need_input | 8 | 0.72 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | play | thinking | 12 | 0.72 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | alert | warning | 8 | 0.72 | false |
| v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack | celebrate | error | 8 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | idle | idle | 12 | 0.22 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | walk | running | 12 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | jump | success | 8 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | sleep | sleeping | 12 | 0.22 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | eat | need_input | 8 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | play | thinking | 12 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | alert | warning | 8 | 0.72 | false |
| v34_clear_calico_v34_character_asset_v34_route_a2_pack | celebrate | error | 8 | 0.72 | false |

## Visual Evidence Refs
- v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack contact sheet: `docs/V34.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack-contact-sheet.svg`
- v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack playback summary: `docs/V34.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack-playback-summary.html`
- v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack manifest: `docs/V34.x/evidence/derivatives/v34_clear_orange_tabby_v34_character_asset_v34_route_a2_pack-manifest.json`
- v34_clear_calico_v34_character_asset_v34_route_a2_pack contact sheet: `docs/V34.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v34_route_a2_pack-contact-sheet.svg`
- v34_clear_calico_v34_character_asset_v34_route_a2_pack playback summary: `docs/V34.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v34_route_a2_pack-playback-summary.html`
- v34_clear_calico_v34_character_asset_v34_route_a2_pack manifest: `docs/V34.x/evidence/derivatives/v34_clear_calico_v34_character_asset_v34_route_a2_pack-manifest.json`

## Route B Comparison Note
- Route B remains a professional-assisted quality fallback candidate.
- V34.6 did not execute Route B and did not use it as product-path input.
- V34.7/V34.8 must compare whether Route B could produce better user-visible motion quality.

## Claim Scan
- Status: passed
- Boundary: named sample Route A2 product preview/apply/rollback only.

## Security Scan
- Status: passed
- Boundary: safe sample IDs, safe candidate IDs, relative evidence refs, no source image payloads.

## Narrow Claim
V34.6 may claim scoped target-isolated preview, apply, and rollback for two named Route A2 candidates.
