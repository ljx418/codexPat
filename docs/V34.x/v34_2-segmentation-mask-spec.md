# V34.2 Segmentation Mask Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.2 从 V34.1 通过的单猫样本生成前景 mask 或透明安全衍生图，避免把照片背景带入动作帧。该阶段不允许把失败 mask 写成可动画资产。

## Planned Code Entities

- `apps/desktop/src/assets/v34-segmentation-mask.ts`
- `apps/desktop/src/assets/v34-segmentation-mask.test.ts`
- `scripts/v34_2_segmentation_mask_smoke.mjs`

## Inputs

- `V34SubjectDetectionRecord`
- sanitized derivative ref
- safe trait summary

## Outputs

`V34SegmentationMaskRecord` 必须包含：

- `sampleId`
- `status`：`passed`、`blocked`、`failed`
- `foregroundCoverageBucket`
- `backgroundLeakageBucket`
- `alphaCoverageBucket`
- `transparentCropEvidenceRef`
- `reasonCodes`

## Acceptance

通过条件：

- V34.1 通过的每张单猫样本都有 mask record；
- passed mask 有透明前景或等价安全衍生证据；
- 背景泄漏被量化或人工审查记录；
- 不合格 mask 进入 blocked/failed。

失败条件：

- 背景直接进入动作帧；
- mask 缺失仍进入角色资产合同；
- evidence 包含原始图像字节、EXIF/GPS 或完整路径。

## Evidence

生成：

`docs/V34.x/evidence/v34_2-segmentation-mask-YYYY-MM-DD.md`

evidence 必须包含 mask contact sheet 或 sanitized derivative ref，并记录 passed/blocked/failed 样本数。
