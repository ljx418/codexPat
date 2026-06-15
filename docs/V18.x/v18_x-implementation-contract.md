# V18 Implementation Contract

日期：2026-06-12  
状态：planned contract。

## Required Interfaces

### ReferencePhotoInput

Allowed fields:

- mediaType
- sizeBucket
- width
- height
- selectedState
- consentState
- safePreviewHandle

Forbidden fields:

- full local path
- raw bytes in evidence
- EXIF/GPS
- original filename if privacy-revealing

### ImageToImageActionProviderAdapter

Input:

- approved reference photo handle
- approved traits
- target action list
- provider model ID
- consent proof

Output:

- providerName
- jobId redacted or hashed
- jobState
- outputKind: `canonical_identity_image`
- safe canonical output handle
- canonical output summary
- reasonCode

Forbidden output:

- raw provider response
- token
- Authorization
- raw HTTP payload
- full path
- raw prompt with private user data

### MultiActionOutputNormalizer

Input:

- safe output handle
- outputKind: `canonical_identity_image`
- action mapping
- canonical source hash

Output:

- app-managed pack ID
- renderer kind `sprite`
- 8 core actions
- frame summary
- identityLock summary:
  - mode: `single_canonical_source`
  - sourceHash
  - actionDerivation: `local_effect_frames`
- safe warnings

### SameCatContinuityQA

Input:

- safe reference summary
- generated action frames
- identityLock summary

Output:

- sameCatStatus
- canonicalSourceHashStatus
- nonblankStatus
- offCanvasStatus
- loopClosureStatus
- adjacentDeltaStatus
- scaleReadabilityStatus
- applyAllowed
- reasonCode

### TargetApplyRollbackController

Input:

- target PetInstance ID
- app-managed pack ID
- previous active pack snapshot

Output:

- applyStatus
- rollbackStatus
- affectedInstanceId
- unchangedInstances summary

## Stable ReasonCodes

- consent_required
- traits_required
- provider_credential_missing
- provider_terms_required
- provider_upload_failed
- provider_rate_limited
- provider_output_missing
- provider_output_rejected
- provider_reference_not_supported
- generation_job_failed
- action_coverage_incomplete
- same_cat_review_failed
- continuity_check_failed
- qa_failed_apply_blocked
- pack_validation_failed
- manifest_import_failed
- activation_failed
- previous_pack_preserved
- target_instance_not_found
- rollback_succeeded

## Runtime Invariants

- Preview sends zero PetEvent.
- Preview never calls notify.
- Preview never writes CatStateMachine.
- Preview never changes live PetInstance state.
- Apply only affects target PetInstance.
- Failure preserves previous active pack.
- Renderer receives only safe action ID, renderer kind, safe pack/profile IDs, playback intent, scale, and visibility.
