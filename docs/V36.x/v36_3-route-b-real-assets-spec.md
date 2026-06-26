# V36.3 Route B Real Assets Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.3 验证 Route B 是否能作为更高质量的备选路线进入同样本比较。Route B 只有在存在真实、来源清楚、可审计的专业辅助资产时才能参与比较；没有真实资产时必须 blocked，不能伪造或用程序化占位替代。

## Route B Definition

Route B 是 professional-assisted asset 路线：由真实专业资产、人工分层、手工修正或可审计的高质量外部资产输入提供更强动作表现，再绑定项目内 runtime contract、QA、preview/apply/rollback 路径。Route B 不是 provider integration verified，不是任意猫自动生成 ready。

## Required Inputs

- 至少两个 V36.1 `sampleId`，用于支撑 PRD 中的同样本 Route A2 / Route B 对照出门条件；如果只能获得一个真实资产，阶段最多只能 partial scoped；
- 与该 `sampleId` 绑定的真实 Route B 资产；
- 资产来源、许可边界、作者或生成流程说明；
- part map、frameSequence 或可转成项目运行时合同的结构化描述。

## Development Actions

1. 记录 Route B 资产来源边界，不记录敏感原始文件路径。
2. 将资产绑定到 `sampleId`，禁止跨样本借用胜负结论。
3. 建立 runtime contract 映射：动作名、帧序列、部件层、锚点、尺寸、透明背景、预览状态。
4. 记录无法接入时的 blocked reason 和下一步供应路径。

## Acceptance Actions

- 若没有真实 Route B 资产，生成 blocked evidence；
- 若有真实资产，验证 sampleId binding、asset QA、产品路径和安全扫描；
- 生成 evidence：`docs/V36.x/evidence/v36_3-route-b-real-assets-YYYY-MM-DD.md`。

## Pass Criteria

- Route B 资产来源边界清晰；
- 资产可映射到项目合同；
- 至少两个同样本 Route B 候选可进入 V36.4；
- 只有一个真实 Route B 候选时，必须记录为 partial scoped input，不能支撑 V36 final full pass；
- evidence 不包含 raw asset bytes、完整本地路径或 secret。

## Non-Pass Criteria

- 没有真实专业辅助资产却声明 Route B 可行；
- 使用不同猫资产冒充同样本比较；
- 资产只是一张静态图或线条占位；
- 声明 provider、production 或任意猫 ready。

## Stop Conditions

- 资产许可或来源无法说明；
- 资产质量明显不能作为目标体验对照；
- 安全扫描发现敏感信息。

## Evidence Checklist

- PRD/spec review；
- Route B asset boundary；
- sampleId binding；
- runtime contract mapping；
- blocked/pass decision；
- claim/security scan。
