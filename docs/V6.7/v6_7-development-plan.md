# V6.7 Development Plan: Visual QA / Renderer Hardening

status: planning-ready

date: 2026-05-30

## Scope

V6.7 revalidates product visual QA for bundled and imported local asset scenarios and hardens renderer visibility behavior.

This phase may implement:

- visual evidence revalidation using retained V5.15 bundled/imported screenshots.
- nonblank PNG checks.
- 1x and 0.75x action clarity review carry-forward.
- GLTF renderer pause/resume when hidden.
- performance baseline note.

This phase must not implement:

- new renderer family.
- production 3D readiness.
- provider generation.
- marketplace.
- production signed release.

## Required Fix

Current GLTF renderer must not continue requestAnimationFrame work while hidden through renderer visibility controls.

## Required Checks

```bash
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

## Allowed Claim

```text
V6.7 visual quality and action QA passed for tested bundled and imported asset scenarios.
```

## Forbidden Claims

```text
3D ready
Rive ready
Live2D ready
production signed release ready
production visual quality ready
provider integration verified
```
