# V20.0 Scope Freeze Evidence

status: passed
date: 2026-06-14

## Scope

V20.0 freezes the mainland provider photo-to-motion-sheet workflow scope,
MiniMax P0 provider boundary, V19 fallback baseline, V20 claim boundaries, and
drawio synchronization status.

## Results

| Check | Result | Details |
| --- | --- | --- |
| required V20 docs exist | passed | docs/active/agent_desktop_pet_prd_v20.md, docs/active/development-plan.md, docs/active/acceptance-plan.md, docs/active/current-vs-target-gap.md, docs/active/current-vs-target-gap.drawio, docs/V20.x/v20_x-current-gap-analysis.md, docs/V20.x/v20_x-target-architecture.md, docs/V20.x/v20_x-development-plan.md, docs/V20.x/v20_x-detailed-development-and-acceptance-plan.md, docs/V20.x/v20_x-acceptance-plan.md, docs/V20.x/v20_x-claim-matrix.md, docs/V20.x/v20_x-milestones.md, docs/V20.x/v20_x-exit-crite |
| active docs point to V20 planned | passed | V20 planned active index |
| single current active status | passed | only one Current active status line in active docs |
| V19 is fallback baseline only | passed | V19 accepted local motion-sheet baseline cannot prove provider branch |
| V19 provider branch blocked/not-claimed | passed | V20 owns provider generation attempt |
| drawio XML basic parse | passed | drawio contains V20 content and mxfile root |
| drawio PNG snapshot export | not-blocking/failed | not exported in this non-GUI smoke; XML parse is the accepted V20.0 evidence for this run |
| drawio XML validator | passed | xmllint or strict mxfile fallback parse |
| reference image evidence fields specified | passed | V20.2 must record reference image fields before any reference-image claim |
| forbidden claim boundary | passed | forbidden claims are not used as ready/passed |
| security scan | passed | V20 docs do not leak token, Authorization header/value, or full local path |

## PRD / Spec Review

V20 PRD and architecture support phase-by-phase implementation. V20.2 remains a
hard provider benchmark gate and V20.6 remains No-Go until V20.0-V20.5 evidence
exists.

## Allowed Claim

V20 mainland provider photo-to-motion-sheet scope frozen with MiniMax benchmark and claim boundaries.

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
