# V7.13 Final Acceptance Report

status: passed
date: 2026-06-01

## Scope

Photo-to-asset orchestration for tested local 2D generated and external GLB import workflows.

Allowed scoped claim after passed evidence:

```text
V7.13 photo-to-asset orchestration passed for tested local 2D generated asset workflow and external GLB import workflow.
```

Forbidden claims from this report:

- automatic photo-to-3D ready.
- provider integration verified.
- broad 3D ready.

## Required Results

- 2D generated workflow: passed using accepted V7.10 MiniMax-generated local
  sprite fixture through import and target activation.
- External GLB import workflow: passed using accepted local GLB fixture through
  import and target activation.
- Optional real 3D provider workflow, or explicit blocked/deferred result:
  blocked because no real 3D provider output was supplied.
- If no real 3D provider output exists:
  - `provider_output_missing`: recorded.
  - `real_provider_3d_branch_blocked`: recorded.
- Stable reason codes: passed.
- Failure preserves active pack: passed with invalid manifest rejection.
- Target PetInstance isolation: passed; default and unrelated pets unchanged.
- Redaction scan: passed.
- Claim scan: passed; forbidden claims appear only in forbidden/not-ready
  contexts.

## Evidence

- `docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-2026-06-01.md`

## Automatic Checks

- `pnpm --filter desktop test`: passed.
- `pnpm --filter desktop check`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed.
- `node scripts/v7_11_external_glb_intake_smoke.mjs`: passed.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v7_13_photo_to_asset_orchestration_smoke.mjs`: passed.

V7.10 and V7.12 accepted evidence were used as scoped baselines. V7.13 used the
real local V7.10 generated sprite fixture and the real local V5.12/V7.12 GLB
fixture. No new provider 3D output was supplied.

## Final Decision

Passed for scoped V7.13 orchestration.

Allowed claim:

```text
V7.13 photo-to-asset orchestration passed for tested local 2D generated asset workflow and external GLB import workflow.
```

No automatic photo-to-3D claim is allowed from this report unless real photo
input, real 3D provider output, GLTF deep scan, runtime mapping, and V7.14 visual
QA all pass.

Do not use ambiguous 3D pass wording. Use `external GLB import workflow passed`
for user-supplied/local GLB evidence, and
`real_provider_3d_branch_blocked` when no real 3D provider output exists.

## Next Phase Gate

V7.14 may proceed to planning/implementation only for the V7.13 accepted paths:

- generated 2D local sprite path.
- external GLB import path.

V7.14 must not fabricate provider 3D visual QA because V7.13 recorded the real
provider 3D branch as blocked.
