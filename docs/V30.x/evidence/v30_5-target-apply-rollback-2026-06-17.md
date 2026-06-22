# V30.5 Target Apply / Rollback Evidence - 2026-06-17

status: passed

## Snapshot

```json
{
  "status": "passed",
  "reasonCodes": [
    "pack_assembled",
    "preview_ready",
    "rollback_available",
    "rollback_restored_previous_pack",
    "target_pack_applied"
  ],
  "generatedPackId": "flagship-work-cat-v2",
  "previewActionCount": 8,
  "previewStatus": "ready",
  "applyStatus": "applied",
  "rollbackStatus": "rolled_back",
  "previewSafety": {
    "acceptedPetEvents": 0,
    "callsNotify": false,
    "writesCatStateMachine": false,
    "mutatesLivePetInstance": false
  },
  "previewApplySnapshot": {
    "previewStatus": "ready",
    "previewReasonCode": "preview_apply_ready",
    "generatedPackId": "flagship-work-cat-v2",
    "targetInstanceId": "codex_v30_target",
    "previewActionCount": 8,
    "previewActions": [
      {
        "actionId": "idle",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "thinking",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "running",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "success",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "warning",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "error",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "need_input",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
        "fallbackActionId": "idle",
        "reasonCode": "generated_action_preview_ready"
      },
      {
        "actionId": "sleeping",
        "coverageState": "animated",
        "rendererKind": "sprite",
        "frameCount": 6,
        "firstFinalClosed": true,
        "maxAdjacentDelta": 5,
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
  },
  "rollbackDefaultPetUnchanged": true,
  "rollbackUnrelatedPetsUnchanged": true
}
```

## Safety

- preview accepted PetEvent count: 0
- preview calls notify: false
- preview writes CatStateMachine: false
- preview mutates live PetInstance state: false
- default pet unchanged: true
- unrelated pets unchanged: true
