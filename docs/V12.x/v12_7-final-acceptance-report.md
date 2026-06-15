# V12.7 Final Acceptance Report

status: passed
date: 2026-06-10

## Scope

V12 verifies desktop pet visibility and screenshot-backed acceptance for tested
local macOS desktop scenarios. It does not add renderer, provider, Codex, OS
binding, production release, Windows, or cross-platform claims.

## Gate Results

| Gate | Result | Details |
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

## Evidence

- V12.6 HTML report: `docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-10.html`
- Real desktop screenshot: `docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png`
- Pet-region screenshot: `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png`
- First-run screenshot: `docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-2026-06-10.png`

## Allowed Claim

```text
V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.
```

## Forbidden Claims

```text
production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified
```

## Final Decision

V12 final desktop visibility gate passed for the scoped tested local macOS scenario.
