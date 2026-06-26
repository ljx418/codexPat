# V36.4 Same-Sample Route Comparison Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.4 在同一 `sampleId` 上比较 Route A2 和 Route B，判断哪条路线更可能达成目标用户体验。V36.4 不允许跨样本比较，也不允许在 Route B blocked 时给出 Route B 胜负结论。

## Required Inputs

- V36.2 Route A2 ceiling evidence；
- V36.3 Route B evidence；
- 至少两个同时具有 Route A2 和 Route B 候选的同样本记录，或稳定 blocked / partial reason。

## Development Actions

1. 为同一 `sampleId` 汇总 Route A2 与 Route B 的动作证据。
2. 对 8 个动作分别记录可读性、身份一致性、局部运动、艺术完成度和用户可接受性。
3. 记录自动评分、人审结论和冲突处理。
4. 形成路线建议：继续 A2、优先 B、混合路线、blocked 或 failed。

## Acceptance Actions

- 检查比较对象必须同 `sampleId`；
- 检查 Route B blocked 时不能给 Route B 胜出结论；
- 生成 evidence：`docs/V36.x/evidence/v36_4-route-comparison-YYYY-MM-DD.md`。

## Pass Criteria

- 至少两个同样本对照完成，或 blocked / partial reason 稳定；
- 只有一个同样本对照完成时，比较结果只能作为 partial scoped 路线信号，不能支撑 V36 final full pass；
- 胜负结论有视觉证据和人审字段；
- 未通过动作有明确原因；
- 结论没有扩大到任意猫。

## Non-Pass Criteria

- 跨样本比较；
- 缺 Route B 真实资产仍比较；
- 只比较单动作却声明整套 8 动作通过；
- 只用自动分数决策。

## Stop Conditions

- Route B 无真实资产且无法进入比较；
- Route A2 和 Route B 的 runtime contract 不可同维度比较；
- 人审发现目标体验严重偏离。

## Evidence Checklist

- PRD/spec review；
- same-sample comparison table；
- per-action result；
- route decision and rationale；
- Route B deferred note when applicable；
- claim/security scan。
