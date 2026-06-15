# V7.2 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- prompt pack covers all core actions.
- prompt pack includes import checklist.
- output contains no raw path, raw photo, EXIF/GPS, token, Authorization, or provider credential.
- empty or invalid traits return stable reason codes.

## Required Checks

- prompt generation unit tests: passed.
- redaction tests: passed.
- fixture prompt pack smoke: passed.
- desktop check/build: passed.

## Evidence

- `docs/V7.2/evidence/v7_2-trait-prompt-pack-smoke-2026-05-31.md`
- `scripts/v7_2_trait_prompt_pack_smoke.mjs`
- `apps/desktop/src/assets/local-trait-prompt-pack.test.ts`
