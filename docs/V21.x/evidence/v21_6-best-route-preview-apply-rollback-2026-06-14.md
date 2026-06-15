# V21.6 Best Route Preview / Apply / Rollback Evidence

status: passed
date: 2026-06-14

## Scope

V21.6 exercises the selected best route from V21.5 through isolated preview,
target-only apply, and rollback. It uses the real Route A generated pack and
does not mark V21 final passed.

## Selected Route

| Field | Value |
| --- | --- |
| selectedRoute | Route A |
| packId | v21-route-a-keypose-orange-tabby |
| routeSource | MiniMax-derived key-pose local pack from V21.1 |

## Result Table

| Check | Result | Details |
| --- | --- | --- |
| V21.5 comparator prerequisite | passed | V21.5 route comparator evidence passed |
| best route selected | passed | Route A: route_a_passed |
| selected route pack exists | passed | Route A pack/pet.json |
| 8 core action frame integrity | passed | 8 actions and safe PNG frames present |
| best route continuity assembly | passed | status=accepted; reasonCode=accepted |
| isolated preview ready | passed | previewActions=8 |
| preview zero PetEvent | passed | acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false |
| safe renderer input snapshot | passed | fields=safeActionId,rendererKind,safePackId,playbackIntent,scale,visibility |
| target-only apply | passed | target changed; default/unrelated unchanged |
| rollback restores previous pack | passed | target restored; default/unrelated unchanged |
| unknown target blocked | passed | status=blocked; reasonCode=target_instance_not_found |
| human-visible preview evidence | passed | docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-2026-06-14.html; docs/V21.x/evidence/assets/v21_6-best-route-preview-apply-rollback-2026-06-14/route-a-preview-grid.png |
| security redaction scan | passed | no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text |
| claim boundary | passed | V21.6 proves best-route preview/apply/rollback only; V21.7 final remains No-Go |

## Preview / Apply Snapshot

```json
{
  "previewStatus": "ready",
  "previewReasonCode": "preview_apply_ready",
  "generatedPackId": "v21-route-a-keypose-orange-tabby",
  "targetInstanceId": "codex_v21_target",
  "previewActionCount": 8,
  "previewActions": [
    {
      "actionId": "idle",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 9,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "thinking",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 9,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "running",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 9,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "success",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 10,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "warning",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 10,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "error",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 10,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "need_input",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 3,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 10,
      "fallbackActionId": "idle",
      "reasonCode": "generated_action_preview_ready"
    },
    {
      "actionId": "sleeping",
      "coverageState": "animated",
      "rendererKind": "sprite",
      "frameCount": 6,
      "firstFinalClosed": true,
      "maxAdjacentDelta": 9,
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
  "targetInstanceId": "codex_v21_target",
  "restoredPackId": "flagship-work-cat-v2",
  "defaultPetUnchanged": true,
  "unrelatedPetsUnchanged": true,
  "acceptedPetEvents": 0,
  "callsNotify": false,
  "writesCatStateMachine": false
}
```

## Human-visible Evidence

- HTML: `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-2026-06-14.html`
- Preview grid: `docs/V21.x/evidence/assets/v21_6-best-route-preview-apply-rollback-2026-06-14/route-a-preview-grid.png`

## PRD / Spec Review

V21.6 matches the target-only preview/apply/rollback requirement for the selected
Route A pack. The preview is isolated, produces zero PetEvent, and does not write
CatStateMachine. Default and unrelated pets are unchanged.

## Risk Assessment

| Risk | Level | Decision |
| --- | --- | --- |
| Route A visual quality still not product-grade for arbitrary cats | Medium | final claim must remain route-scoped |
| Route B capability review mistaken as provider integration | High if overclaimed | blocked by claim scan and V21.7 claim matrix |
| Apply model confused with live user runtime install | Medium | evidence states model/store-level apply; final needs HTML summary |

## Allowed Claim

V21.6 best-route preview/apply/rollback passed for the tested Route A local
animation pack scenario.

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
