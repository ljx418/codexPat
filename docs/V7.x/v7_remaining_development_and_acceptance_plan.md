# V7 Remaining Development And Acceptance Plan

status: V7.13-V7.15 passed scoped
date: 2026-06-01

## Current Baseline

- V7.0-V7.15 are accepted scoped.
- V7 remaining work is advanced personalized cat asset orchestration, visual QA,
  and evidence-matched final gate.
- V7 must not claim production release, broad provider integration, broad 3D
  readiness, or automatic photo-to-3D unless exact conditional evidence passes.

## Remaining Phase Outline

| Phase | Goal | Primary Output | Gate |
| --- | --- | --- | --- |
| V7.13 | Photo-to-asset orchestration | passed scoped with stable reason codes | 2D path and external GLB path passed; provider 3D branch blocked |
| V7.14 | Advanced visual QA | passed scoped screenshots/performance baseline | generated 2D and imported GLB/GLTF visibly passed for accepted paths |
| V7.15 | Advanced final gate | passed scoped final report and scans | final claim matches evidence exactly |

Go / No-Go:

- V7.13: passed scoped.
- V7.14: passed scoped.
- V7.15: passed scoped.

## V7.13 Development Plan

Implement or document a workflow coordinator that connects:

```text
approved safe traits
  -> generated 2D action pack path
  -> external GLB/GLTF import path
  -> validation
  -> target PetInstance activation
  -> sanitized evidence
```

Required behavior:

- preserve previous active pack on failure.
- use existing V7.10, V7.11, and V7.12 validation/runtime gates.
- never persist raw photo bytes by default.
- never log provider credentials, raw provider payload, prompt text, full local
  paths, raw manifest chunks, or raw GLTF chunks.
- report blocked real 3D provider output honestly.
- record `provider_output_missing` and `real_provider_3d_branch_blocked` when
  no real 3D provider output exists.
- avoid ambiguous 3D pass wording; use `external GLB import workflow passed`
  for local/user-supplied GLB evidence.

Acceptance document:

- `docs/V7.13/v7_13-acceptance-plan.md`

Evidence:

- `docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-YYYY-MM-DD.md`
- `docs/V7.13/v7_13-final-acceptance-report.md`

## V7.14 Development Plan

Implement or document the QA harness and operator checklist for:

- generated 2D action pack screenshots or recordings for all core actions.
- imported GLB/GLTF runtime nonblank and bounding-box evidence.
- 1x and 0.75x scale checks.
- CPU/memory baseline.
- delete/deactivate/revert/failure fallback checks.
- manual user acceptance.

V7.14 must read V7.13 final accepted paths. It must not run or claim provider 3D
visual QA if V7.13 marks the real provider branch blocked.

Acceptance document:

- `docs/V7.14/v7_14-acceptance-plan.md`

Evidence:

- `docs/V7.14/evidence/v7_14-advanced-visual-qa-YYYY-MM-DD.md`
- screenshots or recordings under `docs/V7.14/evidence/`
- `docs/V7.14/v7_14-final-acceptance-report.md`

## V7.15 Development Plan

Run the final advanced gate without adding new features.

Required checks:

- V7.13 passed for each claimed path.
- V7.14 passed for each claimed path.
- security scan passed.
- claim scan passed.
- license/attribution scan passed.
- artifact scan passed.
- regression smoke passed.
- final claim is the narrowest claim supported by evidence.
- final report includes the Claim Basis Table covering generated 2D path,
  external GLB import path, real 3D provider output, automatic photo-to-3D, and
  final allowed claim.

Acceptance document:

- `docs/V7.15/v7_15-acceptance-plan.md`

Evidence:

- `docs/V7.15/evidence/v7_15-advanced-productization-gate-smoke-YYYY-MM-DD.md`
- `docs/V7.15/v7_15-final-acceptance-report.md`

## Required Regression Commands

Run the applicable subset for each phase and the full set for V7.15:

```bash
pnpm run doctor
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v7_9_minimax_provider_smoke.mjs
node scripts/v7_10_generated_2d_action_pack_smoke.mjs
node scripts/v7_11_external_glb_intake_smoke.mjs
node scripts/v7_12_3d_runtime_action_mapping_smoke.mjs
node scripts/v7_13_photo_to_asset_orchestration_smoke.mjs
node scripts/v7_15_advanced_productization_gate_smoke.mjs
```

Commands that do not exist yet are implementation targets, not accepted evidence.

## Drift And False-Green Risk Assessment

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Fixture GLB is mistaken for real photo-to-3D provider output | High | V7.13/V7.15 must label provider 3D branch blocked unless real provider output exists |
| Visual screenshot exists but asset is transparent in real runtime | High | V7.14 requires nonblank, bounding-box, scale, and manual acceptance evidence |
| Import success is mistaken for runtime rendering success | High | V7.13 import evidence is insufficient without V7.14 runtime visual QA |
| Provider image smoke is mistaken for provider integration readiness | High | Claim matrix forbids provider integration verified |
| Raw photo/provider/path data leaks into evidence | High | security scan mandatory before acceptance |
| Final gate overclaims broad 3D readiness | High | V7.15 must choose the narrowest claim supported by evidence |

No phase may proceed to a passed final report while any High risk remains open.

## Audit File List

Primary documents for external review:

- `docs/V7.x/v7_remaining_target_architecture.md`
- `docs/V7.x/v7_remaining_target_architecture.drawio`
- `docs/V7.x/v7_remaining_development_and_acceptance_plan.md`
- `docs/V7.x/v7_x-development-plan.md`
- `docs/V7.x/v7_x-acceptance-plan.md`
- `docs/V7.x/v7_x-claim-matrix.md`
- `docs/V7.x/v7_x-current-gap-analysis.md`
- `docs/V7.x/v7_x-evidence-index.md`
- `docs/V7.13/v7_13-photo-to-asset-orchestration-development-plan.md`
- `docs/V7.13/v7_13-acceptance-plan.md`
- `docs/V7.13/v7_13-claim-matrix.md`
- `docs/V7.14/v7_14-advanced-visual-qa-development-plan.md`
- `docs/V7.14/v7_14-acceptance-plan.md`
- `docs/V7.14/v7_14-claim-matrix.md`
- `docs/V7.15/v7_15-acceptance-plan.md`
- `docs/V7.15/v7_15-claim-matrix.md`
