# V33 Target Architecture

文档状态：planned target architecture；对应 `docs/active/agent_desktop_pet_prd_v33.md`。
当前日期：2026-06-25。

## Architecture Summary

V33 在 V32 的本地高质量 frameSequence 质量基线上新增照片输入、身份保持、专业动画路线和应用内产品化闭环。

```text
V30 semantic gate
V31 art gate
V32 measured frame quality gate
  -> V33 photo intake and identity layer
  -> V33 character and motion production layer
  -> V33 in-app preview/apply/rollback layer
  -> V33 real-data E2E evidence layer
```

## Current Architecture Relationship

| Existing Item | Current Role | V33 Gap |
| --- | --- | --- |
| V30 semantic gate | 拒绝 transform-only 弱动作，接受语义动作候选。 | 必须继续用于照片派生候选。 |
| V31 art rubric | 定义高质量视觉体验和占位资产拒绝规则。 | 必须用于每个照片派生候选。 |
| V32 measured quality gate | 证明两个本地高质量 frameSequence packs。 | 必须扩展到照片派生输出，不只测试手工本地 pack。 |
| Photo wizard / asset manager | 已有产品入口和预览/应用边界。 | 需要接入真实样本、候选、blocked reason 和回滚证据。 |
| Tauri bridge / petctl / diagnostics | 提供 runtime 和安全诊断边界。 | 需要继续证明 target-only apply 和 sanitized diagnostics。 |

## Target Layers

### 1. Photo Intake and Privacy Layer

- 接收 named real sample set；
- 删除或不记录 EXIF/GPS、完整本地路径、原始照片字节；
- 输出 suitability status：passed、blocked、failed；
- 输出安全 reasonCode，例如 `low_resolution`、`not_cat`、`multi_subject`、`unsafe_metadata`、`insufficient_body_visibility`。

### 2. Identity and Character Design Layer

- 从通过 intake 的照片生成安全 trait summary；
- 生成同猫角色设计 contract；
- 保持毛色、花纹、体型、脸型、眼睛、尾巴等身份特征；
- 失败时给出 identity drift 或 insufficient reference 的 blocked reason。

### 3. Action Candidate Production Layer

- 为每个通过样本生成或导入 8 动作候选；
- 首选 frameSequence 或可导出 normalized frames 的 professional rig；
- 禁止把整图位移、缩放、旋转或抖动当作最终动作；
- 输出 manifest、frames、contact sheet、GIF 或等效播放证据。

## Single-photo Technical Path

V33 的单照片技术路径不是“直接把照片变形”。目标路径是先把照片转成可动画化角色资产，再由动作模板或专业 rig 生成动作帧。

```text
single photo
  -> privacy-safe intake
  -> cat subject detection / suitability
  -> segmentation or foreground mask
  -> visible anatomy and pose estimate
  -> safe trait anchors
  -> identity-preserving character design
  -> part map or canonical turnaround
  -> rig-ready parts or frameSequence seed
  -> action template application
  -> generated 8-action frames
  -> semantic / art / frame / identity QA
  -> in-app preview / apply / rollback
```

### Technical Stages

| Stage | Purpose | Output | Failure Boundary |
| --- | --- | --- | --- |
| Privacy-safe intake | 接收单照片但不把敏感信息写入 evidence。 | `SampleIntakeRecord`。 | `unsafe_metadata`、`privacy_boundary_failed`。 |
| Subject detection | 判断图中是否是单只可用猫。 | cat bounding box、visibility summary。 | `not_cat`、`multi_subject`、`insufficient_body_visibility`。 |
| Segmentation / mask | 从背景中分离猫主体，避免整图背景参与动作。 | foreground mask 或 transparent crop。 | `low_resolution`、mask quality blocked。 |
| Pose and anatomy estimate | 识别头、身体、四肢、尾巴、耳朵、眼睛等可见结构。 | visible part map、pose estimate。 | `insufficient_body_visibility`、`trait_confidence_low`。 |
| Trait anchors | 提取必须保持的身份特征。 | safe trait summary、identity anchors。 | `identity_drift` risk。 |
| Character design | 将照片身份转成适合动画的角色设计。 | character design contract、canonical style reference。 | low confidence 或 identity drift blocked。 |
| Rig / frame seed | 生成可动画的部件层或标准帧种子。 | part map、turnaround、frameSequence seed。 | rig export blocked。 |
| Action synthesis | 应用 8 动作模板，生成逐动作帧序列。 | frames、manifest、contact sheet、GIF。 | `missing_core_action`、`weak_motion`、`whole_image_transform`。 |
| QA and product path | 用 V30/V31/V32/V33 gates 决定能否预览和应用。 | QA result、preview/apply/rollback evidence。 | `low_art_quality`、`frame_quality_failed`、`apply_blocked`、`rollback_failed`。 |

### Route Strategy

V33 可以并行保留三条候选路线，但 final claim 只覆盖真实通过 evidence 的路线：

- `Route A - local frameSequence rescue route`：用本地项目可控生成器和照片 traits 生成风格化 frameSequence，优先用于不依赖 provider 的可测闭环。
- `Route B - professional rig import route`：把照片身份转成分层部件或专业工具导出的 normalized frames，优先解决动作僵硬问题。
- `Route C - provider candidate route`：只作为候选输入，必须通过本地 QA，不允许声明 provider integration verified。

任何路线都不能把单张照片直接做 translate/scale/rotate/jitter 后当成高质量动作资产。

## Implementation Mapping

V33 的首个工程切片采用本地 frameSequence route，具体落点见 `docs/V33.x/v33-engineering-implementation-blueprint.md`。

```text
apps/desktop/src/assets/v33-sample-intake.ts
  -> apps/desktop/src/assets/v33-identity-contract.ts
  -> apps/desktop/src/assets/v33-photo-action-pipeline.ts
  -> apps/desktop/src/assets/v33-action-candidate-gate.ts
  -> apps/desktop/src/assets/v33-productized-photo-flow.ts
```

复用边界：

- intake 复用 `photo-intake-privacy-boundary.ts` 和 `photo-suitability-traits.ts`；
- frameSequence assembly 复用 `photo-to-2d-continuity-assembler.ts`；
- semantic gate 复用 `semantic-animation-quality.ts`；
- art gate 复用 `v31-art-quality.ts`；
- measured frame gate 复用 `v32-quality-rescue.ts`；
- preview/apply/rollback 复用 `pack-preview-apply-rollback.ts` 和 `photo-to-2d-preview-apply-flow.ts`；
- rig route 复用 `v31-continuation.ts`、`animation-pack-adapter.ts` 和 `asset-pack-validator.ts`。

第一阶段不新增 provider runtime dependency。Provider route 只能作为未来候选导入接口，必须先通过隐私边界、本地标准化和本地 QA。

### 4. Quality Gate Layer

- V30 semantic QA：语义动作、关键姿势、帧差、loop、transform-only rejection；
- V31 art QA：非占位、体积、表情、轮廓、材质、动作可读性；
- V32 measured frame QA：帧数、重复帧、局部运动、背景、off-canvas、小尺寸可读性；
- V33 identity QA：同猫一致性、照片特征保持、候选间身份漂移。

### 5. Product Experience Layer

- 应用内展示候选、QA 状态和 blocked reason；
- 通过候选可 isolated preview；
- 只有 approved candidate 可以 target-only apply；
- rollback 必须恢复之前的可见 pack；
- 失败候选不可应用。

### 6. Evidence and Governance Layer

- 每阶段生成真实 evidence；
- 每阶段包含 PRD/spec review、claim scan、security scan；
- final report 汇总用户可见体验状态、架构目标状态、blocked/failed reason；
- 文档不得把 planned route 写成 ready claim。

## Exit Architecture

V33 exit architecture 只有在真实 evidence 证明以下内容后才算 scoped achieved：

- named real sample set 进入安全 intake；
- 至少一个通过样本完成照片到 8 动作候选；
- 通过候选通过 V30/V31/V32/V33 gates；
- 应用内 preview/apply/rollback 通过；
- blocked/failed 样本给出安全 reasonCode；
- final evidence 不包含敏感信息且不做 forbidden claim。
