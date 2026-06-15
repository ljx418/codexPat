# V11.2 Pointer-Aware Interaction Implementation Spec

status: planned; V11.2 is the next implementation phase after V11.1 passed scoped
date: 2026-06-07

## Goal

Make the pet react to user presence and direct manipulation while preserving
agent state integrity.

## Event Model

Supported local browser events in `RuntimePetWindow`:

| Event | Visual Interaction | Notes |
| --- | --- | --- |
| `pointerenter` / near zone | `pointer_near` | attention pose, no state write |
| `pointerleave` | `pointer_leave` | returns to base visual state |
| `click` | `click` | short transient |
| double click | `double_click` | advanced positive or playful transient |
| drag start | `drag_start` | grabs / braces |
| drag move | `dragging` | follows pointer and persists final position through existing drag path |
| drag end | `drop` | landing / settle transient |

Implementation naming decision:

- Extend `RuntimeMicroInteractionType` with `pointer_leave`, `drag_start`,
  `dragging`, and `drop`.
- `drag_start` is a short transient at pointer-down before window drag begins.
- `dragging` is the active drag loop while OS window drag is active.
- `drop` is a short transient after drag ends, then visual state returns to the
  current safe base state.
- The previous generic `drag` value may remain as a backward-compatible alias
  only inside tests or migration paths. New V11.2 evidence must use
  `drag_start`, `dragging`, and `drop`.

Double-click detection default:

- second click within 350ms.
- same PetInstance window.
- if drag starts, click detection is cancelled.

Pointer-near default:

- `pointerenter` is sufficient for V11.2.
- optional future near-radius detection is out of scope unless already easy in
  the runtime window.

## Priority

Pointer interactions are visual-only and must obey:

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

Rules:

- `error` and `need_input` block hover/click/double-click/drag feedback.
- `drag` cancels click/double-click.
- `drop` may play after drag ends, then returns to the correct base state.
- pointer leave returns to base state unless a higher-priority transient is
  active.
- `pointer_near` must not override `thinking`, `running`, `success`, `warning`,
  `error`, or `need_input`; it may only add attention feedback when the safe
  base state permits it.
- `click` and `double_click` are local visual transients and must not mark an
  agent workflow as success.

## Safety Contract

Pointer interactions must:

- emit zero `PetEvent`.
- not call `notify`.
- not write `CatStateMachine`.
- not mutate `CatStateSnapshot.current`.
- not affect default or unrelated pets.
- preserve existing position persistence after drag.

Renderer input remains safe fields only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Required Reason Codes

```text
pointer_near_active
pointer_leave_returned
click_active
double_click_active
drag_start_active
dragging_active
drop_active
priority_state_blocks_pointer
interaction_cancelled_by_drag
interaction_expired
local_interaction_no_pet_event
local_interaction_no_state_mutation
```

## Runtime Capture Requirements

Capture these paths:

- hover / pointer-near.
- click.
- double-click.
- drag start.
- dragging.
- drop / land.

Each capture must show:

- target pet changed visibly.
- default pet unchanged.
- unrelated Codex pet unchanged.
- runtime state label is not mutated by local interaction.

## Acceptance

Automated smoke:

```bash
node scripts/v11_2_pointer_interaction_smoke.mjs
```

Evidence:

- `docs/V11.x/evidence/v11_2-pointer-interaction-smoke-YYYY-MM-DD.md`
- hover/click/double-click/drag/drop capture.

Pass criteria:

- all required interactions produce visible nonblank change.
- drag final position persists.
- local interaction exits cleanly.
- zero accepted `PetEvent`.
- `CatStateMachine.current` remains unchanged by hover/click/double-click/drag.
- default and unrelated pets remain visually and state-wise unchanged.
- no raw payload, path, prompt, command, token, or Authorization in evidence.

Allowed claim:

```text
V11.2 pointer-aware interaction passed for tested local desktop-pet scenarios.
```
