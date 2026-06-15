# V23-V28 Implementation Contract

文档状态：planned implementation contract。  
当前日期：2026-06-15。

## Core Data Flow

```text
ReferencePhoto
  -> PhotoSuitabilityResult
  -> CatTraitSummary
  -> RouteAttempt
  -> CandidateAsset
  -> QAResult
  -> V22ReviewResult
  -> PreviewSession
  -> ApplyResult
  -> RollbackResult
```

## Stable ReasonCodes

Minimum required reasonCodes:

- photo_missing；
- photo_blurry；
- cat_occluded；
- multi_cat_ambiguous；
- background_too_complex；
- trait_extraction_failed；
- provider_credential_missing；
- route_unavailable；
- route_output_missing；
- action_coverage_incomplete；
- identity_drift_detected；
- motion_amplitude_too_low；
- frame_delta_too_large；
- loop_closure_failed；
- qa_failed_pack_blocked；
- retry_budget_exceeded；
- better_photo_required；
- alternate_route_recommended；
- apply_blocked_non_approved_candidate；
- rollback_available。

## Runtime Rules

- Preview must not call `notify`.
- Preview must not write `CatStateMachine`.
- Preview must not mutate live PetInstance state.
- Apply must target exactly one PetInstance.
- Default and unrelated pets must remain unchanged.
- Rollback must restore the previous visible pack.

## Evidence Rules

Evidence may include screenshots/contact sheets/captures under project evidence
paths. Evidence must not include raw photo bytes, raw provider output, full local
paths, token, Authorization, or private filenames.
