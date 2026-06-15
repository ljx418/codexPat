# V11.5 Flagship Living Cat Asset Spec

status: planned
date: 2026-06-05

## Goal

Create one flagship local bundled animated 2D cat pack that can become the
first-run default after visual QA passes.

Pack ID:

```text
living-work-cat-v1
```

Renderer:

```text
sprite
```

## Visual Identity

Target style:

- warm, polished, work-companion cat.
- stronger silhouette than V10 premium packs.
- readable at 1x and 0.75x.
- consistent head/body/tail proportions across every action.
- transparent background.
- no external URL, script, foreignObject, event handler, or arbitrary local
  path.

Default canvas:

| Field | Value |
| --- | --- |
| viewBox | `0 0 256 256` |
| recommended display size | 220px - 260px |
| transparent background | required |
| renderer kind | `sprite` |

Palette guidance:

- primary body color must be warm and high contrast against transparent window.
- line color must remain visible on light and dark desktop backgrounds.
- error/warning/need_input may add small symbolic marks, but not text labels.

## Required Action Coverage

Core states:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

Idle micro-actions:

```text
idle_blink
idle_look_left
idle_look_right
idle_tail_sway
idle_stretch
idle_settle
idle_nap
idle_wake
```

Pointer actions:

```text
pointer_near
click
double_click
drag_start
dragging
drop
```

Minimum frame requirements:

| Action Type | Minimum Frames | Minimum Unique Poses |
| --- | --- | --- |
| core loop states | 8 | 4 |
| core transient states | 4 | 3 |
| idle micro-actions | 4 | 3 |
| pointer/click actions | 4 | 3 |
| drag loop | 4 | 2 |
| drop / wake transient | 4 | 3 |

## Asset Production Rules

Allowed:

- controlled procedural SVG frames generated from project code.
- local bundled sprite manifest.
- safe action IDs and fallback IDs.

Forbidden:

- remote URL.
- external href.
- script.
- event handler.
- `foreignObject`.
- raw provider payload.
- prompt text.
- token / Authorization.
- full local path.
- shell command.

## Side-by-side Comparison

V11.5 evidence must compare `living-work-cat-v1` against at least:

- `work-cat-v1`.
- one V10 premium pack.

Comparison dimensions:

- silhouette stability.
- emotional distinctness.
- idle life.
- click/drag readability.
- first-impression quality.

## Operator Rubric

Each item is pass/fail:

- cute enough for daily desktop use.
- state changes are obvious.
- idle does not feel static.
- click/drag feedback feels intentional.
- no action looks broken or accidental.
- no frame disappears or jumps off canvas.

Any fail blocks V11.5 final claim.

## Acceptance

Automated smoke:

```bash
node scripts/v11_5_flagship_living_cat_pack_smoke.mjs
```

Evidence:

- `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-YYYY-MM-DD.md`
- contact sheet for every action group.
- runtime capture for every action group.
- side-by-side comparison capture.

Pass criteria:

- all required action groups present.
- frame count and unique pose thresholds pass.
- nonblank / frame-difference / off-canvas checks pass.
- 1x and 0.75x readability pass.
- operator rubric passes.

Allowed claim:

```text
V11.5 flagship living 2D work-cat pack passed for tested local visual-quality scenarios.
```

