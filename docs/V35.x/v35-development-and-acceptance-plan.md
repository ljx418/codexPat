# V35 Development and Acceptance Plan

文档状态：active total-control plan；V35.0 documentation readiness passed scoped；V35.1-V35.6 planned。
当前日期：2026-06-25。

## Stage Objective

V35 将 V34 的 scoped generation core 推进到目标体验质量评估阶段。V35 不直接承诺任意猫自动生成，也不直接进入代码实现；它先冻结质量标准、路线合同、证据格式和出门条件。

## Phase Table

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V35.0 documentation and architecture freeze | 更新 PRD、target architecture、gap、drawio、claim matrix、risk plan、acceptance plan。 | doc audit、drawio page count、claim/security scan。 | passed scoped for documentation only；`docs/V35.x/evidence/v35_0-document-readiness-review-2026-06-25.md` |
| V35.1 target-experience rubric | 按 `v35_1-target-experience-rubric-spec.md` 定义视觉质量、动作可读性、身份保持、非占位图、非整图变形评分。 | rubric 能区分 target-experience、engineering-only、blocked、failed。 | planned；`docs/V35.x/evidence/v35_1-target-experience-rubric-YYYY-MM-DD.md` |
| V35.2 Route A2 quality uplift spec | 按 `v35_2-route-a2-quality-uplift-spec.md` 定义本地 Route A2 可改进点、阈值和打回条件。 | 不能把模板升级写成任意猫 ready；必须有 visual evidence 要求。 | planned；`docs/V35.x/evidence/v35_2-route-a2-quality-uplift-YYYY-MM-DD.md` |
| V35.3 Route B import spec | 按 `v35_3-route-b-source-boundary-spec.md` 定义 professional assisted source boundary、sample binding、frameSequence/part import。 | Route B 不能被写成已执行、全自动或 provider verified。 | planned；`docs/V35.x/evidence/v35_3-route-b-source-boundary-YYYY-MM-DD.md` |
| V35.4 same-sample route comparison spec | 按 `v35_4-same-sample-route-comparison-spec.md` 定义同样本、同标准、同产品路径的路线对照。 | 比较结果能驱动 Route A2 continue、Route B recommended、blocked 或 failed。 | planned；`docs/V35.x/evidence/v35_4-same-sample-route-comparison-YYYY-MM-DD.md` |
| V35.5 product UX evidence spec | 按 `v35_5-product-ux-evidence-spec.md` 定义预览、应用、回滚、失败原因、HTML 报告和截图证据。 | 用户可见目标体验和失败路径清楚。 | planned；`docs/V35.x/evidence/v35_5-product-ux-evidence-YYYY-MM-DD.md` |
| V35.6 final route decision gate | 按 `v35_6-final-route-decision-spec.md` 汇总 V35.1-V35.5 evidence。 | final report 给出窄声明、路线建议、剩余风险、claim/security scan。 | planned；`docs/V35.x/v35-final-route-decision-report.md` |

## Required Execution Specs

- `docs/V35.x/v35_1-target-experience-rubric-spec.md`
- `docs/V35.x/v35_2-route-a2-quality-uplift-spec.md`
- `docs/V35.x/v35_3-route-b-source-boundary-spec.md`
- `docs/V35.x/v35_4-same-sample-route-comparison-spec.md`
- `docs/V35.x/v35_5-product-ux-evidence-spec.md`
- `docs/V35.x/v35_6-final-route-decision-spec.md`

## Development Rules

- 先完成 V35.0 文档冻结，再进入任何代码实现；
- 任何 Route B 证据都必须说明 source boundary 和 sampleId binding；
- Route A2 与 Route B 必须使用同样本和同验收标准比较；
- 工程链路通过不能替代目标体验质量通过；
- failed candidate 不能 preview/apply；
- 任何任意猫、provider、production、Windows、cross-platform ready 声明必须被 claim scan 拦截。

## Required Baseline Commands For Future Implementation

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v33_7_final_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_8_final_gate_smoke.mjs
```

## Stop Conditions

- 文档把 Route B 写成已执行或全自动；
- 文档把 scoped result 写成任意猫 ready；
- 没有 target-experience rubric 就计划代码实现；
- 没有 source boundary 就允许 Route B 入验收；
- final gate 试图用工程通过替代视觉质量通过。

## Documentation Support Decision

V35 文档完成后，应能完整指导后续目标体验级开发和验收。如果文档仍无法清楚说明目标体验、路线边界、代码实体关系、证据要求和出门条件，则不得进入代码实现。
