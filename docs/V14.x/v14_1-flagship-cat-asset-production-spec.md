# V14.1 Flagship Cat Asset Production Spec

日期：2026-06-09  
状态：planned。  

## Target Pack

- Pack ID: `flagship-work-cat-v2`
- Renderer: `sprite`
- Source: bundled local controlled frames
- Role: default high-quality animated work-cat target for V14

## Required Actions

Core actions:

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

Living actions:

```text
idle_blink
idle_look_left
idle_look_right
idle_tail_sway
idle_stretch
idle_settle
idle_nap
idle_wake
click
double_click
drag_start
dragging
drop
```

## Visual Standard

- warmer, cleaner, more polished than `work-cat-v1`.
- consistent face, silhouette, palette, and proportions across all actions.
- 1x and 0.75x readable.
- no blank, fully transparent, off-canvas, or sudden vertical jump frame.
- loop actions first/final rendered frame must match.
- transient actions must have clear entry, main pose, and exit design.

## Acceptance Evidence

- contact sheet per action group.
- runtime playback capture per action group.
- nonblank scan.
- frame-difference scan.
- loop-closure scan.
- scale screenshots.
- operator visual acceptance table.
