# V18 Acceptance Plan

日期：2026-06-12  
状态：V18.0-V18.6 passed scoped。

## Acceptance Principle

V18 的核心验收不是“能导入外部动作表”，而是：

```text
真实用户输入猫图
  -> 真实生成多动作 2D 资产
  -> 应用内预览
  -> 应用到目标宠物
```

如果真实 provider image-to-image output 不存在，V18 final 必须 blocked。

## Evidence Map

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V18.0 | scope freeze | `docs/V18.x/evidence/v18_0-scope-freeze-2026-06-12.md` | passed scoped |
| V18.1 | consent/provider boundary | `docs/V18.x/evidence/v18_1-reference-photo-consent-2026-06-12.md` | passed scoped |
| V18.2 | image-to-image provider job | `docs/V18.x/evidence/v18_2-provider-capability-preflight-2026-06-12.md` | passed scoped |
| V18.3 | output normalization/package | `docs/V18.x/evidence/v18_3-multi-action-normalizer-2026-06-12.md` | passed scoped |
| V18.4 | same-cat/continuity QA | `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-2026-06-12.md` | passed scoped |
| V18.5 | preview/apply/rollback E2E | `docs/V18.x/evidence/v18_5-preview-apply-rollback-2026-06-12.md` | passed scoped |
| V18.6 | final gate | `docs/V18.x/v18_6-final-acceptance-report.md` and `docs/V18.x/evidence/v18_6-photo-to-2d-html-2026-06-12.html` | passed scoped |

## Hard Acceptance Gates

### Real Data

- Must use a real local cat photo selected by the user or from the repo test asset set.
- Must use a real provider image-to-image/reference-image generation path for the provider branch.
- Must not substitute V17 text-to-image action sheet as local-photo provider proof.
- Must not use fixture-only output for final provider claim.

### GUI Workflow

- User can select or drag/drop a cat image.
- User sees safe preview and consent state.
- User sees provider job state.
- User sees generated 8-action preview.
- User can apply to a selected target pet.
- User can rollback.

### Quality Gates

- All 8 core actions visible.
- No blank, fully transparent, or off-canvas action.
- First/final loop closure for looped actions.
- Bounded frame delta; no obvious flashing.
- Same-cat identity review passes.
- 1x and 0.75x readability passes.

### Runtime Safety

- Preview sends zero PetEvent.
- Preview does not call notify.
- Preview does not write CatStateMachine.
- Preview does not mutate live PetInstance state.
- Apply only affects selected target PetInstance.
- Failed apply preserves previous active pack.

### Security and Privacy

Evidence and logs must not include:

- token
- Authorization
- raw provider response
- raw photo bytes
- EXIF/GPS
- prompt text that includes private data
- full local path
- workspace path
- config path
- API token file contents
- shell history
- clipboard
- raw HTTP payload

## Required Regression

Minimum checks before V18.6:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v17_3_action_sheet_packaging_smoke.mjs
node scripts/v17_5_apply_rollback_smoke.mjs
```

If provider/network tests require credentials or explicit consent, evidence must record the consent boundary and redacted credential handling.
