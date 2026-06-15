# V15.1 Interaction Model Smoke Evidence

status: passed
date: 2026-06-10

## Scope

This evidence covers the V15.1 priority-safe interaction model and living idle
scheduler rebaseline. It does not pass drag desktop physics, pointer UX,
autonomous walk, settings UX, final V15 QA, Petdex parity, 3D readiness,
provider readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop unit test suite | passed | exit=0 |
| priority order frozen | passed | error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random |
| required safe actions present | passed | idle_blink, idle_look_left, idle_look_right, idle_tail_sway, idle_stretch, idle_settle, idle_nap, idle_wake, pointer_look, click_paw, double_click_jump, drag_grabbed, dragging, drag_release, drag_land, walk_left, walk_right, turn, edge_avoid |
| error blocks lower-priority interactions | passed | priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_micro |
| need_input blocks lower-priority interactions | passed | priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_pointer, priority_state_blocks_micro |
| drag blocks pointer/click/idle | passed | dragging, dragging, dragging, dragging |
| success transient does not override urgent state | passed | error -> success / success_transient |
| idle scheduler allowed / blocked | passed | idle_blink / idle_random_active |
| safe renderer input snapshot | passed | [{"actionId":"idle_blink","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"pointer_look","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"click_paw","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":false,"priority":"transient","durationMs":900},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"drag_grabbed","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"}] |
| zero PetEvent | passed | all snapshots report emitsPetEvent=false |
| zero CatStateMachine write | passed | all snapshots report writesCatStateMachine=false |
| security scan | passed | no token/auth/raw payload/path-like leakage in V15.1 docs/code/evidence inputs |
| claim scan | passed | V15.1 scoped allowed claim exists; V15.7 remains gated |
| PRD/spec review | passed | V15.1 implementation matches active PRD, acceptance plan, and implementation contract |

## Safe Renderer Input Snapshot

```json
[
  {
    "actionId": "idle_blink",
    "rendererKind": "runtime-selected",
    "packId": "runtime-active-pack",
    "playbackIntent": {
      "loop": true,
      "priority": "base"
    },
    "scale": "runtime-scale",
    "visibility": "runtime-visibility"
  },
  {
    "actionId": "pointer_look",
    "rendererKind": "runtime-selected",
    "packId": "runtime-active-pack",
    "playbackIntent": {
      "loop": true,
      "priority": "base"
    },
    "scale": "runtime-scale",
    "visibility": "runtime-visibility"
  },
  {
    "actionId": "click_paw",
    "rendererKind": "runtime-selected",
    "packId": "runtime-active-pack",
    "playbackIntent": {
      "loop": false,
      "priority": "transient",
      "durationMs": 900
    },
    "scale": "runtime-scale",
    "visibility": "runtime-visibility"
  },
  {
    "actionId": "drag_grabbed",
    "rendererKind": "runtime-selected",
    "packId": "runtime-active-pack",
    "playbackIntent": {
      "loop": true,
      "priority": "base"
    },
    "scale": "runtime-scale",
    "visibility": "runtime-visibility"
  }
]
```

## Allowed Claim

Allowed only if status is passed:

```text
V15 priority-safe interaction model and living idle scheduler rebaseline passed for tested local scenarios.
```

## Forbidden Claims

This evidence does not allow:

- V15 living desktop pet interaction upgrade passed.
- V15 drag physics and release/land interaction passed.
- V15 pointer-aware hover/click/double-click feedback passed.
- V15 bounded autonomous walk passed.
- Petdex parity achieved.
- 3D ready.
- provider integration verified.
- production signed release ready.
- Windows ready.
- cross-platform ready.

## Drift / False-green Risk

Risk level after V15.1: Medium.

Reason: V15.1 is unit/smoke evidence for the interaction priority model. Desktop
visual evidence is still required for V15.2-V15.7 and cannot be inferred from
this phase.

## Final Decision

V15.1 passed. V15.2 may proceed after phase-specific PRD/spec review.
