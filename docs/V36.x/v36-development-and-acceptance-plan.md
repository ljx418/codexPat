# V36 Development and Acceptance Plan

文档状态：active total-control plan；V36.1-V36.8 executed on 2026-06-26；V36 final decision is partial scoped because Route B real professional-assisted assets remained blocked。
当前日期：2026-06-26。

## Stage Objective

V36 将 V35 的 scoped target-experience route assessment 推进到风险闭环阶段。它不直接声明任意猫自动生成 ready，而是用更多真实样本、Route A2 上限评估、Route B 真实资产对照、人工视觉审查和产品 UX 证据判断下一阶段路线。

## Phase Table

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V36.0 documentation readiness | 更新 PRD、target architecture、gap、drawio、risk closure、claim matrix、acceptance plan。 | doc audit、drawio page count、claim/security scan。 | `docs/V36.x/evidence/v36_0-document-readiness-review-2026-06-26.md` |
| V36.1 visual goldens | 按 `docs/V36.x/v36_1-visual-goldens-spec.md` 定义 8 类真实猫视觉金标准样本和审查表。 | 样本、来源、难度、视觉证据和人工审查字段完整。 | passed scoped；`docs/V36.x/evidence/v36_1-visual-goldens-2026-06-26.md` |
| V36.2 Route A2 ceiling | 按 `docs/V36.x/v36_2-route-a2-ceiling-spec.md` 评估 Route A2 模板感、同质化、局部运动和动作可读上限。 | 形成 continue / partial / ceiling reached / blocked 建议。 | passed scoped；`docs/V36.x/evidence/v36_2-route-a2-ceiling-2026-06-26.md` |
| V36.3 Route B real assets | 按 `docs/V36.x/v36_3-route-b-real-assets-spec.md` 接入或记录真实专业辅助资产 source boundary。 | 没有真实资产则 blocked；有资产则必须绑定 sampleId、part map、QA、产品路径。 | blocked scoped；`docs/V36.x/evidence/v36_3-route-b-real-assets-2026-06-26.md` |
| V36.4 same-sample comparison | 按 `docs/V36.x/v36_4-route-comparison-spec.md` 对同一样本比较 Route A2 和 Route B。 | 不允许跨样本或跨标准比较。 | blocked scoped；`docs/V36.x/evidence/v36_4-route-comparison-2026-06-26.md` |
| V36.5 generalization matrix | 按 `docs/V36.x/v36_5-generalization-matrix-spec.md` 扩展到 20 张公开/安全样本。 | 每个样本有状态、reasonCodes、视觉证据或 blocked reason。 | passed scoped；`docs/V36.x/evidence/v36_5-generalization-matrix-2026-06-26.md` |
| V36.6 human visual review gate | 按 `docs/V36.x/v36_6-human-visual-review-spec.md` 执行人工视觉审查和自动评分冲突处理。 | 目标体验通过必须有人审字段；冲突必须记录。 | passed scoped；`docs/V36.x/evidence/v36_6-human-visual-review-2026-06-26.md` |
| V36.7 product UX screenshot report | 按 `docs/V36.x/v36_7-product-ux-report-spec.md` 生成中文 HTML 报告和截图/headless visual evidence。 | 用户可见 preview/apply/rollback/failed blocked。 | passed scoped；`docs/V36.x/evidence/v36_7-product-ux-report-2026-06-26.html` |
| V36.8 final risk closure gate | 按 `docs/V36.x/v36_8-final-risk-closure-spec.md` 汇总 V36.1-V36.7。 | final decision、路线建议、剩余风险、claim/security scan。 | partial scoped；`docs/V36.x/v36-final-risk-closure-report.md` |

## Required Execution Specs

- `docs/V36.x/v36_1-visual-goldens-spec.md`
- `docs/V36.x/v36_2-route-a2-ceiling-spec.md`
- `docs/V36.x/v36_3-route-b-real-assets-spec.md`
- `docs/V36.x/v36_4-route-comparison-spec.md`
- `docs/V36.x/v36_5-generalization-matrix-spec.md`
- `docs/V36.x/v36_6-human-visual-review-spec.md`
- `docs/V36.x/v36_7-product-ux-report-spec.md`
- `docs/V36.x/v36_8-final-risk-closure-spec.md`

## Current Execution Decision

V36 phase execution completed with a partial scoped final decision. Route A2
still has scoped continuation value for tested named/public metadata samples.
Route B remains blocked scoped because no real source-bound
professional-assisted assets were available. The correct next development line
is Route B real-asset acquisition/integration or further Route A2 quality
hardening under the same narrow claim boundary.

## Development Rules

- 每个阶段先写阶段开发与验收计划，再执行开发；
- 每个阶段必须生成真实 evidence，不能 silent pass；
- Route B 只有 source-bound professional asset 才能进入比较；
- 工程链路通过不能替代人工视觉审查；
- failed candidate 不能 preview/apply；
- 任意猫、provider、production、Windows、cross-platform ready 声明必须被 claim scan 拦截。

## Baseline Commands For Future Implementation

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v33_7_final_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_8_final_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v35_6_final_route_decision_smoke.mjs
```

## Stop Conditions

- 文档或 evidence 把 V36 写成任意猫 ready；
- Route B 无真实资产却参与胜负比较；
- 自动评分替代人工视觉审查；
- 泛化矩阵缺失败原因；
- 产品 UX 报告缺截图或 visual evidence；
- claim/security scan failed。
