# V34.3 Pose And Part Map Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.3 为通过 mask 的样本建立可动画部位图，记录可见头部、身体、耳朵、眼睛、尾巴、四肢以及缺失/低置信部位。该阶段不凭空补全不可见部位。

## Planned Code Entities

- `apps/desktop/src/assets/v34-pose-part-map.ts`
- `apps/desktop/src/assets/v34-pose-part-map.test.ts`
- `scripts/v34_3_pose_part_map_smoke.mjs`

## Inputs

- `V34SegmentationMaskRecord`
- `V33CharacterDesignContract`
- safe trait summary

## Outputs

`V34PosePartMapRecord` 必须包含：

- `sampleId`
- `status`：`passed`、`blocked`、`failed`
- `canonicalPose`
- `visibleParts`：`head`、`body`、`leftEar`、`rightEar`、`eyes`、`tail`、`frontLegs`、`backLegs`
- `partConfidence`
- `missingOrLowConfidenceParts`
- `reasonCodes`

## Acceptance

通过条件：

- 每个 mask passed sample 都有 part map；
- 可见部位和缺失部位被分开记录；
- low confidence 样本进入 risk/blocked，不得直接 passed；
- part map 能被 V34.4 角色资产合同引用。

失败条件：

- 看不见的部位被 silently invented；
- 不同样本 part map 混用；
- 只有整图 bbox，没有部位级记录。

## Evidence

生成：

`docs/V34.x/evidence/v34_3-pose-part-map-YYYY-MM-DD.md`

evidence 必须包含 part map summary、风险样本表、PRD/spec review 和 scans。
