# V15.2 Drag Physics Smoke Evidence

status: passed
date: 2026-06-10

## Scope

This evidence covers V15.2 drag physics and release/land interaction behavior.
It does not pass V15.3 pointer feedback, V15.4 autonomous walk, V15.5 emotion
composer, V15.6 settings UX, V15.7 final gate, Petdex parity, 3D readiness,
provider readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| V15.0 prerequisite | passed | scope freeze evidence passed |
| V15.1 prerequisite | passed | interaction model evidence passed |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| drag visual sequence | passed | drag_start -> dragging -> drag_release -> drag_land -> none |
| release / land timing | passed | drag_release_active -> drag_land_active -> interaction_expired |
| safe renderer input maps drag phases | passed | [{"actionId":"drag_grabbed","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"dragging","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"drag_release","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":false,"priority":"transient","durationMs":900},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"drag_land","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":false,"priority":"transient","durationMs":900},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"idle","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"}] |
| zero PetEvent | passed | drag snapshots report emitsPetEvent=false |
| zero CatStateMachine write | passed | drag snapshots report writesCatStateMachine=false |
| native drag ghost guard | passed | CSS drag/select disabled, dragstart/selectstart guard installed, sprite images draggable=false |
| position persistence path | passed | Tauri moved event persists position and renderer reads final position after drag |
| target isolation boundary | passed | drag logic is scoped to current pet shell/window and does not notify default/unrelated pets |
| visual capture generated | passed | docs/V15.x/evidence/v15_2-drag-physics-capture-2026-06-10.html |
| security scan | passed | no token/auth/raw pointer trace/path-like leakage in V15.2 docs/code/evidence inputs |
| claim scan | passed | V15.2 scoped claim exists; V15.7 remains gated |
| PRD/spec review | passed | V15.2 implementation matches drag physics spec and implementation contract |

## Drag Capture

- HTML capture: `docs/V15.x/evidence/v15_2-drag-physics-capture-2026-06-10.html`

## Safe Renderer Input Snapshot

```json
[
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
  },
  {
    "actionId": "dragging",
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
    "actionId": "drag_release",
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
    "actionId": "drag_land",
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
    "actionId": "idle",
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
V15 drag physics and release/land interaction passed for tested local desktop scenarios.
```

## Forbidden Claims

This evidence does not allow:

- V15 living desktop pet interaction upgrade passed.
- V15 pointer-aware hover/click/double-click feedback passed.
- V15 bounded autonomous walk passed.
- Petdex parity achieved.
- 3D ready.
- provider integration verified.
- production signed release ready.
- Windows ready.
- cross-platform ready.

## Drift / False-green Risk

Risk level after V15.2: Medium.

Reason: V15.2 proves drag sequence, native drag ghost prevention, and position
persistence code paths with deterministic local capture. Full final desktop
interaction QA remains required in V15.7.

## Final Decision

V15.2 passed. V15.3 may proceed after phase-specific PRD/spec review.
