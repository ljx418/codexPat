# V36 Implementation Contract

文档状态：planned implementation contract；V36 documentation development stage；V36.0 documentation readiness passed scoped。
当前日期：2026-06-26。

## Reused Contracts

V36 复用以下实体，不在文档阶段修改 runtime 公共接口：

- `V33SampleIntakeRecord`
- `V33CharacterDesignContract`
- `V34SubjectDetectionRecord`
- `V34SegmentationMaskRecord`
- `V34PosePartMapRecord`
- `V34CharacterAssetContract`
- `V34GeneratedActionPack`
- `V34GenerationQaResult`
- `V35TargetExperienceRubric`
- `V35RouteCandidateAssessment`
- `V35RouteBSourceBoundary`
- `V35RouteComparisonResult`
- `V35FinalRouteDecision`

## New Planned Documentation-Level Contracts

### V36VisualGoldenSet

必须记录 `sampleId`、`sourceBoundary`、`difficultyClass`、`expectedIdentityAnchors`、`requiredVisualEvidence`、`humanReviewFields`。

### V36RouteA2CeilingAnalysis

必须记录 `candidateId`、`templateSimilarityScore`、`identityDifferentiationScore`、`localMotionCeiling`、`actionReadabilityLimit`、`recommendation`。

### V36RouteBRealAssetImport

必须记录 `sourceBoundaryId`、`sampleId`、`characterAssetId`、`assetProvenance`、`licenseOrPermissionSummary`、`partMapBinding`、`frameSequenceEvidence`、`qaEvidence`、`productPathEvidence`。

### V36GeneralizationMatrix

必须记录 `sampleId`、`difficultyClass`、`routeId`、`rubricStatus`、`humanReviewStatus`、`productPathStatus`、`reasonCodes`、`visualEvidenceRefs`。状态值只能是 `target_experience`、`engineering_only`、`blocked`、`failed`。

### V36SameSampleRouteComparison

必须记录 `sampleId`、`routeA2CandidateId`、`routeBCandidateId`、`actionIds`、`identityConsistencyResult`、`motionReadabilityResult`、`visualPolishResult`、`humanReviewStatus`、`comparisonDecision`、`partialOrBlockedReason`。

### V36HumanVisualReviewGate

必须记录 `reviewerRole`、`identityScore`、`motionReadabilityScore`、`visualPolishScore`、`nonPlaceholderResult`、`conflictWithAutomatedScore`、`finalStatus`。

### V36ProductUxScreenshotReport

必须记录 `reportPath`、`screenshotManifest`、`sampleIds`、`previewStatus`、`applyStatus`、`rollbackStatus`、`blockedCandidateStatus`、`targetArchitectureSummary`、`currentArchitectureSummary`、`claimScanStatus`、`securityScanStatus`。

### V36FinalRiskClosureDecision

必须记录 `decision`、`routeRecommendation`、`sampleCoverage`、`routeA2CeilingResult`、`routeBResult`、`generalizationResult`、`claimScanStatus`、`securityScanStatus`、`narrowFinalClaim`。

## Compatibility Requirements

- 不改变 Tauri bridge route、auth、diagnostics 合同；
- 不绕过 V30/V31/V32/V33/V34/V35 gates；
- 不允许 failed candidate 进入 product apply；
- 不保存 raw photo bytes、EXIF/GPS、完整路径或 provider raw payload；
- 不允许 Route B 被描述成全自动。
