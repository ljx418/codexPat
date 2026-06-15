# V16 Implementation Contract

状态：planned implementation contract。  
日期：2026-06-10。

## Code Ownership Targets

| Area | Likely Surface |
| --- | --- |
| provider boundary | `apps/desktop/src/assets/*provider*` |
| photo-to-2D generation | `apps/desktop/src/assets/photo-to-2d-*` |
| continuity assembly | `apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts` |
| preview/apply | `apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts` |
| Manager UI | `apps/desktop/src/main.ts` |
| tests | `apps/desktop/src/assets/*.test.ts` |
| smoke scripts | `scripts/v16_*_smoke.mjs` |

## Required ReasonCodes

```text
provider_credential_missing
provider_consent_required
provider_terms_required
provider_cost_ack_required
provider_retention_ack_required
provider_license_ack_required
provider_request_rejected
provider_unavailable
provider_output_missing
provider_output_rejected
provider_generation_failed
same_cat_consistency_failed
frame_count_insufficient
first_final_mismatch
adjacent_delta_exceeded
manifest_import_failed
activation_failed
previous_pack_preserved
rollback_completed
```

## Safe Provider Summary

Provider evidence may store:

- provider name.
- model family/version.
- prompt digest, not prompt text.
- safe job id digest.
- action id.
- frame count.
- output file digest.
- byte length.
- reasonCode.

It must not store:

- raw photo.
- raw prompt.
- provider request/response body.
- token / Authorization / cookie.
- full local path.
- EXIF/GPS.
- shell command.

## Runtime Output Contract

Generated pack preview/apply must pass through existing safe renderer contract.

Preview:

- zero PetEvent.
- no notify.
- no CatStateMachine write.
- no live PetInstance mutation.

Apply:

- target PetInstance only.
- default/unrelated unchanged.
- invalid pack preserves previous active pack.

