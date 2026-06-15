# V17.4 Modal Preview QA Smoke

Date: 2026-06-11
Status: passed
Scope: In-modal 8-action preview QA model and local canvas preview boundary. V17.5 target apply/rollback remains not-run.

## Prerequisite

V17.3 generated local pack exists and was accepted by continuity assembly.

## DOM Capture

```html
<section class="photo-2d-qa-section" data-qa-state="modal_preview_ready" data-qa-reason-code="modal_preview_ready" data-accepted-pet-events="0" data-writes-cat-state-machine="false" data-mutates-live-pet="false"></section>
```

## Preview Action Table

| actionId | coverageState | frameCount | firstFinalClosed | maxAdjacentDelta | reasonCode |
| --- | --- | ---: | --- | ---: | --- |
| idle | animated | 6 | true | 0 | generated_action_preview_ready |
| thinking | animated | 6 | true | 0 | generated_action_preview_ready |
| running | animated | 6 | true | 0 | generated_action_preview_ready |
| success | animated | 3 | true | 0 | generated_action_preview_ready |
| warning | animated | 3 | true | 0 | generated_action_preview_ready |
| error | animated | 3 | true | 0 | generated_action_preview_ready |
| need_input | animated | 3 | true | 0 | generated_action_preview_ready |
| sleeping | animated | 6 | true | 0 | generated_action_preview_ready |

## Failed QA Blocks Apply

```json
{
  "status": "blocked",
  "reasonCode": "same_cat_review_failed",
  "applyBlocked": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false,
  "mutatesLivePetInstance": false
}
```

## Passed QA Remains Preview-only

```json
{
  "status": "modal_preview_ready",
  "reasonCode": "modal_preview_ready",
  "manualSameCatReview": "passed",
  "applyStatus": "not-run",
  "nextPhase": "V17.5 target apply / rollback"
}
```

## Safe Preview Snapshot

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
  "applyStatus": "not-run",
  "applyReasonCode": "previous_pack_preserved",
  "targetChanged": false,
  "defaultPetUnchanged": true,
  "unrelatedPetsUnchanged": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false
}
```

## Acceptance Result

| Check | Result |
| --- | --- |
| all 8 actions visible in preview model | passed |
| failed same-cat QA blocks apply | passed |
| preview sends PetEvent | no |
| preview calls notify | no |
| preview writes CatStateMachine | no |
| preview mutates live PetInstance | no |
| apply/rollback executed | no |

## Security Scan

Evidence contains safe action IDs, frame counts, reasonCodes, and preview boundary flags only. It does not include source image bytes, raw prompt, provider response, credential, auth header, private path, workspace path, config path, shell history, or clipboard content.

## PRD / Spec Review

V17.4 matches the requirement for an in-modal 8-action preview QA boundary. It intentionally does not apply the generated pack.

## Claim Boundary

Allowed claim:
V17.4 in-modal 8-action preview QA passed for tested generated sprite pack scenario.

V17.5-V17.6 remain not-run.
