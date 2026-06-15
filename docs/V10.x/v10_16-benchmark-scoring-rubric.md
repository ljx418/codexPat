# V10.16 Benchmark Scoring Rubric

status: planned
date: 2026-06-05

## Goal

Define an evidence-based rubric for deciding whether V10.16 exceeds selected
open-source UX benchmark dimensions.

## Scoring Outcomes

| Outcome | Meaning |
| --- | --- |
| `exceeded` | Agent Desktop Pet is better on the selected dimension with screenshot/recording evidence |
| `matched` | comparable but not clearly better |
| `partial` | better on some subcriteria but not enough for final exceed claim |
| `blocked` | missing evidence or failed acceptance |

## Visual Quality Scorecard

| Criterion | Required for exceeded |
| --- | --- |
| bundled variety | at least 6 accepted premium local cats |
| action coverage | every cat has 8 core actions |
| animation evidence | contact sheet and runtime capture for every cat |
| readability | 1x and 0.75x pass |
| action distinctness | thinking/running/warning/error/need_input/sleeping are visually distinct |
| fallback safety | missing/corrupt/deleted assets leave visible fallback |
| visual polish | operator rubric passes for identity consistency, silhouette, color, and charm |

If any cat disappears, is transparent, or goes off-canvas, visual outcome is
`blocked`.

## First-run Onboarding Scorecard

| Criterion | Required for exceeded |
| --- | --- |
| default pet path | visible pet in <=3 user actions |
| Codex work-cat path | visible target reaction in <=5 user actions |
| docs independence | README/CLI docs not required for main path |
| unsupported boundary | already-open Codex auto-monitoring shown as unsupported |
| verification | target reaction visible and default/unrelated pets unchanged |
| safety | no prompt text, token, Authorization, raw payload, workspace path, or full path persisted |

If the user must read README or execute manual API commands for the main path,
onboarding outcome is `partial` or `blocked`.

## Benchmark Comparison Table

Final report must include:

| Dimension | Petdex | OpenPets | Shijima-Qt | Agent Desktop Pet | Outcome |
| --- | --- | --- | --- | --- | --- |
| local visual variety | TBD | TBD | TBD | evidence path | exceeded/matched/partial/blocked |
| action coverage | TBD | TBD | TBD | evidence path | exceeded/matched/partial/blocked |
| first-run setup | TBD | TBD | TBD | evidence path | exceeded/matched/partial/blocked |
| work-cat verification | TBD | TBD | TBD | evidence path | exceeded/matched/partial/blocked |

## Final Claim Rule

The final V10.16 claim may be used only if:

- visual quality outcome is `exceeded`.
- first-run onboarding outcome is `exceeded`.
- security scan passes.
- claim scan passes.
- PRD/spec review passes.
- drawio sync passes.

Otherwise V10.16 must report `partial` or `blocked`.

