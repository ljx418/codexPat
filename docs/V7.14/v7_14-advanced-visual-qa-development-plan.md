# V7.14 Advanced Visual QA Development Plan

status: accepted
date: 2026-06-01

## Goal

Collect user-visible, nonblank, bounded, and action-distinguishable evidence for
generated 2D action packs and imported GLB/GLTF runtime assets.

V7.14 is a QA phase. It must not add provider integration, marketplace behavior,
or production release packaging.

V7.14 depends on V7.13 final accepted path evidence. It may only test the paths
that V7.13 passed and claimed. If V7.13 marks the real provider photo-to-3D
branch as blocked, V7.14 must not create provider 3D visual QA evidence.

## Development Scope

- Capture screenshots or short recordings for all core actions:
  `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`,
  `sleeping`.
- Verify generated 2D assets are visible and action changes are distinguishable
  by a human reviewer.
- Verify imported GLB/GLTF runtime is nonblank, in-frame, and stable at 1x and
  0.75x scale.
- Record CPU and memory baseline for idle and active animation.
- Verify delete, deactivate, failed activation, corrupt asset fallback, and
  restore-default flows leave a visible safe cat.
- Verify success does not override active `error` or `need_input` priority state.
- Record manual user acceptance or explicit visual rejection.

## Test Matrix

| Asset Type | Required Checks |
| --- | --- |
| Generated 2D sprite pack | all core actions visible, action changes distinguishable, no transparent state after switch/delete/revert |
| Imported GLB/GLTF pack | nonblank canvas/model, bounding box in viewport, 1x and 0.75x scale, corrupt fallback to CSS |
| Default CSS fallback | remains visible after invalid pack activation, deleted pack, and renderer mismatch |

## Quantitative Targets

- Nonblank rendered area is greater than 1 percent of the pet viewport for GLB
  and sprite visual captures.
- Rendered bounding box remains inside viewport with at least 4 px margin where
  screenshot tooling can measure it.
- Each recorded action sample is at least 3 seconds or includes at least one
  stable screenshot after action state settles.
- CPU and memory baselines are recorded for idle and active animation. If numeric
  thresholds are not yet enforceable, V7.14 must label them as baseline values,
  not performance readiness.

## Evidence

- `docs/V7.14/evidence/v7_14-advanced-visual-qa-YYYY-MM-DD.md`
- screenshot or recording files under `docs/V7.14/evidence/`
- renderer input snapshots with safe fields only

## Allowed Claim

V7.14 advanced visual QA passed for tested generated 2D and imported GLB/GLTF cat
asset scenarios.

## Forbidden Claims

- production visual quality ready.
- broad 3D ready.
- marketplace ready.
- provider integration verified.
