# V20 Implementation Contract

文档状态：planned implementation contract；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Provider Adapter Boundary

Provider adapter may receive:

- user-approved reference image bytes during execution only.
- safe media metadata.
- provider consent state.
- disclosure acceptance booleans.
- provider credential via environment/config boundary.
- prompt template.

Provider adapter must not expose:

- credential value.
- Authorization header.
- raw request body.
- raw provider response.
- raw photo bytes in logs/evidence.
- full local path.
- private filename.
- EXIF/GPS.
- prompt private text.

## Output Contract

Provider output summary must use:

```text
providerName
endpointHost
model
capability
reference_image_attached
provider_capability
text_to_image_only
reasonCode
imageCount
outputKind
safeOutputFileNames
promptHash
promptLength
```

## Motion Sheet Contract

Accepted provider output must normalize into the V19 safe motion sheet model:

```text
sheetId
packId
rendererKind=sprite
actions[8]
framesPerAction
safe pack metadata
QA summary
```

## Stable ReasonCodes

V20 must support:

- provider_credential_missing
- provider_consent_required
- provider_terms_required
- provider_cost_disclosure_required
- provider_privacy_disclosure_required
- provider_retention_disclosure_required
- provider_license_disclosure_required
- provider_unavailable
- provider_reference_not_supported
- provider_output_missing
- provider_output_not_single_sheet
- provider_output_rejected
- background_gate_failed
- same_cat_qa_failed
- motion_amplitude_too_low
- loop_closure_failed
- normalization_failed
- activation_failed
- rollback_succeeded
