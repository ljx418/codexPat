# V35 Implementation Contract

文档状态：planned contract；V35.0 documentation readiness passed scoped；用于代码实现前锁定接口和验收形态。
当前日期：2026-06-25。

## Reused Runtime Contracts

V35 默认复用以下 V33/V34 合同，不在文档阶段修改 runtime 公共接口：

- `V33SampleIntakeRecord`
- `V33CharacterDesignContract`
- `V34SubjectDetectionRecord`
- `V34SegmentationMaskRecord`
- `V34PosePartMapRecord`
- `V34CharacterAssetContract`
- `V34GeneratedActionPack`
- `V34GenerationQaResult`

## New Documentation-Level Contracts

### V35TargetExperienceRubric

必须记录：

- `rubricId`
- `scope`
- `identityCriteria`
- `motionReadabilityCriteria`
- `localPartMotionCriteria`
- `nonPlaceholderCriteria`
- `nonTransformOnlyCriteria`
- `statusScale`: `target_experience`、`engineering_only`、`blocked`、`failed`

### V35RouteA2QualityUpliftPlan

必须记录：

- `routeId`
- `baseCandidateIds`
- `plannedQualityImprovements`
- `targetActions`
- `visualEvidenceRequired`
- `failureThresholds`
- `claimBoundary`

### V35RouteBSourceBoundary

必须记录：

- `sourceBoundaryId`
- `sampleId`
- `characterAssetId`
- `assetProvenance`
- `assistedSteps`
- `licenseOrPermissionSummary`
- `partMapBinding`
- `frameSequenceEvidence`
- `notAutomaticStatement`

### V35RouteComparisonResult

必须记录：

- `sampleId`
- `routeA2CandidateId`
- `routeBCandidateId`
- `rubricResult`
- `productPathResult`
- `winner`
- `reasonCodes`
- `remainingRisks`

### V35FinalRouteDecision

必须记录：

- `decision`
- `evidenceRefs`
- `routeRecommendation`
- `claimScanStatus`
- `securityScanStatus`
- `narrowFinalClaim`

## Compatibility Requirements

- 不改变 Tauri bridge route、auth、diagnostics 合同；
- 不绕过 V30/V31/V32/V33/V34 gates；
- 不允许 failed candidate 进入 product apply；
- 不保存 raw photo bytes、EXIF/GPS、完整路径或 provider raw payload；
- 不允许 Route B 被描述成全自动。
