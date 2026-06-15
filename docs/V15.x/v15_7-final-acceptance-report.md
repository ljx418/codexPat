# V15.7 Final Acceptance Report

status: passed
date: 2026-06-11

## Scope

V15 closes the living desktop interaction upgrade for tested local macOS
scenarios. It covers drag/release/land, pointer-aware hover/click/double-click,
bounded autonomous walk, interaction settings, and priority-safe visual
composition. It does not add renderer ecosystem, provider, OS-level Codex,
production release, Windows, cross-platform, or Petdex parity claims.

## Evidence Gate

| Check | Result | Details |
| --- | --- | --- |
| V15.0 Scope Freeze | passed | docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md |
| V15.1 Interaction Model | passed | docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md |
| V15.2 Drag Physics | passed | docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md |
| V15.3 Pointer Feedback | passed | docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md |
| V15.4 Autonomous Walk | passed | docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md |
| V15.5 Emotion Composer | passed | docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md |
| V15.6 Interaction Settings | passed | docs/V15.x/evidence/v15_6-interaction-settings-smoke-2026-06-10.md |
| Drag / release / land capture exists | passed | docs/V15.x/evidence/v15_2-drag-physics-capture-2026-06-10.html |
| Pointer / hover / click / double-click capture exists | passed | docs/V15.x/evidence/v15_3-pointer-feedback-capture-2026-06-10.html |
| Autonomous walk / turn / edge avoid capture exists | passed | docs/V15.x/evidence/v15_4-autonomous-walk-capture-2026-06-10.html |
| Settings / preview sandbox capture exists | passed | docs/V15.x/evidence/v15_6-interaction-settings-capture-2026-06-10.html |
| V15 real desktop screenshot exists | passed | docs/V15.x/evidence/screenshots/v15_7-real-desktop-2026-06-10.png |
| V12 real desktop regression screenshot exists | passed | docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png |
| V12 real pet-region regression screenshot exists | passed | docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| petctl check | passed | exit=0 |
| petctl test | passed | exit=0 |
| V11.7 interaction QA baseline | passed | exit=0 |
| V12.7 desktop visibility regression | passed | docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-2026-06-10.md |
| V13.7 beta readiness baseline | passed | exit=0 |
| V14.6 historical gallery baseline | passed | exit=0 |
| drawio parse | passed | docs/active/current-vs-target-gap.drawio |
| security scan | passed | V15 docs/evidence contain no forbidden sensitive text |
| claim scan | passed | forbidden claims remain forbidden/not-ready/not-implied |
| PRD/spec review | passed | active PRD and V15 docs align with V15.0-V15.7 status |

## Final HTML

- `docs/V15.x/evidence/v15_7-final-interaction-html-2026-06-11.html`

## Allowed Claim

V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.

## Forbidden Claims

This report does not claim Petdex parity achieved, Petdex ecosystem parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
remote asset loading ready, asset marketplace ready, production signed release
ready, notarized release ready, auto update ready, cross-platform ready, Windows
ready, OS-level Codex window binding ready, all Codex workflows verified, MCP
ready, Third-party agent integration verified, or Claude Code integration
verified.

## Residual Notes

- V14.6 historical gallery baseline is rerun with its original evidence date
  because V14 subphase scripts intentionally write fixed V14 evidence names.
- V15 final includes a real desktop screenshot captured during this gate and
  deterministic interaction captures for the V15 interaction flows.

## Final Decision

V15 final interaction gate passed for the scoped tested local macOS scenario.
