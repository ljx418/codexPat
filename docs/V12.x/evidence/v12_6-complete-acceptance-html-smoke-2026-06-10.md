# V12.6 Complete Acceptance HTML Smoke Evidence

status: passed
date: 2026-06-10

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| real desktop screenshot | passed | docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9989,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| pet-region screenshot | passed | docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png {"ok":true,"width":552,"height":552,"nonblankRatio":0.9927,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| first-run screenshot | passed | docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-2026-06-10.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9985,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| reset before screenshot | passed | docs/V12.x/evidence/screenshots/v12_5-reset-position-before-2026-06-10.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9977,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| reset after screenshot | passed | docs/V12.x/evidence/screenshots/v12_5-reset-position-after-2026-06-10.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9982,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| phase evidence files exist | passed | docs/V12.x/evidence/v12_1-visibility-diagnostics-smoke-2026-06-10.md, docs/V12.x/evidence/v12_2-window-layering-smoke-2026-06-10.md, docs/V12.x/evidence/v12_3-real-screenshot-harness-smoke-2026-06-10.md, docs/V12.x/evidence/v12_4-first-run-real-desktop-proof-2026-06-10.md, docs/V12.x/evidence/v12_5-window-monitor-regression-2026-06-10.md |
| runtime capture labeled non-desktop | passed | optional V11 runtime capture missing; not required for V12 desktop gate |
| HTML report generated | passed | docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-10.html |
| HTML embeds screenshots | passed | embedded data URLs |
| redaction scan | passed | no sensitive text in HTML report |


## HTML Report

- report: `docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-10.html`

The report labels V11 runtime capture as non-desktop evidence and cannot use it
to satisfy the real desktop screenshot gate.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
