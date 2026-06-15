# V12.2 Window Layering Smoke Evidence

status: passed
date: 2026-06-07

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| petctl dist exists | passed | packages/petctl/dist/cli.js |
| baseline list | passed | count=1 |
| default resurface/reset | passed | desktop_visible |
| default layering requested | passed | alwaysOnTop/allWorkspaces/transparent requested |
| create target pet | passed | codex_1780996605986 |
| target resurface/reset | passed | visible |
| repeated resurface does not fail | passed | second resurface ok |
| target visibility diagnostics | passed | target diagnostics ok |
| target layering requested | passed | alwaysOnTop/allWorkspaces/transparent requested |
| no duplicate target windows listed | passed | count=2 |
| redaction scan | passed | no sensitive text in visibility output |


## Scope

V12.2 verifies re-show/reset/layering requests for default and one target pet.
It does not claim cross-Space or full-screen overlay readiness.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
