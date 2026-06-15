# V18.5 Preview Apply Rollback

status: passed
date: 2026-06-12

## Scope

V18.5 verifies the generated V18 pack can enter the app's isolated preview and
target-only apply/rollback model without emitting PetEvents, notify calls, or
CatStateMachine writes.

This is model/store-level evidence. V18.6 still must generate a human-readable
HTML report, run regression/security/claim scans, and select the narrow final
claim.

## Results

```json
[
  {
    "name": "V18.4 QA prerequisite",
    "result": "passed",
    "details": "same-cat/continuity QA evidence passed"
  },
  {
    "name": "continuity assembly prerequisite",
    "result": "passed",
    "details": "status=accepted; reasonCode=accepted"
  },
  {
    "name": "preview ready",
    "result": "passed",
    "details": "status=ready; reasonCode=preview_apply_ready"
  },
  {
    "name": "preview action count",
    "result": "passed",
    "details": "previewActions=8"
  },
  {
    "name": "preview zero PetEvent",
    "result": "passed",
    "details": "acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false"
  },
  {
    "name": "safe renderer input snapshot",
    "result": "passed",
    "details": "fields=safeActionId,rendererKind,safePackId,playbackIntent,scale,visibility"
  },
  {
    "name": "target-only apply",
    "result": "passed",
    "details": "targetChanged=true; default/unrelated unchanged"
  },
  {
    "name": "rollback restores previous pack",
    "result": "passed",
    "details": "target restored; default/unrelated unchanged"
  },
  {
    "name": "unknown target blocked",
    "result": "passed",
    "details": "status=blocked; reasonCode=target_instance_not_found"
  },
  {
    "name": "human-visible action preview",
    "result": "passed",
    "details": "docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-2026-06-12/action-preview.html; docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-2026-06-12/identity-action-grid.png"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "safe ids and action metadata only; no token, Authorization, raw provider response, raw photo, full path, prompt text"
  },
  {
    "name": "claim boundary",
    "result": "passed",
    "details": "V18.5 proves preview/apply/rollback model path only; V18.6 final HTML/regression remains not-run"
  }
]
```

## Preview / Apply Snapshot

```json
{
  "previewStatus": "ready",
  "previewReasonCode": "preview_apply_ready",
  "generatedPackId": "v18-3-minimax-i2i-identity-locked-pack",
  "targetInstanceId": "codex_v18_target",
  "previewActionCount": 8,
  "previewActions": [
    {
      "actionId": "idle",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "thinking",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 21,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "running",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 21,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "success",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "warning",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "error",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "need_input",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "sleeping",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 17,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    }
  ],
  "previewSafety": {
    "acceptedPetEvents": 0,
    "callsNotify": false,
    "writesCatStateMachine": false,
    "mutatesLivePetInstance": false
  },
  "safeRendererInputFields": [
    "safeActionId",
    "rendererKind",
    "safePackId",
    "playbackIntent",
    "scale",
    "visibility"
  ],
  "applyStatus": "applied",
  "applyReasonCode": "target_pack_applied",
  "targetChanged": true,
  "defaultPetUnchanged": true,
  "unrelatedPetsUnchanged": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false
}
```

## Rollback Snapshot

```json
{
  "status": "rollback_completed",
  "reasonCode": "rollback_completed",
  "targetInstanceId": "codex_v18_target",
  "restoredPackId": "flagship-work-cat-v2",
  "defaultPetUnchanged": true,
  "unrelatedPetsUnchanged": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false
}
```

## Human-visible Preview

- docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-2026-06-12/action-preview.html
- docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-2026-06-12/identity-action-grid.png

## PRD / Spec Review

V18.5 preview/apply/rollback passed for the tested generated pack. V18.6 may proceed to final report/regression only.

## Allowed Claim

V18 in-app preview, target apply, and rollback passed for the tested generated 2D action pack scenario.

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- V18 final workflow passed
