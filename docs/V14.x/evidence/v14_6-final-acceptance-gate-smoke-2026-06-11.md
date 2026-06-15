# V14.6 Final Acceptance Gate Smoke Evidence

status: failed
date: 2026-06-11

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| V14.0 scope freeze | failed | exit=1 |
| V14.1 flagship work cat | passed | exit=0 |
| V14.2 animation linter | passed | exit=0 |
| V14.3 gallery favorite | passed | exit=0 |
| V14.4 preview switch | passed | exit=0 |
| V14.5 AI workflow boundary | passed | exit=0 |
| V13.7 beta readiness baseline | passed | exit=0 |
| V11.7 interaction QA baseline | passed | exit=0 |
| V10.16 benchmark baseline | passed | exit=0 |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| petctl check | passed | exit=0 |
| petctl test | passed | exit=0 |
| V12.7 desktop visibility regression evidence | blocked | docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-2026-06-11.md |
| required V14/V12 evidence exists | blocked | docs/V14.x/evidence/v14_0-scope-freeze-2026-06-11.md, docs/V14.x/evidence/v14_1-flagship-work-cat-v2-smoke-2026-06-11.md, docs/V14.x/evidence/v14_1-flagship-work-cat-v2-contact-sheet-2026-06-11.html, docs/V14.x/evidence/v14_1-flagship-work-cat-v2-runtime-capture-2026-06-11.html, docs/V14.x/evidence/v14_2-animation-stability-linter-smoke-2026-06-11.md, docs/V14.x/evidence/v14_3-gallery-filter-favorite-smoke-2026-06-11.md, docs/V14.x/evidence/v14_3-gallery-filter-favorite-capture-2026-06-11.html, docs/V14.x/evidence/v14_4-preview-one-click-switch-smoke-2026-06-11.md, docs/V14.x/evidence/v14_5-ai-asset-workflow-boundary-smoke-2026-06-11.md, docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-2026-06-11.md, docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-11.png, docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-11.png |
| CPU/memory baseline recorded | blocked | ps_unavailable |
| license / local asset attribution scan | passed | bundled V14 assets are project-authored local procedural packs |
| security scan | passed | no token/auth/raw payload/path leakage in V14 docs/evidence |
| claim scan | passed | forbidden claims only in forbidden/not-ready contexts |

## Reports

- final report: `docs/V14.x/v14_6-final-acceptance-report.md`
- final HTML: `docs/V14.x/evidence/v14_6-final-acceptance-html-2026-06-11.html`

## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, full local path, or provider raw
response. It does not claim Petdex parity, 3D readiness, provider integration,
production signed release readiness, Windows/cross-platform readiness, OS-level
Codex window binding, all Codex workflow verification, MCP readiness, third-party
agent integration verification, or Claude Code integration verification.
