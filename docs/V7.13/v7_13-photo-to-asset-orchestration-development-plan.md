# V7.13 Photo-To-Asset Orchestration Development Plan

status: accepted
date: 2026-06-01

## Goal

V7.13 turns the accepted V7.1-V7.12 building blocks into one guided user
workflow:

```text
local photo or traits
  -> user-approved safe traits
  -> 2D provider/guided generation path or external GLB import path
  -> generated asset staging
  -> manifest and GLTF/GLB validation
  -> import
  -> target PetInstance activation
  -> runtime verification prompt/evidence
```

The phase must not bypass consent, credential, validation, renderer, or
PetInstance isolation gates.

## Current Baseline

- V7.9 MiniMax explicit-consent image provider smoke: passed scoped.
- V7.10 generated 2D action pack assembly and target activation: passed scoped.
- V7.11 local GLB/GLTF intake contract: passed scoped.
- V7.12 tested local imported GLB/GLTF runtime mapping: passed scoped.

V7.13 can use these as accepted inputs, but it cannot turn them into broad
provider integration or automatic photo-to-3D readiness.

## Development Scope

Implement or document a guided orchestration layer that:

- creates a workflow session from local photo/traits without persisting raw photo
  bytes by default.
- records only user-approved safe traits and safe workflow step states.
- branches into:
  - 2D generated action pack path, using MiniMax/external image outputs already
    compatible with V7.10.
  - external GLB/GLTF import path, using files supplied by the user and validated
    by V7.11/V7.12 gates.
- stages generated/imported files under app-managed storage only after validation.
- imports the resulting manifest through the existing local import validation
  path.
- activates the selected pack to one target PetInstance only.
- preserves the previous active pack if any step fails.
- produces stable reason codes for blocked or failed steps.
- produces a sanitized evidence summary.

## Out Of Scope

- automatic photo-to-3D generation.
- default photo upload.
- provider ecosystem integration.
- remote asset loading.
- marketplace.
- production signed release.
- broad 3D readiness.
- modifying V3/V4 Codex monitoring semantics.

## Reason Codes

- `photo_not_selected`
- `traits_approval_required`
- `consent_required`
- `credential_missing`
- `provider_failed`
- `provider_output_missing`
- `provider_output_rejected`
- `external_asset_missing`
- `asset_validation_failed`
- `gltf_scan_failed`
- `manifest_import_failed`
- `activation_failed`
- `runtime_visual_not_observed`
- `previous_pack_preserved`
- `external_glb_import_passed`
- `real_provider_3d_branch_blocked`

## Implementation Targets

- A local orchestration model with step status:
  `not_started`, `ready`, `blocked`, `running`, `passed`, `failed`.
- A sanitized session summary for evidence and UI diagnostics.
- A CLI or script smoke that exercises:
  - accepted 2D generated pack path.
  - accepted external GLB/GLTF import path.
  - blocked provider/photo-to-3D path when no real 3D provider output exists.
  - failed validation path preserving the previous active pack.
- Desktop Manager copy and guidance text if UI changes are needed.

## Evidence

- `docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-2026-06-XX.md`
- `docs/V7.13/v7_13-final-acceptance-report.md`

## Allowed Claim

V7.13 photo-to-asset orchestration passed for tested local 2D generated asset
workflow and external GLB import workflow.

If no real 3D provider output exists, evidence must record both
`provider_output_missing` and `real_provider_3d_branch_blocked`. Do not use
ambiguous 3D pass wording; use `external GLB import workflow` for
local/user-supplied GLB evidence.

## Forbidden Claims

- automatic photo-to-3D ready.
- provider integration verified.
- remote generation ready.
- broad 3D ready.
- production signed release ready.
