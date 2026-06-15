# V12.3 Real Screenshot Harness Smoke Evidence

status: passed
date: 2026-06-10

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| petctl dist exists | passed | packages/petctl/dist/cli.js |
| default pet resurfaced before screenshot | passed | desktop_visible |
| real desktop screenshot captured | passed | docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png |
| pet-region screenshot captured | passed | {"x":696,"y":232,"width":276,"height":276} attempts=1 |
| desktop screenshot PNG check | passed | {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9989,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| pet-region nonblank/non-flat check | passed | {"ok":true,"width":552,"height":552,"nonblankRatio":0.9927,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| redaction scan | passed | no sensitive text in screenshot diagnostics |


## Screenshot Artifacts

- real desktop screenshot: `docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png`
- pet-region screenshot: `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png`

Runtime HTML screenshots do not satisfy this gate.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
