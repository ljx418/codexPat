# V34 Implementation Contract

文档状态：planned contract；用于后续代码实现前锁定接口和验收形态。
当前日期：2026-06-25。

## Contract Goal

V34 实现必须证明照片到动作资产之间存在真实生成链。最终动作包不能只有 final frames；必须能追踪：

```text
sample -> subject -> mask -> part map -> character asset -> action synthesis -> QA -> product path
```

## Core Records

### V34PhotoSampleSetRecord

- `sampleSetId`
- `sampleIds`
- `sourceBoundary`: `local_safe_fixture`、`public_web_stripped_thumbnail`、`approved_user_sample`
- `hasClearSamples`
- `hasDifficultSamples`
- `hasNegativeSamples`
- `evidenceRefs`

### V34SubjectDetectionRecord

- `sampleId`
- `status`: `passed`、`blocked`、`failed`
- `subjectCount`
- `catSubjectConfidence`
- `visibleRatio`
- `safeBoundingBoxBucket`
- `reasonCodes`
- `evidenceRefs`

### V34SegmentationMaskRecord

- `sampleId`
- `status`
- `foregroundCoverageBucket`
- `backgroundLeakageBucket`
- `alphaCoverageBucket`
- `transparentCropEvidenceRef`
- `reasonCodes`

### V34PosePartMapRecord

- `sampleId`
- `status`
- `visibleParts`: `head`、`body`、`leftEar`、`rightEar`、`eyes`、`tail`、`frontLegs`、`backLegs`
- `canonicalPose`
- `partConfidence`
- `missingOrLowConfidenceParts`
- `reasonCodes`

### V34CharacterAssetContract

- `characterAssetId`
- `sampleId`
- `identityAnchors`
- `requiredParts`
- `allowedStylization`
- `disallowedDrift`
- `rigReadiness`
- `frameSeedReadiness`
- `reviewStatus`
- `evidenceRefs`

### V34RigFrameSeed

- `seedId`
- `characterAssetId`
- `routeId`: `local_deterministic_generation`、`professional_assisted_import`
- `partMapRef`
- `canonicalFrames`
- `actionTemplateRefs`
- `sourceBoundary`
- `reasonCodes`

### V34GeneratedActionPack

- `candidateId`
- `characterAssetId`
- `rendererKind`: `frameSequence`
- `actions`: 8 V34 target action ids
- `frameCountByAction`
- `targetActionFrames`
- `runtimeCoreProjection`
- `localMotionEvidence`
- `identityEvidence`
- `visualEvidenceRefs`
- `manifestRef`
- `contactSheetEvidenceRef`
- `playbackEvidenceRef`
- `routeBQualityFallbackRecorded`

### V34GenerationQaResult

- `candidateId`
- `sampleId`
- `generationChainStatus`
- `semanticQa`
- `artQa`
- `frameQa`
- `identityQa`
- `overallStatus`
- `reasonCodes`
- `repairGuidance`

## Route A2 Action Contract

V34.5 采用 Route A2 dual action contract。实现和证据必须把 V34 target actions 与 runtime core projection 分开记录：

- V34 target actions：`idle`、`walk`、`jump`、`sleep`、`eat`、`play`、`alert`、`celebrate`；
- runtime core projection：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`；
- `runtimeCoreProjection.semanticEquivalenceClaimed` 必须为 `false`；
- runtime projection 只用于复用 V30/V31/V32/V33 gates，不得写成语义等价；
- `routeBQualityFallbackRecorded` 必须为 `true`，表示 Route B 在 V34.7/V34.8 中继续作为质量比较项。

## ReasonCode Additions

V34 必须至少支持：

- `subject_detection_failed`
- `segmentation_failed`
- `mask_background_leakage`
- `pose_estimate_failed`
- `part_map_incomplete`
- `character_asset_blocked`
- `frame_seed_blocked`
- `action_template_failed`
- `same_pack_reuse_identity_drift`
- `generation_chain_incomplete`
- `whole_image_transform`
- `weak_motion`
- `missing_core_action`
- `preview_failed`
- `apply_blocked`
- `rollback_failed`

## Compatibility Requirements

- 不改变现有 bridge route、HTTP method、auth 或 diagnostics 合同；
- 不破坏 V30/V31/V32/V33 gates；
- 不破坏 preview/apply/rollback 合同；
- 不把 public web samples、provider outputs 或 professional imports 直接写成 trusted accepted pack；
- 不把 named sample set 结果扩大成任意猫 ready。
