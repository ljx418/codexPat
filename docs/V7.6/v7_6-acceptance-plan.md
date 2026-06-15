# V7.6 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- every core action produces visible output.
- two pets using the same generated pack do not share mutable renderer state.
- default and unrelated pets remain unchanged.
- restart restores active pack mapping.
- success does not override active error or need_input state.
- renderer input snapshot contains only safe action ID, renderer kind, safe pack/profile IDs, playback intent, scale, and visibility.

## Required Checks

- runtime action mapping unit tests: passed.
- per-PetInstance isolation smoke: passed through runtime imported pack baseline.
- restart restore smoke: passed through runtime imported pack baseline.
- renderer payload safety snapshot: passed.
- visual nonblank checks: passed using retained GLTF and imported sprite evidence PNGs.

## Evidence

- `docs/V7.6/evidence/v7_6-action-mapping-runtime-smoke-2026-05-31.md`
- `scripts/v7_6_action_mapping_runtime_smoke.mjs`
- `docs/V5.x/evidence/v5_12-runtime-imported-pack-rendering-smoke-2026-05-30.md`
