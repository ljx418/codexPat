# V34.1 Subject Detection Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.1 建立真实样本集合和主体检测记录，证明项目能区分单猫、多主体、非猫或不可用照片。该阶段不生成动作资产。

## Planned Code Entities

- `apps/desktop/src/assets/v34-subject-detection.ts` 中的 `V34PhotoSampleSetRecord`
- `apps/desktop/src/assets/v34-subject-detection.ts` 中的 `V34SubjectDetectionRecord`
- `apps/desktop/src/assets/v34-subject-detection.test.ts`
- `scripts/v34_1_subject_detection_smoke.mjs`

## Inputs

- `V33SampleIntakeRecord`
- sanitized thumbnail 或安全尺寸/主体提示
- sample set 至少 5 张，其中至少 3 张单猫，至少 1 张多主体或不适合样本

## Outputs

`V34SubjectDetectionRecord` 必须包含：

- `sampleId`
- `status`：`passed`、`blocked`、`failed`
- `subjectCount`
- `catSubjectConfidence`
- `visibleRatio`
- `safeBoundingBoxBucket`
- `reasonCodes`
- `evidenceRefs`

## Acceptance

通过条件：

- 每个输入样本都有 detection record；
- 至少 3 张单猫样本进入下一阶段；
- 至少 1 张不适合样本被拒绝并有 reasonCodes；
- evidence 不包含 raw photo、EXIF/GPS、完整路径或原始文件名。

失败条件：

- 多主体或非猫样本被标为通过；
- detection record 无 sampleId；
- 使用 fixture 或人工标注但文档写成自动 CV ready。

## Evidence

生成：

`docs/V34.x/evidence/v34_1-subject-detection-YYYY-MM-DD.md`

evidence 必须引用：

- 本 spec；
- V34 PRD；
- sample set summary；
- command results；
- PRD/spec review；
- claim/security scan；
- next phase decision。
