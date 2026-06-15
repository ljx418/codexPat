# V12.4 First-run Real Desktop Proof Evidence

status: passed
date: 2026-06-10

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop health | passed | GET /api/health ok |
| petctl dist exists | passed | packages/petctl/dist/cli.js |
| first-run visible default pet path | passed | visible within local proof path |
| first-run real desktop screenshot captured | passed | docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-2026-06-10.png |
| first-run screenshot visible pixels | passed | {"ok":true,"width":2880,"height":1800,"nonblankRatio":0.9985,"uniqueColorSample":256,"reasonCode":"desktop_visible"} |
| first-run proof does not send PetEvent | passed | eventMarkerCountBefore=1 after=1 |
| redaction scan | passed | no sensitive text in first-run proof output |


## Screenshot Artifact

- first-run desktop screenshot: `docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-2026-06-10.png`

This proof uses local visibility/resurface behavior and does not mutate
Agent/Codex state.


## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
