# V11.x Acceptance Plan: Living Work-Cat Interaction Experience

status: active; V11.1-V11.7 passed scoped
date: 2026-06-07

## Acceptance Rule

V11 may pass only when the local desktop pet visibly behaves like a living
companion in tested scenarios. Static screenshots, raw manifest coverage,
preview-only evidence, or subjective claims without runtime captures are not
enough.

V11 must preserve the V3/V4/V10 safety and routing boundaries:

- micro-interactions do not emit `PetEvent`.
- micro-interactions do not write `CatStateMachine`.
- renderer receives only safe action/pack/playback fields.
- default and unrelated pets are not affected by target interactions.

Active PRD: `docs/active/agent_desktop_pet_prd_v11.md`.

## User Experience Acceptance Gate

V11 final acceptance must prove the product experience, not only the animation
pipeline. By the end of V11, a user should be able to experience a living
work-cat on the desktop:

- first launch shows a visible, animated cat within 10 seconds in the tested
  local desktop scenario.
- the user can understand what the cat is doing without reading internal
  PetEvent, manifest, renderer, hook, or JSONL documentation.
- pointer-near, click, double-click, drag start, dragging, and drop all produce
  visible feedback.
- Codex / Agent states produce distinguishable cat emotions and actions for
  `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`,
  and `sleeping`.
- multiple pets remain isolated; target interactions and target Codex states do
  not affect default or unrelated pets.
- local interactions are visual-only: they do not emit `PetEvent`, call
  `notify`, write `CatStateMachine`, or mutate Agent/Codex state.
- asset failures preserve or restore a visible safe cat instead of producing a
  transparent, blank, missing, or off-canvas pet.

User-scenario acceptance must include:

- Codex work-cat scenario: wrapper-launched Codex maps working/blocked/done
  states to the target cat.
- ambient companion scenario: with no Codex event, the cat still feels alive
  through idle, nap, wake, look, stretch, and tail motion.
- multi-session scenario: two work-cats can represent separate sessions without
  cross-state contamination.
- desktop arrangement scenario: drag/drop feedback is visible and position
  persists.
- first-run scenario: a new user can see, click, drag, and understand the cat
  before reading advanced setup docs.
- asset scenario: switching/importing assets keeps the pet visible and failure
  fallback is understandable.
- safety scenario: evidence contains no token, Authorization, raw payload,
  prompt text, tool command text, full local path, workspace path, config path,
  or raw terminal/provider payload.

## V11.1 Living Idle System

Required:

- 3-minute runtime capture.
- at least 4 distinct idle behaviors.
- no repeated same behavior more than 2 consecutive times.
- sleeping/nap after long inactivity.
- pointer-near wake from sleeping/nap.
- `error` and `need_input` block idle random.
- no blank / transparent / off-canvas frames.

Evidence:

- `docs/V11.x/evidence/v11_1-living-idle-smoke-YYYY-MM-DD.md`
- runtime capture image/video or HTML playback summary.

## V11.2 Pointer-Aware Interaction

Required:

- hover/near feedback.
- click feedback.
- double-click feedback.
- drag start, dragging, drop/land feedback.
- position persists after drag.
- interaction exits and returns to correct base state.
- target pet only; default/unrelated pets unchanged.
- zero accepted `PetEvent` from local interaction.

Evidence:

- `docs/V11.x/evidence/v11_2-pointer-interaction-smoke-YYYY-MM-DD.md`
- hover/click/double-click/drag/drop capture.

Status: passed scoped with `docs/V11.x/evidence/v11_2-pointer-interaction-smoke-2026-06-07.md`.

## V11.3 Emotion Layer

Required:

- all 8 core states have distinct emotion profile.
- thinking/running/warning/error/need_input/sleeping are visually
  distinguishable without labels.
- success transient does not override active error or need_input.
- rapid state changes do not flicker or leave invisible state.
- long-running variation remains visually working.

Evidence:

- `docs/V11.x/evidence/v11_3-emotion-layer-smoke-YYYY-MM-DD.md`
- before/after visual state capture.

Status: passed scoped with `docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md`.

## V11.4 Action Composer

Required:

- enter/loop/exit/transient composition works for tested actions.
- priority order is enforced:

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

- visual queue does not expose or imply agent event queue readiness.
- rapid event smoke keeps correct final visual state.
- lower-priority action cannot interrupt error or need_input.

Evidence:

- `docs/V11.x/evidence/v11_4-action-composer-smoke-YYYY-MM-DD.md`

Status: passed scoped with `docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md`.

## V11.5 Flagship Living Cat Pack

Required:

- `living-work-cat-v1` exists.
- 8 core states are covered.
- at least 6 idle micro-actions are covered.
- pointer/click/double-click/drag/drop/wake/sleep transition actions exist or
  visible fallback is documented.
- loop actions have at least 8 frames.
- flagship gestures have at least 3 unique visual poses.
- contact sheets and runtime captures exist.
- side-by-side comparison proves improvement over V10 premium packs.
- operator visual rubric passes:
  - cuteness.
  - readability.
  - naturalness.
  - state distinctness.
  - first-impression quality.

Evidence:

- `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-YYYY-MM-DD.md`
- contact sheets.
- runtime captures.

Status: passed scoped with `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-2026-06-07.md`.

## V11.6 First-Run Delight

Required:

- first launch shows visible living cat within 10 seconds in tested local run.
- user can click and see feedback without opening docs.
- demo mode can show thinking/running/success/need_input/error without
  mutating agent state.
- Codex work-cat path remains available but not required for the pet to feel
  alive.
- first-run copy avoids internal phase jargon.

Evidence:

- `docs/V11.x/evidence/v11_6-first-run-delight-smoke-YYYY-MM-DD.md`
- app-start-to-visible-cat capture.

## V11.7 Final Interaction QA Gate

Required:

- V11.1-V11.6 final reports exist.
- all visual captures reviewed.
- nonblank / frame-difference / off-canvas scans pass.
- target isolation passes.
- regression passes.
- security scan passes.
- claim scan passes.
- PRD/spec review passes.
- drawio sync evidence exists.

Evidence:

- `docs/V11.x/v11_7-final-acceptance-report.md`
- `docs/V11.x/evidence/v11_7-interaction-qa-gate-smoke-YYYY-MM-DD.md`

## Final Allowed Claim

```text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
```

## Forbidden Claims

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
OS-level Codex window binding ready
per-instance queue ready
```
