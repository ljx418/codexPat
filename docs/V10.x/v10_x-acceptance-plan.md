# V10.x Acceptance Plan: Product-grade Animated Work-Cat Experience

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Acceptance Rule

V10.1-V10.5 remain accepted as scoped baseline evidence. V10.6 passed scoped
for local animation format rebaseline. V10 final product-grade acceptance is
not complete until V10.7-V10.10 pass. Static screenshots, manifests,
prompt-only plans, rough procedural frames, or format-only adapter evidence are
insufficient for the final V10 experience claim.

V10.11 is an additional product-experience rebaseline gate. It does not reopen
the V10.10 product-grade animated 2D work-cat claim; it validates that current
capabilities are explained, onboarded, and evidenced without false active-stage
or readiness claims.

## V10.11 Product Experience Rebaseline

Required:

- README and active docs agree that V10.11 is the active
  product-experience rebaseline.
- active docs do not treat any non-V10 phase as the current desktop-pet phase.
- three-minute Codex work-cat onboarding text shows the recommended wrapper
  JSONL path and clearly says already-open Codex windows are unsupported for
  automatic monitoring.
- drawio gap map includes current architecture, target architecture delta,
  development/acceptance plan, milestones, gates, and exit conditions.
- real desktop screenshots are recorded under `docs/V10.x/evidence/`.
- HTML evidence report links real screenshots and is not used as mock proof.
- regression, security scan, and claim scan pass.

Evidence:

- `docs/V10.x/v10_11-product-experience-rebaseline.md`
- `docs/V10.x/v10_11-final-acceptance-report.md`
- `docs/V10.x/evidence/v10_11-settings-real-window-YYYY-MM-DD.png`

Status: passed scoped.

## V10.12-V10.16 Open-source Benchmark Surpass Track

Status: accepted scoped.

Required:

- V10.12 benchmark spec identifies selected external benchmarks, metrics, and
  no-false-green claim boundary.
- V10.13 ships at least 6 premium local bundled animated 2D cats, each with 8
  core actions and visual QA evidence.
- V10.14 first-run wizard lets a new user create a visible pet in at most 3
  steps and a Codex work-cat with visible test reaction in at most 5 steps.
- V10.15 built-in gallery supports safe preview, activation, restore default,
  and user-imported pack deletion.
- V10.16 final gate compares selected visual/onboarding dimensions against the
  benchmark set with real screenshots or recordings.

Evidence:

- `docs/V10.x/v10_12-v10_16-open-source-surpass-plan.md`
- `docs/V10.x/v10_12-open-source-benchmark-spec.md`
- `docs/V10.x/v10_13-premium-cat-library-acceptance-plan.md`
- `docs/V10.x/v10_13-premium-cat-asset-production-spec.md`
- `docs/V10.x/v10_14-first-run-wizard-acceptance-plan.md`
- `docs/V10.x/v10_14-first-run-wizard-ui-state-spec.md`
- `docs/V10.x/v10_15-built-in-gallery-ux-acceptance-plan.md`
- `docs/V10.x/v10_15-gallery-data-model-and-ux-spec.md`
- `docs/V10.x/v10_16-benchmark-scoring-rubric.md`
- `docs/V10.x/v10_16-benchmark-surpass-gate.md`
- `docs/V10.x/v10_12-v10_16-final-report-templates.md`

V10.16 may pass only if screenshots/recordings prove both selected dimensions:
premium local visual quality and ordinary-user first-run onboarding.

## V10.6 Animation Format Rebaseline

Status: passed scoped.

Required:

- local `pet.json + spritesheet` and `pet.json + png sequence` pack examples
  parse into the existing safe action model.
- all 8 core actions can be represented.
- malformed metadata is rejected without changing the active pack.
- missing action resolves to visible fallback where allowed.
- no remote URL, absolute path, path traversal, script field, event handler,
  raw path, raw payload, token, Authorization, or shell command is accepted.

Evidence:

- `docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md`

## V10.7 High-quality Default 2D Work Cat Pack

Required:

- bundled `work-cat-v1` exists and is selectable as the default work-cat pack.
- 8 core actions exist.
- `idle`, `thinking`, `running`, and `sleeping` have at least 8 frames.
- `success`, `warning`, `error`, and `need_input` have at least 4 frames.
- every frame is nonblank, visible, transparent-background compatible, and
  inside bounds.
- action identity is visually consistent across all actions.
- operator can distinguish thinking, running, warning, error, need_input, and
  sleeping without reading labels.
- 1x and 0.75x scale are visible.

Evidence:

- `docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md`
- contact sheet and runtime playback capture for all actions.

## V10.8 Runtime Micro-interaction Layer

Required:

- idle loop shows at least one random micro-action within 30 seconds.
- click feedback is visible and does not mutate agent state.
- drag feedback is visible and position persistence still works.
- success transient returns to idle unless active error or need_input blocks it.
- default and unrelated pets remain unchanged.

Evidence:

- `docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-YYYY-MM-DD.md`

## V10.9 Manager Preview & Activation UX Polish

Required:

- Manager displays current active pack.
- Manager previews all 8 core actions.
- preview shows coverage state, frame count, fps, loop/transient, fallback, and
  sanitized reasonCode.
- preview does not call `notify`.
- preview does not write to `CatStateMachine`.
- preview does not activate, delete, or rollback packs.
- "restore default work cat" reactivates `work-cat-v1`.
- app restart restores active pack mapping.

Evidence:

- `docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md`

Status: passed scoped. V10.9 does not prove the final product-grade V10 claim;
V10.10 remains required.

## V10.10 Product-grade Animation Gate

Required:

- V10.6, V10.7, V10.8, and V10.9 final evidence exists.
- full visual QA passes for `work-cat-v1`.
- corrupt/missing/static assets fallback to a visible safe cat.
- default and unrelated pets remain unchanged during preview and runtime tests.
- security scan passes.
- claim scan passes.
- PRD/spec review passes.
- drawio gap map matches final status.

Evidence:

- `docs/V10.x/v10_x-product-grade-final-acceptance-report.md`

Status: passed scoped.

## Minimum Regression

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs
node scripts/v9_2_minimax_static_2d_generation_smoke.mjs
node scripts/v9_3_minimax_dynamic_2d_generation_smoke.mjs
```

## Manual Acceptance Minimum

At final acceptance, the operator must see:

- the default work cat is visually better than `sprite-v3-animated`.
- all core actions are previewable.
- state changes visibly switch runtime animation.
- idle/click/drag micro-interactions are visible.
- fallback never produces a blank or transparent pet.
