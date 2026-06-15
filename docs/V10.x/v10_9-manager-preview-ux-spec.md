# V10.9 Manager Preview UX Spec

status: accepted-scoped
date: 2026-06-04

## Goal

Define the Desktop Manager UX required to make animation packs understandable
and safe for normal users.

## Required UI Elements

Manager must display:

- active pack display.
- fallback pack display.
- renderer kind.
- all 8 core action preview controls.
- coverage state.
- frame count.
- fps.
- loop/transient label.
- fallback action ID.
- sanitized reasonCode.
- restore default work cat action.

Core actions:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

Coverage states:

```text
animated
static
fallback
missing
```

## Active Pack Display

Shows:

- display name.
- safe pack ID.
- renderer kind.
- whether pack is default, imported, or fallback.
- no source path.
- no workspace path.

## Fallback Pack Display

Shows:

- fallback pack display name.
- safe fallback pack ID.
- reason fallback is active when applicable.

## Action Preview

Preview must:

- preview all 8 core actions.
- use isolated preview renderer.
- show visible fallback for missing/corrupt/partial action.
- show sanitized reasonCode.
- not change live pet state.

Preview must not:

- call `notify`.
- write `CatStateMachine`.
- change live PetInstance state.
- activate a pack.
- delete a pack.
- rollback a pack.
- send PetEvent.

## Restore Default Work Cat

Behavior:

- restores `work-cat-v1` as the selected default pack.
- preserves app-managed storage.
- if restore fails, previous active pack remains active.
- success/failure uses sanitized reasonCode.

## Restart Persistence

Required:

- active pack mapping persists after app restart.
- fallback reason does not expose source path.
- invalid persisted pack falls back to visible safe default.

## Evidence Requirements

Evidence file:

```text
docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-YYYY-MM-DD.md
```

Accepted evidence:

```text
docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md
```

V10.9 passed scoped against this spec. It does not prove final product-grade
V10 acceptance; V10.10 closure remains required.

Evidence must include:

- preview for all core actions.
- active pack display result.
- fallback display result.
- restore default result.
- restart persistence result.
- preview zero accepted PetEvent result.
- live PetInstance unchanged by preview result.
- security scan result.
- claim scan result.
