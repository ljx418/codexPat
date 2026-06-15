# V11.1 PRD / Spec Review

status: passed
date: 2026-06-05

## Scope

This review covers V11.1 Living Idle System only.

## PRD Alignment

PRD target:

- the pet should feel alive while idle.
- local interactions must not emit `PetEvent`.
- local interactions must not mutate Agent/Codex state.
- V11 must not claim Petdex parity, 3D readiness, provider readiness,
  production release readiness, cross-platform readiness, or Windows readiness.

V11.1 implementation alignment:

- added living idle actions:
  - `idle_blink`
  - `idle_look_left`
  - `idle_look_right`
  - `idle_tail_sway`
  - `idle_stretch`
  - `idle_settle`
  - `idle_nap`
  - `idle_wake`
- idle actions run only for idle/sleeping base states.
- `error` and `need_input` block idle random behavior.
- click and drag active states block idle random behavior.
- pointer-near can wake from nap/sleeping.
- snapshots keep `emitsPetEvent=false` and `writesCatStateMachine=false`.

## Drift / False-green Risk Review

| Risk | Result | Notes |
| --- | --- | --- |
| V11.1 overclaims V11 final | passed | V11.7 remains No-Go. |
| idle behavior mutates agent state | passed | controller snapshots assert no PetEvent and no CatStateMachine write. |
| visual evidence overclaims product quality | passed | V11.1 claims scheduler behavior only; flagship visual quality remains V11.5. |
| Petdex / 3D / provider overclaim | passed | forbidden claims remain not-ready. |

## Decision

V11.1 PRD/spec review passed for the scoped living idle scheduler.

V11.2 may enter planning audit after V11.1 final acceptance, but V11 final
acceptance remains blocked until V11.1-V11.6 evidence all pass.

