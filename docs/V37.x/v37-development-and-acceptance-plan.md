# V37 Development and Acceptance Plan

文档状态：active total-control plan；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Stage Objective

V37 将 V36 partial scoped 的剩余风险转化为可执行开发计划：让 tested named photo samples 在产品中形成该猫自己的 8 动作资产候选，并完成预览、应用、回滚和真实 evidence。

## Phase Table

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V37.0 documentation readiness | 更新 PRD、target architecture、gap、drawio、claim matrix、acceptance plan。 | doc audit、drawio page count、claim/security scan。 | `docs/V37.x/evidence/v37_0-document-readiness-review-2026-06-26.md`; passed scoped for documentation readiness only |
| V37.1 product UX contract | 定义并实现真实照片入口、生成状态、候选列表、预览、应用、回滚 UI anchor。 | 用户路径有 V37 产品入口；失败候选不可 apply。 | `docs/V37.x/evidence/v37_1-product-ux-contract-2026-06-26.md`; passed scoped |
| V37.2 named photo sample set | 定义并实现至少 2 个 tested named samples 和负例/blocked 样本。 | 样本有 safe metadata、source boundary、consent/permission、difficulty。 | `docs/V37.x/evidence/v37_2-named-photo-sample-set-2026-06-26.md`; passed scoped |
| V37.3 identity and character asset | 绑定 sampleId、trait summary、identity anchors、characterAssetId。 | 不允许复用内置猫或跨样本资产。 | `docs/V37.x/evidence/v37_3-identity-character-asset-2026-06-26.md`; passed scoped |
| V37.4 action candidate generation | 实现 Route A2 8 动作候选和 Route B blocked 输入。 | 动作覆盖、非 transform-only、非占位、非内置猫复用。 | `docs/V37.x/evidence/v37_4-action-candidate-generation-2026-06-26.md`; passed scoped |
| V37.5 product preview/apply/rollback | 实现产品路径 preview、target-only apply、rollback 和 failed blocked 模型。 | passed candidate 可应用并回滚；failed/blocked 不可应用。 | `docs/V37.x/evidence/v37_5-product-preview-apply-rollback-2026-06-26.md`; passed scoped |
| V37.6 visual review and report | 生成 HTML 报告、人审表、自动评分冲突表。 | 目标体验通过必须有人审；本轮是 model-level review，不是 raw-photo screenshot-backed animation acceptance。 | `docs/V37.x/evidence/v37_6-visual-review-report-2026-06-26.html`; passed scoped with residual visual risk |
| V37.7 final scoped gate | 汇总 V37.1-V37.6，给出 scoped / partial / blocked / failed。 | final report、claim scan、security scan、剩余风险。 | `docs/V37.x/v37-final-photo-to-action-report.md`; passed scoped for product-path contract only |

## Engineering Blueprint

后续实质开发必须遵守 `docs/V37.x/v37-engineering-implementation-blueprint.md`。该蓝图定义：

- 必须新增或修改的代码实体；
- V37 产品 UI 稳定 DOM anchor；
- named sample set、negative sample、blocked sample 的最小样本矩阵；
- Route A2 主路线和 Route B blocked/optional comparison 边界；
- V37.1-V37.7 阶段 smoke 脚本；
- 每阶段出门门槛和 No-Go 条件。

## Development Rules

- 每个阶段先产出阶段开发及验收计划，再执行开发；
- 每个阶段必须生成真实 evidence，不能 silent pass；
- 产品截图不能用内置猫冒充照片生成结果；
- Route B 没有真实资产时只能 blocked 或 partial；
- 人审失败、identity drift、transform-only、占位图、failed candidate apply 都是 No-Go；
- 任意猫、provider、production、Windows、cross-platform ready 声明必须被 claim scan 拦截。

## Baseline Commands For Future Implementation

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_8_final_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v35_6_final_route_decision_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v36_8_final_risk_closure_smoke.mjs
```

## Stop Conditions

- 文档或 evidence 把 V37 写成任意猫 ready；
- UI 仍只展示内置猫却声明 photo-to-action 通过；
- Route B 无真实资产却参与胜负比较；
- 自动评分替代人工视觉审查；
- failed/blocked/rejected candidate 可 apply；
- evidence 缺视觉截图或 HTML visual evidence；
- claim/security scan failed。

## Development Readiness Assessment

V37.1-V37.7 已按工程实现蓝图生成 scoped evidence，并通过 product-path contract gate。该结论仍不能保证 raw-photo pixel generation、截图级动画播放验收或任意猫自动生成。Route A2 的视觉质量上限和 Route B 缺失仍是下一阶段主要风险；若后续真实截图或人工视觉审查证明 Route A2 僵硬或模板化，必须转入 partial/failed 或把 Route B 作为主线候选。
