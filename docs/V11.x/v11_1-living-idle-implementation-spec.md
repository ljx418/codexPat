# V11.1 Living Idle Implementation Spec

status: planned
date: 2026-06-05

## Goal

Upgrade the existing V10 idle micro-interaction controller from three simple
idle actions into a living idle scheduler that can run for minutes without the
pet feeling static or repetitive.

## Current Baseline

Existing code:

- `apps/desktop/src/runtime-micro-interactions.ts`
- `apps/desktop/src/main.ts`
- `apps/desktop/src/assets/bundled-packs/work-cat-v1.ts`

Current micro actions:

- `idle_blink`
- `idle_tail_sway`
- `idle_stretch`
- `click`
- `drag`

V11.1 keeps the same safety boundary: idle behavior is local visual behavior
only. It must not emit `PetEvent`, write `CatStateMachine`, or alter agent
state.

## Required Behavior

Add a living idle scheduler with these visual-only action IDs:

```text
idle_blink
idle_look_left
idle_look_right
idle_tail_sway
idle_stretch
idle_settle
idle_nap
idle_wake
```

Required scheduler rules:

- Runs only when base state is `idle` or `sleeping`.
- Blocks on `error` and `need_input`.
- Does not start while drag/click/double-click is active.
- Does not repeat the same idle action more than twice in a row.
- Chooses at least 4 distinct idle actions over a 3-minute run.
- Enters `idle_nap` after a configurable long-idle threshold.
- `idle_wake` triggers when pointer-near occurs during `idle_nap` or
  `sleeping`.

Default timings:

| Setting | Default | Allowed Range |
| --- | --- | --- |
| idle interval | 6s | 3s - 20s |
| idle action duration | 900ms | 400ms - 2000ms |
| nap threshold | 90s | 45s - 300s |
| wake duration | 1200ms | 500ms - 2500ms |

Reason codes:

```text
base_state
idle_random_active
idle_repetition_guard
idle_priority_blocked
idle_nap_active
idle_wake_active
interaction_active
micro_expired
```

## Interface Contract

Extend the runtime micro-interaction snapshot, preserving existing fields:

```ts
type LivingIdleMicroInteraction =
  | "idle_blink"
  | "idle_look_left"
  | "idle_look_right"
  | "idle_tail_sway"
  | "idle_stretch"
  | "idle_settle"
  | "idle_nap"
  | "idle_wake";

type LivingIdleSnapshot = {
  baseState: CatState;
  displayState: CatState;
  microInteraction: LivingIdleMicroInteraction | "none";
  active: boolean;
  reasonCode: string;
  emitsPetEvent: false;
  writesCatStateMachine: false;
};
```

Renderer-facing output remains only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Asset Coverage

V11.1 may initially map new idle actions to existing `idle` frames with
CSS/SVG pose variation. V11.5 must later provide full flagship pack coverage.

Minimum V11.1 visible coverage:

- `idle_blink`: eyelid change.
- `idle_look_left`: head/eye direction change.
- `idle_look_right`: head/eye direction change.
- `idle_tail_sway`: tail movement.
- `idle_stretch`: body stretch.
- `idle_settle`: body lowers or shifts.
- `idle_nap`: sleeping-like low-energy pose.
- `idle_wake`: transition back to attentive pose.

## Acceptance

Automated smoke:

```bash
node scripts/v11_1_living_idle_smoke.mjs
```

Evidence:

- `docs/V11.x/evidence/v11_1-living-idle-smoke-YYYY-MM-DD.md`
- runtime capture for 3-minute idle.
- summary table with observed idle actions.

Pass criteria:

- at least 4 distinct idle actions observed in 3 minutes.
- same action not repeated more than twice in a row.
- `error` and `need_input` block idle random.
- pointer-near wakes from nap/sleeping.
- no blank / transparent / off-canvas frame.
- zero accepted `PetEvent` from idle behavior.

Allowed claim:

```text
V11.1 living idle system passed for tested local desktop-pet scenarios.
```

