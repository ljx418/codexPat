# V7.13 Photo-To-Asset Orchestration Smoke

status: passed
date: 2026-06-01

## Scope

This smoke validates V7.13 orchestration for tested local 2D generated asset workflow and external GLB import workflow.

It does not claim automatic photo-to-3D ready, provider integration verified, broad 3D ready, remote generation ready, or production signed release ready.

## Runtime Data Used

- generated 2D action pack: accepted V7.10 MiniMax-generated local sprite fixture.
- external GLB import: accepted V5.12/V7.12 local GLB runtime fixture.
- photo reference: local fixture metadata through privacy boundary only.
- real provider 3D branch: blocked because no real 3D provider output was supplied.

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| desktop V7.13 unit coverage | passed | ok |
| desktop typecheck | passed | ok |
| photo privacy boundary | passed | reasonCode=photo_privacy_boundary_ok; safeFields=extension,mediaType,provided,sizeBucket |
| user-approved trait prompt pack | passed | reasonCode=trait_prompt_pack_ok; renderer=sprite; actionCount=8 |
| 2D generated asset import | passed | packId=v7-10-minimax-orange-tabby-actions; renderer=sprite; assets=8; instanceId=n/a |
| 2D generated target activation | passed | packId=v7-10-minimax-orange-tabby-actions; renderer=sprite; assets=0; instanceId=codex_v713_sprite |
| external GLB import | passed | packId=v5-12-runtime-gltf; renderer=gltf; assets=8; instanceId=n/a |
| external GLB target activation | passed | packId=v5-12-runtime-gltf; renderer=gltf; assets=0; instanceId=codex_v713_gltf |
| invalid import preserves previous active pack | passed | reasonCode=asset_manifest_forbidden_content; previousPackPreserved=true |
| target isolation | passed | defaultUnchanged=true; unrelatedPetsUnchanged=true |
| orchestration summary | passed | status=passed; reasonCodes=asset_validation_failed,external_glb_import_passed,orchestration_passed,previous_pack_preserved,provider_output_missing,real_provider_3d_branch_blocked |

## Orchestration Summary

- status: `passed`
- allowed claim: `V7.13 photo-to-asset orchestration passed for tested local 2D generated asset workflow and external GLB import workflow.`
- reason codes: `asset_validation_failed, external_glb_import_passed, orchestration_passed, previous_pack_preserved, provider_output_missing, real_provider_3d_branch_blocked`
- generated 2D path: `passed`
- external GLB import path: `passed`
- real provider 3D branch: `blocked`
- provider branch reason: `provider_output_missing, real_provider_3d_branch_blocked`
- previous active pack preserved: `true`
- default unchanged: `true`
- unrelated pets unchanged: `true`

## Security Redaction

Evidence records safe field names, reason codes, pack IDs, renderer kinds, and target instance IDs only.

It excludes raw photo bytes, EXIF/GPS, prompt text, raw provider responses, tokens, Authorization values, full local paths, workspace paths, config paths, raw manifest JSON chunks, and raw GLTF JSON chunks.

## Final Decision

Passed for V7.13 scoped orchestration. The real provider photo-to-3D branch remains blocked with `provider_output_missing` and `real_provider_3d_branch_blocked`.
