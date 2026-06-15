# V21 Identity-locked Motion GIF Report

status: passed
date: 2026-06-15

## Scope

This report fixes the previous showcase issues by using identity-locked local
motion templates for the three supplied cat photos. It generates animated GIFs
for all 8 core actions per cat.

HTML: `docs/V21.x/evidence/v21_identity_locked_motion_gif_report-2026-06-15.html`

## Acceptance Table

| Check | Result | Details |
| --- | --- | --- |
| gray-cat input photo exists | passed | local reference photo |
| orange-cat input photo exists | passed | local reference photo |
| cream-orange-cat input photo exists | passed | local reference photo |
| gray-cat gif coverage | passed | actions=8 |
| gray-cat identity locked | passed | single palette/template used for all actions |
| gray-cat motion amplitude | passed | visible action amplitude; no sub-pixel jitter only |
| gray-cat loop closure | passed | first/final frame intentionally identical |
| orange-cat gif coverage | passed | actions=8 |
| orange-cat identity locked | passed | single palette/template used for all actions |
| orange-cat motion amplitude | passed | visible action amplitude; no sub-pixel jitter only |
| orange-cat loop closure | passed | first/final frame intentionally identical |
| cream-orange-cat gif coverage | passed | actions=8 |
| cream-orange-cat identity locked | passed | single palette/template used for all actions |
| cream-orange-cat motion amplitude | passed | visible action amplitude; no sub-pixel jitter only |
| cream-orange-cat loop closure | passed | first/final frame intentionally identical |
| security scan | passed | no token, Authorization, raw provider response, full local path, prompt private text |
| claim boundary | passed | GIF report demonstrates controlled identity-locked local motion assets; not arbitrary provider generation readiness |

## What Changed

- No cross-pose provider identity mixing.
- Each cat keeps one palette/template across all actions.
- Actions use visible body/head/paw/tail motion, not sub-pixel jitter.
- First and final frames are intentionally closed.
- GIF report embeds the actual animated action previews.

## Boundary

This is a controlled local animation asset route. It does not prove arbitrary
photo-to-animation readiness or provider integration verification.
