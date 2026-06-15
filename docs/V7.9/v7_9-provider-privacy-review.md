# V7.9 Provider Privacy Review

status: planned
date: 2026-05-31

## Privacy Boundary

Allowed provider-bound data:

- User-approved cat traits.
- User-approved action intent.
- Optional user-approved photo only after explicit upload consent.
- Provider model identifier and generation settings needed for the smoke.

Forbidden in provider logs, evidence, manifests, and renderer payloads:

- Provider credentials.
- Authorization headers.
- Raw provider request or response.
- Raw prompt text.
- Original photo bytes.
- EXIF/GPS.
- Full local path.
- Workspace path.
- Config path.
- Token-like values.

## Retention Boundary

Provider output may be stored only as an app-managed generated asset candidate. The source photo is not persisted by default. Evidence stores a safe output summary, not raw provider payloads.

## Risk

Risk level: High until a real credential, explicit consent, provider cost/privacy/retention notes, and redacted evidence are supplied.
