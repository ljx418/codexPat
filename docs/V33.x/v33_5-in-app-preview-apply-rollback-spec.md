# V33.5 In-app Preview / Apply / Rollback Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

把通过 QA 的照片派生候选接入应用内预览、target-only apply 和 rollback。

## Inputs

- V33.4 evidence；
- asset manager / photo wizard / gallery product path；
- runtime preview/apply/rollback contract。

## Development Actions

- 在应用内展示候选、QA 状态和 blocked reason；
- 允许 approved candidate isolated preview；
- 只允许 approved candidate target-only apply；
- rollback 恢复之前可见 pack；
- failed/blocked candidate 不可应用。

## Acceptance Actions

- 用户路径截图或自动化截图存在；
- approved candidate preview passed；
- target-only apply passed；
- rollback passed；
- failed candidate blocked；
- diagnostics sanitized；
- evidence 通过 claim/security scan。

## Evidence

`docs/V33.x/evidence/v33_5-in-app-preview-apply-rollback-YYYY-MM-DD.md`
