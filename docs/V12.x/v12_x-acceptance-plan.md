# V12.x Acceptance Plan: Desktop Visibility & Screenshot-backed Acceptance

status: passed scoped
date: 2026-06-07

## Acceptance Principle

V12 cannot pass with runtime HTML screenshots alone. At least one tested local
macOS real desktop screenshot must show the actual pet window visible on the
desktop.

## Evidence Requirements

| Phase | Required Evidence | Pass Condition |
| --- | --- | --- |
| V12.1 | `v12_1-visibility-diagnostics-smoke-2026-06-07.md` | passed scoped |
| V12.2 | `v12_2-window-layering-smoke-2026-06-07.md` | passed scoped |
| V12.3 | `v12_3-real-screenshot-harness-smoke-2026-06-07.md` plus PNGs | passed scoped |
| V12.4 | `v12_4-first-run-real-desktop-proof-2026-06-07.md` | passed scoped |
| V12.5 | `v12_5-window-monitor-regression-2026-06-07.md` | passed scoped |
| V12.6 | `v12_6-complete-acceptance-html-2026-06-07.html` | passed scoped |
| V12.7 | `v12_7-final-acceptance-report.md` | passed scoped |

Implementation contract: `docs/V12.x/v12_x-implementation-contract.md`.

## Minimum Manual Review

The reviewer must be able to open the V12.6 HTML and answer:

- Do I see a real desktop screenshot with a visible cat?
- Do I see a pet-region screenshot with a visible cat?
- If a screenshot failed, is the failure visible and explained?
- Do I see the allowed claim and forbidden claims?
- Do I see regression and security results?

## Failure Rules

V12 must be blocked or failed if:

- real desktop screenshot does not show the cat.
- screenshot evidence is replaced by runtime HTML without explicit label.
- output hides screenshot failures.
- diagnostics leak local paths, screen text, prompt text, token, Authorization,
  workspace path, config path, or raw payload.
- V12 final report claims production/cross-platform/provider/3D readiness.
- real desktop screenshot is substituted by runtime capture.
- pet-region screenshot is missing or pixel visibility check is inconclusive
  without manual visual confirmation.
- V12.6 HTML hides failed screenshot paths behind links instead of showing a
  visible blocker.

## Automated Screenshot Checks

Minimum checks:

- screenshot file exists and has nonzero size.
- image dimensions are nonzero.
- pet-region nonblank pixel ratio is above 1%.
- pet-region is not a single flat color.
- runtime HTML screenshots are labeled as non-desktop evidence.

## Final Allowed Claim

```text
V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.
```
