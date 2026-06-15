# V20 Acceptance Plan

文档状态：active acceptance；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Acceptance Principle

V20 cannot pass by reusing:

- V17 text-to-image action sheet evidence.
- V18 MiniMax canonical identity + local transform-derived frames.
- V19 local motion-sheet import evidence.

V20 provider path requires real provider output from the V20 generation attempt.

## Phase Gates

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V20.0 | scope freeze and provider matrix | `docs/V20.x/evidence/v20_0-scope-freeze-2026-06-14.md` | passed |
| V20.1 | consent/credential/disclosure boundary | `docs/V20.x/evidence/v20_1-provider-consent-boundary-2026-06-14.md` | passed |
| V20.2 | MiniMax reference-image motion sheet benchmark | `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-2026-06-14.md` | passed 3-sample provider output benchmark; 8x9 normalization still blocked |
| V20.3 | provider output normalization/background gate | `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-2026-06-14.md` | blocked |
| V20.4 | same-cat/amplitude/loop QA | `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-2026-06-14.md` | blocked by V20.3 |
| V20.5 | preview/apply/rollback | `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-2026-06-14.md` | blocked by V20.3/V20.4 |
| V20.6 | final evidence-matched gate | `docs/V20.x/v20_6-final-acceptance-report.md` | blocked |

## Required Runtime Checks

Minimum checks:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v19_0_scope_freeze_smoke.mjs
node scripts/v19_motion_sheet_pipeline_smoke.mjs
```

If V20 provider scripts are implemented:

```text
node scripts/v20_0_scope_freeze_smoke.mjs
node scripts/v20_1_provider_consent_boundary_smoke.mjs
node scripts/v20_2_minimax_motion_sheet_live_smoke.mjs
node scripts/v20_3_provider_output_normalization_smoke.mjs
node scripts/v20_4_motion_quality_qa_smoke.mjs
node scripts/v20_5_preview_apply_rollback_smoke.mjs
```

## Security Scan

Evidence must not contain:

- token
- Authorization
- raw provider response
- raw HTTP payload
- raw photo bytes
- EXIF/GPS
- full local path
- workspace path
- config path
- api-token.json
- prompt private text

## Hard Fail Conditions

- Provider output is not based on user/reference cat image but claim says reference-image passed.
- V20.2 evidence omits `reference_image_attached=true`, `provider_capability=reference_image_supported`, or `text_to_image_only=false` while claiming a reference-image path passed.
- Provider output contains obvious different cats across rows.
- Provider output has background and no safe background handling.
- Motion amplitude is too small but claim says high-amplitude passed.
- Preview/apply mutates default or unrelated pets.
- QA failed pack can still apply.
- Evidence leaks credential, raw payload, raw photo, full local path, or raw provider response.
- V20 claims low-retry provider reliability with fewer than 3 real photo samples.
- Retry attempts repeat the same prompt without reasonCode-driven repair.

## Supporting Specs

- `docs/V20.x/v20_x-minimax-live-smoke-request-spec.md`
- `docs/V20.x/v20_x-motion-quality-qa-thresholds.md`
- `docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md`
