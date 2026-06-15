# V7.1 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- user can choose a local photo or skip photo and enter traits.
- raw photo is not persisted by default.
- EXIF/GPS is not persisted.
- full local path is not displayed in logs, evidence, prompt, or diagnostics.
- cancel/delete removes session metadata.

## Required Checks

- photo intake unit tests: passed.
- privacy/redaction tests: passed.
- desktop check/test: passed.
- desktop build: passed.
- automated UI boundary coverage: local fixture metadata smoke passed.
- manual UI smoke with one local fixture photo remains recommended before V7.2 UX polish, but the V7.1 privacy boundary is accepted by automated real-data fixture evidence.

## Security Scan

Scan for raw path, EXIF/GPS, token, Authorization, raw photo bytes, and prompt leakage.

## Evidence

- `docs/V7.1/evidence/v7_1-photo-intake-privacy-smoke-2026-05-31.md`
- `scripts/v7_1_photo_intake_privacy_smoke.mjs`
- `apps/desktop/src/assets/photo-intake-privacy-boundary.test.ts`
