# V12.7 Final Desktop Visibility Gate Smoke Evidence

status: passed
date: 2026-06-10

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| V12.1 diagnostics | passed | exit=0 |
| V12.2 layering | passed | exit=0 |
| V12.3 screenshots | passed | exit=0 |
| V12.4 first-run | passed | exit=0 |
| V12.5 monitor regression | passed | exit=0 |
| V12.6 HTML report | passed | exit=0 |
| desktop check | passed | exit=0 |
| petctl check | passed | exit=0 |
| petctl test | passed | exit=0 |
| cargo check | passed | exit=0 |
| V3.1 runtime smoke | passed | exit=0 |
| V4.4 managed session smoke | passed | exit=0 |
| V11.7 interaction QA gate | passed | exit=0 |
| required V12 evidence exists | passed | docs/V12.x/evidence/v12_1-visibility-diagnostics-smoke-2026-06-10.md, docs/V12.x/evidence/v12_2-window-layering-smoke-2026-06-10.md, docs/V12.x/evidence/v12_3-real-screenshot-harness-smoke-2026-06-10.md, docs/V12.x/evidence/v12_4-first-run-real-desktop-proof-2026-06-10.md, docs/V12.x/evidence/v12_5-window-monitor-regression-2026-06-10.md, docs/V12.x/evidence/v12_6-complete-acceptance-html-smoke-2026-06-10.md, docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-10.html, docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png, docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png, docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-2026-06-10.png |
| security scan | passed | no token/auth/raw payload/path leakage in V12 docs/evidence |
| claim scan | passed | forbidden claims not used as ready |


## Final Report

- `docs/V12.x/v12_7-final-acceptance-report.md`


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
