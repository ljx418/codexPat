# V36 Target Architecture

文档状态：active target architecture；V36.1-V36.8 executed on 2026-06-26；V36 final decision is partial scoped because Route B real professional-assisted assets remained blocked。
当前日期：2026-06-26。

## Architecture Goal

V36 在 V35 scoped route assessment 之上增加风险闭环层：

```text
V35 scoped route assessment
  -> visual golden sample layer
  -> Route A2 ceiling analysis
  -> Route B real professional-assisted import
  -> same-sample route comparison
  -> generalization sample matrix
  -> human visual review gate
  -> product UX screenshot/report evidence
  -> final risk closure decision
```

目标不是把 V35 scoped pass 扩大成任意猫 ready，而是用更强证据判断高质量 2D 动作资产目标是否可达，以及应继续 Route A2 还是转向 Route B。2026-06-26 的执行结果是 Route A2 可继续，Route B 因缺少真实 source-bound professional-assisted asset 而 blocked，V36 final decision 为 partial scoped。

## Current-to-Target Code Entity Relationship

| Entity | Current Role | V36 Relationship | Status |
| --- | --- | --- | --- |
| `v33-sample-intake.ts` | 安全样本接入、隐私边界、样本状态。 | V36 泛化矩阵和视觉金标准样本继续使用该安全样本事实源。 | 已实现/复用 |
| `v33-identity-contract.ts` | 身份锚点、角色设计、identity gate。 | V36 必须用 identity anchors 判断同一只猫是否保持。 | 已实现/复用 |
| `v33-productized-photo-flow.ts` | preview、target-only apply、rollback。 | V36 产品 UX 证据继续复用，不允许失败候选应用。 | 已实现/复用 |
| `v34-subject-detection.ts` | 单猫、多猫、低可见样本判断。 | V36 样本分层使用 clear/partial/occluded/multi-cat 资格状态。 | 已实现/复用 |
| `v34-segmentation-mask.ts` | foreground mask 和背景泄漏记录。 | V36 Route A2/Route B 对照必须说明 mask 前提或阻塞原因。 | 已实现/复用 |
| `v34-pose-part-map.ts` | 可见部位、低置信部位、姿态记录。 | Route B 资产必须绑定同一 part map 或记录专业辅助替代来源。 | 已实现/复用 |
| `v34-character-asset-contract.ts` | 每只猫独立角色资产合同。 | V36 所有路线候选必须绑定 `characterAssetId`。 | 已实现/复用 |
| `v34-rig-frame-synthesis.ts` | Route A2 本地 8 动作候选。 | V36 Route A2 ceiling 的被测对象。 | 需评估上限 |
| `v34-generation-quality-gate.ts` | V30/V31/V32/V33/V34 QA 与产品路径证据。 | V36 继续作为工程链路 gate，不能替代人工视觉审查。 | 已实现/复用 |
| `v35-target-experience-quality.ts` | V35 rubric、Route A2 uplift、Route B boundary、comparison、decision。 | V36 将其作为质量评估输入，并补充视觉金标准、人审、泛化矩阵。 | 已实现/需增强 |
| `scripts/v35_smoke_common.mjs` | 构建 V35 named-sample context 和 evidence。 | V36 脚本可复用其上下文，但必须新增真实样本和 Route B 资产证据。 | 已实现/需扩展 |
| `v36-risk-closure.ts` | V36 风险闭环实现实体。 | 提供 visual goldens、Route A2 ceiling、Route B blocked handling、same-sample comparison、generalization matrix、human review、UX report、final decision。 | 已实现/新增 |
| `scripts/v36_smoke_common.mjs` | V36 evidence 写入、claim/security scan、公共上下文。 | 各 V36 phase smoke 复用该脚本生成真实 evidence。 | 已实现/新增 |
| `docs/V36.x/v36_1-visual-goldens-spec.md` | V36.1 视觉金标准执行规格。 | 约束真实样本矩阵、来源边界和人审字段。 | passed scoped |
| `docs/V36.x/v36_2-route-a2-ceiling-spec.md` | V36.2 Route A2 上限执行规格。 | 约束模板感、整图变形、局部运动和动作可读评估。 | passed scoped |
| `docs/V36.x/v36_3-route-b-real-assets-spec.md` | V36.3 Route B 真实资产执行规格。 | 要求真实专业辅助资产、sampleId binding 和 runtime contract mapping。 | blocked scoped |
| `docs/V36.x/v36_4-route-comparison-spec.md` | V36.4 同样本比较执行规格。 | 禁止跨样本比较，Route B blocked 时不能给出胜负结论。 | blocked scoped |
| `docs/V36.x/v36_5-generalization-matrix-spec.md` | V36.5 泛化矩阵执行规格。 | 约束 20 张安全样本的状态矩阵和失败原因。 | passed scoped |
| `docs/V36.x/v36_6-human-visual-review-spec.md` | V36.6 人工视觉审查执行规格。 | 将人审设为目标体验通过的硬门槛。 | passed scoped |
| `docs/V36.x/v36_7-product-ux-report-spec.md` | V36.7 产品 UX 报告执行规格。 | 要求中文 HTML、截图证据、preview/apply/rollback/blocked 路径。 | passed scoped |
| `docs/V36.x/v36_8-final-risk-closure-spec.md` | V36.8 最终风险闭环执行规格。 | 汇总阶段证据并限制最终路线声明。 | partial scoped |

## Target Layers

### 1. Visual Golden Sample Layer

职责：

- 定义至少 8 类真实猫样本；
- 记录样本来源、许可摘要、隐私状态和难度标签；
- 输出 contact sheet、播放摘要、人工审查表。
- 当前状态：V36.1 passed scoped，记录 8 类公开/安全 metadata 样本。

### 2. Route A2 Ceiling Analysis Layer

职责：

- 对 Route A2 的模板感、动作重复度、身份同质化、局部运动上限做评估；
- 建立继续投入阈值；
- 若 Route A2 低于阈值，不能继续作为目标体验主线。
- 当前状态：V36.2 passed scoped，建议 Route A2 在窄边界下继续。

### 3. Route B Real Professional-Assisted Import Layer

职责：

- 接入真实专业辅助 8 动作资产或 rig-ready parts；
- 记录 source boundary、permission summary、sampleId binding、part map binding；
- 不允许把 Route B 写成 provider verified 或全自动。
- 当前状态：V36.3 blocked scoped，没有真实 Route B 专业辅助资产。

### 4. Same-Sample Comparison Layer

职责：

- 对同一个 `sampleId` 比较 Route A2 和 Route B；
- 使用同一 V35/V36 rubric、同一产品路径、同一证据格式；
- 如果 Route B 没有真实资产，只能记录 blocked。
- 当前状态：V36.4 blocked scoped，未给出 Route B 胜负结论。

### 5. Generalization Matrix Layer

职责：

- 扩展到约 20 张公开/安全样本；
- 对 clear、partial、occluded、multi-cat、complex-background 分层；
- 输出 passed / engineering-only / blocked / failed 和 reasonCodes。
- 当前状态：V36.5 passed scoped，记录 20 个公开/安全 metadata 样本。

### 6. Human Visual Review Gate

职责：

- 人工视觉审查覆盖身份、动作可读、局部运动、非占位、非整图变形、整体美术质量；
- 自动评分只能作为辅助信号；
- 自动通过但人工失败必须进入 conflict table。
- 当前状态：V36.6 passed scoped，人审仍是目标体验声明的必要条件。

### 7. Product UX Evidence Layer

职责：

- 展示用户能看到的预览、应用、回滚和失败阻塞；
- 使用 HTML、截图或 headless derivative evidence；
- 标明哪些是真实 runtime 截图，哪些是 headless derivative。
- 当前状态：V36.7 passed scoped，生成中文 HTML 与 headless visual evidence。

## Exit Architecture

V36 scoped exit 需要证明：

- V35 scoped baseline 没有被改写；
- 风险闭环由真实视觉证据、人工审查和产品路径共同支撑；
- Route B 未执行时不会被写成胜出或通过；
- final decision 是 V36 partial scoped，路线建议是 Route A2 continue with Route B blocked；
- 所有结论保持 tested named/public sample scoped。
