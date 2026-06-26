# V33.6 Real-data E2E Report Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

生成中文 HTML 自动化验收报告，让人类快速理解真实样本、目标架构、当前实现、用户场景路径和剩余风险。

## Inputs

- V33.1-V33.5 evidence；
- screenshots、contact sheets、GIF 或播放证据；
- command results；
- claim/security scan results。

## Development Actions

- 汇总当前架构与目标架构；
- 列出每个样本的 intake、identity、candidate、QA、preview/apply/rollback 状态；
- 嵌入截图或播放证据；
- 标出 passed、partial、blocked、failed；
- 明确不声明任意猫自动生成 ready。

## Acceptance Actions

- HTML 使用中文；
- 报告包含目标架构和当前实现；
- 报告包含用户可体验路径截图；
- 报告列出真实通过、阻塞和失败原因；
- 不做虚假验收；
- claim/security scan passed。

## Evidence

`docs/V33.x/evidence/v33_6-real-data-e2e-report-YYYY-MM-DD.html`
