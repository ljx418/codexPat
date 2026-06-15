# V7.1 Photo Intake Privacy Smoke Evidence

status: passed

date: 2026-05-31

commit: c07cdd0e

## Scope

Validated V7.1 local photo intake privacy boundary with a real local image fixture:

- fixture class: local generated orange tabby PNG action asset.
- tested path handling: path used only by test runner to read file metadata.
- session output: no full path, no source filename, no raw photo bytes, no EXIF/GPS, no upload, no provider call.

## Commands

- `pnpm --filter desktop test`
- `pnpm --filter desktop check`
- `pnpm --filter desktop build`
- `node scripts/v7_1_photo_intake_privacy_smoke.mjs`

## Smoke Result

```text
status: passed
desktop V7.1 unit coverage: passed
desktop typecheck: passed
real local photo metadata privacy boundary: passed
security redaction scan: passed
```

## Accepted Safe Fields

- `status`
- `reasonCode`
- `photoReferenceMode`
- `photoProvided`
- `safePhotoFields`
- `privacyBoundary`
- `approvedTraitLength`

## Rejected / Not Persisted

- raw photo bytes
- source filename
- full local path
- EXIF/GPS
- prompt text
- provider payload
- token
- Authorization
- workspace path
- config path
- `api-token.json`

## Runtime Claim Boundary

This evidence does not prove generated asset import, runtime rendering, photo customization readiness, provider integration, automatic photo-to-3D, or production release readiness.

## Decision

V7.1 local photo intake privacy boundary passed for tested local no-upload scenarios.
