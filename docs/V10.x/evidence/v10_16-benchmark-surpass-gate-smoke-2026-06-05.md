# V10.16 Benchmark Surpass Gate Smoke Evidence

status: passed
date: 2026-06-05

## Scope

This gate compares selected open-source UX benchmark dimensions only: local
visual quality and ordinary-user first-run onboarding. It does not claim full
Petdex parity, ecosystem parity, broad 3D readiness, provider integration,
marketplace readiness, production signed release readiness, cross-platform
readiness, or Windows readiness.

## Evidence Files

- benchmark report: `docs/V10.x/evidence/v10_16-benchmark-surpass-report-2026-06-05.html`
- V10.13 contact sheets: `docs/V10.x/evidence/v10_13-premium-cat-library-contact-sheets-2026-06-05.html`
- V10.13 runtime capture: `docs/V10.x/evidence/v10_13-premium-cat-library-runtime-capture-2026-06-05.html`
- V10.14 first-run capture: `docs/V10.x/evidence/v10_14-first-run-wizard-capture-2026-06-05.html`
- V10.15 gallery capture: `docs/V10.x/evidence/v10_15-built-in-gallery-capture-2026-06-05.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| V10.12-V10.15 evidence gate | passed | docs/V10.x/v10_12-final-acceptance-report.md, docs/V10.x/v10_13-final-acceptance-report.md, docs/V10.x/v10_14-final-acceptance-report.md, docs/V10.x/v10_15-final-acceptance-report.md, docs/V10.x/evidence/v10_13-premium-cat-library-contact-sheets-2026-06-05.html, docs/V10.x/evidence/v10_13-premium-cat-library-runtime-capture-2026-06-05.html, docs/V10.x/evidence/v10_14-first-run-wizard-capture-2026-06-05.html, docs/V10.x/evidence/v10_15-built-in-gallery-capture-2026-06-05.html |
| visual-quality scorecard | passed | 6 premium cats, 8 actions, contact sheet/runtime capture, nonblank/frame-difference evidence |
| first-run onboarding scorecard | passed | default <=3 actions, Codex work-cat <=5 actions, unsupported already-open boundary |
| selected benchmark comparison | passed | Agent Desktop Pet exceeds selected local visual breadth and first-run guidance dimensions with local evidence |
| regression evidence | passed | V3.1 runtime, V4.4 managed session, desktop check/test, petctl test passed in this run |
| security scan | passed | no token, Authorization, raw payload, full local path, workspace path, config path, or credential-file marker in V10.12-V10.16 evidence docs |
| claim scan | passed | forbidden claims appear only in forbidden/not-ready contexts |
| PRD/spec review | passed | V10.16 remains scoped to local visual quality and first-run onboarding |
| drawio sync | passed | drawio sync snapshot exists |

## Final Allowed Claim

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

## Final Decision

V10.16 gate passed for the selected scoped benchmark dimensions.
