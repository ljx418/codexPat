# V11.3-V11.4 Emotion Layer and Action Composer Spec

status: accepted scoped
date: 2026-06-07

## Goal

Make state changes feel emotionally continuous instead of mechanical. V11.3
defines emotion profiles; V11.4 defines how actions are sequenced and
interrupted.

## Emotion Profiles

| Core State | Emotion Profile | Required Visual Cues | Default Loop |
| --- | --- | --- | --- |
| `idle` | calm | relaxed eyes, low movement, tail motion | `idle` |
| `thinking` | focused | narrowed/focused eyes, head tilt, small movement | `thinking` |
| `running` | busy | faster body/paw motion, alert eyes | `running` |
| `success` | happy transient | jump, smile, bright eyes | `success` then idle |
| `warning` | alert | wide eyes, raised ears, caution pose | `warning` |
| `error` | distressed / blocked | droop, sad eyes, shake or slump | `error` holds |
| `need_input` | asking / attentive | looking at user, raised paw or prompt-like pose | `need_input` holds |
| `sleeping` | low energy | closed eyes, low body, sleep breath | `sleeping` |

V11.3 must not create new PetEvent levels. It maps existing safe `CatState`
values to richer visual output.

## Action Phase Model

Each visual action may expose:

```ts
type VisualActionPhase = "enter" | "loop" | "exit" | "transient";

type VisualActionPlan = {
  actionId: string;
  phase: VisualActionPhase;
  priority: number;
  interruptPolicy: "block_lower" | "allow_same" | "replace_lower" | "hold_until_state_change";
  durationMs: number | "loop";
  fallbackActionId: string;
};
```

This is a visual playback plan only. It is not an agent queue and must not be
claimed as per-instance queue readiness.

## Priority Order

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

Required rules:

- `error` holds until the safe state changes away from error.
- `need_input` holds until the safe state changes away from need_input.
- `success` is transient and returns to idle unless blocked by `error` or
  `need_input`.
- `drag_start`, `dragging`, and `drop` override click/double-click/idle but
  not error/need_input.
- lower-priority idle random never interrupts running/thinking/warning/error.
- rapid incoming events must leave a deterministic final visual action.

## Transition Table

| From | To | Required Behavior |
| --- | --- | --- |
| `thinking` | `running` | thinking exit or direct busy enter; no blank frame |
| `running` | `success` | success transient then idle |
| `running` | `error` | error interrupts immediately |
| `thinking` | `need_input` | need_input interrupts immediately |
| `success` | `error` | error wins and success does not return to idle |
| `need_input` | `idle` | need_input exits only after state changes |
| `idle_nap` | `pointer_near` | wake transient then idle/attention |
| `dragging` | `drop` | drop transient then current safe base state |

## Reason Codes

```text
emotion_profile_resolved
action_enter_selected
action_loop_selected
action_exit_selected
action_transient_selected
priority_interrupt_applied
priority_hold_active
lower_priority_blocked
success_transient_return_idle
rapid_event_final_state_stable
fallback_action_selected
```

## Acceptance

Automated smokes:

```bash
node scripts/v11_3_emotion_layer_smoke.mjs
node scripts/v11_4_action_composer_smoke.mjs
```

Evidence:

- `docs/V11.x/evidence/v11_3-emotion-layer-smoke-YYYY-MM-DD.md`
- `docs/V11.x/evidence/v11_4-action-composer-smoke-YYYY-MM-DD.md`

Accepted evidence:

- `docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md`
- `docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md`

Pass criteria:

- all 8 core states have distinct emotion profile.
- operator can distinguish thinking/running/warning/error/need_input/sleeping
  without labels.
- transition table passes.
- rapid event sequence produces deterministic final visual state.
- no flicker, blank, fully transparent, or off-canvas frames.
- no renderer unsafe fields.

Allowed claims:

```text
V11.3 emotion-layer state expression passed for tested local work-cat scenarios.
V11.4 visual action composer passed for tested local priority and transition scenarios.
```
