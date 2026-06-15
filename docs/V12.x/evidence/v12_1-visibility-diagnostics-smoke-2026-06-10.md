# V12.1 Visibility Diagnostics Smoke Evidence

status: passed
date: 2026-06-10

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| petctl dist exists | passed | packages/petctl/dist/cli.js |
| default resurface for diagnostic baseline | passed | resurfaced |
| default visibility diagnostics | passed | desktop_visible |
| diagnostics safe field shape | passed | instance/window/position/size/monitor/layering/screenshotObservation |
| invalid instance rejected locally | passed | reasonCode=instance_id_invalid |
| redaction scan | passed | no token/auth/raw payload/path leakage |


## Scope

V12.1 verifies sanitized visibility diagnostics for the default pet. It does
not prove screenshot visibility; V12.3 owns real desktop screenshot evidence.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
