# V21.7 Final Acceptance Report

status: passed
date: 2026-06-14

## Scope

V21 closes the multi-route animation asset recovery track. It validates route
evidence for provider-derived key-pose recovery, alternate provider review,
local rig fallback, video-route exclusion, visual comparison, and best-route
preview/apply/rollback.

This report does not claim provider integration, arbitrary-cat automatic
photo-to-animation, Petdex parity, 3D readiness, or production release readiness.

## Evidence Gate

| Gate | Result | Details |
| --- | --- | --- |
| V21.0 Scope Freeze | passed | status=passed; expected=passed |
| V21.1 Route A | passed | status=passed; expected=passed |
| V21.2 Route B | passed | status=passed; expected=passed |
| V21.3 Route C | passed | status=passed; expected=passed |
| V21.4 Route D | passed | status=excluded; expected=excluded |
| V21.5 Comparator | passed | status=passed; expected=passed |
| V21.6 Best Route | passed | status=passed; expected=passed |
| visual evidence available | passed | Route A, Route C, and V21.6 preview images embedded |
| pnpm --filter desktop check | passed | desktop TypeScript check passed |
| pnpm --filter @agent-desktop-pet/petctl test | passed | petctl tests passed |
| git artifact scan | passed | tracked workspace changes=329; no generated dist/target/node_modules/provider raw artifacts in project pathspec |
| security scan | passed | no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text |
| claim scan | passed | forbidden claims only appear in forbidden/not-ready/not-implied contexts |

## Route Decision

| Route | Final Status | Decision |
| --- | --- | --- |
| Route A Provider key-pose -> local animation pack | passed | selected best route for V21.6 |
| Route B Alternate provider preflight | passed as review | not final route evidence alone |
| Route C Unified character local 2D rig | passed | available fallback/comparison route |
| Route D Image-to-video -> frames | excluded | no safe explicit-consent video source |

## Regression

- pnpm --filter desktop check: passed
- pnpm --filter @agent-desktop-pet/petctl test: passed

## Human-visible Dashboard

`docs/V21.x/evidence/v21_7-final-acceptance-dashboard-2026-06-14.html`

## Allowed Claim

V21 multi-route animation asset recovery passed for the tested Route A
MiniMax-derived key-pose to local animation pack scenario with QA, visual
comparator, target-only preview/apply, and rollback evidence. Route C local 2D
rig also passed as a tested fallback route.

## Forbidden Claims

- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready

## Final Decision

V21 scoped acceptance passed. The project has a route-scoped recovery path, not a general provider/product parity claim.
