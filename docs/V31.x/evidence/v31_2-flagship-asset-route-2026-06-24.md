# V31.2 Flagship Asset Route

status: passed scoped
date: 2026-06-24

## Summary

- Development plan: use the existing project fixture imported-animated-qa-cat-v1 as the first V31 flagship candidate, create sanitized evidence copies, and validate quality gates.
- Acceptance standard: 8 actions, visual QA, semantic QA, license boundary, target apply, and rollback must pass.
- Sanitized asset directory: docs/V31.x/evidence/assets/v31_flagship_candidate_sanitized_2026-06-24.
- Contact sheet: docs/V31.x/evidence/assets/v31_flagship_candidate_sanitized_2026-06-24/contact-sheet.png.
- Art QA: {
    "status": "passed",
    "candidateId": "v31_flagship_imported_animated_qa_cat_v1_sanitized",
    "safePackId": "v31-flagship-local-candidate",
    "routeKind": "professional_frame_pack",
    "reasonCodes": [
      "v31_art_quality_passed"
    ],
    "actionCoverage": {
      "idle": true,
      "thinking": true,
      "running": true,
      "success": true,
      "warning": true,
      "error": true,
      "need_input": true,
      "sleeping": true
    },
    "scoreBuckets": {
      "visualPolish": "high",
      "actionPose": "medium",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Semantic QA: {
    "status": "passed",
    "candidateId": "v30_semantic_candidate",
    "safePackId": "v31-flagship-local-candidate",
    "routeKind": "local_2d_rig",
    "reasonCodes": [
      "semantic_animation_passed"
    ],
    "actionCoverage": {
      "idle": true,
      "thinking": true,
      "running": true,
      "success": true,
      "warning": true,
      "error": true,
      "need_input": true,
      "sleeping": true
    },
    "actionScores": {
      "idle": {
        "semanticReadable": true,
        "motionBucket": "low",
        "keyPoseBucket": "low",
        "transformOnly": false
      },
      "thinking": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "running": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "success": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "warning": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "error": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "need_input": {
        "semanticReadable": true,
        "motionBucket": "medium",
        "keyPoseBucket": "medium",
        "transformOnly": false
      },
      "sleeping": {
        "semanticReadable": true,
        "motionBucket": "low",
        "keyPoseBucket": "low",
        "transformOnly": false
      }
    },
    "transformOnlyScore": "low",
    "keyPoseDiversityScore": "medium",
    "semanticChecklistResult": "passed",
    "loopClosureResult": "passed",
    "adjacentDeltaResult": "passed",
    "sameCatResult": "passed"
  }.
- Apply/rollback: {
    "status": "passed",
    "reasonCodes": [
      "pack_assembled",
      "preview_ready",
      "rollback_available",
      "rollback_restored_previous_pack",
      "target_pack_applied"
    ],
    "generatedPackId": "v31-flagship-local-candidate",
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
      "generatedPackId": "v31-flagship-local-candidate",
      "targetInstanceId": "codex_v31_target",
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
  }.
- Audit opinion: candidate is accepted only as a named local asset pack, not as arbitrary-cat automation.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, provider integration verified, 3D ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
