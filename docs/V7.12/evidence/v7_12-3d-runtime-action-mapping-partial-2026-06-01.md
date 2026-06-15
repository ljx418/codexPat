# V7.12 3D Runtime Action Mapping Partial Evidence

status: superseded
date: 2026-06-01

## Scope

This evidence records the attempted V7.12 runtime 3D mapping acceptance using a
real local GLB/GLTF pack accepted by V7.11.

## Passed Checks

- Real local GLB/GLTF pack imported and activated for one target PetInstance.
- Desktop app restarted so runtime resolved the active GLTF pack from storage.
- GLTF renderer normalized model bounds and camera framing to prevent the
  previous off-canvas/cropped render.
- Runtime screenshot shows a visible nonblank 3D model.
- Follow-up runtime cleanup reduced the desktop to the default pet plus two
  V7.12 target PetInstances.
- `petctl asset activate` now removes the target instance from previously
  active imported packs before assigning the new pack, preventing stale sprite
  packs from shadowing GLTF activation.
- Desktop pet windows now initialize `CatStateMachine` from sanitized
  `PetInstance.currentState`, preventing restart-time idle drift when the bridge
  state already records `thinking`, `running`, or another accepted state.
- Two target PetInstances were activated to the same GLTF pack and a cropped 1x
  runtime screenshot shows both target GLTF renderers nonblank while the default
  pet remains visually separate.
- PNG nonblank check passed for
  `docs/V7.12/evidence/v7_12-runtime-gltf-visible-2026-06-01.png`.
- PNG nonblank check passed for
  `docs/V7.12/evidence/v7_12-shared-gltf-1x-2026-06-01.png`.
- `pnpm --filter desktop check` passed after renderer changes.
- `pnpm --filter @agent-desktop-pet/petctl test` passed after activation
  isolation changes.

## Superseded By

This partial evidence has been superseded by:

- `docs/V7.12/evidence/v7_12-3d-runtime-action-mapping-smoke-2026-06-01.md`

## Historical Blockers From This Attempt

- 0.75x scale visual evidence is not yet captured in a clean, auditable
  screenshot.
- Complete action switching evidence for every core action is still missing.
- Visual labels/action state screenshots remain incomplete; bridge state changed
  through real `petctl notify` calls, but the clean saved evidence still only
  proves nonblank shared GLTF rendering.
- Corrupt GLB runtime fallback has not yet been verified in the live desktop
  runtime.

## Evidence

- `docs/V7.12/evidence/v7_12-runtime-gltf-visible-2026-06-01.png`
- `docs/V7.12/evidence/v7_12-shared-gltf-1x-2026-06-01.png`

## Security Redaction

Evidence excludes token, Authorization, provider credential, raw provider
response, raw prompt, source photo, full local user path, workspace path, config
path, and api-token.json.

## Final Decision

This partial evidence remains historical context only. The later V7.12 smoke
evidence captured the remaining checks and is the active acceptance reference.
