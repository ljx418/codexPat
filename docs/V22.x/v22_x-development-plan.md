# V22 Development Plan

文档状态：scoped accepted development plan。  
阶段主题：Asset Quality Review & Rejection Gate。  
当前日期：2026-06-15。

## Scope

V22 starts from V21 scoped accepted multi-route candidate generation and adds a quality review gate. The goal is not to create a better provider in this stage. The goal is to prevent bad generated assets from being accepted, shown as product-quality, or applied to a live pet.

## Phase Plan

| Phase | Name | Development Scope | Output |
| --- | --- | --- | --- |
| V22.0 | Scope Freeze | freeze PRD, architecture, claim, drawio, rejected V21 visual evidence | scope evidence |
| V22.1 | Candidate Quality Schema | define candidate status, reasonCode, QA result schema | schema + fixtures |
| V22.2 | Technical QA Gate | detect missing actions, blank/off-canvas/background/path/script/loop problems | automated QA |
| V22.3 | Motion QA Gate | score motion amplitude, adjacent delta, drift, readability | motion QA report |
| V22.4 | Visual Review UX Contract | operator/user review states, pass/fail, comment, guidance | review UI contract |
| V22.5 | Retry and Route Guidance | retry budget, reason-driven repair, alternate route recommendation | retry policy |
| V22.6 | Preview/Apply Enforcement | reject non-approved candidates, target-only apply for approved, rollback | runtime enforcement |
| V22.7 | Final Gate | accepted/rejected examples, screenshots, scans, claim decision | final report + HTML |

## Implementation Priorities

1. Bad candidates cannot apply.
2. Rejected candidates cannot appear as installable gallery assets.
3. Every failed candidate shows a stable reasonCode.
4. Repeated failure gives useful user guidance.
5. Final reports must show both pass and fail examples.

## Known Inputs

Use the V21 visual failure as a test input:

- `docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-2026-06-15.md`
- `docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-2026-06-15.html`

This candidate is technical-smoke evidence only and must be rejected by V22 visual quality gate.

## Detailed Implementation Package

Use `docs/V22.x/v22_x-detailed-development-and-acceptance-plan.md` as the
phase-by-phase implementation checklist. It defines fixture classes, measurable
QA behavior, evidence requirements, retry policy, final report structure, and
minimum regression checks.

## Go / No-Go

V22.0-V22.7 passed scoped on 2026-06-15.

Final evidence:

- `docs/V22.x/v22_7-final-acceptance-report.md`
- `docs/V22.x/evidence/v22_7-quality-review-dashboard-2026-06-15.html`
- `docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md`
