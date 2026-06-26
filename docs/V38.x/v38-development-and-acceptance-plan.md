# V38 Development And Acceptance Plan

Date: 2026-06-26

## Stage Plan

| Phase | Development | Acceptance | Evidence |
| --- | --- | --- | --- |
| V38.0 | Audit PRD, architecture, acceptance, claim and security docs | Required docs exist and no critical boundary mismatch | `v38_0-planning-audit-2026-06-26.md` |
| V38.1 | Download public-source originals to temporary storage and query source metadata | Three cat sources accepted, one dog rejected, one multi-cat blocked | `v38_1-public-source-intake-2026-06-26.md` |
| V38.2 | Generate sanitized 512x512 PNG derivatives | Three cat derivatives pass metadata stripping and hash evidence | `v38_2-pixel-sanitization-2026-06-26.md` |
| V38.3 | Generate eight-action frame packs, contact sheets, and GIFs | Three renderable packs cover all target actions and are not transform-only | `v38_3-renderable-action-pack-2026-06-26.md` |
| V38.4 | Run automated quality floor | Scoped quality floor passes or blocks with reason | `v38_4-quality-gate-2026-06-26.md` |
| V38.5 | Verify product UI anchors | V38 settings anchors are present and pipeline status is scoped passed | `v38_5-product-e2e-ui-contract-2026-06-26.md` |
| V38.6 | Generate Chinese HTML report and browser screenshot | Screenshot-backed report exists and is suitable for human review | `v38_6-human-visual-review-2026-06-26.md` |
| V38.7 | Final gate | Final report states narrow scoped result and remaining risks | `v38_7-final-gate-2026-06-26.md` |

## End To End Commands

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
node --import tsx scripts/v38_0_planning_audit_smoke.mjs
node --import tsx scripts/v38_1_public_source_intake_smoke.mjs
node --import tsx scripts/v38_2_pixel_sanitization_smoke.mjs
node --import tsx scripts/v38_3_renderable_action_pack_smoke.mjs
node --import tsx scripts/v38_4_quality_gate_smoke.mjs
node --import tsx scripts/v38_5_product_e2e_screenshot_smoke.mjs
node --import tsx scripts/v38_6_human_visual_review_smoke.mjs
node --import tsx scripts/v38_7_final_gate_smoke.mjs
git diff --check
```

## Audit Closure Rule

Before each phase starts, the phase script writes its own PRD/spec review and audit opinion. If the phase cannot create real evidence, it must block instead of silently passing.
