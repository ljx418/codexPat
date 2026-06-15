# V15.4 Autonomous Walk Smoke Evidence

status: passed
date: 2026-06-10
scope: V15.4 bounded autonomous walk, turn, edge avoidance, and blocking rules for tested local desktop scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
| V15.0 prerequisite | passed | scope freeze evidence passed |
| V15.1 prerequisite | passed | interaction model evidence passed |
| V15.2 prerequisite | passed | drag physics evidence passed |
| V15.3 prerequisite | passed | pointer feedback evidence passed |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| bounded walk cycle | passed | walk_step -> walk_right -> x=48 |
| edge avoidance | passed | walk_edge_avoid -> edge_avoid -> x=100 |
| turn visual | passed | autonomous_walk_turn -> turn |
| disable switch | passed | walk_disabled |
| quiet mode blocks walk | passed | walk_quiet_mode |
| priority blocks walk | passed | walk_priority_blocked / walk_priority_blocked |
| safe renderer input maps walk phases | passed | [{"actionId":"walk_right","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"edge_avoid","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"},{"actionId":"turn","rendererKind":"runtime-selected","packId":"runtime-active-pack","playbackIntent":{"loop":true,"priority":"base"},"scale":"runtime-scale","visibility":"runtime-visibility"}] |
| zero PetEvent | passed | walk decisions and snapshots report emitsPetEvent=false |
| zero CatStateMachine write | passed | walk decisions and snapshots report writesCatStateMachine=false |
| desktop wiring | passed | main.ts ticks AutonomousWalkController, persists target position, and handles edge turn |
| target isolation boundary | passed | walk path is scoped to current pet window and does not notify default/unrelated pets |
| visual capture generated | passed | docs/V15.x/evidence/v15_4-autonomous-walk-capture-2026-06-10.html |
| security scan | passed | no token/auth/raw pointer trace/path-like leakage in V15.4 docs/code/evidence inputs |
| claim scan | passed | V15.4 scoped claim exists; V15.7 remains gated |
| PRD/spec review | passed | V15.4 implementation matches autonomous walk spec and implementation contract |

## Evidence Notes

- Bounded walk maps to safe action `walk_right` or `walk_left`.
- Edge avoidance maps to safe action `edge_avoid`.
- Turn transition maps to safe action `turn`.
- Disabled autonomous walk, quiet mode, urgent states, and drag block walk.
- Walk decisions and snapshots emit zero PetEvent and write zero CatStateMachine updates.
- The deterministic visual capture is `docs/V15.x/evidence/v15_4-autonomous-walk-capture-2026-06-10.html`.

## Safe Renderer Input Fields

```text
actionId
rendererKind
packId
playbackIntent
scale
visibility
```

## Security Boundary

No token, Authorization header, raw pointer trace, screen text, clipboard contents, prompt text, tool command text, workspace path, config path, or full local path is recorded in this evidence.

## Allowed Claim

V15 bounded autonomous walk passed for tested local desktop scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
