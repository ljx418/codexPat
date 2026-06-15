# V11.2 Pointer-Aware Interaction Smoke

status: passed
date: 2026-06-07

## Scope

This evidence covers V11.2 pointer-aware local desktop-pet interactions only:
pointer-near, pointer-leave, click, double-click, drag_start, dragging, and
drop. It does not claim V11 final acceptance, Petdex parity, 3D readiness,
provider integration, production release readiness, cross-platform readiness,
Windows readiness, OS-level Codex window binding readiness, or per-instance
agent queue readiness.

## Evidence Files

- HTML capture: `docs/V11.x/evidence/v11_2-pointer-interaction-capture-2026-06-07.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| pointer-near feedback | passed | pointerenter maps to pointer_near visual feedback |
| pointer-leave feedback | passed | pointerleave maps to pointer_leave return feedback |
| click feedback | passed | click maps to local success transient display |
| double-click feedback | passed | double-click maps to stronger local positive transient |
| drag start feedback | passed | drag threshold starts drag_start feedback |
| dragging feedback | passed | active window drag maps to dragging loop feedback |
| drop feedback | passed | drag end maps to drop transient and returns to base state |
| priority blocking | passed | error and need_input block pointer/click/double-click/drag feedback |
| zero accepted PetEvent | passed | all V11.2 interaction snapshots report emitsPetEvent=false |
| no CatStateMachine write | passed | all V11.2 interaction snapshots report writesCatStateMachine=false |
| target isolation boundary | passed | controller instances are per runtime pet window and store no global target state |
| runtime wiring | passed | main.ts wires pointerenter/leave/click/dblclick/drag-start/dragging/drop without notify |
| CSS visible feedback | passed | styles.css contains V11.2 micro-interaction animation selectors |
| security scan | passed | no token, Authorization, prompt, command, raw payload, full local path, workspace path, or config path in V11.2 evidence inputs |
| claim scan | passed | V11.2 scoped claim only; no final V11 overclaim |

## Snapshot Summary

| Snapshot | Micro Interaction | Display State | Reason Code | Emits PetEvent | Writes CatStateMachine |
| --- | --- | --- | --- | --- | --- |
| pointerNear | pointer_near | idle | pointer_near_active | false | false |
| pointerLeave | pointer_leave | idle | pointer_leave_returned | false | false |
| click | click | success | click_active | false | false |
| doubleClick | double_click | success | double_click_active | false | false |
| dragStart | drag_start | running | drag_start_active | false | false |
| dragging | dragging | running | dragging_active | false | false |
| drop | drop | idle | drop_active | false | false |
| dropExpired | none | idle | interaction_expired | false | false |
| errorBlocksPointer | none | error | priority_state_blocks_pointer | false | false |
| errorBlocksClick | none | error | priority_state_blocks_pointer | false | false |
| errorBlocksDoubleClick | none | error | priority_state_blocks_pointer | false | false |
| errorBlocksDrag | none | error | priority_state_blocks_pointer | false | false |
| needInputBlocksDrop | none | need_input | priority_state_blocks_pointer | false | false |

## Safe Renderer Output Boundary

Renderer output remains limited to:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Allowed Claim

```text
V11.2 pointer-aware interaction passed for tested local desktop-pet scenarios.
```

## Final Decision

V11.2 pointer-aware interaction smoke passed. V11.2 remains a scoped phase claim, not final V11 acceptance.
