# V33.4 Rig / Frame Runtime Route Spec

文档状态：planned execution spec。
当前日期：2026-06-25。

## Goal

让照片派生候选进入 runtime-compatible 资产形态，并通过 V30/V31/V32/V33 gates。

## Inputs

- V33.3 evidence；
- V33 implementation contract；
- V30 semantic gate；
- V31 art gate；
- V32 measured quality gate。

## Development Actions

- 将候选规范化为 frameSequence 或批准的 runtime payload；
- 接入 semantic、art、frame quality、identity QA；
- 保留 QA reasonCodes；
- 禁止 QA failed candidate 进入可应用状态。

## Acceptance Actions

- 通过候选的 V30/V31/V32/V33 gate 均 passed；
- blocked 候选有稳定工具或质量原因；
- failed 候选不可 apply；
- visual evidence 与 QA 结果一致；
- evidence 通过 claim/security scan。

## Evidence

`docs/V33.x/evidence/v33_4-rig-frame-runtime-route-YYYY-MM-DD.md`
