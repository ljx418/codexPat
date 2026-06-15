# V12.5 Window / Monitor Regression Evidence

status: blocked
date: 2026-06-07

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| petctl dist exists | passed | packages/petctl/dist/cli.js |
| default baseline diagnostics | passed | window_offscreen |
| target pet created | passed | codex_1781004377361 |
| target reset/resurface | passed | target visible |
| target pet-region visible | blocked | {"ok":false,"reasonCode":"pet_region_capture_missing"} |
| default reset after target operations | passed | default visible |
| reset-position after screenshot visible | passed | {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.1257,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| default pet remains listed | passed | state=idle |
| redaction scan | passed | no sensitive text in monitor regression output |


## Screenshot Artifacts

- reset-position before: `docs/V12.x/evidence/screenshots/v12_5-reset-position-before-2026-06-07.png`
- reset-position after: `docs/V12.x/evidence/screenshots/v12_5-reset-position-after-2026-06-07.png`
- target pet region: `docs/V12.x/evidence/screenshots/v12_5-target-pet-region-2026-06-07.png`

V12.5 verifies target isolation for visibility operations and does not claim
all-monitor or cross-platform readiness.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
