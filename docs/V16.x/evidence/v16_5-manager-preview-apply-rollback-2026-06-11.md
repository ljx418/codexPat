# V16.5 Preview Apply Rollback Evidence

status: passed
date: 2026-06-11


## Preview / Apply Summary

| Field | Value |
| --- | --- |
| previewStatus | ready |
| previewReasonCode | preview_apply_ready |
| previewActionCount | 8 |
| applyStatus | applied |
| applyReasonCode | target_pack_applied |
| targetChanged | true |
| defaultPetUnchanged | true |
| unrelatedPetsUnchanged | true |
| acceptedPetEvents | 0 |
| callsNotify | false |
| writesCatStateMachine | false |

## Safe Renderer Input Fields

- safeActionId
- rendererKind
- safePackId
- playbackIntent
- scale
- visibility

## Allowed Claim

V16 generated 2D action pack preview, target-pet apply, and rollback UX passed for tested local scenarios.


## Security Boundary

Evidence contains safe IDs, safe file names, digests, counts, reasonCodes, and renderer field names only. It does not include raw provider payload, raw prompt, raw photo bytes, credential values, Authorization headers, config paths, workspace paths, or full local paths.
