# V11.6-V11.7 First-Run Delight and Interaction QA Spec

status: planned
date: 2026-06-05

## Goal

V11.6 makes the first app experience feel alive. V11.7 closes the whole V11
track with evidence-backed QA.

## V11.6 First-Run Delight

First-run behavior after V11.5 passes:

- default visible pet uses `living-work-cat-v1`.
- app shows a visible living cat within 10 seconds in tested local run.
- first-run UI exposes:
  - try click.
  - try drag.
  - preview Codex states.
  - create Codex work-cat.
  - skip setup.
- first-run copy must avoid internal phase jargon.

Safe demo mode:

- can demonstrate `thinking`, `running`, `success`, `need_input`, `error`.
- must be visibly labeled as local demo.
- must not emit `PetEvent`.
- must not call `notify`.
- must not write `CatStateMachine`.
- exits back to the real safe state.

Required demo reason codes:

```text
demo_started
demo_state_preview
demo_completed
demo_cancelled
demo_no_state_mutation
```

V11.6 evidence:

- `docs/V11.x/evidence/v11_6-first-run-delight-smoke-YYYY-MM-DD.md`
- app-start-to-visible-cat capture.
- click feedback capture from first-run path.
- demo start and exit capture.

## V11.7 Interaction QA Gate

V11.7 may start only after V11.1-V11.6 final evidence exists.

Required evidence inputs:

- V11.1 living idle report.
- V11.2 pointer interaction report.
- V11.3 emotion layer report.
- V11.4 action composer report.
- V11.5 flagship pack report.
- V11.6 first-run delight report.

Required captures:

- 3-minute idle.
- hover / pointer-near.
- click.
- double-click.
- drag and drop.
- all 8 core states.
- first app launch to visible pet.
- demo mode start and exit.

Required automated checks:

- nonblank frame scan.
- frame-difference scan.
- off-canvas / bounding box scan.
- transparent frame scan.
- target isolation.
- zero accepted `PetEvent` from local interactions.
- renderer safe input snapshot.
- PRD/spec review.
- drawio sync.
- claim scan.
- security scan.

Minimum regression:

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

Forbidden evidence content:

- token.
- Authorization.
- raw payload.
- prompt text.
- tool command text.
- provider payload.
- full local path.
- workspace path.
- config path.
- shell command.

Final report:

- `docs/V11.x/v11_7-final-acceptance-report.md`

Required final report sections:

- status: passed / blocked / failed.
- date.
- commit.
- scope.
- phase evidence table.
- visual QA result.
- first-run result.
- state priority result.
- target isolation result.
- regression result.
- security scan result.
- claim scan result.
- PRD/spec review.
- drawio sync.
- allowed claim.
- forbidden claims.
- final decision.

Allowed final claim:

```text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
```

Still forbidden:

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
OS-level Codex window binding ready
per-instance queue ready
```

