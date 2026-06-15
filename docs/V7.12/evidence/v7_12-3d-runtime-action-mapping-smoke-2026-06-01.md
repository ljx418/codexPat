# V7.12 3D Runtime Action Mapping Smoke Evidence

status: passed
date: 2026-06-01

## Scope

This evidence covers the tested local imported GLB/GLTF runtime path only.
It does not claim broad 3D readiness, automatic photo-to-3D readiness, provider
integration readiness, marketplace readiness, or production release readiness.

## Runtime Setup

- Desktop health: passed.
- Active instances: default pet plus two V7.12 target PetInstances.
- Imported pack: `v5-12-runtime-gltf`.
- Renderer kind: `gltf`.
- Target route: two non-default PetInstances only.
- Default pet: unchanged by target GLTF activation.

## Visual Evidence

- 1x shared GLTF runtime screenshot:
  `docs/V7.12/evidence/v7_12-shared-gltf-1x-final-2026-06-01.png`
- 0.75x shared GLTF runtime screenshot:
  `docs/V7.12/evidence/v7_12-shared-gltf-075-final-2026-06-01.png`
- Corrupt GLB runtime fallback screenshot:
  `docs/V7.12/evidence/v7_12-corrupt-gltf-fallback-2026-06-01.png`

PNG nonblank smoke passed for all three files.

## Core Action Evidence

The target PetInstance was driven through real local Event Bridge notifications.
Each event was accepted and `petctl list --json` reported the corresponding
target `currentState`.

| Action | Result |
| --- | --- |
| `idle` | accepted; target state became `idle` |
| `thinking` | accepted; target state became `thinking` |
| `running` | accepted; target state became `running` |
| `success` | accepted; target state became `success` |
| `warning` | accepted; target state became `warning` |
| `error` | accepted; target state became `error` |
| `need_input` | accepted; target state became `need_input` |
| `sleeping` | accepted; target state became `sleeping` |

Because the tested GLB fixture uses one shared model with accepted action clips,
the evidence records state/action routing and visible nonblank rendering rather
than claiming high-quality distinguishable 3D animations.

## Fixes Verified

- `petctl asset activate` removes the target instance from previously active
  imported packs before assigning the new pack, preventing stale sprite packs
  from shadowing GLTF activation.
- Desktop pet windows initialize `CatStateMachine` from sanitized
  `PetInstance.currentState`, preventing restart-time idle drift.
- Runtime corrupt GLB fallback returned target pets to CSS fallback instead of
  rendering a blank or broken GLTF canvas.
- Restored the original GLB after corrupt fallback verification and reactivated
  the GLTF pack for both target instances.

## Regression

- `pnpm --filter desktop check`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed.
- `node scripts/v7_11_external_glb_intake_smoke.mjs`: passed.
- PNG nonblank checks for V7.12 screenshot evidence: passed.

## Security Redaction

Evidence records only safe pack IDs, action IDs, renderer kind, sanitized state
results, and screenshot file names. It does not include token, Authorization,
provider credential, raw provider response, raw prompt, source photo, full local
user path, workspace path, config path, or `api-token.json`.

## Decision

Passed for the scoped tested local imported GLB/GLTF runtime action mapping
scenario.
