# V20.1 Provider Consent Boundary Evidence

status: passed
date: 2026-06-14

## Scope

V20.1 verifies the product boundary before any mainland provider call. This
smoke does not upload a photo, does not call MiniMax, and does not persist any
provider credential. It verifies consent, terms, disclosure, credential presence,
document-only provider blocking, and reference-image evidence field requirements.

## Results

| Check | Result | Details |
| --- | --- | --- |
| provider selector defaults to MiniMax | passed | provider=minimax; reasonCode=provider_consent_required |
| non-active mainland providers are document-only | passed | provider=aliyun_wanxiang; reasonCode=provider_document_only |
| consent unchecked blocks provider call | passed | reasonCode=provider_consent_required |
| terms and disclosure gates are required | passed | terms/cost/privacy/retention/license/attribution reasonCodes covered |
| missing credential is stable | passed | reasonCode=provider_credential_missing |
| configured credential is redacted | passed | credentialState=configured |
| provider execution is gated by actual local env | passed | MINIMAX_API_KEY present; value redacted |
| reference image evidence fields enforced | passed | reference_image_attached/provider_capability/text_to_image_only gate covered |
| provider benchmark unit tests pass | passed | v20-provider-benchmark.test.ts passed |
| safe output fields only | passed | providerName, endpointHost, model, capability, reference_image_attached, provider_capability, text_to_image_only, reasonCode, imageCount, outputKind, safeOutputFileNames, promptHash, promptLength, credentialState, sampleCount, acceptedSampleCount, medianAcceptedAttemptCount |
| evidence security scan | passed | no token, Authorization, raw photo bytes, raw provider response, raw HTTP payload, full local path, or private filename |

## Safe Metadata

| Field | Value |
| --- | --- |
| provider | MiniMax / 海螺 |
| credentialState | configured |
| providerCallStarted | false |
| uploadStarted | false |
| tokenPrinted | false |
| AuthorizationPrinted | false |
| rawPhotoBytesRecorded | false |
| rawProviderResponseRecorded | false |

## PRD / Spec Review

V20.1 satisfies the provider consent/disclosure boundary required by the V20 PRD.
V20.2 remains a separate conditional provider benchmark gate and is not implied
by this evidence.

## Allowed Claim

V20.1 mainland provider consent and credential boundary passed without starting provider execution.

## Forbidden Claims

- provider integration verified
- MiniMax benchmark passed
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- production signed release ready
