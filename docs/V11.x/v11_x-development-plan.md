# V11.x Development Plan: Living Work-Cat Interaction Experience

status: active; V11.1-V11.7 passed scoped
date: 2026-06-07

## Goal

V11 turns the accepted V10 animated work-cat from a state-rendering component
into a living desktop companion. The product target is stronger ordinary-user
experience than common open-source desktop-pet projects in two dimensions:

- visible life: idle variation, emotion continuity, pointer-aware feedback,
  click/drag reactions, and polished animation transitions.
- low-friction use: first open shows an animated cat, the user can discover
  interactions without reading phase docs, and Codex work-cat status remains
  understandable.

V11 does not reopen Codex monitoring semantics, provider generation, 3D
readiness, remote marketplace, or release-signing claims.

Active PRD: `docs/active/agent_desktop_pet_prd_v11.md`.

## Baseline

V10.16 accepted the selected benchmark track for tested local visual quality
and first-run onboarding scenarios. That baseline provides:

- premium bundled animated 2D cat library.
- first-run wizard.
- built-in local gallery.
- state-linked runtime animation.
- Manager preview and activation UX.

Closed V11 gap:

```text
animated work-cat exists
  -> but idle behavior is still shallow
  -> pointer/click/drag feedback is accepted scoped
  -> emotion transitions and visual priority model have accepted scoped evidence
  -> flagship living cat visual proof is accepted scoped
  -> first-run delight is not yet accepted
```

## Non-goals

- Do not claim Petdex parity achieved.
- Do not claim 3D ready.
- Do not claim automatic photo-to-3D ready.
- Do not claim provider integration verified.
- Do not add marketplace or remote asset loading.
- Do not add production signing, notarization, auto-update, Windows, or
  cross-platform readiness.
- Do not change V3/V4 Codex routing or monitoring claims.
- Do not use micro-interactions to emit `PetEvent` or mutate agent state.

## V11.1 Living Idle System

Goal: make the pet feel alive even when no agent event arrives.

Implementation scope:

- add an idle behavior scheduler with controlled randomness.
- support idle micro-actions: `blink`, `look_around`, `tail_sway`, `stretch`,
  `settle`, `nap`, `wake`.
- add repetition guard so the same micro-action is not repeated excessively.
- add long-inactivity transition from idle to sleeping/nap.
- add pointer-near wake behavior for sleeping/nap.
- ensure `error` and `need_input` priority states block idle random actions.

Acceptance evidence:

- 3-minute idle runtime capture.
- at least 4 distinct idle behaviors observed.
- no blank, fully transparent, or off-canvas frames.
- `error` / `need_input` not overwritten by idle random actions.
- sleeping/nap can wake on pointer proximity without emitting `PetEvent`.

Allowed claim:

```text
V11.1 living idle system passed for tested local desktop-pet scenarios.
```

## V11.2 Pointer-Aware Interaction

Goal: make the pet respond immediately to user presence and input.

Implementation scope:

- pointer-near hover/attention state.
- single-click feedback.
- double-click advanced feedback.
- drag start, dragging, and drop/land feedback.
- position persistence after drag.
- per-PetInstance isolation.
- no `PetEvent`, no `CatStateMachine` write, no agent state mutation.

Acceptance evidence:

- hover, click, double-click, drag, and drop runtime capture.
- target pet changes, default/unrelated pets unchanged.
- position persistence verified after drag.
- interaction state exits cleanly and returns to correct base state.

Allowed claim:

```text
V11.2 pointer-aware interaction passed for tested local desktop-pet scenarios.
```

Status: passed scoped with `docs/V11.x/evidence/v11_2-pointer-interaction-smoke-2026-06-07.md`.

## V11.3 Emotion Layer

Goal: make Codex/agent states visually expressive and emotionally continuous.

Implementation scope:

- map core states to emotion profiles:
  - `idle`: calm.
  - `thinking`: focused.
  - `running`: busy.
  - `success`: happy transient.
  - `warning`: alert.
  - `error`: distressed / blocked.
  - `need_input`: attentive / asking.
  - `sleeping`: low-energy.
- add enter/loop/exit transition metadata where available.
- prevent `success` transient from overriding active `error` or `need_input`.
- add long-running variation that remains visually working but less mechanical.

Acceptance evidence:

- before/after visual evidence for all 8 core states.
- operator can distinguish thinking, running, warning, error, need_input, and
  sleeping without labels.
- success returns to idle only when no higher-priority state is active.
- no state flicker during rapid state changes.

Allowed claim:

```text
V11.3 emotion-layer state expression passed for tested local work-cat scenarios.
```

Status: passed scoped with `docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md`.

## V11.4 Action Composer

Goal: replace mechanical action switching with composable visual sequences.

Implementation scope:

- add visual-only action composition primitives:
  - `enter`.
  - `loop`.
  - `exit`.
  - `transient`.
  - `interruptPolicy`.
- add visual queue for renderer actions only. This is not an agent event queue
  and must not be called per-instance queue readiness.
- enforce priority:

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

- ensure lower-priority visual actions cannot interrupt higher-priority states.

Acceptance evidence:

- running -> success -> idle sequence is smooth.
- thinking -> need_input interrupts lower-priority actions correctly.
- error holds until cleared.
- rapid event smoke does not produce flicker, invisible cat, or incorrect final
  state.

Allowed claim:

```text
V11.4 visual action composer passed for tested local priority and transition scenarios.
```

Status: passed scoped with `docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md`.

## V11.5 Flagship Living Cat Asset Pack

Goal: ship one flagship animated 2D cat pack that is visibly stronger than V10
premium packs and suitable as the first-run default.

Implementation scope:

- add `packId: living-work-cat-v1`.
- cover all 8 core states.
- cover at least 6 idle micro-actions.
- cover pointer/click/drag/drop/wake/sleep transition actions.
- loop actions have at least 8 frames.
- flagship gestures have at least 3 unique visual poses.
- contact sheets and runtime captures for every action group.
- side-by-side comparison against V10 premium packs.

Acceptance evidence:

- 1x and 0.75x readability.
- no blank, transparent, or off-canvas frames.
- stable silhouette and proportions across actions.
- operator visual acceptance passes on cuteness, readability, and naturalness.

Allowed claim:

```text
V11.5 flagship living 2D work-cat pack passed for tested local visual-quality scenarios.
```

Status: passed scoped with `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-2026-06-07.md`.

## V11.6 First-Run Delight

Goal: the first app experience shows a living cat before the user needs to
understand settings.

Implementation scope:

- first launch defaults to `living-work-cat-v1` when accepted.
- show a visible animated cat within 10 seconds of app start in tested local
  environment.
- add a safe demo mode for thinking/running/success/need_input/error.
- demo mode must not emit real `PetEvent` or mutate agent state.
- keep Codex work-cat setup available but not required to see a living pet.
- reduce internal engineering terms in first-run copy.

Acceptance evidence:

- first-run recording from app start to visible living cat.
- user can click the cat and see feedback without opening docs.
- demo mode exits back to real state safely.
- default and unrelated pets remain isolated.

Allowed claim:

```text
V11.6 first-run living pet delight passed for tested local first-open scenarios.
```

## V11.7 Interaction QA Gate

Goal: close V11 with evidence, not subjective claims.

Implementation scope:

- collect recordings/screenshots:
  - 3-minute idle.
  - hover/click/double-click.
  - drag/drop.
  - all 8 core states.
  - first-run delight.
- run automated checks:
  - nonblank.
  - frame-difference.
  - off-canvas / bounding box.
  - transparent-frame scan.
  - target isolation.
  - state priority.
  - regression.
  - security and claim scans.
- perform PRD/spec review and drawio sync.

Allowed final claim:

```text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
```

## Minimum Regression

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v10_13_premium_cat_library_smoke.mjs
node scripts/v10_14_first_run_wizard_smoke.mjs
node scripts/v10_15_built_in_gallery_ux_smoke.mjs
node scripts/v10_16_benchmark_surpass_gate_smoke.mjs
```

## Go / No-Go

V11.1-V11.7 completed and accepted scoped. No additional V11 feature
implementation is planned under this track.
