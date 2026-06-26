# V36.7 Product UX Screenshot Report Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.7 生成中文 HTML 自动化验收报告，用截图或 headless visual evidence 说明用户在产品内能看到什么、能操作什么、哪些候选被阻止。报告必须避免虚假验收。

## Required Inputs

- V36.1-V36.6 evidence；
- 目标架构与当前架构摘要；
- 产品路径状态：preview、apply、rollback、blocked、failed；
- 截图或 headless visual evidence。

## Development Actions

1. 设计报告结构：目标体验、当前实现、架构差异、样本矩阵、用户路径、验收结论、剩余风险。
2. 为通过和未通过路径都保留证据。
3. 标明每张截图或视觉证据对应的 `sampleId`、动作、状态。
4. 报告中不得隐藏 blocked/failed。

## Acceptance Actions

- 检查 HTML 可读性和中文说明；
- 检查截图证据覆盖 preview/apply/rollback/blocked 或 stable blocked reason；
- 生成 evidence/report：`docs/V36.x/evidence/v36_7-product-ux-report-YYYY-MM-DD.html`。

## Pass Criteria

- 人类审查者能快速理解目标架构、当前架构、用户路径和风险；
- 每个目标体验声明都有截图或视觉证据；
- failed candidate 不展示为可用成果；
- claim/security scan 无阻断。

## Non-Pass Criteria

- 报告缺截图或视觉证据；
- 只展示成功不展示失败；
- 把工程通过写成用户体验完成；
- 包含敏感路径、secret、raw payload 或 raw photo bytes。

## Stop Conditions

- 自动化截图会抢占用户焦点且未提前告知；
- 无法获取产品路径证据；
- 报告内容与 PRD 或 evidence 冲突。

## Evidence Checklist

- PRD/spec review；
- report path；
- screenshot manifest；
- user-visible scenario summary；
- target/current architecture summary；
- claim/security scan。
