# V13 Development Plan: Beta Distribution & User-ready Closure

日期：2026-06-08  
状态：passed scoped；V13.1-V13.7 accepted for tested local macOS beta workflow scenario。  

## Scope

V13 closes the gap between a developer-run local desktop pet and a beta-user-ready local macOS workflow. It focuses on packaging foundation, first-run comprehension, safe diagnostics, stability evidence, artifact hygiene, and screenshot-backed beta readiness reporting.

V13 does not implement new renderer semantics, provider generation, OS-level Codex monitoring, Windows support, cross-platform release, notarization, auto-update, or production signing.

## Phase Plan

| Phase | Development Goal | Output |
| --- | --- | --- |
| V13.1 Scope Freeze | Freeze beta capability boundary, claims, evidence chain, and no-go list. | passed scoped |
| V13.2 Packaging Foundation | Build and smoke-test local macOS packaging path; document signing/notarization/auto-update as checklist only. | passed scoped |
| V13.3 First-run Journey | Make first-run path understandable: visible pet, settings/onboarding, Codex work-cat command, unsupported already-open window notice. | passed scoped |
| V13.4 Diagnostics Export | Provide safe support export boundary and redaction scan. | passed scoped |
| V13.5 Stability Baseline | Record local animation, memory/CPU, and desktop visibility baseline. | passed scoped |
| V13.6 Hygiene | Scan artifacts, licenses, evidence, generated files, and forbidden claims. | passed scoped |
| V13.7 Beta Gate | Produce final beta readiness report and HTML evidence bundle. | passed scoped |

Detailed implementation requirements, evidence filenames, stable reasonCodes,
diagnostics schema, stability thresholds, and final HTML structure are defined
in `docs/V13.x/v13_x-implementation-contract.md`.

## Implementation Boundaries

Allowed:

- local macOS packaging smoke and launch verification.
- first-run guide and settings/onboarding polish.
- safe diagnostics export plan and implementation if missing.
- crash/log export redaction boundary.
- screenshot-backed HTML reporting.
- artifact/license/claim scans.
- regression reruns.

Forbidden:

- production signed release readiness.
- notarized release readiness unless a real notarization evidence gate is created later.
- auto-update readiness.
- Windows or cross-platform claims.
- Petdex parity claim.
- provider, photo-to-3D, broad 3D, marketplace, OS-level Codex binding, or all-Codex workflow claims.

## Subphase Gate Rules

1. Each subphase must produce evidence before it can be marked passed.
2. Each next phase must start from a PRD/spec review and claim-boundary review.
3. If security redaction or claim scan finds High risk, stop and fix the current phase instead of advancing.
4. V13.7 cannot start until V13.1-V13.6 have explicit passed/blocked/failed status.

## Regression Baseline

V13 should rerun or document valid recent evidence for:

- `pnpm --filter desktop check`
- `pnpm --filter @agent-desktop-pet/petctl test`
- `node scripts/v3_1_runtime_smoke.mjs`
- `node scripts/v4_4_managed_session_smoke.mjs`
- V10/V11/V12 screenshot or visual QA smoke paths as applicable.

## Final Decision Rule

V13 passes only if the beta user journey, diagnostics export, packaging smoke, stability baseline, security scan, claim scan, artifact/license scan, and final HTML report pass with evidence.
