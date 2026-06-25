# V30 Implementation Contract

文档状态：scoped passed implementation contract；retained as V30 data-flow and safety contract。
当前日期：2026-06-23。

## Required Data Flow

```text
ActionStoryboard
  -> CandidateFrameRoute
  -> NormalizedAnimationPack
  -> MotionReadabilityQA
  -> VisualReviewResult
  -> IsolatedPreview
  -> ApprovedApply
  -> Rollback
```

## Core Types

### ActionStoryboard

Required fields:

- actionId；
- semanticGoal；
- keyPoses；
- timing；
- loopType；
- rejectIfMostlyWholeImageTransform；
- manualReviewPrompt。

### CandidateFrameRoute

Allowed route kinds:

- provider_key_pose；
- local_2d_rig；
- manual_frame_import；
- weak_baseline_comparison。

### MotionReadabilityQA

Required outputs:

- status: passed / blocked / failed；
- reasonCodes；
- actionScores；
- transformOnlyScore；
- keyPoseDiversityScore；
- semanticChecklistResult；
- loopClosureResult；
- adjacentDeltaResult；
- sameCatResult。

## Stable Reason Codes

Minimum reasonCodes:

- storyboard_missing；
- key_pose_missing；
- action_semantics_unreadable；
- whole_image_transform_only；
- motion_amplitude_too_low；
- key_pose_diversity_too_low；
- silhouette_change_too_low；
- anchor_drift_too_high；
- loop_closure_failed；
- adjacent_frame_jump；
- identity_drift；
- background_residue；
- off_canvas_frame；
- visual_review_rejected；
- qa_failed_pack_blocked；
- approved_pack_applied；
- rollback_restored_previous_pack。

## Runtime Rules

- Preview must not call notify.
- Preview must not send PetEvent.
- Preview must not write CatStateMachine.
- Apply must require QA-approved pack.
- Apply must affect only target PetInstance.
- Rollback must restore previous visible pack.

## Evidence Redaction

Evidence may include:

- safe pack ID；
- action ID；
- reasonCode；
- score buckets；
- contact sheet filename；
- animated preview filename；
- sanitized route kind。

Evidence must not include:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- private filename；
- full local path；
- workspace/config path；
- prompt private text；
- Petdex copied assets。
