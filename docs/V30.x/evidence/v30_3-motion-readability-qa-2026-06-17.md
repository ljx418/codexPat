# V30.3 Motion Readability QA Evidence - 2026-06-17

status: passed

## Weak Baseline Result

```json
{
  "status": "failed",
  "candidateId": "v30_weak_transform_candidate",
  "safePackId": "v16-host-image-tool-orange-tabby",
  "routeKind": "weak_baseline_comparison",
  "reasonCodes": [
    "action_semantics_unreadable",
    "key_pose_diversity_too_low",
    "motion_amplitude_too_low",
    "silhouette_change_too_low",
    "visual_review_rejected",
    "whole_image_transform_only"
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
      "transformOnly": true
    },
    "thinking": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "running": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "success": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "warning": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "error": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "need_input": {
      "semanticReadable": false,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    },
    "sleeping": {
      "semanticReadable": true,
      "motionBucket": "low",
      "keyPoseBucket": "low",
      "transformOnly": true
    }
  },
  "transformOnlyScore": "high",
  "keyPoseDiversityScore": "low",
  "semanticChecklistResult": "failed",
  "loopClosureResult": "passed",
  "adjacentDeltaResult": "passed",
  "sameCatResult": "passed"
}
```

## Semantic Candidate Result

```json
{
  "status": "passed",
  "candidateId": "v30_semantic_candidate",
  "safePackId": "flagship-work-cat-v2",
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
}
```

## Decision

- weak baseline expected result: failed.
- semantic candidate expected result: passed.
- transform-only motion is rejected.
- weak action amplitude or unreadable semantics are rejected.
