# V34 Target Architecture

文档状态：active target/current architecture；V34.1-V34.8 已 evidence-matched scoped passed。
当前日期：2026-06-25。

## Architecture Goal

V34 将 V33 的“安全样本 + 既有本地 frameSequence 候选”推进为真正的生成核心：

```text
photo sample
  -> v33-sample-intake
  -> v34-subject-detection
  -> v34-segmentation-mask
  -> v34-pose-part-map
  -> v33-identity-contract
  -> v34-character-asset-contract
  -> v34-rig-frame-synthesis
  -> v34-generation-quality-gate
  -> v33-productized-photo-flow
```

目标是让每只通过样本都产生自己的角色资产和动作帧，而不是套用一个已有 tabby 动作包。

## Current-to-Target Relationship

| Current Entity | Current Role | V34 Target Relationship |
| --- | --- | --- |
| `v33-sample-intake.ts` | 安全样本记录和 privacy boundary。 | 继续作为入口；输出供 V34 subject detection 使用。 |
| `v33-identity-contract.ts` | 从安全 traits 建立身份合同。 | 继续作为 identity anchor 源；V34 补齐 part map 与角色资产合同。 |
| `v33-photo-action-pipeline.ts` | 把本地 frameSequence 候选接到 QA。 | 不再作为照片生成核心；仅作为兼容候选导入路径。 |
| `v33-action-candidate-gate.ts` | 聚合 V30/V31/V32/V33 QA。 | V34 在其前面新增 generation-chain gate，证明生成链完整。 |
| `v33-productized-photo-flow.ts` | 预览、应用、回滚。 | 继续复用，不改公共应用合同。 |
| `photo-intake-privacy-boundary.ts` | 隐私边界。 | 继续复用。 |
| `photo-suitability-traits.ts` | 基础适配性和安全 traits。 | 继续复用，但不再替代主体检测、分割和姿态估计。 |
| `semantic-animation-quality.ts` | V30 语义动作门禁。 | 继续复用。 |
| `v31-art-quality.ts` | V31 美术质量门禁。 | 继续复用。 |
| `v32-quality-rescue.ts` | V32 真实帧质量门禁。 | 继续复用。 |

## Target Layers

### 1. Intake and Sample Governance

具体实体：

- existing `apps/desktop/src/assets/v33-sample-intake.ts`
- `apps/desktop/src/assets/v34-subject-detection.ts` 中的 `V34PhotoSampleSetRecord`

职责：

- 接收 named sample set；
- 只保存 safe sample id、media type bucket、dimensions、consent、quality signals；
- 禁止保存 raw photo bytes、EXIF/GPS、完整路径、原始文件名；
- 输出 `V33SampleIntakeRecord` 和 `V34PhotoSampleSetRecord`。

### 2. Subject Detection Layer

具体实体：

- `apps/desktop/src/assets/v34-subject-detection.ts`

输入：

- `V33SampleIntakeRecord`
- sanitized image derivative 或安全尺寸/主体提示

输出：

- `V34SubjectDetectionRecord`
- 单猫置信度；
- 主体边界框；
- 可见比例；
- `not_cat`、`multi_subject`、`insufficient_body_visibility` reasonCodes。

边界：

- 第一实现可使用可审计本地启发式或人工标注 fixture；
- 不得把人工/fixture 标注写成自动 CV ready。

### 3. Segmentation and Mask Layer

具体实体：

- `apps/desktop/src/assets/v34-segmentation-mask.ts`

输入：

- `V34SubjectDetectionRecord`
- stripped thumbnail 或 approved local derivative

输出：

- `V34SegmentationMaskRecord`
- foreground crop summary；
- alpha coverage；
- background leakage score；
- transparent crop evidence ref；
- `segmentation_failed`、`low_resolution` reasonCodes。

边界：

- 背景不能进入动作帧；
- mask 质量不达标时必须 blocked/failed。

### 4. Pose and Part Map Layer

具体实体：

- `apps/desktop/src/assets/v34-pose-part-map.ts`

输入：

- segmentation result；
- safe trait summary；
- identity anchors。

输出：

- `V34PosePartMapRecord`
- visible head/body/ear/eye/tail/leg status；
- canonical pose；
- part confidence；
- `pose_estimate_failed`、`trait_confidence_low` reasonCodes。

边界：

- 看不见的部位不能被 silently invented；
- low confidence 不能 passed，只能 blocked 或 marked risk。

### 5. Character Asset Contract Layer

具体实体：

- `apps/desktop/src/assets/v34-character-asset-contract.ts`

输入：

- `V33CharacterDesignContract`
- `V34PosePartMapRecord`
- `V34SegmentationMaskRecord`

输出：

- `V34CharacterAssetContract`
- same-cat identity anchors；
- allowed stylization；
- disallowed drift；
- rig-ready part requirements；
- canonical frame seed requirements。

边界：

- 角色资产合同必须能追溯到同一个 sampleId；
- 不同猫样本不能复用同一个 characterAssetId 通过。

### 6. Rig / Frame Synthesis Layer

具体实体：

- `apps/desktop/src/assets/v34-rig-frame-synthesis.ts`

输入：

- `V34CharacterAssetContract`
- action template library；
- rig-ready parts 或 frame seed。

输出：

- `V34RigFrameSeed`
- `V34GeneratedActionPack`
- 8 action frameSequence；
- manifest；
- contact sheet；
- GIF 或播放证据；
- `weak_motion`、`whole_image_transform`、`missing_core_action` reasonCodes。

边界：

- 不允许整图变形；
- 每个动作必须有局部姿态或表情/耳朵/尾巴/四肢/符号变化；
- 每只猫必须生成自己的 frameSequence 或记录 blocked。

### 7. Quality Gate and Product Layer

计划实体：

- `apps/desktop/src/assets/v34-generation-quality-gate.ts`
- existing `apps/desktop/src/assets/v33-productized-photo-flow.ts`

复用门禁：

- V30 semantic；
- V31 art；
- V32 measured frame quality；
- V33 identity；
- V34 generation-chain completeness。

输出：

- `V34GenerationQaResult`
- preview/apply/rollback result；
- failed candidate blocked evidence。

## Route Strategy

V34 采用两条可并行但必须分开验收的路线：

| Route | Purpose | Pass Condition | Risk Control |
| --- | --- | --- | --- |
| Route A local deterministic generation | 使用本地启发式/模板/部件组合生成第一批可审计 frameSequence。 | 至少 2 个不同猫样本生成各自 8 动作并通过 gates。 | 默认主路线；若 V34.5 只能生成整图变形或身份复用，则 failed，不进产品路径。 |
| Route B professional assisted import | 使用人工/专业工具导出的部件或帧序列作为 approved candidate。 | 必须带 sampleId、part map、source boundary、QA 和产品闭环。 | Route A 动作质量不足时的目标体验 fallback；不能声明全自动。 |
| Route D local ML segmentation/pose | 可选引入本地 CV/ML 模型辅助分割和姿态。 | 只在真实 evidence 证明本地模型输出可靠时进入通过链。 | optional accelerator；不得作为未验收依赖。 |

Provider route 保留为 future candidate import，不作为 V34 pass 前置条件。

风险燃尽、kill switch 和路线对比的事实源是：

- `docs/V34.x/v34-risk-burndown-and-route-decision.md`

## Current Implemented Scope

截至 2026-06-25，V34.1-V34.8 已形成 scoped implementation evidence：

```text
v33-sample-intake
  -> v34-subject-detection
  -> v34-segmentation-mask
  -> v34-pose-part-map
  -> v33-identity-contract
  -> v34-character-asset-contract
  -> v34-rig-frame-synthesis Route A2
  -> v34-generation-quality-gate
  -> v33-productized-photo-flow preview / apply / rollback
  -> v34 real-data HTML report
  -> v34 final gate
```

V34.6 product preview / target-only apply / rollback、V34.7 Chinese HTML report with Route B comparison 和 V34.8 final gate 已完成 scoped evidence。Route B professional assisted import 是后续质量对照和 fallback，不是 V34 已执行架构路径。

## Exit Architecture

V34 scoped achieved 需要真实 evidence 证明：

- 不是复用错误身份 pack；
- 不是整图变形；
- 每个 passed 样本有完整生成链；
- 至少 2 个不同猫样本有各自通过候选；
- preview/apply/rollback 仍复用现有安全产品合同；
- claim/security scan passed。
