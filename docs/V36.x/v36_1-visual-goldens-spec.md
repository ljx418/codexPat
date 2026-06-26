# V36.1 Visual Goldens Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.1 建立真实猫样本视觉金标准，作为后续 Route A2 上限评估、Route B 对照、泛化矩阵和人工视觉审查的输入。V36.1 不生成动作资产，不声明任意猫自动生成 ready。

## Required Inputs

- 至少 8 类真实猫样本记录，覆盖不同体型、毛色、毛长、姿态、遮挡、背景复杂度和脸部可见性；
- 每个样本必须有 `sampleId`、来源边界、许可或安全使用说明、难度标签、预期目标体验备注；
- 每个样本必须避免记录原始本地绝对路径、EXIF/GPS、raw photo bytes、token 或 provider payload；
- 如果样本来自公开网络，必须记录网页来源或可审计引用，不把来源记录写成“已授权生产使用”。

## Development Actions

1. 建立 `visualGoldenSample` 记录结构。
2. 为每个样本记录用户可见目标体验：身份可识别、动作可读、非线条占位、非整图僵硬变形。
3. 为每个样本记录失败风险：遮挡、低清晰度、侧脸、复杂背景、长毛、黑猫低对比、幼猫比例等。
4. 建立后续阶段复用字段：`routeA2Status`、`routeBStatus`、`humanReviewStatus`、`evidenceRefs`。

## Acceptance Actions

- 验证样本数量不少于 8 类；
- 验证每个样本的来源边界、难度标签、目标体验字段完整；
- 验证没有把样本集合描述为任意猫覆盖；
- 生成 evidence：`docs/V36.x/evidence/v36_1-visual-goldens-YYYY-MM-DD.md`。

## Pass Criteria

- 样本矩阵字段完整；
- 每个样本可被 V36.2-V36.7 以 `sampleId` 复用；
- 视觉目标描述能指导人工审查；
- claim/security scan 无阻断问题。

## Non-Pass Criteria

- 少于 8 类真实样本；
- 样本没有来源边界或难度标签；
- 记录 raw photo bytes、EXIF/GPS、完整本地路径或 secret；
- 把样本集合扩写成任意猫 ready。

## Stop Conditions

- 真实样本来源不可审计；
- 安全扫描发现敏感值；
- 文档把 V36.1 写成动作资产质量通过。

## Evidence Checklist

- PRD/spec review；
- 样本矩阵摘要；
- 来源边界摘要；
- 风险标签统计；
- claim scan；
- security scan；
- scoped decision：`passed scoped`、`blocked scoped` 或 `failed`。
