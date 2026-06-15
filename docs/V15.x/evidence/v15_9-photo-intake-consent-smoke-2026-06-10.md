# V15.9 Photo Intake Consent Smoke Evidence

status: passed
date: 2026-06-10

## Scope

V15.9 validates the photo intake and consent boundary for the planned
photo-guided 2D action asset workflow. It does not generate provider assets,
does not upload photos, and does not claim automatic photo-to-2D readiness or
provider integration.

## Safe Evidence Snapshot

| Field | Value |
| --- | --- |
| status | photo_selected |
| reasonCode | exif_redacted |
| sourceKind | local_photo |
| sourceDigest | photo_digest_86b4e073 |
| safePhotoFields | dimensionBucket, exifStripped, extension, hasExif, mimeType, sizeBucket |
| providerUploadAllowed | false |
| termsReviewed | false |
| storesRawPhoto | false |
| uploadsByDefault | false |
| persistsExifGps | false |
| persistsSourceFileName | false |
| persistsFullPath | false |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop test | passed | exit=0 |
| desktop check | passed | exit=0 |
| real local photo metadata accepted | passed | status=photo_selected; reasonCode=exif_redacted; safeFields=dimensionBucket,exifStripped,extension,hasExif,mimeType,sizeBucket |
| local processing consent required | passed | status=consent_required; reasonCode=consent_required |
| provider terms required before upload | passed | status=consent_required; reasonCode=provider_terms_required; providerName=minimax |
| missing photo | passed | status=blocked; reasonCode=photo_required |
| unsafe photo metadata | passed | status=failed; reasonCode=security_scan_failed |
| unsupported mime | passed | status=failed; reasonCode=photo_mime_unsupported |
| photo too large | passed | status=failed; reasonCode=photo_too_large |
| decode failed | passed | status=failed; reasonCode=photo_decode_failed |
| no upload by default | passed | uploadsByDefault=false; includesProviderCall=false; providerUploadAllowed=false |
| security redaction scan | passed | no raw photo, source filename, full path, EXIF/GPS payload, token, Authorization, prompt text, or raw provider response |
| claim scan | passed | V15.9 claim remains scoped and forbidden claims stay forbidden/not-ready |
| PRD/spec review | passed | active PRD, V15 plan, detailed spec, and acceptance plan align with V15.9 |

## Security Boundary

Evidence records only safe metadata buckets and consent booleans. It excludes
raw photo bytes, source filename, full local path, EXIF/GPS payload, token,
Authorization, prompt text, raw provider request, and raw provider response.

## Allowed Claim

V15.9 photo intake and consent boundary passed for tested local scenarios.

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.

## Final Decision

V15.9 passed.
