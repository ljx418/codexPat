# V18.2 Provider Capability Preflight

status: failed
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
    "name": "real local cat photo exists",
    "result": "failed",
    "details": "reasonCode=reference_photo_missing"
  }
]
```

## Security Boundary

- Credential source is named as MINIMAX_API_KEY only; the value is never written.
- Reference image bytes and Data URL are never written.
- Raw provider response is never written.
- Full local paths, EXIF/GPS, prompt text, Authorization, token, workspace path,
  config path, and api-token.json are forbidden from this evidence.

## PRD / Spec Review

V18.2 is not passed. V18.3/V18.6 must remain No-Go unless the provider capability issue is resolved or explicitly replanned.

## Allowed Claim

No V18.2 provider capability passed claim is made while status is not passed.

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
