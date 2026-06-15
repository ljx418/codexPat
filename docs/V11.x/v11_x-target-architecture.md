# V11.x Target Architecture: Living Work-Cat Interaction Layer

status: active target architecture; V11.1-V11.7 passed scoped
date: 2026-06-07

## Target Flow

```text
PetEvent / UserPointerEvent / TimerTick
  -> CatStateMachine
  -> InteractionStateController
  -> EmotionStateResolver
  -> ActionComposer
  -> RuntimePlaybackController
  -> RendererRegistry
  -> SpriteRenderer
  -> RuntimePetWindow / ManagerPreviewPanel
```

V11 adds a visual interaction layer around the accepted V10 animation runtime.
It does not add a new agent event source.

Active PRD: `docs/active/agent_desktop_pet_prd_v11.md`.

## Current vs Target Architecture

| Area | V10 Current | V11 Target |
| --- | --- | --- |
| Idle | random micro-interactions are shallow | controlled living idle scheduler with multiple behaviors |
| Pointer feedback | click/drag smoke exists | hover, click, double-click, drag/drop, wake feedback |
| State emotion | states map to actions | states map to emotion profiles and transitions |
| Action sequencing | state action selection | enter/loop/exit/transient composition and visual priority |
| Default asset | premium bundled packs | flagship `living-work-cat-v1` first-run default |
| First-run | wizard can create pet/work-cat | app opens directly into visible living pet and safe demo |
| Evidence | benchmark-gate screenshots | interaction QA recordings and priority/isolation scans |

## InteractionStateController

Responsibilities:

- receive local pointer/timer signals.
- classify visual-only interaction states.
- never emit `PetEvent`.
- never write raw agent state.
- keep target PetInstance scoped.
- preserve position persistence after drag.

Allowed inputs:

- pointer near / leave.
- click / double-click.
- drag start / drag move / drag end.
- local idle timer tick.
- current safe pet state.

Forbidden inputs:

- raw Codex payload.
- raw terminal text.
- prompt text.
- tool command text.
- provider payload.
- token / Authorization.
- local path.

## EmotionStateResolver

Responsibilities:

- map safe core states to visual emotion profiles.
- preserve priority for error and need_input.
- prevent success transient from overriding priority states.
- provide long-running variation hints.

Core mapping:

| State | Emotion | Notes |
| --- | --- | --- |
| idle | calm | random living idle allowed |
| thinking | focused | attentive, low movement |
| running | busy | active working movement |
| success | happy transient | returns to idle unless blocked |
| warning | alert | visible caution behavior |
| error | distressed / blocked | high priority |
| need_input | asking / attentive | high priority |
| sleeping | low-energy | wakes on pointer near |

## ActionComposer

Responsibilities:

- compose visual action phases: enter, loop, exit, transient.
- enforce visual priority.
- hold error/need_input until the safe state changes.
- avoid flicker during rapid event changes.

Priority:

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

This is a visual queue only. It must not be documented or claimed as
per-instance agent queue readiness.

## Flagship Pack Contract

`living-work-cat-v1` must expose:

- 8 core state actions.
- at least 6 idle micro-actions.
- hover/click/double-click/drag/drop visual actions.
- wake/sleep transition actions or visible fallback.
- metadata for loop/transient, fps, frame count, fallback, and priority.

Renderer adapter receives only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

Renderer adapter never receives raw PetEvent, raw agent payload, raw provider
payload, prompt text, tool command text, token, Authorization, workspace path,
config path, full local path, remote URL, shell command, or script source.

## First-Run Delight Architecture

```text
AppStart
  -> FirstRunExperienceController
  -> ensure visible default PetInstance
  -> activate living-work-cat-v1 if accepted
  -> local demo state controller
  -> no real PetEvent mutation
```

The first-run demo is local and reversible. It must not change the underlying
agent/Codex state.

## Final Architecture Decision

V11 is a 2D-first interaction and living-pet experience layer. It may improve
ordinary-user experience beyond selected open-source benchmarks, but it must
not claim full Petdex parity, 3D readiness, provider readiness, marketplace
readiness, or production release readiness.
