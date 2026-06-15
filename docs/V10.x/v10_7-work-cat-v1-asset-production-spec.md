# V10.7 work-cat-v1 Asset Production Spec

status: accepted-spec-v10.7-passed
date: 2026-06-04

## Goal

Define the asset production and visual acceptance rules for the default
product-grade animated 2D work cat.

This spec does not claim V10 product-grade acceptance. V10.7 has passed scoped
against this spec; V10.8-V10.10 remain required for final product-grade runtime
experience acceptance.

## Asset Identity

Pack:

```text
packId: work-cat-v1
rendererKind: sprite
format: pet-json-frame-sequence or pet-json-spritesheet
```

Visual identity:

- orange tabby work cat.
- friendly, readable, desktop-safe silhouette.
- consistent head, ear, body, tail, paw, and face proportions across every
  action.
- clear eyes and mouth at 0.75x scale.
- transparent background.
- no decorative scene background.

## Canvas And Frame Dimensions

| Property | Required Value |
| --- | --- |
| canvas size | 256 x 256 px |
| frame size | 256 x 256 px |
| rendered safe area | cat bbox stays within 12 px margin |
| export format | PNG sequence or spritesheet PNG/WebP |
| alpha | transparent background |

## Color Palette

Recommended palette:

| Role | Color |
| --- | --- |
| body orange | `#E88A3A` |
| dark tabby marks | `#9A4E20` |
| cream muzzle/belly | `#F8D7A0` |
| nose/paw accent | `#E86C72` |
| eye dark | `#1F2933` |
| shadow neutral | `#5E5A54` with low opacity |

Small palette variation is allowed only if identity remains consistent.

## Line And Shading Style

- clean 2D illustration.
- soft rounded silhouette.
- subtle flat or cel shading.
- no photorealistic texture.
- no jagged generated artifacts.
- no inconsistent limb count or distorted anatomy.
- no text or UI labels inside frames.

## Per-action Storyboard

| Action | Storyboard | Minimum Frames | Minimum Unique Poses | Timing |
| --- | --- | --- | --- | --- |
| idle | breathing, subtle tail sway, occasional blink-ready neutral pose | 8 | 4 | loop 8-10 fps |
| thinking | head tilt, ear twitch, focused gaze | 8 | 4 | loop 8-10 fps |
| running | small trotting motion, paws alternate, tail balances | 8 | 4 | loop 10-12 fps |
| success | small hop or proud tail lift | 4 | 3 | transient 800-1600 ms |
| warning | ears up, alert pose, small shake | 4 | 3 | transient 1200-2500 ms |
| error | surprised recoil then recovery | 4 | 3 | transient 1500-3000 ms |
| need_input | paw raise, expectant look | 4 | 3 | transient/hold 1500-4000 ms |
| sleeping | curled breathing, sleepy blink | 8 | 4 | loop 6-8 fps |

## Comparison Criteria vs sprite-v3-animated

V10.7 passes only if `work-cat-v1` is visibly better than `sprite-v3-animated`
under side-by-side review.

Required comparison:

- side-by-side contact sheet for all 8 actions.
- side-by-side runtime playback capture for at least idle, thinking, running,
  need_input, error, and sleeping.
- operator pass/fail for visual quality.

Pass criteria:

- clearer silhouette than `sprite-v3-animated`.
- more consistent identity across actions.
- fewer visible procedural artifacts.
- more readable action intent.
- smoother loop timing.

## Automated Visual Checks

Required:

- contact sheet for every action.
- runtime playback capture for every action.
- nonblank scan.
- frame-difference check.
- 1x and 0.75x readability capture.
- bounding box / off-canvas check.
- no fully transparent frame.
- no frame with cat bbox touching canvas edge.

Frame-difference minimum:

- loop actions must have at least 4 unique visual poses.
- transient actions must have at least 3 unique visual poses.

## Operator Visual Acceptance Rubric

Each action is graded pass/fail:

- identity consistency.
- action readability without labels.
- smooth loop or clear transient.
- no broken anatomy.
- no blank/transparent/off-canvas frame.
- acceptable at 1x and 0.75x.

V10.7 fails if any core action fails the operator rubric.

## Evidence Requirements

Evidence file:

```text
docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md
```

Evidence must include:

- side-by-side contact sheet paths.
- runtime playback capture paths.
- frame count table.
- unique pose count table.
- nonblank result.
- frame-difference result.
- scale result.
- operator visual acceptance result.
- security scan result.
- claim scan result.

Evidence must not include source paths, raw image payloads, provider payloads,
prompt text, token, Authorization, or local workspace paths.
