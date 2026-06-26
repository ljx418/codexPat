# V37 Target Architecture

文档状态：active target architecture；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26；V36 partial scoped is the input baseline。
当前日期：2026-06-26。

## Architecture Goal

V37 把 V36 的风险闭环推进到用户可见产品路径：

```text
V36 partial scoped
  -> V37 photo selection / intake contract
  -> V37 identity and character asset contract
  -> V37 Route A2 action asset candidate
  -> V37 quality and human visual gate
  -> V37 product preview/apply/rollback gate
  -> V37 final scoped photo-to-action decision
```

目标不是继续证明内置猫动画，也不是声明任意猫 ready。目标是后续实现能让 tested named photo samples 在产品中生成并应用该猫自己的 8 动作资产。

## Current-to-Target Entity Relationship

| Entity | Current Role | V37 Relationship | Status |
| --- | --- | --- | --- |
| `v33-sample-intake.ts` | 安全样本接入、授权、隐私边界。 | V37 named photo sample set 的事实源。 | 已实现/复用 |
| `v33-identity-contract.ts` | trait summary、identity anchors、角色设计。 | V37 判断“是不是这只猫”的主合同。 | 已实现/复用 |
| `v33-productized-photo-flow.ts` | preview、target-only apply、rollback 证据模型。 | V37 产品出门门禁。 | 已实现/复用 |
| `v34-subject-detection.ts` | 单猫、多猫、低可见样本判断。 | V37 进入生成链路的第一道资格门。 | 已实现/复用 |
| `v34-segmentation-mask.ts` | foreground mask、背景泄漏、alpha 覆盖。 | V37 防止背景/遮挡样本伪通过。 | 已实现/复用 |
| `v34-pose-part-map.ts` | 可见部位、姿态、低置信部位。 | V37 绑定动作生成所需部位。 | 已实现/复用 |
| `v34-character-asset-contract.ts` | 每只猫独立 character asset contract。 | V37 必须确保每个照片样本有独立 `characterAssetId`。 | 已实现/复用 |
| `v34-rig-frame-synthesis.ts` | Route A2 本地 8 动作候选。 | V37 默认可控动作资产生成路线。 | 已实现/需产品化 |
| `v34-generation-quality-gate.ts` | V30/V31/V32/V33/V34 QA 和产品路径。 | V37 工程门禁，不能替代人审。 | 已实现/复用 |
| `v35-target-experience-quality.ts` | target-experience rubric 和 route decision。 | V37 判断目标体验是否足够。 | 已实现/复用 |
| `v36-risk-closure.ts` | visual goldens、泛化矩阵、人审和 final decision。 | V37 的风险输入和 claim 边界。 | 已实现/复用 |
| `main.ts` photo wizard / gallery / asset manager | 用户可见入口和预览/应用界面。 | V37 必须让真实照片候选出现在产品路径里。 | 已实现/需改造 |
| `v37-named-photo-sample-set.ts` | V37 safe named sample metadata、negative sample、blocked sample 的事实源。 | V37 tested named samples、negative sample、blocked sample 的事实源。 | 已实现/ scoped evidence |
| `v37-photo-to-action-product-path.ts` | V37 主编排合同，串联 sample -> character asset -> action candidate -> product path。 | V37 主编排合同，串联 sample -> character asset -> action candidate -> product path。 | 已实现/ scoped evidence |
| `v37-human-visual-acceptance.ts` | V37 model-level 人审门槛和自动评分冲突收口。 | V37 人审硬门槛和自动评分冲突收口。 | 已实现/ scoped evidence |
| `scripts/v37_1_*` 到 `scripts/v37_7_*` | 阶段 smoke、真实 evidence、final gate。 | 阶段 smoke、真实 evidence、final gate。 | 已实现/ scoped evidence |

## Target Layers

### 1. Product Photo Intake Layer

- 用户选择或导入真实猫照片；
- 只记录安全摘要、sampleId、source boundary、consent/permission；
- 不保存 raw photo bytes、EXIF/GPS、完整路径或 provider payload。

### 2. Identity And Character Asset Layer

- 生成 trait summary、identity anchors、角色资产合同；
- 每个通过样本必须有独立 `characterAssetId`；
- 不允许用内置猫、默认猫或其他样本结果替代。

### 3. Action Asset Candidate Layer

- 默认 Route A2 生成该猫的 8 动作 frameSequence candidate；
- Route B 只有真实 source-bound professional-assisted assets 才能进入；
- 所有 candidate 必须绑定 `sampleId`、`characterAssetId`、`routeId`。

### 4. Quality And Human Review Layer

- V30 semantic gate、V31 art gate、V32 measured quality、V33 identity、V34 generation、V35 target-experience、V36 human review 共同约束；
- 自动评分只能辅助，人审失败不能通过；
- transform-only、占位图、内置猫复用必须 rejected。

### 5. Product Preview Apply Rollback Layer

- passed candidate 可 preview；
- only target pet can be changed；
- rollback restores previous pack；
- failed/blocked/rejected candidate cannot apply。

### 6. Automation And Evidence Layer

- 稳定 DOM anchor 必须覆盖 photo entry、sample status、candidate list、preview stage、apply、rollback、blocked reason；
- 每个阶段必须有脚本、evidence、PRD/spec review、claim scan、security scan；
- `docs/V37.x/v37-engineering-implementation-blueprint.md` 是后续代码落点和验收锚点的主事实源。

## Exit Architecture

V37 scoped exit 需要证明：

- 至少 2 个 tested named photo samples 完成产品路径；
- 用户看到的是照片对应猫的动作资产，不是内置默认猫；
- 每个通过结果都有真实 visual evidence；
- final claim 只覆盖 tested named samples；
- Route B 无真实资产时保持 blocked 或 partial，不可写成通过。

## Development Readiness Limit

V37.1-V37.7 已生成 scoped product-path evidence，但不能保证 Route A2 一定达到真实目标用户体验。视觉质量风险只能通过下一阶段 raw-photo pixel input、截图级动画播放、人审和 Route B source-bound 对照继续关闭。如果 Route A2 结果仍僵硬、像模板或接近内置猫，后续 final gate 必须给出 `partial scoped`、`failed` 或转向 Route B 的建议。
