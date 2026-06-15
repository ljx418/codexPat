# V14.1 Flagship Work Cat V2 Smoke Evidence

status: passed
date: 2026-06-09

## Scope

This evidence validates the bundled local `flagship-work-cat-v2` animated 2D
pack. It does not claim Petdex parity, 3D readiness, provider integration,
marketplace readiness, production release readiness, Windows readiness, or
cross-platform readiness.

## Evidence Files

- contact sheet: `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-contact-sheet-2026-06-09.html`
- runtime capture: `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-runtime-capture-2026-06-09.html`

## Core Actions

| action | frame count | unique poses | playback | loop closed |
| --- | ---: | ---: | --- | --- |
| idle | 11 | 10 | loop | yes |
| thinking | 10 | 9 | loop | yes |
| running | 33 | 32 | loop | yes |
| success | 18 | 17 | transient | yes |
| warning | 12 | 11 | transient | yes |
| error | 10 | 9 | transient | yes |
| need_input | 10 | 9 | transient | yes |
| sleeping | 10 | 9 | loop | yes |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| flagship pack present | passed | flagship-work-cat-v2 is the V14 local pack |
| core action coverage | passed | all 8 core actions meet V14 frame thresholds |
| living action coverage | passed | living idle/click/drag actions are present |
| loop closure | passed | loop actions render identical first and final frames |
| nonblank scan | passed | all rendered SVG frames contain visible geometry |
| frame difference | passed | core actions meet distinct pose thresholds |
| security scan | passed | no script, foreignObject, external href, event handler, remote URL, data URI, or text payload |
| renderer boundary | passed | runtime renderer receives safe action ID, sprite renderer kind, safe pack ID, playback intent, scale, and visibility only |
| claim scan | passed | V14.1 claims only a bundled local flagship animated 2D pack; no Petdex parity, 3D, provider, marketplace, release, Windows, or cross-platform claim |

## Allowed Claim

V14.1 bundled local flagship animated 2D work-cat pack passed for tested local SVG sprite scenarios.

## Final Decision

V14.1 passed. V14.2 may proceed after phase-specific review.
