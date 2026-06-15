# V5.15 Visual Quality And Action QA Evidence

status: passed

date: 2026-05-30

## Scope

This evidence covers visual QA for tested bundled and imported local asset scenarios.

It does not claim production visual quality, 3D readiness, provider integration, marketplace readiness, or production signed release readiness.

## Visual Evidence

Bundled pack evidence:

- `docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png`
- covers all eight core actions for the bundled sprite fixture.

Imported pack evidence:

- `docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.html`
- `docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png`
- covers all eight core actions for the imported orange tabby local sprite fixture.
- includes 0.75x scale checks for `warning`, `error`, and `need_input`.

## Nonblank Checks

Commands:

```bash
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png
```

Result:

```text
passed
```

## Bounding Box And Scale Review

The imported fixture keeps each cat image inside a fixed 176px frame at 1x.

The `warning`, `error`, and `need_input` actions remain visually distinguishable at 0.75x in the imported fixture.

No full blank frame or off-canvas card was observed in the retained fixed-frame screenshots.

## Performance Baseline

Local process sampling recorded the active desktop pet debug process at approximately:

```text
CPU: 0.0%
RSS: 71,772 KB
```

This is a local baseline observation, not a production performance guarantee.

## Regression

Commands:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
node scripts/v5_8_personalized_asset_pipeline_smoke.mjs
```

Result:

```text
passed
```

## Security Notes

The visual fixture uses local relative image references only.

No retained V5.15 evidence contains token, Authorization header, raw payload, prompt text, provider payload, raw photo, workspace path, config path, full local path, remote asset URL, or script source.

## Claim Boundary

Allowed:

```text
V5.15 visual quality and action QA passed for tested bundled and imported asset scenarios.
```

Forbidden:

```text
production visual quality ready
3D ready
asset marketplace ready
provider integration verified
production signed release ready
```
