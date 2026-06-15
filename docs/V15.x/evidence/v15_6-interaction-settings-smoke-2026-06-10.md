# V15.6 Interaction Settings Smoke Evidence

status: passed
date: 2026-06-10
scope: V15.6 interaction settings controls, persistence, quiet mode, and isolated preview for tested local Desktop Manager scenarios.

## Results

| Gate | Result | Notes |
| --- | --- | --- |
| V15.0 prerequisite | passed | scope freeze evidence passed |
| V15.1 prerequisite | passed | interaction model evidence passed |
| V15.2 prerequisite | passed | drag physics evidence passed |
| V15.3 prerequisite | passed | pointer feedback evidence passed |
| V15.4 prerequisite | passed | autonomous walk evidence passed |
| V15.5 prerequisite | passed | emotion composer evidence passed |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| settings sanitize and persistence | passed | {"autonomousWalk":false,"pointerReactions":false,"clickReactions":true,"dragPhysics":true,"quietMode":true,"interactionFrequency":"low","motionIntensity":"subtle"} |
| preview sandbox | passed | drag:drag_grabbed:preview_interaction_safe; pointer_near:pointer_look:preview_interaction_safe; pointer_hover:pointer_ear_twitch:preview_interaction_safe; click:click_paw:preview_interaction_safe; double_click:double_click_jump:preview_interaction_safe; autonomous_walk:walk_right:preview_interaction_safe; quiet_mode:idle_settle:preview_quiet_mode_safe |
| quiet mode behavior | passed | walk_quiet_mode |
| zero PetEvent | passed | all preview snapshots report emitsPetEvent=false |
| zero CatStateMachine write | passed | all preview snapshots report writesCatStateMachine=false |
| settings UI controls visible | passed | settings page contains all required controls and preview buttons |
| preview does not call notify | passed | preview wiring updates local DOM summary only |
| visual capture generated | passed | docs/V15.x/evidence/v15_6-interaction-settings-capture-2026-06-10.html |
| security scan | passed | no token/auth/raw settings trace/path-like leakage in V15.6 docs/code/evidence inputs |
| claim scan | passed | V15.6 scoped claim exists; V15.7 remains gated |
| PRD/spec review | passed | V15.6 implementation matches settings preview spec and implementation contract |

## Preview Summary

```text
drag:drag_grabbed:preview_interaction_safe; pointer_near:pointer_look:preview_interaction_safe; pointer_hover:pointer_ear_twitch:preview_interaction_safe; click:click_paw:preview_interaction_safe; double_click:double_click_jump:preview_interaction_safe; autonomous_walk:walk_right:preview_interaction_safe; quiet_mode:idle_settle:preview_quiet_mode_safe
```

## Evidence Notes

- Settings controls include autonomous walk, pointer reactions, click reactions, drag physics, quiet mode, interaction frequency, and motion intensity.
- Deterministic storage reload proves persistence.
- Preview sandbox emits zero PetEvent, writes zero CatStateMachine updates, and does not mutate live PetInstance state.
- Quiet mode blocks autonomous walk.
- The deterministic visual capture is `docs/V15.x/evidence/v15_6-interaction-settings-capture-2026-06-10.html`.

## Security Boundary

No token, Authorization header, raw pointer trace, raw payload, screen text, clipboard contents, prompt text, tool command text, workspace path, config path, or full local path is recorded in this evidence.

## Allowed Claim

V15 interaction settings and preview passed for tested local Desktop Manager scenarios.

## Forbidden Claims

This evidence does not claim Petdex parity, production release readiness, Windows readiness, cross-platform readiness, 3D readiness, provider integration, OS-level Codex window binding, or all Codex workflows verified.
