# V7.6 Action Mapping Runtime Smoke Evidence

status: passed

date: 2026-05-31

commit: c07cdd0e

## Scope

Validated generated asset action mapping and runtime retargeting using the existing local imported pack runtime baseline.

This evidence does not prove production animation quality, remote runtime assets, arbitrary GLTF animation control, or broad 3D readiness.

## Commands

- `pnpm --filter desktop test`
- `pnpm --filter desktop check`
- `node scripts/v5_12_runtime_imported_pack_smoke.mjs`
- `node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_3-gltf-render-fixture-2026-05-28.png`
- `node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png`
- `node scripts/v7_6_action_mapping_runtime_smoke.mjs`

## Smoke Result

```text
status: passed
desktop runtime/action unit coverage: passed
desktop typecheck: passed
runtime imported pack baseline: passed
nonblank GLTF/canvas baseline: passed
nonblank imported sprite baseline: passed
renderer payload safety scan: passed
```

## Renderer Safe Fields

- safe action ID.
- renderer kind.
- safe pack/profile IDs.
- playback intent.
- scale.
- visibility.

## Not Passed To Renderer

- raw prompt text.
- raw photo data.
- provider payload.
- raw Agent / Codex / terminal / MCP / HTTP payload.
- token.
- Authorization.
- workspace path.
- config path.
- full local path.

## Decision

V7.6 generated asset action mapping passed for tested per-PetInstance runtime scenarios.
