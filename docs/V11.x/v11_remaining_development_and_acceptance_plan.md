# V11 Remaining Development And Acceptance Plan

status: active planning support; V11.1-V11.6 passed scoped; V11.7 next  
date: 2026-06-07

## Purpose

This document is the handoff checklist for the remaining V11 implementation.
It consolidates the active PRD, target architecture, phase specs, acceptance
plan, claim matrix, and drawio gap diagram into one decision-complete sequence.

It does not replace the phase specs. It exists to prevent plan drift and
false-green acceptance between V11.2 and V11.7.

The drawio file is the Chinese high-level review entrypoint for humans. Detailed
implementation decisions remain in the PRD, target architecture, phase specs,
acceptance plan, and claim matrix.

## Current State

```text
V10.16 selected benchmark track passed scoped.
V11.1 living idle system passed scoped.
V11.2 pointer-aware interaction passed scoped.
V11.3 emotion-layer state expression passed scoped.
V11.4 visual ActionComposer passed scoped.
V11.5 flagship living-cat asset pack passed scoped.
V11.6 first-run living cat and safe demo passed scoped.
V11.7 final gate may start; it must not add new features.
```

## Remaining Phase Order

| Phase | Implementation Target | Acceptance Gate | Status |
| --- | --- | --- | --- |
| V11.2 | pointer-near, pointer-leave, click, double-click, drag_start, dragging, drop | runtime capture, target isolation, zero PetEvent, no CatStateMachine write | passed scoped |
| V11.3 | emotion profiles for all 8 core states | before/after captures, operator distinguishability, no unsafe renderer fields | passed scoped |
| V11.4 | visual ActionComposer with enter/loop/exit/transient and priority policy | rapid-event smoke, deterministic final visual state, no flicker | passed scoped |
| V11.5 | `living-work-cat-v1` flagship animated 2D pack | contact sheets, runtime captures, side-by-side comparison, operator rubric | passed scoped |
| V11.6 | first-run living cat and safe demo mode | visible cat within 10 seconds, demo no state mutation | passed scoped |
| V11.7 | final interaction QA gate | regression, visual QA, security scan, claim scan, PRD/spec review, drawio sync | next |

## Shared Safety Rules

Every V11.2-V11.6 implementation must preserve:

- micro-interactions emit zero `PetEvent`.
- micro-interactions do not call `notify`.
- micro-interactions do not write `CatStateMachine`.
- micro-interactions do not mutate Agent/Codex state.
- target PetInstance only; default and unrelated pets unchanged.
- renderer receives only safe action ID, renderer kind, safe pack ID,
  playback intent, scale, and visibility.
- evidence contains no token, Authorization, raw payload, prompt text, tool
  command text, provider payload, full local path, workspace path, config path,
  remote URL, or shell command.

## Global Priority Order

```text
error > need_input > drag_start / dragging / drop > double_click > click > success transient > running > thinking > pointer_near > idle random
```

This is visual priority only. It must not be described as an agent event queue,
per-instance queue readiness, or Codex workflow completion logic.

## Required Evidence Files

```text
docs/V11.x/evidence/v11_2-pointer-interaction-smoke-YYYY-MM-DD.md
docs/V11.x/evidence/v11_3-emotion-layer-smoke-YYYY-MM-DD.md
docs/V11.x/evidence/v11_4-action-composer-smoke-YYYY-MM-DD.md
docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-YYYY-MM-DD.md
docs/V11.x/evidence/v11_6-first-run-delight-smoke-YYYY-MM-DD.md
docs/V11.x/v11_7-final-acceptance-report.md
```

## Stage Audit Rule

After each phase:

- update that phase final report.
- update `docs/active/current-vs-target-gap.md`.
- update `docs/V11.x/v11_x-current-gap-analysis.md`.
- update `docs/V11.x/v11_x-milestones.md`.
- run security and claim scans for the changed docs/evidence.
- record plan drift and false-green risk.

If any High risk remains, stop before the next implementation phase.

## Final Claim Boundary

Allowed only after V11.7 passes:

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
all Codex workflows verified
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
per-instance queue ready
```
