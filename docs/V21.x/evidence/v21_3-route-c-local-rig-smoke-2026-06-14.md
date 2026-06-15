# V21.3 Route C Local Rig Evidence

status: passed
date: 2026-06-14

## Scope

V21.3 Route C generates a local procedural 2D rig from a safe sampled palette of
one local cat photo. It proves local control of same-cat consistency, background,
loop closure, and action amplitude for the tested local rig scenario. It does
not claim photo-real likeness or arbitrary-cat automation.

## Source

| Field | Value |
| --- | --- |
| route | route_c_local_rig |
| safeSource | 猫_2.jpg |
| outputPackId | v21-route-c-local-rig-gray-cat |
| contactSheet | route-c-contact-sheet.jpg |
| rigParts | body, head, leftEar, rightEar, tail, frontPaws, rearPaws, eyes, mouth, whiskers |

## Results

| Check | Result | Details |
| --- | --- | --- |
| V21.0 evidence exists | passed | V21.3 requires V21.0 scope-freeze evidence |
| Route C source photo exists | passed | safeSource=猫_2.jpg |
| Route C spec exists | passed | local rig route spec |
| local rig pack generation | passed | route_c_passed |
| 8 core action coverage | passed | actions=8 |
| rig parts declared | passed | body, head, leftEar, rightEar, tail, frontPaws, rearPaws, eyes, mouth, whiskers |
| no blank/off-canvas frames | passed | {"idle":6,"thinking":6,"running":6,"success":3,"warning":3,"error":3,"need_input":3,"sleeping":6} |
| loop closure | passed | {"idle":0,"thinking":0,"running":0,"success":0,"warning":0,"error":0,"need_input":0,"sleeping":0} |
| motion amplitude | passed | {"idle":8.56,"thinking":21,"running":33.5,"success":34.03,"warning":23.01,"error":29,"need_input":30.02,"sleeping":7} |
| same-cat source stability | passed | single local procedural rig and one sampled palette drive all actions |
| transparent background | passed | transparent canvas generated locally |
| existing animation adapter accepts pack | passed | adaptV10PetJsonAnimationPack accepted 8 actions |
| previous active pack preserved | passed | no live activation attempted by Route C smoke |
| safe output field list | passed | summary contains safe IDs, palette buckets, file names, QA fields only |
| security scan | passed | no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text |
| claim scan | passed | Route C does not imply V21 final passed, arbitrary cats readiness, or 3D readiness |

## QA Summary

| Field | Value |
| --- | --- |
| actionCount | 8 |
| nonblankPassed | true |
| offCanvasPassed | true |
| loopClosurePassed | true |
| motionAmplitudePassed | true |
| sameCatPassed | true |
| backgroundPassed | true |

## PRD / Spec Review

Route C serves the V21 PRD by providing a locally controllable fallback route
when provider output cannot satisfy sheet format or identity continuity. It is
not a provider route and cannot claim provider integration.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Procedural rig claimed as photo-real identity | High | forbidden; evidence says sampled palette/local rig only |
| Motion too weak | Medium | motion smoke passed |
| Live pet mutated before QA | High | no activation attempted |

## Allowed Claim

V21 Route C unified-character local 2D rig workflow passed for the tested local cat-palette rig scenario with QA evidence. V21 final remains No-Go.

## Forbidden Claims

- V21 final passed
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- production signed release ready
