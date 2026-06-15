# V7.15 Acceptance Plan

status: accepted
date: 2026-06-01

## Required Gates

- V7.8 accepted.
- V7.9 provider result passed or explicitly blocked/excluded.
- V7.10 generated 2D action pack passed if 2D generated workflow is claimed.
- V7.11 GLB/GLTF intake passed if 3D import workflow is claimed.
- V7.12 runtime 3D mapping passed if runtime 3D mapping is claimed.
- V7.13 orchestration passed for each claimed path.
- V7.14 visual QA passed for each claimed path.
- Security scan passed.
- Claim scan passed.
- License/attribution scan passed.
- Artifact scan passed.
- Regression smoke passed.

## Final Claim Selection

V7.15 must select the narrowest claim supported by evidence:

- If only generated 2D and external GLB/GLTF import paths pass, the final claim
  must be scoped to tested local generated 2D and imported GLB/GLTF runtime
  scenarios.
- If the real 3D provider/photo-to-3D branch is blocked, the final report must
  say automatic photo-to-3D remains not-ready.
- If real photo input, real 3D provider output, GLTF deep scan, runtime mapping,
  and V7.14 visual QA all pass, V7.15 may use the conditional tested-provider
  photo-to-3D claim from `docs/V7.13/v7_13-claim-matrix.md`.

## Required Regression

- `node scripts/v7_1_photo_intake_privacy_smoke.mjs`
- `node scripts/v7_2_trait_prompt_pack_smoke.mjs`
- `node scripts/v7_3_external_generation_instruction_smoke.mjs`
- `node scripts/v7_4_provider_consent_boundary_smoke.mjs`
- `node scripts/v7_5_generated_asset_import_gltf_scan_smoke.mjs`
- `node scripts/v7_6_action_mapping_runtime_smoke.mjs`
- `node scripts/v7_7_productization_gate_smoke.mjs`
- `node scripts/v7_13_photo_to_asset_orchestration_smoke.mjs`
- `node scripts/v7_14_advanced_visual_qa_smoke.mjs`, or explicit review of
  V7.14 manual visual evidence if the visual QA remains manual.
- `pnpm --filter desktop check`
- `pnpm --filter desktop build`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`

## Blocking Rule

V7.15 cannot convert a blocked provider path, blocked 3D path, or external-only import path into automatic photo-to-3D readiness.

V7.15 cannot pass if evidence contains token, Authorization, raw provider
payload, raw photo bytes, EXIF/GPS, prompt text, tool command text, full local
path, workspace path, config path, raw manifest JSON chunk, or raw GLTF JSON
chunk.

## Go / No-Go

- V7.13: passed scoped.
- V7.14: passed scoped.
- V7.15: passed scoped.
