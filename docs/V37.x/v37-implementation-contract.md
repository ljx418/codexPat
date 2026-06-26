# V37 Implementation Contract

文档状态：active implementation contract；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Reused Contracts

V37 实现复用：

- V33 sample intake and identity contracts；
- V34 subject detection、segmentation、pose part map、character asset、rig/frame synthesis、generation QA；
- V35 target-experience rubric；
- V36 risk closure、human visual review、claim/security boundary；
- product preview/apply/rollback contracts。

## Implemented V37 Records

### V37PhotoToActionProductPath

必须记录 `sampleId`、`sourceBoundary`、`productEntryPoint`、`candidateListStatus`、`previewStatus`、`applyStatus`、`rollbackStatus`、`blockedCandidateStatus`。

### V37NamedPhotoSampleSet

必须记录 `sampleId`、`displayName`、`difficultyClass`、`sourceKind`、`permissionSummary`、`intakeStatus`、`reasonCodes`。

### V37PhotoIdentityAssetContract

必须记录 `sampleId`、`traitSummaryId`、`identityAnchorIds`、`characterAssetId`、`crossSampleReuseCheck`、`status`。

### V37ActionAssetCandidate

必须记录 `candidateId`、`sampleId`、`characterAssetId`、`routeId`、`actionCoverage`、`semanticStatus`、`visualStatus`、`humanReviewStatus`、`productPathStatus`。

### V37ProductPreviewApplyRollbackGate

必须记录 `previewReady`、`targetOnlyApplyPassed`、`rollbackPassed`、`failedCandidateBlocked`、`previousPackRestored`。

### V37FinalPhotoToActionDecision

必须记录 final decision、sample count、passed count、blocked count、failed count、remaining risks、narrow claim、claim scan、security scan。

## Required Implementation Files

本轮代码开发新增：

- `apps/desktop/src/assets/v37-named-photo-sample-set.ts`
- `apps/desktop/src/assets/v37-named-photo-sample-set.test.ts`
- `apps/desktop/src/assets/v37-photo-to-action-product-path.ts`
- `apps/desktop/src/assets/v37-photo-to-action-product-path.test.ts`
- `apps/desktop/src/assets/v37-human-visual-acceptance.ts`
- `apps/desktop/src/assets/v37-human-visual-acceptance.test.ts`

若实现时需要改动 `main.ts`，改动范围必须限定在 photo intake、photo 2D wizard、gallery、asset manager、preview/apply/rollback 区域，并保留现有非 V37 用户路径。

## Required UI Anchors

- `#v37-photo-action-entry`
- `#v37-sample-status`
- `#v37-action-candidate-list`
- `#v37-action-preview-stage`
- `[data-v37-apply-candidate]`
- `#v37-rollback-candidate`
- `#v37-blocked-candidate-reason`

这些 anchor 是 V37.5 和 V37.6 自动化截图及产品路径验收的合同。没有稳定 anchor 时不能声明产品路径通过。

## Invariants

- `sampleId` 不能跨样本借用通过结论；
- `characterAssetId` 必须与 sampleId 绑定；
- failed/blocked/rejected candidate 不能 apply；
- Route B 没有真实 source-bound asset 时不能参与胜负比较；
- evidence 不得记录 raw photo bytes、EXIF/GPS、完整路径、token、provider raw payload、raw prompt、raw JSONL。

## Explicit Residual Boundary

This contract is implemented for scoped product-path evidence. It does not prove raw-photo pixel generation, screenshot-backed real-photo animated playback, Route B professional-assisted output, provider integration, arbitrary-cat generation, platform readiness, or production readiness.
