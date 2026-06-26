# V36.2 Route A2 Ceiling Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.2 用 V36.1 真实样本评估 Route A2 的工程上限：它是否只能产出局部改良的模板化动作，还是能稳定接近目标用户体验。V36.2 不允许用自动指标替代人工视觉判断。

## Route A2 Definition

Route A2 是当前项目内的可控程序化质量提升路线：基于 V34/V35 的本地样本记录、part map、frameSequence、动作质量评分、preview/apply/rollback 证据继续提升。它不依赖外部专业手绘资产，也不证明任意猫自动生成 ready。

## Required Inputs

- V36.1 `visualGoldenSample`；
- V35 final route decision；
- 现有 Route A2 candidate/quality records；
- V30/V31/V32/V33/V34/V35 基线 smoke 或 stable blocked reason。

## Development Actions

1. 为每个 V36.1 样本生成或绑定 Route A2 候选记录。
2. 记录动作维度：idle、walk、jump、sleep、stretch、sit、groom、attention。
3. 记录上限风险：整图变形、模板复制、局部运动不足、身份漂移、动作不可读、低质占位。
4. 标注每个样本是否只达到 `engineering_only`，不能把工程通过直接写成目标体验通过。

## Acceptance Actions

- 对每个样本记录 Route A2 状态和 reasonCodes；
- 对 target-experience 候选要求人工视觉字段存在；
- 生成 evidence：`docs/V36.x/evidence/v36_2-route-a2-ceiling-YYYY-MM-DD.md`。

## Pass Criteria

- Route A2 上限结论可复核；
- 每个通过样本有视觉证据和人审字段；
- 每个未通过样本有明确 reasonCodes；
- 最终建议只能是 `route_a2_continue`、`route_a2_partial`、`route_a2_ceiling_reached` 或 `blocked`。

## Non-Pass Criteria

- 只凭脚本通过声明目标体验；
- 未记录模板感和同质化风险；
- 没有人审字段却声明 target-experience；
- 把少量样本通过写成任意猫自动生成 ready。

## Stop Conditions

- 多数样本仍表现为整图变形或线条占位；
- 视觉证据缺失；
- 自动评分与人工审查冲突但未处理。

## Evidence Checklist

- PRD/spec review；
- per-sample Route A2 matrix；
- sample screenshots or visual evidence refs；
- route ceiling decision；
- claim/security scan；
- scoped decision。
