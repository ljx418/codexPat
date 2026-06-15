# V15.3 Pointer Feedback Spec

日期：2026-06-09  
状态：planned。  

## Goal

Make the pet visibly react to pointer proximity, hover, click, and double-click without changing agent state or live PetInstance state outside the visual interaction layer.

## Interaction Inputs

| Input | Definition | Debounce / Timing |
| --- | --- | --- |
| `pointer_near` | pointer enters a configurable radius around the pet. | enter/leave hysteresis required. |
| `pointer_hover` | pointer stays inside pet bounds without drag. | minimum dwell threshold required. |
| `click` | primary click without drag. | ignored if double-click window is still open. |
| `double_click` | two clicks within configured window. | higher priority than click. |
| `pointer_leave` | pointer exits near/hover zone. | returns to prior allowed base behavior. |

## Required Visual Actions

- `pointer_look`
- `pointer_ear_twitch`
- `pointer_tail_focus`
- `click_paw`
- `click_blink`
- `double_click_jump`
- `double_click_roll` or `double_click_play`

## Priority Rules

Pointer feedback is allowed only below:

```text
error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random
```

Hard rules:

- `error` blocks pointer/click/double-click visual override.
- `need_input` blocks pointer/click/double-click visual override.
- `drag` blocks pointer/click/double-click.
- `double_click` prevents the first click from playing a full click action.

## Runtime Boundary

Pointer feedback must not:

- emit PetEvent.
- call notify.
- write CatStateMachine.
- modify agent state.
- read screen text.
- read clipboard.
- persist raw pointer traces.
- output prompt text, tool command text, token, Authorization, workspace path, config path, or full local path.

## Acceptance Evidence

Output:

```text
docs/V15.x/evidence/v15_3-pointer-feedback-smoke-YYYY-MM-DD.md
```

Required proof:

- pointer-near visual response.
- hover visual response.
- click visual response.
- double-click visual response.
- double-click does not produce two full click actions.
- error / need_input blocking result.
- zero accepted PetEvent.
- renderer receives safe fields only.
- real desktop screenshot/capture or deterministic visual capture.

## Failure Conditions

- pointer feedback changes live agent state.
- click/double-click emits PetEvent.
- `error` or `need_input` is visually overwritten.
- evidence contains raw pointer path, screen text, clipboard content, or sensitive data.
