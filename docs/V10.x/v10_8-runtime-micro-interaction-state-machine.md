# V10.8 Runtime Micro-interaction State Machine

status: accepted-spec-v10.8-passed
date: 2026-06-04

## Goal

Define runtime micro-interactions that make the work cat feel alive without
polluting agent state or PetEvent routing.

V10.8 has passed scoped against this spec. V10.9 Manager polish and V10.10
final product-grade visual QA remain required before the final V10 claim.

## Interaction Types

Supported local micro-interactions:

- idle random actions: blink, tail sway, stretch.
- click feedback.
- drag feedback.

These are UI-only behaviors.

## Priority Order

Highest to lowest:

```text
error
need_input
drag
click
success transient
idle random
base state loop
```

Rules:

- `error` blocks success and idle random overrides.
- `need_input` blocks success and idle random overrides.
- drag overrides click while active.
- click may interrupt idle random but not drag, error, or need_input.
- success transient returns to idle unless error or need_input is active.

## Forbidden State Mutation

Micro-interactions must not:

- emit PetEvent.
- call `notify`.
- write `CatStateMachine`.
- change agent state.
- change Codex/agent binding.
- affect default or unrelated pets.

## Idle Random Actions

Actions:

- blink.
- tail sway.
- stretch.

Scheduling:

- enabled only during base `idle`.
- at least one micro-action should be observable within 30 seconds.
- random interval must be bounded and deterministic under test mode.
- idle random action must return to idle loop.

## Click Feedback

Behavior:

- visible local response on the clicked pet only.
- duration target: 300-1200 ms.
- returns to current base or priority state.
- no PetEvent or state-machine write.

## Drag Feedback

Behavior:

- visible local drag pose while dragging.
- drop returns to current base or priority state.
- persisted position must still update through existing position save behavior.
- drag must not alter agent state.

## Target Isolation

Every micro-interaction applies only to the interacted PetInstance.

Required isolation checks:

- default pet unchanged when another pet is clicked/dragged.
- unrelated Codex pets unchanged.
- agent state remains unchanged.

## Evidence Requirements

Evidence file:

```text
docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-2026-06-04.md
```

Evidence must include:

- idle 30-second micro-action capture.
- click feedback capture.
- drag feedback capture.
- priority order result.
- position persistence result after drag.
- target isolation result.
- no PetEvent accepted during click/drag micro-interaction.
- security scan result.
- claim scan result.
