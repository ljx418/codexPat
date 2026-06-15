# V21.1 Route A Key-pose Pack Evidence

status: passed
date: 2026-06-14

## Scope

V21.1 Route A attempts to convert V20 provider-derived key-pose material into a
safe local frameSequence pack. It does not activate the pack and does not claim
V21 final passed.

## Source

| Field | Value |
| --- | --- |
| route | route_a_keypose |
| safeSource | sample_2-minimax-motion-sheet-1.jpeg |
| sourceRole | V20 provider output reused as Route A input only |
| outputPackId | v21-route-a-keypose-orange-tabby |
| contactSheet | route-a-contact-sheet.jpg |

## Results

| Check | Result | Details |
| --- | --- | --- |
| V21.0 evidence exists | passed | V21.1 requires V21.0 scope-freeze evidence |
| Route A source image exists | passed | safeSource=sample_2-minimax-motion-sheet-1.jpeg |
| key-pose extraction and pack generation | passed | route_a_passed |
| 8 core action coverage | passed | actions=8 |
| no blank/off-canvas frames | passed | {"idle":6,"thinking":6,"running":6,"success":3,"warning":3,"error":3,"need_input":3,"sleeping":6} |
| loop closure | passed | {"idle":0,"thinking":0,"running":0,"success":0,"warning":0,"error":0,"need_input":0,"sleeping":0} |
| motion amplitude | passed | {"idle":32,"thinking":26.46,"running":71.15,"success":27,"warning":51,"error":50,"need_input":27.5,"sleeping":21.5} |
| same-cat grouping | passed | single provider output sample used for all actions |
| background safety | passed | corner alpha residue below threshold after local background mask |
| previous active pack preserved | passed | no live activation attempted by Route A smoke |
| safe output field list | passed | summary contains safe IDs, file names, QA fields only |
| existing animation adapter accepts pack | passed | adaptV10PetJsonAnimationPack accepted 8 actions |
| security scan | passed | no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text |
| claim scan | passed | V21.1 does not imply V21 final passed or provider integration verified |

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

Route A serves the V21 PRD because it routes around V20's 8x9 direct-provider
failure by extracting provider-derived key poses and assembling a local pack.
V21.2-V21.4 remain separate routes; V21.5/V21.6/V21.7 remain gated.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| V20 output treated as V21 final evidence | High | not allowed; V20 output is input only |
| Missing actions hidden by duplicated idle frames | High | action mapping generates all 8 named actions |
| Motion too weak | Medium | current generated pack passes motion amplitude smoke |
| Live pet mutated before QA | High | no activation attempted |

## Allowed Claim

V21 Route A provider key-pose to local animation pack workflow passed for the tested MiniMax-derived key-pose scenario with local QA evidence. V21 final remains No-Go.

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
