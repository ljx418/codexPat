# V7.4 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- no provider execution occurs without explicit consent.
- no credential is stored in manifest, renderer payload, evidence, or logs.
- feasibility-only acceptance is allowed when no credential is supplied.
- real provider smoke, if run, names provider and scenario and stores only redacted evidence.
- provider output still goes through V7.5 import validation.

## Required Checks

- consent boundary unit tests: passed.
- credential redaction tests: passed.
- provider-disabled feasibility smoke: passed.
- optional explicit-consent provider smoke: not run, excluded from scoped V7.4 acceptance.

## Evidence

- `docs/V7.4/evidence/v7_4-provider-consent-boundary-smoke-2026-05-31.md`
- `scripts/v7_4_provider_consent_boundary_smoke.mjs`
- `apps/desktop/src/assets/provider-consent-boundary.test.ts`
