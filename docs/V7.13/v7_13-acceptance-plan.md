# V7.13 Acceptance Plan

status: accepted
date: 2026-06-01

## Objective

V7.13 accepts only the orchestration layer that connects previously accepted
V7.9-V7.12 capabilities into a guided workflow. It does not by itself prove
automatic photo-to-3D generation, provider integration, or broad 3D readiness.

## Required Test Data

- One local user-provided or fixture cat reference photo, used only through the
  V7 privacy boundary.
- One approved safe trait set derived from user review.
- One accepted generated 2D action pack compatible with V7.10.
- One accepted local GLB/GLTF asset compatible with V7.11/V7.12.
- One intentionally invalid asset or manifest for failure preservation testing.

Evidence must record safe field names, workflow step names, reason codes, target
PetInstance ID, renderer kind, and sanitized pass/fail decisions only.

## Acceptance Matrix

| Case | Expected Result | Required Evidence |
| --- | --- | --- |
| 2D generated path | approved traits lead to generated/imported sprite pack activation on one target PetInstance | workflow step summary, manifest validation result, activation result, target instance state |
| External GLB/GLTF import path | supplied GLB/GLTF passes deep scan, imports, activates, and renders through accepted V7.12 runtime path | GLTF scan decision, import result, activation result, runtime verification prompt |
| No real 3D provider output | provider photo-to-3D branch returns blocked/deferred, not success | `provider_output_missing` and `real_provider_3d_branch_blocked` |
| Validation failure | previous active pack remains active and target pet does not become transparent | previous pack ID preserved, stable failure reason |
| Target isolation | only target PetInstance receives the activated pack | default and unrelated pets unchanged |
| Redaction | diagnostics and evidence contain no sensitive fields | security scan result |

## Mandatory Checks

- 2D path starts from approved safe traits and does not persist raw photo bytes by
  default.
- External GLB/GLTF path uses existing GLTF deep scan before import or
  activation.
- Real provider/photo-to-3D path is blocked unless a real 3D provider output is
  available and passes the full V7.11/V7.12 chain.
- Any failed step preserves the previous active pack.
- Diagnostics use stable reason codes:
  `traits_approval_required`, `consent_required`, `provider_output_missing`,
  `provider_output_rejected`, `asset_validation_failed`, `gltf_scan_failed`,
  `manifest_import_failed`, `activation_failed`, `previous_pack_preserved`,
  `external_glb_import_passed`, `real_provider_3d_branch_blocked`.
- Evidence must avoid ambiguous 3D pass wording. Use
  `external_glb_import_passed` for local/user-supplied GLB import and
  `real_provider_3d_branch_blocked` when no real 3D provider output exists.
- Evidence and logs do not contain raw photo bytes, EXIF/GPS, prompt text, raw
  provider responses, tokens, Authorization values, full local paths, workspace
  paths, config paths, raw manifest JSON chunks, or raw GLTF JSON chunks.

## Regression Requirements

Run or explicitly document why not applicable:

```bash
node scripts/v7_9_minimax_provider_smoke.mjs
node scripts/v7_10_generated_2d_action_pack_smoke.mjs
node scripts/v7_11_external_glb_intake_smoke.mjs
node scripts/v7_12_3d_runtime_action_mapping_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop check
```

## Evidence

- `docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-YYYY-MM-DD.md`
- `docs/V7.13/v7_13-final-acceptance-report.md`

## Blocking Rule

Automatic photo-to-3D can only be claimed if a real photo input, real 3D provider
output, GLTF deep scan, runtime action mapping, and visual QA all pass. Without
that exact chain, V7.13 can only pass the scoped 2D generated workflow and
external GLB import workflow.

## Go / No-Go

- V7.13: passed scoped.
- V7.14: passed scoped after V7.13 accepted path evidence.
- V7.15: passed scoped after V7.13 and V7.14 final reports.
