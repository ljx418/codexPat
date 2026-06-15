# V13.3 First-run User Journey Evidence

status: passed
date: 2026-06-08

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| default pet visible before first-run screenshot | passed | external_shell_resurface_prechecked |
| desktop screenshot with visible pet | passed | docs/V13.x/evidence/screenshots/v13_3-desktop-visible-pet-2026-06-08.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.5875,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| settings window automation attempt | passed | settings_open_attempted |
| settings / first-run screenshot | passed | docs/V13.x/evidence/screenshots/v13_3-settings-first-run-2026-06-08.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.5875,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| Codex work-cat guide screenshot | passed | docs/V13.x/evidence/screenshots/v13_3-codex-work-cat-guide-2026-06-08.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.5875,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| JSONL wrapper command is present in onboarding source | passed | jsonl_wrapper_command_present |
| managed TUI /hooks trust guidance is present | passed | hooks_trust_guidance_present |
| already-open Codex unsupported notice is present | passed | already_open_boundary_present |
| onboarding proof does not mutate unrelated pets | passed | lastEventMarkersBefore=0 after=0 |
| evidence redaction scan | passed | no sensitive text in first-run evidence |


## Screenshot Artifacts

- desktop screenshot with visible pet: `docs/V13.x/evidence/screenshots/v13_3-desktop-visible-pet-2026-06-08.png`
- settings / first-run screenshot: `docs/V13.x/evidence/screenshots/v13_3-settings-first-run-2026-06-08.png`
- Codex work-cat guide screenshot: `docs/V13.x/evidence/screenshots/v13_3-codex-work-cat-guide-2026-06-08.png`

If settings automation is blocked by local macOS permissions, this phase remains blocked and no mock screenshot is accepted.


## Claim Boundary

This evidence does not claim production signed release ready, notarized release
ready, auto update ready, cross-platform ready, Windows ready, Petdex parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
all Codex workflows verified, MCP ready, Third-party agent integration verified,
or Claude Code integration verified.
