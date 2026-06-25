# V32 Quality Rescue Smoke

status: passed scoped
date: 2026-06-24

## Evidence

- Development plan: generate two local project-authored layered-rig frameSequence packs, measure their real PNG frames, and run V30/V31/V32/runtime gates.
- Acceptance standard: two local packs must pass measured V32 gate plus V30 semantic, V31 art, target-only preview/apply, rollback, claim scan, and security scan.
- Generated packs: quality-rescue-tabby-v1, quality-rescue-tuxedo-v1.
- V32 quality results: [
    {
      "status": "passed",
      "candidateId": "quality-rescue-tabby-v1",
      "safePackId": "quality-rescue-tabby-v1",
      "routeKind": "local_layered_rig",
      "reasonCodes": [
        "v32_quality_rescue_passed"
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
      "actionSummaries": {
        "idle": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "low",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "thinking": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "medium",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "running": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "success": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "warning": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "error": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "need_input": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "sleeping": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "medium",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        }
      },
      "scoreBuckets": {
        "motion": "high",
        "localMotion": "high",
        "visualDetail": "high"
      }
    },
    {
      "status": "passed",
      "candidateId": "quality-rescue-tuxedo-v1",
      "safePackId": "quality-rescue-tuxedo-v1",
      "routeKind": "local_layered_rig",
      "reasonCodes": [
        "v32_quality_rescue_passed"
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
      "actionSummaries": {
        "idle": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "low",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "thinking": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "medium",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "running": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "success": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "warning": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "error": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "medium",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0.143
        },
        "need_input": {
          "frameCount": 8,
          "motionBucket": "high",
          "localMotionBucket": "high",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        },
        "sleeping": {
          "frameCount": 12,
          "motionBucket": "high",
          "localMotionBucket": "low",
          "visualDetailBucket": "high",
          "duplicateFrameRatio": 0
        }
      },
      "scoreBuckets": {
        "motion": "high",
        "localMotion": "medium",
        "visualDetail": "high"
      }
    }
  ].
- V30 semantic: {
    "status": "passed",
    "candidateId": "v30_semantic_candidate",
    "safePackId": "quality-rescue-tabby-v1",
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
- V31 art: {
    "status": "passed",
    "candidateId": "quality_rescue_local_layered_rig",
    "safePackId": "quality-rescue-tabby-v1",
    "routeKind": "layered_2d_rig",
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
      "visualPolish": "medium",
      "actionPose": "medium",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Preview/apply/rollback: {
    "status": "passed",
    "reasonCodes": [
      "pack_assembled",
      "preview_ready",
      "rollback_available",
      "rollback_restored_previous_pack",
      "target_pack_applied"
    ],
    "generatedPackId": "quality-rescue-tabby-v1",
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
      "generatedPackId": "quality-rescue-tabby-v1",
      "targetInstanceId": "codex_v32_target",
      "previewActionCount": 8,
      "previewActions": [
        {
          "actionId": "idle",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "thinking",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "running",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "success",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "warning",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "error",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "need_input",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
          "firstFinalClosed": true,
          "maxAdjacentDelta": 5,
          "fallbackActionId": "idle",
          "reasonCode": "generated_action_preview_ready"
        },
        {
          "actionId": "sleeping",
          "coverageState": "animated",
          "rendererKind": "sprite",
          "frameCount": 12,
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
- HTML report: docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html.
- Headless screenshot: passed; docs/V32.x/evidence/screenshots/v32_quality_rescue-overview-2026-06-24.png.
- Claim/security scan: passed/passed; claim violations=[], security violations=[].
- Audit opinion: V32 only covers local project-authored assets. Photo-derived arbitrary-cat automation remains not ready.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
