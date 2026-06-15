# V18.2 Provider Capability Preflight

status: passed
date: 2026-06-12

## Scope

V18.2 checks whether the selected provider can support the V18 local cat photo
reference-image branch. This evidence uses the project-local cat fixture as a
real reference image and records only safe metadata.

This is not the V18 final gate and does not prove arbitrary-cat automation,
provider integration readiness, Petdex parity, 3D readiness, or production
release readiness.

## Provider Capability Source

- Provider: MiniMax
- Model: image-01
- Official API reference checked: image-generation-i2i
- Safe field evidence: subject_reference, type, image_file, base64 Data URL support, response_format=base64
- Local implementation path: MiniMax reference-image provider preflight/job summary

## Results

```json
[
  {
    "name": "official capability field map",
    "result": "passed",
    "details": "MiniMax image-generation-i2i exposes subject_reference[type=character,image_file] and image_file supports public URL or base64 Data URL; model=image-01; response_format supports base64"
  },
  {
    "name": "credential presence",
    "result": "passed",
    "details": "credentialSource=MINIMAX_API_KEY"
  },
  {
    "name": "upload consent",
    "result": "passed",
    "details": "explicit local smoke consent configured"
  },
  {
    "name": "provider terms/disclosures",
    "result": "passed",
    "details": "terms/privacy/retention/license smoke acceptance configured"
  },
  {
    "name": "reference image metadata",
    "result": "passed",
    "details": "mediaType=image/jpeg; sizeBucket=small; byteLength=456492; sha256=8460464f4ef7422d"
  },
  {
    "name": "preflight capability",
    "result": "passed",
    "details": "capability=image_to_image_supported; reasonCode=provider_capability_confirmed"
  },
  {
    "name": "MiniMax reference-image provider job",
    "result": "passed",
    "details": "providerName=MiniMax; model=image-01; endpointHost=api.minimaxi.com; capability=image_to_image_supported; reasonCode=provider_capability_confirmed; imageCount=1; outputFiles=1; status=0; statusMessage=success"
  },
  {
    "name": "safe output field list",
    "result": "passed",
    "details": "providerName, model, endpointHost, capability, documentedFields, referenceImage safe metadata, promptHash, promptLength, imageCount, output file safe names, status code/message"
  },
  {
    "name": "raw payload redaction",
    "result": "passed",
    "details": "no token, Authorization, Data URL, raw provider response, raw photo bytes, full local path, EXIF/GPS, workspace/config path"
  },
  {
    "name": "claim boundary",
    "result": "passed",
    "details": "V18.2 can only claim tested MiniMax reference-image provider capability/job; not arbitrary cats, provider integration, Petdex parity, or final V18 readiness"
  }
]
```

## Security Boundary

- Credential source is named as MINIMAX_API_KEY only; the value is never written.
- Reference image bytes and Data URL are never written.
- Provider response body is never written.
- Full local paths, EXIF/GPS, prompt text, Authorization, token, workspace path,
  config path, and API token file contents are forbidden from this evidence.

## PRD / Spec Review

V18.2 provider reference-image capability is confirmed for the tested MiniMax local reference-image scenario. V18.3 may proceed to normalize accepted provider output into the required 8-action model.

## Allowed Claim

V18.2 MiniMax reference-image provider capability and one tested local reference-image job passed.

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- cross-platform ready
- Windows ready
- V18 final workflow passed
