# V18 Detailed Development and Acceptance Plan

日期：2026-06-12  
状态：planned；用于支撑 V18.0-V18.6 phase-by-phase implementation。  
目标体验：用户直接输入猫图，生成多个 2D 动作，预览后应用到指定宠物，并可回滚。

## 0. Global Rules

V18 开发不得跳阶段。每个子阶段必须产出 `passed / blocked / failed` evidence，且下一阶段只能在前一阶段审计无新增 High 风险后进入。

所有阶段必须遵守：

- 不记录 token、Authorization、raw provider response、raw HTTP payload。
- 不记录 raw photo bytes、EXIF/GPS、full local path、workspace path、config path。
- 不把 V17 text-to-image action sheet 当作 V18 local photo provider evidence。
- 不声明 arbitrary cats automatic photo-to-2D ready。
- 不声明 provider integration verified。
- 不声明 Petdex parity、3D ready、photo-to-3D、production release、Windows、cross-platform。

## V18.0 Scope Freeze

### Development Tasks

1. Generate `docs/V18.x/evidence/v18_0-scope-freeze-YYYY-MM-DD.md`.
2. Verify PRD, target architecture, development plan, acceptance plan, claim matrix, implementation contract, provider preflight, wizard state spec, and drawio exist.
3. Confirm active docs point to V18 planned.
4. Confirm V17 is listed only as baseline.
5. Run claim scan over V18 docs.

### Acceptance

- V18 docs exist and are internally consistent.
- Drawio XML parses and is readable.
- Forbidden claims appear only in not-ready/forbidden contexts.
- V18.1 Go/No-Go decision exists.

### Block / Fail

- Missing V18 PRD or target architecture: blocked.
- Drawio unreadable or XML invalid: blocked.
- Ready claim without evidence: failed.

## V18.1 Reference Photo Consent and Provider Boundary

### Development Tasks

1. Add or validate wizard UI for local cat photo selection and drag/drop.
2. Show local preview using browser object URL or sanitized app-managed preview.
3. Show safe metadata only: media type, size bucket, dimensions, selected state.
4. Add upload/generation consent checkbox.
5. Add cost/privacy/retention/license/attribution disclosure surface.
6. Add provider credential presence check without printing credential.
7. Add stable reasonCodes:
   - `consent_required`
   - `traits_required`
   - `provider_credential_missing`
   - `provider_terms_required`
   - `provider_cost_disclosure_required`
   - `provider_privacy_disclosure_required`
   - `provider_retention_disclosure_required`
   - `provider_license_disclosure_required`

### Acceptance

Evidence: `docs/V18.x/evidence/v18_1-reference-photo-consent-YYYY-MM-DD.md`

Required proof:

- Real local cat photo selected.
- Preview visible in UI.
- Full local path hidden.
- EXIF/GPS not persisted.
- Consent unchecked blocks provider call.
- Missing credential shows stable reasonCode.
- UI screenshot or DOM capture included.
- Security scan passes.

### Block / Fail

- Provider can be called without consent: failed.
- Credential/path/raw photo appears in evidence: failed.
- No real UI evidence: blocked.

## V18.2 Image-to-image Provider Adapter and Job Lifecycle

### Development Tasks

1. Execute provider capability preflight.
2. Select named provider/model.
3. Verify provider supports reference image / image-to-image.
4. Implement adapter only after capability confirmed.
5. Implement job lifecycle:
   - `queued`
   - `uploading`
   - `generating`
   - `output_received`
   - `blocked`
   - `failed`
6. Return only sanitized job summary and safe output handle.
7. Add reasonCodes:
   - `provider_reference_not_supported`
   - `provider_upload_failed`
   - `provider_rate_limited`
   - `provider_output_missing`
   - `provider_output_rejected`
   - `generation_job_failed`
   - `provider_capability_confirmed`

### Acceptance

Evidence:

- `docs/V18.x/evidence/v18_2-provider-capability-preflight-YYYY-MM-DD.md`
- `docs/V18.x/evidence/v18_2-image-to-image-provider-job-YYYY-MM-DD.md`

Required proof:

- Provider name/model recorded.
- Capability decision recorded.
- Real reference image job attempted only after consent.
- Provider output received or phase marked blocked.
- Raw response and credential redacted.
- If provider is text-to-image only, V18.2 status is blocked.

### Block / Fail

- No reference-image support: blocked.
- Credential missing: blocked.
- Provider call logs token/Authorization/raw response: failed.
- Text-to-image output is used as V18 local-photo evidence: failed.

## V18.3 Canonical Identity Normalizer and Pack Assembly

### Development Tasks

1. Accept provider output kind:
   - `canonical_identity_image`
2. Convert the provider output into one app-managed canonical source image.
3. Record a safe canonical source hash without exposing local paths or raw provider payload.
4. Derive all 8 core actions locally from the same canonical source image:
   - `idle`
   - `thinking`
   - `running`
   - `success`
   - `warning`
   - `error`
   - `need_input`
   - `sleeping`
5. Generate app-managed frame files.
6. Generate `pet.json` with `identityLock.mode = single_canonical_source` and `actionDerivation = local_effect_frames`.
7. Run existing animation pack validator.
8. Preserve previous active pack on invalid activation.

V18.3 intentionally avoids per-action provider generation because it can cause
the generated actions to drift into different cats. Action-sheet and frame
sequence imports remain V17/V5-compatible intake patterns, but they are not the
active V18.3 provider evidence path.

### Acceptance

Evidence: `docs/V18.x/evidence/v18_3-multi-action-normalizer-YYYY-MM-DD.md`

Required proof:

- 8 actions present.
- 8 actions share the same canonical source hash.
- `identityLock.mode = single_canonical_source`.
- `identityLock.actionDerivation = local_effect_frames`.
- Safe output field list recorded.
- Missing action fails with `action_coverage_incomplete`.
- Invalid pack fails with `pack_validation_failed`.
- Previous active pack preserved.
- No raw local path in output.

### Block / Fail

- Less than 8 actions but marked passed: failed.
- Any action derived from a different source hash but marked passed: failed.
- Invalid pack replaces current pack: failed.
- Output stored outside app-managed boundary without safe handle: failed.

## V18.4 Same-cat and Continuity QA

### Development Tasks

1. Build same-cat review from approved traits and generated action preview.
2. Run nonblank checks.
3. Run off-canvas checks.
4. Run first/final loop closure checks.
5. Run adjacent-frame delta checks.
6. Run 1x and 0.75x readability checks.
7. Block apply when QA fails.

### Acceptance

Evidence: `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-YYYY-MM-DD.md`

Required proof:

- Contact sheet.
- QA table.
- Same-cat decision.
- canonical source hash gate result.
- Continuity result.
- Runtime preview capture.
- QA failed pack cannot apply.

### Block / Fail

- Transparent/blank/off-canvas action passes QA: failed.
- QA failed pack can apply: failed.
- Same-cat review missing: blocked.

## V18.5 Preview / Target Apply / Rollback E2E

### Development Tasks

1. Add or validate in-wizard 8-action preview.
2. Ensure preview renderer is isolated.
3. Add target PetInstance selector.
4. Apply generated pack to target only.
5. Confirm default and unrelated pets remain unchanged.
6. Implement rollback to previous active pack.
7. Record screenshots before/after apply and after rollback.

### Acceptance

Evidence: `docs/V18.x/evidence/v18_5-preview-apply-rollback-YYYY-MM-DD.md`

Required proof:

- Preview sends zero PetEvent.
- Preview does not write CatStateMachine.
- Apply changes only target PetInstance.
- Rollback restores previous active pack.
- Failed apply preserves previous active pack.
- Screenshots show preview/apply/rollback state.

### Block / Fail

- Preview mutates live state: failed.
- Apply affects default/unrelated pet: failed.
- Rollback missing: failed.

## V18.6 Final Acceptance Gate

### Development Tasks

1. Verify V18.1-V18.5 evidence exists and is passed/blocked/failed.
2. Generate `docs/V18.x/v18_6-final-acceptance-report.md`.
3. Generate `docs/V18.x/evidence/v18_6-photo-to-2d-html-YYYY-MM-DD.html`.
4. Run minimum regression:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v17_3_action_sheet_packaging_smoke.mjs
node scripts/v17_5_apply_rollback_smoke.mjs
```

5. Run security scan.
6. Run claim scan.
7. Run artifact/license scan.

### Acceptance

Required proof:

- Real user photo reference image path passed.
- Real provider image-to-image output passed.
- 8 generated actions previewed in app.
- Target apply and rollback passed.
- Final HTML embeds screenshots directly.
- Security scan passed.
- Claim scan passed.

### Final Decision

Allowed final claim only after all required evidence passes:

```text
V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local image-to-image provider scenario with in-app preview, target apply, and rollback.
```

If V18.2 provider capability is blocked, final status must be blocked.
