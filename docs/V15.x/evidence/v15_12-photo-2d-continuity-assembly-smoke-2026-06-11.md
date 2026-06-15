# V15.12 Photo 2D Continuity Assembly Smoke Evidence

status: passed
date: 2026-06-11

## Scope

V15.12 validates local generated/imported frame assembly into a safe sprite
pack. It uses local frame metadata fixtures and existing V10 animation pack
adapter boundaries. It does not call a provider and does not claim automatic
photo-to-2D readiness.

## Accepted Pack Snapshot

| Field | Value |
| --- | --- |
| status | accepted |
| reasonCode | accepted |
| generatedPackId | photo-2d-orange-tabby-v1 |
| coreActionCoverage | idle, thinking, running, success, warning, error, need_input, sleeping |
| preservedPreviousActivePack | false |
| safeRendererOutputFields | packId, rendererKind, actions.actionId, actions.assetId, actions.frameCount, actions.fps, actions.loop, actions.transient, actions.durationMs, actions.fallbackActionId |

## Frame Count And Continuity Table

| Action | Frame Count | First/Final Closed | Max Adjacent Delta |
| --- | ---: | --- | ---: |
| idle | 6 | true | 6 |
| thinking | 6 | true | 6 |
| running | 6 | true | 6 |
| success | 3 | true | 6 |
| warning | 3 | true | 6 |
| error | 3 | true | 6 |
| need_input | 3 | true | 6 |
| sleeping | 6 | true | 6 |

## Failed Fixture Table

| Action | Reason Code | Frame Index |
| --- | --- | --- |
| none | none | none |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop test | passed | exit=0 |
| desktop check | passed | exit=0 |
| accepted generated frame assembly | passed | status=accepted; reasonCode=accepted; actionCount=8 |
| continuity table passed | passed | idle:6,thinking:6,running:6,success:6,warning:6,error:6,need_input:6,sleeping:6 |
| safe renderer output fields | passed | packId,rendererKind,actions.actionId,actions.assetId,actions.frameCount,actions.fps,actions.loop,actions.transient,actions.durationMs,actions.fallbackActionId |
| failed fixture first_final_mismatch | passed | status=rejected; reasonCode=first_final_mismatch; previousPackPreserved=true |
| failed fixture adjacent_delta_exceeded | passed | status=rejected; reasonCode=adjacent_delta_exceeded; previousPackPreserved=true |
| failed fixture unsafe_svg_payload | passed | status=rejected; reasonCode=unsafe_svg_payload; previousPackPreserved=true |
| failed fixture frame_blank | passed | status=rejected; reasonCode=frame_blank; previousPackPreserved=true |
| failed fixture frame_off_canvas | passed | status=rejected; reasonCode=frame_off_canvas; previousPackPreserved=true |
| security redaction scan | passed | safe assembly evidence contains no private data values, prompt text, provider payload, or local paths |
| claim scan | passed | V15.12 claim remains local continuity assembly scoped and forbidden claims stay forbidden/not-ready |
| PRD/spec review | passed | active PRD, V15 plan, detailed spec, and acceptance plan align with V15.12 continuity assembly |

## Security Boundary

Evidence records only safe pack IDs, action IDs, frame counts, continuity
numbers, issue reason codes, and renderer output field names. It excludes raw
photo bytes, source filename, full local path, EXIF/GPS payload, token,
Authorization, prompt text, raw provider request, and raw provider response.

## Allowed Claim

V15.12 photo-guided 2D action pack continuity assembly passed for tested local frame assets.

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.
