# V31.11 Photo Action Preview Apply Rollback

status: blocked
date: 2026-06-24

## Pre-execution Development And Acceptance Plan

- Execute only the scoped V31 continuation phase named in this evidence.
- Use existing PRD and target architecture as the source of truth.
- Stop or mark blocked instead of passing if real visual, runtime, or photo-derived evidence is missing.

## Evidence

- Development plan: run the approved preview/apply/rollback model and require true photo-derived action frames before accepting photo-action closure.
- Acceptance standard: QA, all 8 actions, target-only apply, rollback, and photo-derived frame availability must all be true.
- PRD/spec review: using the flagship local pack proves runtime controls, not arbitrary photo-derived action asset generation.
- Preview/apply/rollback: {
    "status": "passed",
    "reasonCodes": [
      "pack_assembled",
      "preview_ready",
      "rollback_available",
      "rollback_restored_previous_pack",
      "target_pack_applied"
    ],
    "generatedPackId": "v31-continuation-flagship-candidate",
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
      "generatedPackId": "v31-continuation-flagship-candidate",
      "targetInstanceId": "codex_v31_continuation_target",
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
- Semantic QA: {
    "status": "passed",
    "candidateId": "v30_semantic_candidate",
    "safePackId": "v31-continuation-flagship-candidate",
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
- Closure result: {
    "status": "blocked",
    "reasonCodes": [
      "photo_derived_action_frames_missing"
    ],
    "namedSampleSetStatus": "partial",
    "artStatus": "passed",
    "semanticStatus": "passed",
    "previewApplyStatus": "passed",
    "rollbackStatus": "rolled_back",
    "photoDerivedActionFramesAvailable": false
  }.
- Audit opinion: V31.11 is blocked because no real photo-derived action frame pack is available, even though target-only apply and rollback controls pass for the tested local candidate.
- Claim/security scan: passed/passed; doc audit: passed.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
