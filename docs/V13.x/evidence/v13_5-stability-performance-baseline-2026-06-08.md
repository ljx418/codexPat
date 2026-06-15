# V13.5 Stability / Performance Baseline Evidence

status: passed
date: 2026-06-08

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| settings open checkpoint | passed | settings_opened |
| app focus change checkpoint | passed | app_activated |
| at least 3 visible pets or documented shorter smoke | passed | instanceCount=1; durationMs=60000 |
| default pet resurfaced for stability start | passed | resurfaced |
| start screenshot visible | passed | docs/V13.x/evidence/screenshots/v13_5-stability-start-2026-06-08.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.3425,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| start pet-region screenshot visible | passed | docs/V13.x/evidence/screenshots/v13_5-stability-start-pet-region-2026-06-08.png {"ok":true,"width":936,"height":860,"nonblankRatio":0.2381,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| default pet visible before stability end capture | passed | visible |
| end screenshot visible | passed | docs/V13.x/evidence/screenshots/v13_5-stability-end-2026-06-08.png {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.3282,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| app-specific end pet-region screenshot visible | passed | docs/V13.x/evidence/screenshots/v13_5-stability-end-pet-region-2026-06-08.png {"ok":true,"width":936,"height":860,"nonblankRatio":0.2416,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| memory growth within threshold or explained | passed | startMb=0.0 endMb=0.0 growth=0.000 |
| user-facing state remains recoverable | passed | list_ok |
| evidence redaction scan | passed | no sensitive text in stability evidence |


## Runtime Shape

- requested duration ms: `60000`
- external shell prechecked: `false`
- precaptured real screenshots: `true`
- start screenshot: `docs/V13.x/evidence/screenshots/v13_5-stability-start-2026-06-08.png`
- end screenshot: `docs/V13.x/evidence/screenshots/v13_5-stability-end-2026-06-08.png`
- start pet-region screenshot: `docs/V13.x/evidence/screenshots/v13_5-stability-start-pet-region-2026-06-08.png`
- end pet-region screenshot: `docs/V13.x/evidence/screenshots/v13_5-stability-end-pet-region-2026-06-08.png`
- start metrics: `[]`
- end metrics: `[]`

V13.5 uses a shorter smoke when `V13_STABILITY_DURATION_MS` is below
600000. That is accepted only as a local environment-limited baseline, not as
production soak evidence.


## Claim Boundary

This evidence does not claim production signed release ready, notarized release
ready, auto update ready, cross-platform ready, Windows ready, Petdex parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
all Codex workflows verified, MCP ready, Third-party agent integration verified,
or Claude Code integration verified.
