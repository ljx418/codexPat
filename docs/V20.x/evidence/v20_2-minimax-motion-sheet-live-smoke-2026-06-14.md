# V20.2 MiniMax Motion Sheet Live Smoke Evidence

status: passed
date: 2026-06-14

## Scope

V20.2 verifies whether MiniMax can be called through the current reference-image
/ image-to-image path using a real local cat photo. The repository currently
contains one real cat photo sample, so this evidence cannot support any low-retry
reliability claim even if the provider returns an image.

## Results

| Check | Result | Details |
| --- | --- | --- |
| real local cat photo samples exist | passed | sampleCount=3; sampleIds=sample_1,sample_2,sample_3 |
| sample size supports benchmark | passed | three real cat photos available |
| credential present | passed | MINIMAX_API_KEY present; value redacted |
| upload consent and provider terms present | passed | uploadConsent=true; termsAccepted=true |
| reference image request fields confirmed | passed | reference_image_attached=true; provider_capability=reference_image_supported; text_to_image_only=false |
| MiniMax live output received | passed | acceptedOutputs=3/3 |
| safe provider summary | passed | no token, Authorization, raw request, raw provider response, raw photo bytes, private filename, or full local path |
| reference image evidence gate | passed | reasonCode=reference_image_supported |
| benchmark low-retry reliability result | passed | sampleCount=3; acceptedSampleCount=3; medianAcceptedAttemptCount=1 |
| scoped smoke result | passed | status=passed; reasonCode=provider_benchmark_passed |

## Provider Summary

| Field | Value |
| --- | --- |
| provider | MiniMax / 海螺 |
| model | image-01 |
| reference_image_attached | true |
| provider_capability | reference_image_supported |
| text_to_image_only | false |
| imageCount | 3 |
| safeOutputFileNames | sample_1-minimax-motion-sheet-1.jpeg, sample_2-minimax-motion-sheet-1.jpeg, sample_3-minimax-motion-sheet-1.jpeg |
| benchmarkReasonCode | provider_benchmark_passed |
| lowRetryReliabilityClaim | false |

## PRD / Spec Review

V20.2 is only accepted as a scoped one-sample provider smoke when a real MiniMax
reference-image output is returned. V20.2 does not prove provider reliability
because fewer than three real cat samples are available in the repository.

## Allowed Claim

V20.2 MiniMax reference-image one-sample motion-sheet provider smoke returned output; low-retry reliability remains not claimed.

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- production signed release ready
