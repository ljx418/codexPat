# V16 Development Plan

状态：passed scoped；V16.0-V16.6 evidence passed on 2026-06-11.  
日期：2026-06-11。

## Objective

Move from V15 import-ready photo-guided 2D assets to a real named-provider multi-frame 2D generation workflow:

```text
cat photo
  -> consent and trait approval
  -> named provider multi-action generation
  -> safe output normalization
  -> same-cat consistency review
  -> local animation pack assembly
  -> preview all actions
  -> target-only apply
```

V16 passed for the tested host ChatGPT/Codex image tool scenario. This does not
generalize to arbitrary cats or broad provider integration.

## Non-goals

- No 3D generation or 3D readiness.
- No provider integration verified broad claim.
- No arbitrary-cat automatic readiness claim until real multi-cat evidence exists.
- No marketplace, remote runtime loading, production signing, Windows, or cross-platform.
- No runtime renderer access to raw provider/photo/prompt payloads.

## Phase Plan

### V16.0 Scope Freeze

Development content:

- Freeze named-provider strategy.
- Confirm V15.9-V15.13 baseline evidence exists.
- Confirm claim matrix and drawio align with V16.
- Define provider output contract and blocked fallback rule.

Acceptance:

- `docs/V16.x/evidence/v16_0-scope-freeze-2026-06-11.md`
- drawio XML parse passes.
- forbidden claims only appear in forbidden/not-ready contexts.

### V16.1 Provider Boundary Harness

Development content:

- Provider credential loader using environment variable only.
- Explicit consent and disclosure model.
- Provider job redaction boundary.
- Safe reasonCodes:
  - `provider_credential_missing`
  - `provider_consent_required`
  - `provider_terms_required`
  - `provider_cost_ack_required`
  - `provider_retention_ack_required`
  - `provider_license_ack_required`
  - `provider_request_rejected`
  - `provider_unavailable`

Acceptance:

- no provider request before consent.
- no credential in logs/evidence.
- dry-run and blocked states use stable reasonCode.
- evidence: `docs/V16.x/evidence/v16_1-provider-boundary-2026-06-11.md`

### V16.2 Real Provider Multi-action Generation Smoke

Development content:

- Generate at least one provider-backed 8-action 2D frame set for one tested local cat-photo scenario.
- Store only app-managed local output.
- Record safe output summary, not raw provider response.

Acceptance:

- all 8 actions returned or explicit blocked result.
- frame counts meet minimums.
- output files are local app-managed assets.
- provider summary contains provider name, model, safe job id digest, action counts, file digests.
- no raw photo/prompt/provider payload/token/path leakage.
- evidence: `docs/V16.x/evidence/v16_2-provider-multi-action-generation-2026-06-11.md`

### V16.3 Same-cat Consistency Review

Development content:

- Automated trait consistency summary.
- Manual visual review rubric.
- Rejection model for identity drift.

Acceptance:

- same-cat score/report exists for all actions.
- at least one human-readable contact sheet.
- identity drift fails safely with `same_cat_consistency_failed`.
- evidence: `docs/V16.x/evidence/v16_3-same-cat-consistency-2026-06-11.md`

### V16.4 Auto Packaging

Development content:

- Normalize provider output to `pet.json + frame sequence`.
- Run V15.12 continuity assembler.
- Preserve previous active pack after any invalid output.

Acceptance:

- accepted provider output becomes local sprite pack.
- corrupt/missing/unsafe output rejected.
- previous active pack preserved.
- evidence: `docs/V16.x/evidence/v16_4-auto-packaging-continuity-2026-06-11.md`

### V16.5 Manager Job UX, Preview, Apply, Rollback

Development content:

- Desktop Manager generation job status.
- Preview all 8 core actions.
- Apply generated pack only to selected PetInstance.
- Rollback/delete generated pack safely.

Acceptance:

- preview emits zero PetEvent.
- preview does not mutate CatStateMachine.
- default/unrelated pets unchanged.
- rollback restores visible safe pack.
- evidence: `docs/V16.x/evidence/v16_5-manager-preview-apply-rollback-2026-06-11.md`

### V16.6 Final Visual/Security/Product Gate

Development content:

- End-to-end HTML report with embedded screenshots/contact sheet/runtime capture.
- Security, license, claim, regression scans.

Acceptance:

- V16.0-V16.5 evidence all passed or final status blocked.
- if real provider output missing, final is blocked or narrowed.
- no broad automatic/provider-ready claim.
- evidence: `docs/V16.x/v16_6-final-acceptance-report.md`

## Required Regression

- `pnpm --filter desktop test`
- `pnpm --filter desktop check`
- `pnpm --filter @agent-desktop-pet/petctl test`
- `node scripts/v15_8_2d_animation_continuity_smoke.mjs`
- `node scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs`
- `node scripts/v15_13_photo_2d_preview_apply_smoke.mjs` with real screenshot/capture evidence if final gate is run.

## Go / No-Go

- V16.0: passed.
- V16.1: passed.
- V16.2: passed for tested host image tool output.
- V16.3: passed.
- V16.4: passed.
- V16.5: passed.
- V16.6: passed scoped.
