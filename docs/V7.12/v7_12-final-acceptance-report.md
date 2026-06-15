# V7.12 Final Acceptance Report

status: passed
date: 2026-06-01

## Scope

Runtime 3D action mapping for tested local imported GLB/GLTF assets.

## Required Results

- GLB/GLTF source accepted by V7.11: passed.
- Nonblank runtime visual evidence: passed for 1x and 0.75x shared-pack runtime
  screenshots.
- Bounding box and scale checks: passed scoped for visible 1x and 0.75x
  runtime screenshots.
- Core action mapping/fallback: passed scoped; every core action was accepted
  through the real local Event Bridge and the target PetInstance reported the
  corresponding `currentState`.
- PetInstance isolation: passed scoped; stale sprite activation shadowing was
  fixed in `petctl asset activate`, two target instances resolve the same GLTF
  pack, and the default pet remains visually separate.
- Corrupt asset fallback: passed scoped; a temporarily corrupted app-managed GLB
  fell back to CSS runtime rendering, and the original GLB was restored.
- Renderer payload safety: no leakage observed in generated evidence.
- Claim scan: passed for scoped status; no broad 3D/product/provider claim is
  made.

## Evidence

- `docs/V7.12/evidence/v7_12-3d-runtime-action-mapping-smoke-2026-06-01.md`
- `docs/V7.12/evidence/v7_12-runtime-gltf-visible-2026-06-01.png`
- `docs/V7.12/evidence/v7_12-shared-gltf-1x-2026-06-01.png`
- `docs/V7.12/evidence/v7_12-shared-gltf-1x-final-2026-06-01.png`
- `docs/V7.12/evidence/v7_12-shared-gltf-075-final-2026-06-01.png`
- `docs/V7.12/evidence/v7_12-corrupt-gltf-fallback-2026-06-01.png`

## Final Decision

Passed for the scoped tested local imported GLB/GLTF runtime action mapping
scenario. This does not imply broad 3D readiness, automatic photo-to-3D
readiness, provider integration readiness, marketplace readiness, or production
release readiness.
