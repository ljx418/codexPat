# V36.5 Generalization Matrix Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.5 用更宽的真实样本矩阵评估当前路线的泛化风险。它只证明矩阵内样本的 scoped 行为，不证明任意猫自动生成 ready。

## Required Inputs

- V36.1 视觉金标准样本；
- V36.2 Route A2 上限结论；
- V36.3/V36.4 Route B 状态；
- 约 20 张公开或安全样本记录，若无法达到数量必须给出 stable blocked reason。

## Development Actions

1. 扩展样本矩阵，保持 `sampleId` 和来源边界。
2. 对每个样本记录 pipeline status：`target_experience`、`engineering_only`、`blocked`、`failed`。
3. 对每个非 target 样本记录 reasonCodes。
4. 分析失败聚类：背景、遮挡、毛色、姿态、低分辨率、身份漂移、动作僵硬。

## Acceptance Actions

- 样本数量、状态、失败原因和证据引用完整；
- target-experience 状态必须有人审字段；
- 生成 evidence：`docs/V36.x/evidence/v36_5-generalization-matrix-YYYY-MM-DD.md`。

## Pass Criteria

- 矩阵可复核；
- 失败不是 silent pass；
- 泛化结论仅限测试矩阵；
- 决策能指导下一阶段路线选择。

## Non-Pass Criteria

- 样本不足但无 blocked reason；
- failed/blocked 缺原因；
- 目标体验通过缺视觉证据；
- 把矩阵通过写成任意猫 ready。

## Stop Conditions

- 样本来源不可审计；
- 大面积失败且无可执行缓解路径；
- claim/security scan failed。

## Evidence Checklist

- PRD/spec review；
- sample status matrix；
- reasonCode distribution；
- visual evidence refs；
- generalization decision；
- claim/security scan。
