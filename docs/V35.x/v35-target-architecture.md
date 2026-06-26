# V35 Target Architecture

文档状态：active target architecture；V35.0 documentation readiness passed scoped；V35.1-V35.6 planned。
当前日期：2026-06-25。

## Architecture Goal

V35 在 V34 scoped generation core 之上增加目标体验质量层和路线比较层：

```text
V34 generated action candidate
  -> V35 target-experience rubric
  -> Route A2 quality uplift plan
  -> Route B professional assisted source boundary
  -> same-sample route comparison
  -> product UX evidence
  -> final route decision
```

目标不是改写 V34 已通过事实，而是判断现有 Route A2 是否能达到目标体验级，或者下一阶段是否应转向 Route B。

## Current-to-Target Relationship

| Current Entity | Current Role | V35 Relationship |
| --- | --- | --- |
| `v33-sample-intake.ts` | 安全样本接入和隐私边界。 | 继续作为样本事实源。 |
| `v33-identity-contract.ts` | 身份锚点和角色设计合同。 | 继续作为 same-cat identity 输入。 |
| `v33-productized-photo-flow.ts` | 预览、目标应用、回滚。 | V35 继续复用，不改产品应用合同。 |
| `v34-subject-detection.ts` | 单猫、多猫、不可用样本判断。 | 继续作为 V35 样本资格输入。 |
| `v34-segmentation-mask.ts` | foreground mask 和背景泄漏记录。 | 作为 Route A2/Route B 对照的样本前提。 |
| `v34-pose-part-map.ts` | 可见部位、低置信和姿态记录。 | Route B 必须绑定同一 part map 或说明专业辅助替代来源。 |
| `v34-character-asset-contract.ts` | 每只猫独立角色资产合同。 | V35 所有候选必须绑定该合同。 |
| `v34-rig-frame-synthesis.ts` | Route A2 本地生成 8 动作候选。 | Route A2 quality uplift 的主要对象。 |
| `v34-generation-quality-gate.ts` | V30/V31/V32/V33/V34 QA 与产品路径证据。 | V35 复用，不允许 failed candidate 进入应用。 |

## Target Layers

### 1. Target-Experience Rubric Layer

文档合同：

- `V35TargetExperienceRubric`

职责：

- 定义目标体验级 2D 动作资产的视觉标准；
- 区分目标体验级、工程通过但质量不足、blocked、failed；
- 要求动作可读、身份稳定、局部运动明显、非占位图、非整图变形；
- 明确人工审查和自动证据如何共同形成结论。

### 2. Route A2 Quality Uplift Layer

文档合同：

- `V35RouteA2QualityUpliftPlan`

职责：

- 基于 V34 Route A2 的本地确定性 frameSequence；
- 定义可改进点：部件层级、尾巴/耳朵/四肢局部运动、动作符号、表情、帧间差异；
- 定义通过阈值和打回阈值；
- 不允许把模板改进写成任意猫自动生成 ready。

### 3. Route B Professional Assisted Import Layer

文档合同：

- `V35RouteBSourceBoundary`

职责：

- 记录专业辅助资产来源、sampleId 绑定、part map 绑定、frameSequence 或部件导入方式；
- 要求 source boundary、授权/许可说明、视觉证据、QA、preview/apply/rollback；
- 明确 Route B 是 professional assisted，不是全自动，不是 provider verified。

### 4. Same-Sample Route Comparison Layer

文档合同：

- `V35RouteComparisonResult`

职责：

- 对同一批 named samples 比较 Route A2 和 Route B；
- 输出路线得分、失败原因、用户体验差异和推荐路线；
- 不允许用不同样本或不同验收标准制造虚假比较。

### 5. Product UX Evidence Layer

复用实体：

- `v33-productized-photo-flow.ts`
- `v34-generation-quality-gate.ts`

职责：

- 只允许通过 QA 的候选进入 preview/apply/rollback；
- failed 或 blocked candidate 必须显示 reasonCode；
- 产出中文 HTML 报告、contact sheet、播放证据和产品路径证据。

## Route Strategy

| Route | V35 Role | Pass Evidence | No-Go Condition |
| --- | --- | --- | --- |
| Route A2 quality uplift | 默认主线，延续 V34 本地可审计路线。 | 同一样本下视觉质量达到 rubric 阈值，且产品路径通过。 | 仍像占位图、整图变形、身份漂移或动作不可读。 |
| Route B professional assisted import | 目标体验 fallback 和对照路线。 | source boundary、sampleId binding、part map、frameSequence、QA、视觉证据、产品路径证据。 | 缺来源边界、无法绑定样本、试图写成全自动或 provider verified。 |
| Route C provider candidate import | 未来候选。 | 需要另立 PRD 和安全/授权/成本审计。 | 未经批准不得进入 V35 pass 条件。 |

## Exit Architecture

V35 scoped exit 需要证明：

- V34 scoped baseline 没有被改写；
- Route A2 与 Route B 使用同样本、同验收标准比较；
- final route decision 有视觉证据和产品路径证据；
- 所有声明都保持 named-sample scoped；
- 高质量目标未达成时必须 partial、blocked 或 failed。
