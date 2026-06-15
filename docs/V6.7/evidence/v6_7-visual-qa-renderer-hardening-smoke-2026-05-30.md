# V6.7 Visual QA / Renderer Hardening Smoke

status: passed

date: 2026-05-30

commit: dcc9f363

## Scope

This evidence covers visual QA revalidation for retained bundled/imported local fixtures and GLTF renderer hidden-state hardening.

## Visual Evidence

Bundled fixture:

- `docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png`

Imported fixture:

- `docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png`

The retained fixtures cover all eight core actions. The imported fixture includes 0.75x checks for warning, error, and need_input.

## Nonblank Checks

```text
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png
```

Result: passed.

```text
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png
```

Result: passed.

## Renderer Hardening

`apps/desktop/src/renderer/gltf-renderer.ts` now pauses the animation frame loop when renderer visibility is false and resumes only when visible.

## Automatic Checks

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

All checks passed.

## Security Scan

Evidence references only retained fixture paths and pass/fail decisions.

No token, Authorization value, raw payload, prompt text, provider payload, raw photo, workspace path, config path, full local path, remote asset URL, or script source is recorded.

## Claim Result

Allowed:

```text
V6.7 visual quality and action QA passed for tested bundled and imported asset scenarios.
```

Still forbidden:

```text
3D ready
Rive ready
Live2D ready
production signed release ready
production visual quality ready
provider integration verified
```
