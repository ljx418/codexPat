# V11.5 Flagship Living Cat Pack Smoke Evidence

status: passed
date: 2026-06-07

## Scope

This smoke validates the bundled `living-work-cat-v1` procedural SVG sprite
pack for tested local visual-quality scenarios. It does not claim provider,
remote asset, 3D, marketplace, production signing, cross-platform, or Windows
readiness.

## Evidence Files

- contact sheet: `docs/V11.x/evidence/v11_5-flagship-living-cat-contact-sheet-2026-06-07.html`
- side-by-side comparison: `docs/V11.x/evidence/v11_5-flagship-side-by-side-2026-06-07.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| pack id | passed | living-work-cat-v1 |
| manifest valid | passed | validateAssetManifest ok |
| core action coverage | passed | idle, thinking, running, success, warning, error, need_input, sleeping |
| idle micro-action coverage | passed | idle_blink, idle_look_left, idle_look_right, idle_tail_sway, idle_stretch, idle_settle, idle_nap, idle_wake |
| pointer action coverage | passed | pointer_near, pointer_leave, click, double_click, drag, drag_start, dragging, drop |
| frame thresholds | passed | idle:8/8, thinking:8/8, running:8/8, success:4/4, warning:4/4, error:4/4, need_input:4/4, sleeping:8/8, idle_blink:4/4, idle_look_left:4/4, idle_look_right:4/4, idle_tail_sway:8/4, idle_stretch:5/4, idle_settle:4/4, idle_nap:8/4, idle_wake:4/4, pointer_near:4/4, pointer_leave:4/4, click:4/4, double_click:6/4, drag:6/4, drag_start:4/4, dragging:6/4, drop:4/4 |
| unique pose thresholds | passed | idle:8/4, thinking:8/4, running:8/4, success:4/3, warning:4/3, error:4/3, need_input:4/3, sleeping:8/4, idle_blink:4/3, idle_look_left:4/3, idle_look_right:4/3, idle_tail_sway:8/3, idle_stretch:5/3, idle_settle:4/3, idle_nap:8/3, idle_wake:4/3, pointer_near:4/3, pointer_leave:4/3, click:4/3, double_click:6/3, drag:6/2, drag_start:4/3, dragging:6/2, drop:4/3 |
| controlled SVG safety | passed | no script, foreignObject, href, event handler, URL, data URI, token, Authorization, or local path |
| comparison inputs | passed | compares living-work-cat-v1 with work-cat-v1 and premium-orange-tabby |
| operator rubric | passed | automated rubric proxy passed for cuteness/readability/naturalness/state distinctness/first impression |

## Final Decision

V11.5 flagship living 2D work-cat pack passed for tested local visual-quality scenarios.
