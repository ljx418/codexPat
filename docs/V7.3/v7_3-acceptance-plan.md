# V7.3 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- user can generate and copy external generation instructions.
- instructions cover all core actions.
- checklist includes manifest, license, attribution, and import validation.
- instructions do not contain local path, raw photo, provider credential, token, or Authorization.
- generated instructions clearly state that local validation is required before activation.

## Required Checks

- instruction generation unit tests: passed.
- redaction tests: passed.
- local fixture workflow review: passed.
- desktop check/build: passed.

## Evidence

- `docs/V7.3/evidence/v7_3-external-generation-instruction-smoke-2026-05-31.md`
- `scripts/v7_3_external_generation_instruction_smoke.mjs`
- `apps/desktop/src/assets/external-generation-instruction-workflow.test.ts`
