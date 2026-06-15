# V10.x Model Detailed Design

status: v10.6-v10.7-passed-v10.8-v10.10-planned
date: 2026-06-04

## Purpose

This document defines the models required to turn V10 from a scoped animation
playback proof into a product-grade animated 2D work-cat experience.

## WorkCatPackModel

Default target:

```text
packId: work-cat-v1
rendererKind: sprite
format: pet-json-spritesheet | pet-json-frame-sequence
```

Required actions:

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

Quality requirements:

- consistent cat identity across all actions.
- transparent-background compatible.
- no blank, fully transparent, or off-canvas frames.
- loop actions: at least 8 frames.
- transient actions: at least 4 frames.
- 1x and 0.75x scale must remain readable.

## PetJsonAnimationPackModel

Minimal accepted local format:

```ts
type PetJsonAnimationPack = {
  packId: string;
  displayName: string;
  rendererKind: "sprite";
  format: "spritesheet" | "frameSequence";
  actions: Record<CoreActionId, {
    frames: string[];
    fps: number;
    loop: boolean;
    durationMs?: number;
    fallbackActionId?: CoreActionId;
  }>;
};
```

Validation rules:

- all core action keys must be present for `work-cat-v1`.
- frame names must be safe relative asset names.
- fps must be clamped to accepted range.
- remote URLs, absolute paths, path traversal, scripts, event handlers, and
  executable-like fields are rejected.
- invalid activation preserves previous active pack.

## AnimationPackAdapter

Input:

- validated V5 manifest pack, or
- validated local `pet.json` animation pack.

Output:

- safe action coverage.
- frame sequence metadata.
- loop/transient metadata.
- fallback action.
- renderer-safe playback profile.

The adapter must not expose source paths, raw images, raw manifest content,
provider payload, prompt text, token, Authorization, or shell command text.

## RuntimePlaybackController

State mapping:

| State | Action | Behavior |
| --- | --- | --- |
| idle | idle | loop with random idle micro-actions |
| thinking | thinking | loop until state changes |
| running | running | loop until state changes |
| success | success | transient, then idle unless priority state blocks |
| warning | warning | visible transient / loop per pack metadata |
| error | error | priority state |
| need_input | need_input | priority state |
| sleeping | sleeping | loop |

Micro-actions:

- blink.
- tail sway.
- stretch.
- click feedback.
- drag feedback.

Micro-actions must not mutate agent state or emit PetEvents.

## ManagerPreviewModel

Preview input:

- safe pack ID.
- safe action ID.
- renderer kind.
- playback intent.
- scale.

Preview output:

- isolated animation preview.
- coverage state.
- frame count.
- fps.
- loop/transient label.
- fallback action.
- sanitized reasonCode.

Preview never writes to live PetInstance state.

## EvidenceModel

Every V10.6-V10.10 evidence file must record:

- phase status.
- visual evidence path.
- action coverage table.
- nonblank result.
- frame-difference result.
- fallback result.
- target isolation result.
- security scan result.
- claim scan result.

Final V10 acceptance must include:

- work-cat-v1 contact sheets.
- runtime playback captures.
- idle/click/drag micro-interaction evidence.
- Manager preview evidence.
- regression results.
- PRD/spec review.

## Model Exit Rule

V10 is model-complete only when `work-cat-v1`, the adapter, runtime playback
controller, Manager preview model, and evidence model are all accepted with no
High false-green risk.
