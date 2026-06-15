# V10.16 Final Acceptance Report

status: passed
date: 2026-06-05

## Scope

V10.16 closes the selected open-source UX benchmark surpass gate for tested
local macOS visual quality and ordinary-user first-run onboarding scenarios.
This is not a full Petdex parity claim and does not include 3D readiness,
provider integration, marketplace readiness, production signed release
readiness, cross-platform readiness, or Windows readiness.

## Evidence Gate

| Item | Result | Evidence |
| --- | --- | --- |
| V10.12 final report | passed | `docs/V10.x/v10_12-final-acceptance-report.md` |
| V10.13 final report | passed | `docs/V10.x/v10_13-final-acceptance-report.md` |
| V10.14 final report | passed | `docs/V10.x/v10_14-final-acceptance-report.md` |
| V10.15 final report | passed | `docs/V10.x/v10_15-final-acceptance-report.md` |
| V10.16 gate smoke | passed | `docs/V10.x/evidence/v10_16-benchmark-surpass-gate-smoke-2026-06-05.md` |
| V10.16 HTML report | passed | `docs/V10.x/evidence/v10_16-benchmark-surpass-report-2026-06-05.html` |
| V10.16 report screenshot | passed | `docs/V10.x/evidence/v10_16-benchmark-surpass-report-2026-06-05.png` |

## Visual-quality Benchmark Scorecard

| Criterion | Result |
| --- | --- |
| bundled variety | exceeded: 6 accepted premium local cats |
| action coverage | exceeded: every cat has 8 core actions |
| animation evidence | exceeded: contact sheet and runtime capture exist |
| readability | exceeded: 1x and 0.75x capture evidence |
| action distinctness | exceeded: frame-difference and unique pose checks passed |
| fallback safety | passed: CSS/default renderer fallback remains available |
| visual polish | passed: local operator/automated rubric evidence accepted |

## First-run Onboarding Scorecard

| Criterion | Result |
| --- | --- |
| default pet path | exceeded: visible pet path within 3 user actions |
| Codex work-cat path | exceeded: target reaction path within 5 user actions |
| docs independence | exceeded: primary path is in Desktop Manager |
| unsupported boundary | passed: already-open Codex window auto-monitoring is shown unsupported |
| safety | passed: no sensitive fields persisted by wizard |

## Regression

| Check | Result |
| --- | --- |
| `node scripts/v3_1_runtime_smoke.mjs` | passed after desktop app startup |
| `node scripts/v4_4_managed_session_smoke.mjs` | passed when rerun serially after V3.1 cleanup |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter desktop test` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed |
| `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` | passed |

## Security Scan

Result: passed.

The V10.12-V10.16 evidence set does not include token values, Authorization
headers, raw payloads, full local paths, workspace paths, config paths, or
credential-file markers.

## Claim Scan

Result: passed.

Forbidden claims appear only in forbidden / not-ready contexts.

## Allowed Claim

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

## Forbidden Claims

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
asset marketplace ready
production signed release ready
cross-platform ready
Windows ready
```

## Final Decision

V10.16 passed for the selected scoped benchmark dimensions. V10.12-V10.16 are
accepted.
