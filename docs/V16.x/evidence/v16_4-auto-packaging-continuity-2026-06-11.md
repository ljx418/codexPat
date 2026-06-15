# V16.4 Auto Packaging Continuity Evidence

status: passed
date: 2026-06-11


## Packaging Summary

| Field | Value |
| --- | --- |
| generatedPackId | v16-host-image-tool-orange-tabby |
| reasonCode | accepted |
| core actions | 8 |
| safeRendererOutputFields | packId, rendererKind, actions.actionId, actions.assetId, actions.frameCount, actions.fps, actions.loop, actions.transient, actions.durationMs, actions.fallbackActionId |

## Frame Count Table

| actionId | frameCount |
| --- | ---: |
| idle | 6 |
| thinking | 6 |
| running | 6 |
| success | 3 |
| warning | 3 |
| error | 3 |
| need_input | 3 |
| sleeping | 6 |

## Continuity Table

| idle | true | 5 |
| thinking | true | 5 |
| running | true | 5 |
| success | true | 5 |
| warning | true | 5 |
| error | true | 5 |
| need_input | true | 5 |
| sleeping | true | 5 |

## Allowed Claim

V16 provider-generated 2D frames packaged into a safe local animation pack for tested scenarios.


## Security Boundary

Evidence contains safe IDs, safe file names, digests, counts, reasonCodes, and renderer field names only. It does not include raw provider payload, raw prompt, raw photo bytes, credential values, Authorization headers, config paths, workspace paths, or full local paths.
