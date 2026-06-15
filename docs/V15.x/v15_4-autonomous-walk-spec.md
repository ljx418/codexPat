# V15.4 Autonomous Walk Spec

日期：2026-06-09  
状态：planned。  

## Goal

Allow the pet to move on its own inside safe desktop bounds while remaining configurable, interruptible, and priority-safe.

## Behavior Model

```text
idle_allowed
  -> walk_decision
  -> walk_left / walk_right
  -> pause
  -> look
  -> turn
  -> edge_avoid
  -> settle
```

## Safe Bounds

Autonomous walk must clamp movement to:

- current monitor visible area.
- pet window size.
- safe margin.
- persisted position format already used by the app.

The pet must never be placed where a real desktop screenshot cannot capture it.

## Configuration

Required settings inputs:

- autonomous walk on/off.
- walk frequency: low / normal / lively.
- movement range: small / medium / wide.
- quiet mode disables walk.

## Interrupt Rules

Autonomous walk stops immediately when:

- `error`
- `need_input`
- `drag`
- active click / double-click
- user disables walk
- quiet mode starts

## Runtime Boundary

Autonomous walk must not:

- emit PetEvent.
- call notify.
- write CatStateMachine.
- overwrite agent state.
- move default or unrelated pets.
- record raw pointer path, screen text, clipboard, prompt text, tool command text, token, Authorization, workspace path, config path, or full local path.

## Acceptance Evidence

Output:

```text
docs/V15.x/evidence/v15_4-autonomous-walk-smoke-YYYY-MM-DD.md
```

Required proof:

- at least one visible walk cycle.
- pause and turn behavior.
- edge avoidance or deterministic edge simulation.
- no offscreen / transparent / blank visual.
- disable switch stops walk.
- quiet mode blocks walk.
- high-priority state blocks walk.
- final position remains within safe bounds.
- default and unrelated pets unchanged.

## Failure Conditions

- pet disappears or exits safe desktop bounds.
- walk continues during error, need_input, drag, or quiet mode.
- walk changes CatStateMachine or emits PetEvent.
- evidence leaks sensitive desktop or path data.
