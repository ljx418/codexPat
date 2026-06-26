# V36.6 Human Visual Review Gate Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.6 将人工视觉审查作为目标体验通过的硬门槛。自动评分可以辅助排序，但不能替代人审，也不能覆盖明显视觉失败。

## Required Inputs

- V36.1-V36.5 evidence；
- 每个候选的 visual evidence refs；
- 自动评分或工程 QA 结果；
- 人审表字段定义。

## Review Dimensions

- 猫身份可识别；
- 8 动作语义可读；
- 非线条占位；
- 非整图僵硬变形；
- 局部部件运动可信；
- 连续帧不明显破碎；
- 预览体验可接受；
- failed candidate 不可 apply。

## Development Actions

1. 建立人审表，记录 reviewer、reviewDate、sampleId、actionId、status、reasonCodes。
2. 对自动评分与人工结论冲突的样本记录冲突处理。
3. 将 target-experience 状态限定为人审通过且产品路径不阻断。

## Acceptance Actions

- 检查所有 target-experience 候选均有人审字段；
- 检查冲突样本有处理结论；
- 生成 evidence：`docs/V36.x/evidence/v36_6-human-visual-review-YYYY-MM-DD.md`。

## Pass Criteria

- 人审字段完整；
- 自动评分未替代人审；
- non-pass 样本原因清楚；
- 产品路径状态与人审状态一致。

## Non-Pass Criteria

- 没有人审仍声明目标体验；
- 人审失败候选可 apply；
- 只给总分不给失败原因；
- 冲突样本 silent pass。

## Stop Conditions

- 多数样本人工审查不达目标体验；
- 人审标准与 PRD 目标体验冲突；
- 证据缺截图或可审查视觉材料。

## Evidence Checklist

- PRD/spec review；
- human review table；
- automated score conflict table；
- target-experience decision；
- product gating notes；
- claim/security scan。
