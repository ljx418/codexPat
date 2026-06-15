# V22.0 Scope Freeze Evidence

status: passed
date: 2026-06-15
commit: dd66a441

## Scope

V22 is frozen as **Asset Quality Review & Rejection Gate**. It starts from the
V21 scoped accepted multi-route candidate generation baseline and adds a
mandatory product-quality gate before preview/apply/final acceptance.

## Document Existence

| Document | Status |
| --- | --- |
| `docs/active/agent_desktop_pet_prd_v22.md` | present |
| `docs/V22.x/v22_x-target-architecture.md` | present |
| `docs/V22.x/v22_x-development-plan.md` | present |
| `docs/V22.x/v22_x-detailed-development-and-acceptance-plan.md` | present |
| `docs/V22.x/v22_x-acceptance-plan.md` | present |
| `docs/V22.x/v22_x-quality-review-gate-spec.md` | present |
| `docs/V22.x/v22_x-claim-matrix.md` | present |
| `docs/V22.x/v22_x-milestones.md` | present |
| `docs/V22.x/v22_x-exit-criteria.md` | present |
| `docs/V22.x/v22_x-evidence-index.md` | present |
| `docs/V22.x/v22_x-doc-audit.md` | present |

## Active Pointers

| Active File | Result |
| --- | --- |
| `docs/active/current-vs-target-gap.md` | points to V22 scoped accepted after closure |
| `docs/active/development-plan.md` | points to V22 scoped accepted after closure |
| `docs/active/acceptance-plan.md` | points to V22 scoped accepted after closure |
| `docs/active/current-vs-target-gap.drawio` | synced to V22 |

## Closure Sync

After V22.7 passed scoped, active documents were updated to
`V22 scoped accepted`. Current active status is recorded in:

- `docs/active/current-vs-target-gap.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/V22.x/v22_7-final-acceptance-report.md`

## Drawio Parse

| Diagram | Result |
| --- | --- |
| `docs/active/current-vs-target-gap.drawio` | parsed |
| `docs/V22.x/v22_x-quality-review-target-state.drawio` | parsed |

## Rejected Baseline

The V21 premium pixel report is recorded as a technical smoke but failed user
visual acceptance:

| Evidence | Result |
| --- | --- |
| `docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-2026-06-15.md` | `failed-user-visual-acceptance` |

V22 must use that candidate as a known visual-rejected fixture. It must not be
used as product-quality pet evidence.

## Claim Boundary

Allowed V22.0 claim:

```text
V22 asset quality review gate scope frozen with claim boundaries.
```

Forbidden claims remain not-ready:

- Petdex parity achieved
- provider integration verified
- low-retry provider reliability for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready

## Initial Gate And Closure

```text
V22.1 Candidate Quality Schema: Go at scope-freeze time.
V22.7 Final Gate: passed scoped after V22.0-V22.6 evidence was produced.
```

## Security Scan

This evidence contains no token, Authorization header, raw provider response,
raw HTTP payload, raw photo bytes, EXIF/GPS, private filename, full local path,
workspace path, config path, or `api-token.json`.
