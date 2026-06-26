# V33.3 Photo Action Candidates Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

为通过身份合同的样本生成或导入 8 动作候选，并提供真实帧或播放证据。

## Inputs

- V33.2 evidence；
- V33 implementation contract；
- V30/V31/V32 gate contracts。

## Development Actions

- 对通过样本执行单照片技术路径：subject detection、segmentation/mask、pose/anatomy estimate、trait anchors、character design、rig/frame seed、action synthesis；
- 第一实现切片可以把 subject detection、segmentation/mask、pose/anatomy estimate 记录为 `reviewed` 或 `not_automated`，但必须说明依据来自 safe sample record、reviewer-approved visual hints、contact sheet、frameSequence pack 或 import contract；
- 生成或导入 `frameSequence` 或 future-approved `rigExport`；
- 覆盖 8 个核心动作；
- 写出 manifest、frame refs、source boundary 和 evidence refs；
- 生成 contact sheet、GIF 或等效播放证据；
- 拒绝静态图、整图变形和缺动作候选。

## Acceptance Actions

- 至少一个通过样本产生完整 8 动作候选，或记录稳定 blocked reason；
- evidence 必须展示技术路径每一步的 status，不能只展示最终图；
- `reviewed` 或 `not_automated` status 不得写成自动 CV、自动分割或自动姿态估计已通过；
- 每个候选都有 visual evidence；
- missing action、weak motion、whole-image transform、low art quality 必须被标记；
- evidence 通过 claim/security scan。

## Evidence

`docs/V33.x/evidence/v33_3-photo-action-candidates-YYYY-MM-DD.md`
