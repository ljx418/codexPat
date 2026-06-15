# V10.15 Built-in Gallery & Safe Pack UX Acceptance Plan

status: planned
date: 2026-06-05

## Gallery Requirements

Desktop Manager must provide a local built-in pet gallery.

Required controls:

- filter by style tag.
- preview all 8 core actions.
- activate for selected PetInstance.
- restore default work-cat.
- delete user-imported packs.

Required metadata:

- packId.
- displayName.
- rendererKind.
- action coverage.
- frame count and fps.
- license and attribution.
- quality status.
- fallback status.

## Safety Requirements

Preview must not:

- call `notify`.
- write `CatStateMachine`.
- mutate live PetInstance state.
- activate, delete, or rollback without explicit user command.
- receive raw prompt, provider payload, token, Authorization, full local path,
  workspace path, config path, or shell command.

## Evidence

- gallery screenshot.
- preview screenshot.
- activation screenshot.
- restore-default screenshot.
- delete user-imported pack screenshot.
- renderer input snapshot with safe fields only.

