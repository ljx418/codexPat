# V34 Development and Acceptance Plan

文档状态：active total-control plan；V34.1-V34.8 已 evidence-matched scoped passed，V34 本阶段已收口。
当前日期：2026-06-25。

## Stage Objective

V34 的阶段目标是补齐 V33 缺失的生成核心：从不同猫照片生成各自的可动画角色资产和 8 动作 frameSequence。每个子阶段必须先产出计划与验收标准，再进入代码实现；每阶段结束必须有真实 evidence、PRD/spec review、claim scan、security scan。

## Phase Table

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V34.0 document and architecture freeze | 更新 PRD、目标架构、gap、drawio、claim matrix、milestones、acceptance plan、implementation contract、phase specs。 | doc audit、drawio page count、claim scan、security scan。 | passed scoped；`docs/V34.x/evidence/v34_0-document-readiness-review-2026-06-25.md` |
| V34.1 sample set and subject detection | 按 `v34_1-subject-detection-spec.md` 建立 named sample set 与 `v34-subject-detection.ts`。 | 单猫、多猫、非猫/不可用样本都有 record 和 reasonCodes。 | passed scoped；`docs/V34.x/evidence/v34_1-subject-detection-2026-06-25.md` |
| V34.2 segmentation and safe derivative | 按 `v34_2-segmentation-mask-spec.md` 实现 `v34-segmentation-mask.ts`。 | 背景不进入动作帧；mask 质量可验收或 blocked。 | passed scoped；`docs/V34.x/evidence/v34_2-segmentation-mask-2026-06-25.md` |
| V34.3 pose and part map | 按 `v34_3-pose-part-map-spec.md` 实现 `v34-pose-part-map.ts`。 | 可见部位、缺失部位和低置信风险清楚记录。 | passed scoped；`docs/V34.x/evidence/v34_3-pose-part-map-2026-06-25.md` |
| V34.4 character asset contract | 按 `v34_4-character-asset-contract-spec.md` 实现 `v34-character-asset-contract.ts`。 | 每个通过样本有自己的角色资产合同，不复用错误身份。 | passed scoped；`docs/V34.x/evidence/v34_4-character-asset-contract-2026-06-25.md` |
| V34.5 rig/frame synthesis | 按 `v34_5-rig-frame-synthesis-spec.md` 实现 Route A2 dual action contract。 | 至少 2 个不同猫样本生成各自 8 动作 frameSequence；transform-only negative 被拒绝；Route B 记录为后续比较项。 | passed scoped via Route A2；`docs/V34.x/evidence/v34_5-rig-frame-synthesis-2026-06-25.md` |
| V34.6 generation QA and product path | 按 `v34_6-generation-product-e2e-spec.md` 实现 `v34-generation-quality-gate.ts` 并复用 V33 product flow。 | V30/V31/V32/V33/V34 gates、preview、apply、rollback 通过；failed candidates 被阻塞。 | passed scoped；`docs/V34.x/evidence/v34_6-generation-product-e2e-2026-06-25.md` |
| V34.7 real-data HTML report | 按 `v34_7-real-data-report-spec.md` 汇总样本、生成链、视觉证据、产品路径。 | 中文 HTML 报告列明 passed/blocked/failed，不做虚假验收。 | passed scoped；`docs/V34.x/evidence/v34_7-real-data-report-2026-06-25.html` |
| V34.8 final gate | 按 `v34_8-final-gate-spec.md` 汇总所有阶段。 | final report 给出 narrow claim、claim/security scan 和剩余风险。 | passed scoped；`docs/V34.x/v34-final-acceptance-report.md` |

## Required Execution Specs

- `docs/V34.x/v34-evidence-and-scan-checklist.md`
- `docs/V34.x/v34-risk-burndown-and-route-decision.md`
- `docs/V34.x/v34_1-subject-detection-spec.md`
- `docs/V34.x/v34_2-segmentation-mask-spec.md`
- `docs/V34.x/v34_3-pose-part-map-spec.md`
- `docs/V34.x/v34_4-character-asset-contract-spec.md`
- `docs/V34.x/v34_5-rig-frame-synthesis-spec.md`
- `docs/V34.x/v34_6-generation-product-e2e-spec.md`
- `docs/V34.x/v34_7-real-data-report-spec.md`
- `docs/V34.x/v34_8-final-gate-spec.md`

## Implemented Closure Slice

V34.6-V34.8 已按以下链路完成 scoped implementation 和 evidence：

```text
V34.5 passed Route A2 generated candidates
  -> V34GenerationQaResult
  -> V33 productized photo flow
  -> preview / target-only apply / rollback
  -> V34.7 HTML report with Route B comparison
  -> V34.8 final gate
```

已通过出门条件：

- 至少 2 个 V34.5 passed Route A2 candidates 可 preview；
- approved generated candidate 可 target-only apply；
- rollback 恢复上一状态；
- failed/transform-only/missing-target-action candidate 不能 preview/apply；
- V34.7 报告包含 Route A2 结果和 Route B 是否可能更好的审计判断；
- evidence 不包含 raw photo bytes、EXIF/GPS、完整路径或原始 provider payload。

## Development Rules

- 先证据计划，后代码实现；
- 先本地可审计路线，后 provider candidate；
- 生成链必须记录每个 stage 的状态，不能只给最终图片；
- 失败候选不能进入 preview/apply；
- 任何扩大 claim 的文案必须被 claim scan 拦截。
- Route A 是默认主路线；Route B 只能作为质量 fallback，并必须声明 professional assisted source boundary；
- V34.1-V34.4 不达标时不得进入 V34.5 动作生成；
- V34.5 出现 transform-only、身份复用或缺核心动作时必须打回，不得进入 V34.6；
- 若 Route A 失败但 Route B 可证明目标体验，最终只能写 scoped route evidence，不能写全自动。
- V34.5 Route A2 已 passed scoped 只允许作为 V34.6 输入，不代表最终目标体验或任意猫 ready。
- V34.7/V34.8 必须比较 Route B 是否可能带来更好的目标体验；比较不等于执行 Route B。

## Risk Burndown Gate

每个阶段开始前必须读取 `docs/V34.x/v34-risk-burndown-and-route-decision.md`：

| Gate | Required Decision |
| --- | --- |
| V34.1 entry | 样本集是否覆盖单猫、负例、低质量/遮挡风险。 |
| V34.2 entry | detection record 是否足以裁剪/分割，低置信是否 blocked。 |
| V34.3 entry | mask 是否能支持可见部件图，不可靠 mask 是否打回。 |
| V34.4 entry | identity anchors 是否能绑定同一样本，不同样本是否隔离。 |
| V34.5 entry | 是否已有独立 character contract；是否选择 Route A 或触发 Route B。 |
| V34.6 entry | 是否所有候选通过 generation QA，failed candidate 是否 blocked。 |
| V34.8 entry | 是否有真实视觉证据和 claim/security scan。 |

## Required Baseline Commands

后续代码实现阶段至少运行：

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v33_7_final_gate_smoke.mjs
```

## Stop Conditions

以下情况必须停止并重新审计：

- 需要上传真实用户照片到外部 provider；
- 禁止文档或实现试图保存 raw photo bytes、EXIF/GPS、完整路径；
- 只有单一 tabby pack 被套用于不同猫且仍试图 passed；
- 只有整图变形；
- 没有真实视觉证据；
- final gate 试图声明任意猫自动生成 ready。

## Documentation Support Decision

在新增 phase specs、evidence checklist、risk burndown plan 和 V34.6-V34.8 evidence 后，V34 文档和实现可以支撑 V34.1-V34.8 的 evidence-matched scoped closure。该结论只证明 named sample set + local Route A2 + product path；不证明任意猫自动生成、provider integration、3D、production、Windows 或 cross-platform readiness。
