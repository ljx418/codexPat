# V7.x Acceptance Plan

status: V7.0-V7.15 accepted scoped

date: 2026-06-01

## Acceptance Principle

V7 acceptance requires product workflow evidence with real local test data, not only unit tests.

V7.0-V7.7 scoped acceptance is complete. The retained baseline below describes the regression set used by the V7.7 gate and should be rerun for future post-V7 changes.

V7.8 advanced scope acceptance is complete. V7.9 MiniMax provider smoke is accepted scoped. V7.10 generated 2D action pack assembly and target runtime activation are accepted scoped. V7.11 local GLB/GLTF intake contract is accepted scoped. V7.12 tested local imported GLB/GLTF runtime action mapping is accepted scoped. V7.13 photo-to-asset orchestration is accepted scoped for tested local 2D generated and external GLB import paths. V7.14 advanced visual QA is accepted scoped for the V7.13 accepted paths. V7.15 advanced final gate is accepted scoped with the narrowest evidence-matched claim. Generated action packs cannot be built from mocks. Broader GLB/GLTF runtime 3D readiness still requires future visual/product evidence beyond the scoped V7.12 local fixture scenario.

Detailed V7.13-V7.15 acceptance criteria are defined in
`docs/V7.x/v7_remaining_development_and_acceptance_plan.md`.

Each phase must prove:

- user-visible workflow works for the stated scenario.
- privacy and redaction boundary holds.
- generated/imported assets pass validation before runtime.
- default and unrelated pets are not affected.
- forbidden claims remain forbidden.

## Required Regression Baseline

```bash
pnpm run doctor
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v5_12_runtime_imported_pack_smoke.mjs
node scripts/v5_13_guided_workflow_smoke.mjs
node scripts/v5_14_provider_feasibility_smoke.mjs
```

V7.7 also reruns V3/V4/V5/V6 retained smoke where practical.

## Security Scan

Evidence, logs, screenshots, diagnostic exports, prompts, generated manifests, and renderer snapshots must not include:

```text
token
Authorization
provider credential
raw photo bytes
EXIF/GPS
raw provider response
raw prompt history
prompt text in renderer payload
tool command text
terminal text
full /Users path
workspace path
config path
api-token.json
remote URL in local asset manifest
external GLTF resource URI
```

## Phase Acceptance Summary

| Phase | Must Pass |
| --- | --- |
| V7.0 | scope frozen, claim matrix complete |
| V7.1 | no-upload photo intake, no raw photo persistence |
| V7.2 | prompt pack covers all core actions using user-approved traits |
| V7.3 | external generation instructions and import checklist are usable |
| V7.4 | provider consent boundary redacts credentials and raw responses |
| V7.5 | generated sprite/GLTF packs import only after deep validation |
| V7.6 | generated pack maps to runtime actions per PetInstance |
| V7.7 | final visual QA, regression, security, claim, license, artifact scans pass |
| V7.8 | passed: PRD, gap, claim, and evidence docs agree on advanced gated scope |
| V7.9 | passed: MiniMax credential boundary, explicit consent, provider terms flag, redacted adapter/smoke, and live image output |
| V7.10 | passed: generated 2D action pack covers all core actions and is visible at runtime for one target PetInstance |
| V7.11 | passed scoped: real local GLB/GLTF asset passes deep scan and intake contract; no photo-to-3D/provider claim |
| V7.12 | passed scoped: imported GLB/GLTF runtime mapping with 1x/0.75x visual evidence, action-state evidence, isolation, and corrupt fallback |
| V7.13 | passed: orchestration for tested local 2D generated and external GLB import paths, with provider 3D branch blocked |
| V7.14 | passed: generated 2D and imported GLB/GLTF visual QA evidence with nonblank, scale, fallback, safe renderer snapshot, and agent visual acceptance checks |
| V7.15 | passed: final advanced claim matches actual evidence and security/claim/license/artifact scans pass |

## Planned Advanced Smoke Commands

```bash
node scripts/v7_11_external_glb_intake_smoke.mjs
node scripts/v7_12_3d_runtime_action_mapping_smoke.mjs
node scripts/v7_13_photo_to_asset_orchestration_smoke.mjs
node scripts/v7_15_advanced_productization_gate_smoke.mjs
```

V7.9, V7.10, V7.11, and V7.12 checks have passed with scoped real-data
evidence. Remaining planned commands must not be marked passed until implemented
and run with the required real data.

## Failure Policy

If a phase fails:

- do not broaden the claim.
- do not skip to Productization Gate.
- return to the phase plan and correct the acceptance gap.
