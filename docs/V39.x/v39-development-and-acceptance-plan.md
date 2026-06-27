# V39 Development And Acceptance Plan

Date: 2026-06-27

## Phase Plan

| Phase | Development Target | Acceptance Target | Evidence |
| --- | --- | --- | --- |
| V39.0 | Freeze PRD, architecture, drawio, claim/security docs | Docs agree on V39 A2++ scope and no false ready claims | `docs/V39.x/evidence/v39_0-document-readiness-YYYY-MM-DD.md` |
| V39.1 | Define target-experience visual rubric | Reject photo-card overlays, labels, weak motion, and unattractive output | `docs/V39.x/evidence/v39_1-target-experience-rubric-YYYY-MM-DD.md` |
| V39.2 | Define characterized asset contract | Passing sample has cleaned silhouette, style profile, identity traits, and no-card proof | `docs/V39.x/evidence/v39_2-characterized-asset-contract-YYYY-MM-DD.md` |
| V39.3 | Define layered part rig contract | Head/body/ears/paws/tail/eyes-expression responsibilities are explicit or blocked by visibility | `docs/V39.x/evidence/v39_3-layered-part-rig-YYYY-MM-DD.md` |
| V39.4 | Define Route A2++ action frame composer | Eight actions use local part motion and pose changes, not border/dot/text overlays | `docs/V39.x/evidence/v39_4-action-frame-composer-YYYY-MM-DD.md` |
| V39.5 | Define product preview/apply/rollback contract | User can preview a V39 candidate, apply only approved target, and rollback | `docs/V39.x/evidence/v39_5-product-preview-apply-rollback-YYYY-MM-DD.md` |
| V39.6 | Define automated visual report | Chinese HTML shows source, character, parts, actions, GIF/contact sheets, product UI, and failed cases | `docs/V39.x/evidence/v39_6-visual-report-YYYY-MM-DD.html` |
| V39.7 | Define Route B comparison record | Route B is recorded as available, blocked, or better candidate only with real same-sample assets | `docs/V39.x/evidence/v39_7-route-b-comparison-YYYY-MM-DD.md` |
| V39.8 | Define final gate | Final report states passed scoped, partial scoped, blocked, or failed with claim/security scan | `docs/V39.x/v39-final-characterized-action-report.md` |

Detailed phase entry criteria, pass/block/fail rules, and evidence shape are controlled by `docs/V39.x/v39-phase-specs.md`. Visual quality and route-risk closure are controlled by `docs/V39.x/v39-quality-rubric-and-risk-closure.md`.

## Implementation Order For Later Code

1. Add data contracts and tests for characterized asset and part rig.
2. Add Route A2++ frame composition using local part motion.
3. Add quality gates that reuse V31/V32/V34/V35 and add human preference rejection.
4. Add V39 product UI anchors in settings without changing older V37/V38 evidence.
5. Add phase smoke scripts and HTML visual report.
6. Run full regression and final claim/security scans.

The later implementation must not start V39.2 until V39.1 rejects V38-style photo-card outputs. It must not start final gate work until at least two different tested samples have passed the full route or the phase evidence explicitly records partial/blocked/failed status.

## Required Baseline Commands For Later Implementation

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
node --import tsx scripts/v39_0_document_readiness_smoke.mjs
node --import tsx scripts/v39_1_target_experience_rubric_smoke.mjs
node --import tsx scripts/v39_2_characterized_asset_contract_smoke.mjs
node --import tsx scripts/v39_3_layered_part_rig_smoke.mjs
node --import tsx scripts/v39_4_action_frame_composer_smoke.mjs
node --import tsx scripts/v39_5_product_preview_apply_rollback_smoke.mjs
node --import tsx scripts/v39_6_visual_report_smoke.mjs
node --import tsx scripts/v39_7_route_b_comparison_smoke.mjs
node --import tsx scripts/v39_8_final_gate_smoke.mjs
git diff --check
```

## Audit Closure Rule

Each phase must write its own PRD/spec review, development plan, acceptance result, claim scan, security scan, and clear decision. If evidence is still only a V38-style photo-card overlay, V39 must fail or block instead of passing.
