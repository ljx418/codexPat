# V20 Motion Quality QA Thresholds

文档状态：planned QA thresholds；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Purpose

This file turns "looks good" into measurable V20 gates. Provider output must pass
both automated metrics and operator-visible review before preview/apply.

## Required Action Coverage

Accepted pack must cover all 8 core actions:

- idle
- thinking
- running
- success
- warning
- error
- need_input
- sleeping

Default target: 9 frames per action.  
Minimum accepted visible frames: 6 per action.  
Transient actions may have 3+ distinct poses only if explicitly labelled in
evidence; V20 default remains 9-column sheet parsing.

## Nonblank / Transparency

Per frame:

- nontransparent pixel ratio must be greater than 1%.
- frame must not be fully blank.
- frame must not be fully opaque background.
- alpha-safe subject area should be isolated; visible scene background blocks
  apply unless a documented background-removal step produces safe transparent
  frames.

## Bounding Box / Off-canvas

Per frame:

- subject bounding box must stay inside frame with at least 2px margin where
  source resolution permits.
- visible subject width and height must each be at least 20% of frame size.
- visible subject width and height must each be no more than 95% of frame size.
- no core body part may be consistently cropped off unless the action explicitly
  requires a transient and operator review accepts it.

## Motion Amplitude

Each action must show meaningful motion:

- loop/base actions (`idle`, `thinking`, `running`, `sleeping`) require at least
  3 unique visual poses.
- transient/emotive actions (`success`, `warning`, `error`, `need_input`)
  require at least 2 unique visual poses.
- `running` must show the strongest motion among loop actions, either by body
  center travel, limb pose change, or silhouette change.
- `success`, `warning`, `error`, and `need_input` must be visually separable at
  0.75x scale.

Initial automatic threshold:

- perceptual/frame difference between at least two non-adjacent frames per action
  must exceed the local baseline used by V19/V10 animation checks.
- adjacent frame difference must remain below the jump threshold so animation
  does not snap or teleport.

## Loop Closure

Loop actions:

- idle
- thinking
- running
- sleeping

Gate:

- first/final frame must be visually close enough to avoid visible snap.
- if exact closure is impossible, final evidence must mark the action as
  `loop_closure_review_required`; runtime must use ping-pong playback or safe
  fallback instead of ordinary loop.

## Same-cat Consistency

The cat must remain visually the same across rows:

- fur color and markings must remain materially consistent.
- face/eye/ear proportions must not drift into a different animal.
- style must not switch between realistic, cartoon, watercolor, 3D, or icon
  modes across actions.
- operator review must mark same-cat result passed before apply.

## Readability

Required manual or screenshot-backed review:

- 1x scale: all actions readable.
- 0.75x scale: running, success, warning, error, need_input still distinct.
- no labels, borders, UI text, background scene, or provider watermark may be
  visible in cropped runtime frames.

## Apply Gate

The pack cannot apply if any of these fail:

- action coverage.
- nonblank.
- background/transparent gate.
- off-canvas gate.
- same-cat gate.
- motion amplitude gate.
- loop closure or ping-pong fallback decision.
- security scan.

