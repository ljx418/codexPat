# V17.5 Apply Rollback Smoke

Date: 2026-06-11
Status: passed
Scope: Target-only apply and rollback logic for the accepted V17.3 generated pack. This is model/store-level evidence and does not send PetEvent or mutate CatStateMachine.

## Target Apply Result

```json
{
  "previewStatus": "ready",
  "previewReasonCode": "preview_apply_ready",
  "generatedPackId": "v17-action-sheet-packaging-docs-cat",
  "targetInstanceId": "codex_2",
  "previewActionCount": 8,
  "previewActions": [
    {
      "actionId": "idle",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "thinking",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "running",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "success",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "warning",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "error",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "need_input",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 0,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "sleeping",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
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

## Rollback Result

```json
{
  "status": "rollback_completed",
  "reasonCode": "rollback_completed",
  "targetInstanceId": "codex_2",
  "restoredPackId": "previous-safe-pack",
  "defaultPetUnchanged": true,
  "unrelatedPetsUnchanged": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false
}
```

## Failure Preservation Result

```json
{
  "status": "blocked",
  "reasonCode": "target_instance_not_found",
  "previousPackPreserved": true
}
```

## Acceptance Result

| Check | Result |
| --- | --- |
| target instance changed to generated pack | passed |
| default pet unchanged | passed |
| unrelated pets unchanged | passed |
| rollback restores previous pack | passed |
| failed apply preserves previous pack | passed |
| accepted PetEvent | 0 |
| calls notify | false |
| writes CatStateMachine | false |

## PRD / Spec Review

V17.5 matches the target-only apply, failure preservation, and rollback requirements for the tested generated local pack scenario. V17.6 final product HTML and screenshot-backed review remain not-run.

## Claim Boundary

Allowed claim:
V17.5 target-pet apply and rollback passed for tested local generated pack scenario.

V17.6 remains not-run.
