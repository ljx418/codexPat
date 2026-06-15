# V15.1 Interaction Priority Spec

日期：2026-06-09  
状态：planned。  

## Goal

Define and implement a single priority model so agent state, drag, pointer, click, success transient, autonomous walk, and idle actions cannot conflict.

## Priority Order

```text
error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random
```

## Required Safe Actions

- `idle_blink`
- `idle_look_left`
- `idle_look_right`
- `idle_tail_sway`
- `idle_stretch`
- `idle_settle`
- `idle_nap`
- `idle_wake`
- `pointer_look`
- `click_paw`
- `double_click_jump`
- `drag_grabbed`
- `dragging`
- `drag_release`
- `drag_land`
- `walk_left`
- `walk_right`
- `turn`
- `edge_avoid`

## Runtime Boundary

The interaction model must not:

- emit PetEvent.
- call notify.
- write CatStateMachine.
- change agent state.
- expose raw pointer path, screen contents, clipboard, prompt, tool command, token, Authorization, workspace path, config path, or full local path.

## Acceptance

- priority table unit tests pass.
- error and need_input block all lower-priority interactions.
- drag blocks click/pointer/idle/walk.
- double_click blocks click.
- success transient does not override error or need_input.
- idle random runs only when no higher priority state exists.

## Evidence

Output:

```text
docs/V15.x/evidence/v15_1-interaction-model-smoke-YYYY-MM-DD.md
```

Evidence must include:

- priority matrix result.
- blocked lower-priority action result.
- idle scheduler allowed / blocked result.
- zero PetEvent result.
- zero CatStateMachine write result.
- safe renderer input snapshot.
- security scan result.
