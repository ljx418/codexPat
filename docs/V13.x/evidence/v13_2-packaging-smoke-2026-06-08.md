# V13.2 Packaging Foundation Smoke Evidence

status: passed
date: 2026-06-08

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop build | passed | exit=0 |
| desktop tauri app build | passed | exit=0 |
| packaged app artifact found | passed | {"fileName":"Agent Desktop Pet.app","extension":".app","type":"macOS app bundle"} |
| packaged app launch attempt | passed | app_launch_passed |
| desktop health after packaged launch | passed | GET /api/health ok |
| signing checklist status | passed | planned/not-required-for-v13 |
| notarization checklist status | passed | planned/not-required-for-v13 |
| auto-update checklist status | passed | planned/not-required-for-v13 |
| evidence redaction scan | passed | no sensitive text in packaging evidence |


## Sanitized Artifact Summary

- `{"fileName":"Agent Desktop Pet.app","extension":".app","type":"macOS app bundle"}`

This smoke records sanitized artifact filename/type only and does not record full local package paths, signing identity, signing secret, Apple account data, token, Authorization, or raw build logs.


## Claim Boundary

This evidence does not claim production signed release ready, notarized release
ready, auto update ready, cross-platform ready, Windows ready, Petdex parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
all Codex workflows verified, MCP ready, Third-party agent integration verified,
or Claude Code integration verified.
