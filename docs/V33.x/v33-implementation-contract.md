# V33 Implementation Contract

文档状态：planned implementation contract；用于 V33.1-V33.6 实质开发前约束接口和证据形态。
当前日期：2026-06-25。

## Contract Goal

V33 实现必须把真实照片样本、身份保持、动作候选、QA、预览、应用和回滚串成可测试的结构化流程。任何实现都不得以文本说明替代动作帧、视觉证据或 runtime 验证。

工程实现落点见 `docs/V33.x/v33-engineering-implementation-blueprint.md`。本合同定义 V33 模块必须输出的数据形状；实现蓝图定义这些数据如何落到具体代码、脚本和 evidence。

## Core Records

### Sample Intake Record

每个样本必须输出安全 intake 记录：

- `sampleId`：稳定、不可反推出完整本地路径的 ID；
- `sampleClass`：`clear`、`difficult`、`blocked`、`negative`；
- `status`：`passed`、`blocked`、`failed`；
- `reasonCode`：安全枚举，失败或阻塞时必填；
- `safeTraitsAvailable`：是否可进入 trait extraction；
- `evidenceRefs`：只引用脱敏 evidence 文件或截图。

禁止保存或写入 evidence：原始照片字节、EXIF/GPS、完整本地路径、原始文件名、provider raw payload、token、Authorization、raw prompt。

### Trait Summary Record

通过 intake 的样本必须输出安全 trait summary：

- `sampleId`；
- `furColor`、`pattern`、`bodyShape`、`faceShape`、`eyeFeature`、`tailFeature`；
- `confidence`：`high`、`medium`、`low`；
- `identityRisks`：安全 reasonCode 列表；
- `source`：`local_review`、`local_model`、`manual_fixture` 或未来批准的 provider candidate。

### Character Design Contract

角色设计合同必须说明：

- `characterId`；
- `sampleId`；
- `identityAnchors`：必须保持的可见特征；
- `allowedStylization`：允许的风格化范围；
- `disallowedDrift`：不能改变的身份特征；
- `reviewStatus`：`passed`、`blocked`、`failed`；
- `evidenceRefs`。

### Technical Pipeline Record

每个通过样本必须记录单照片到动作候选的技术路径：

- `sampleId`；
- `routeId`：`local_frame_sequence`、`professional_rig_import` 或 `provider_candidate`;
- `subjectDetectionStatus`：`passed`、`reviewed`、`blocked`、`failed` 或 `not_automated`；
- `segmentationStatus`：`passed`、`reviewed`、`blocked`、`failed` 或 `not_automated`；
- `poseEstimateStatus`：`passed`、`reviewed`、`blocked`、`failed` 或 `not_automated`；
- `identityAnchorStatus`：`passed`、`reviewed`、`blocked` 或 `failed`；
- `characterDesignStatus`：`passed`、`reviewed`、`blocked` 或 `failed`；
- `rigOrFrameSeedStatus`：`passed`、`reviewed`、`blocked` 或 `failed`；
- `actionSynthesisStatus`：`passed`、`blocked` 或 `failed`；
- `blockedStage`：若未完成，记录阻塞在哪个 stage；
- `reasonCodes`；
- `evidenceRefs`。

该记录用于防止“只有最终图片、没有生成链路”的虚假验收。第一实现切片允许将 subject detection、segmentation、pose estimate 标记为 `reviewed` 或 `not_automated`，但必须说明依据来自安全样本记录、人工审核、approved visual hints 或本地资产导入合同；不得把 `reviewed` 写成自动 CV 能力。

### Action Candidate Manifest

动作候选必须包含：

- `candidateId`；
- `characterId`；
- `rendererKind`：`frameSequence` 或未来批准的 `rigExport`；
- `actions`：8 个核心动作；
- `frameCountByAction`；
- `sourceBoundary`：local project-authored、licensed import、manual fixture 或 approved candidate；
- `qaStatus`；
- `evidenceRefs`。

核心动作固定为：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`。

### QA Result

QA 结果必须包含：

- `semanticQa`：V30 gate 结果；
- `artQa`：V31 gate 结果；
- `frameQa`：V32 measured gate 结果；
- `identityQa`：V33 identity gate 结果；
- `overallStatus`：`passed`、`blocked`、`failed`；
- `reasonCodes`；
- `repairGuidance`。

### V33 Identity Gate

V33 identity gate 必须判断照片身份合同是否被动作候选保持：

- `sampleId` 和 `characterId` 必须能追溯到同一个 character design contract；
- 候选必须覆盖 identity anchors 中要求保留的毛色、花纹、体型、脸部/眼睛、尾巴或其他显著特征；
- 候选不得出现 `disallowedDrift` 中明确禁止的身份漂移；
- 候选动作之间必须保持同一角色，不得每个动作像不同猫；
- low-confidence identity anchor 不能 silent pass，必须输出 `trait_confidence_low` 或 `identity_drift` 风险；
- identity gate passed 只证明 named sample / named candidate 范围，不证明任意猫自动身份保持。

### Product Application Result

应用内闭环必须记录：

- `candidateId`；
- `targetInstanceId` 或安全等价标识；
- `previewStatus`；
- `applyStatus`；
- `rollbackStatus`；
- `previousPackRestored`；
- `failedCandidateBlocked`；
- `diagnosticsSafe`。

## ReasonCode Minimum Set

V33 实现至少支持以下安全 reasonCode：

- `low_resolution`
- `not_cat`
- `multi_subject`
- `unsafe_metadata`
- `insufficient_body_visibility`
- `subject_detection_failed`
- `segmentation_failed`
- `pose_estimate_failed`
- `trait_confidence_low`
- `identity_drift`
- `character_design_blocked`
- `rig_export_blocked`
- `missing_core_action`
- `weak_motion`
- `whole_image_transform`
- `low_art_quality`
- `frame_quality_failed`
- `preview_failed`
- `apply_blocked`
- `rollback_failed`
- `privacy_boundary_failed`

## Compatibility Requirements

- 不破坏 V30 semantic gate、V31 art gate、V32 measured gate 的既有行为；
- 不破坏 V26/V30/V32 preview、target-only apply、rollback 合同；
- 不改变 bridge route、auth、sanitized diagnostics 合同，除非未来 PRD 显式批准；
- 不把 provider candidate 设为可信结果；所有候选都必须经过本地 QA；
- 不把 named sample set 结果扩大成任意猫 ready。
