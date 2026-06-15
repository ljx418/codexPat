# V10.x Milestones

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Milestone Summary

| Milestone | Phase | Goal | Exit Evidence |
| --- | --- | --- | --- |
| M0 | V10.1-V10.5 | Scoped baseline already accepted | `v10_x-baseline-final-acceptance-report.md` |
| M6 | V10.6 | Animation format rebaseline accepted scoped | `v10_6-animation-format-rebaseline-smoke-2026-06-04.md` |
| M7 | V10.7 | High-quality default 2D work-cat pack accepted scoped | `v10_7-work-cat-v1-visual-smoke-2026-06-04.md` |
| M8 | V10.8 | Runtime micro-interaction layer accepted scoped | `v10_8-runtime-micro-interaction-smoke-2026-06-04.md` |
| M9 | V10.9 | Manager preview and activation polish accepted scoped | `v10_9-manager-preview-activation-smoke-2026-06-04.md` |
| M10 | V10.10 | Product-grade animation gate accepted scoped | `v10_x-product-grade-final-acceptance-report.md` |
| M11 | V10.11 | Product experience rebaseline passed scoped | `v10_11-final-acceptance-report.md` |
| M12 | V10.12 | Open-source benchmark spec accepted | `v10_12-open-source-benchmark-spec.md` |
| M13 | V10.13 | Premium built-in animated cat library accepted | `v10_13-final-acceptance-report.md` |
| M14 | V10.14 | Ordinary-user first-run wizard accepted | `v10_14-final-acceptance-report.md` |
| M15 | V10.15 | Built-in gallery and safe pack UX accepted | `v10_15-final-acceptance-report.md` |
| M16 | V10.16 | Selected benchmark surpass gate accepted scoped | `v10_16-final-acceptance-report.md` |

## M6 Exit

- local `pet.json + spritesheet/png-sequence` adapter accepted.
- malformed packs fail safely.
- active pack is preserved after invalid activation.
- V5 manifest import path remains compatible.
- V10.6 remains a format rebaseline claim only and does not prove
  product-grade visual quality.

## M7 Exit

- `work-cat-v1` is bundled and selectable as default.
- all core actions pass visual, nonblank, frame-difference, and scale checks.
- `sprite-v3-animated` remains fallback / baseline.
- V10.7 remains a visual smoke claim only and does not prove V10.8 runtime
  micro-interactions or V10.10 product-grade final acceptance.

## M8 Exit

- idle random micro-action evidence exists.
- click feedback evidence exists.
- drag feedback evidence exists.
- priority state rules pass.

## M9 Exit

- Manager preview shows all core actions and coverage metadata.
- preview is isolated from live runtime.
- restore default work cat is modeled and active pack mapping survives restart
  in tested local Manager view-model scenarios.

## M10 Exit

- V10.6-V10.9 evidence accepted.
- regression, security scan, claim scan, PRD/spec review, and drawio sync pass.
- final claim is limited to tested local bundled `work-cat-v1` scenarios.

## M11 Exit

- README and active docs agree on V10.11 as the active product-experience line.
- active docs no longer treat any non-V10 phase as the current desktop-pet phase.
- drawio gap map reflects V10 current architecture, target architecture delta,
  development/acceptance plan, milestones, gates, and exit conditions.
- real desktop screenshots exist under `docs/V10.x/evidence/`.
- HTML reporting links real screenshots and is not used as mock proof.
- regression, security scan, claim scan, and PRD/spec review pass.

## M12 Exit

- selected benchmark sources and comparison dimensions are frozen.
- visual-quality and onboarding metrics are decision-complete.
- no-false-green claim boundary is documented.
- drawio sync reflects V10.12-V10.16 target architecture and gates.

## M13 Exit

- at least 6 premium bundled local animated cat packs pass visual QA.
- every pack covers all 8 core actions.
- contact sheet, runtime capture, 1x/0.75x, nonblank, frame-difference, and
  action-distinctness evidence exists.

## M14 Exit

- first-run wizard creates a visible default pet in no more than 3 user actions.
- first-run wizard creates a Codex work-cat and verifies a visible test reaction
  in no more than 5 user actions.
- already-open Codex automatic monitoring is visibly unsupported.

## M15 Exit

- built-in gallery lists bundled and imported safe packs.
- preview is isolated from live PetInstance state.
- activation, restore default, and delete user-imported pack flows pass.

## M16 Exit

- V10.12-V10.15 evidence exists.
- visual-quality scorecard is `exceeded`.
- first-run onboarding scorecard is `exceeded`.
- regression, security scan, claim scan, PRD/spec review, and drawio sync pass.
