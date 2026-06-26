# Agent Desktop Pet PRD V36 - Risk Closure and Target-Experience Hardening

文档状态：active PRD；V36.1-V36.8 executed on 2026-06-26；V36 final decision is partial scoped because Route B real professional-assisted assets remained blocked。
当前日期：2026-06-26。

## Current Truth

V35 已完成 named-sample scoped route assessment。它证明：

- V35 rubric、Route A2 uplift、Route B source boundary、same-sample comparison、product UX evidence、final route decision 已形成 evidence；
- Route A2 uplift 在两个命名样本上通过 scoped target-experience assessment；
- Route B professional assisted import 已记录边界，但没有真实专业辅助资产，因此为 `blocked_not_executed`；
- V35 不证明任意猫自动生成高质量动作资产、不证明 provider integration、不证明 production、Windows 或 cross-platform readiness。

V36 的目标是关闭这些剩余风险，而不是扩大 V35 结论。2026-06-26 的执行结果是：V36.1/V36.2/V36.5/V36.6/V36.7 有 scoped evidence，V36.3/V36.4 因没有真实 Route B 专业辅助资产而 blocked scoped，V36.8 final decision 为 `V36 partial scoped`。

## Product Goal

V36 将高质量 2D 动作资产目标拆成可证明的风险闭环：

1. 用更多真实猫样本建立视觉金标准；
2. 判断 Route A2 模板/确定性路线的质量上限；
3. 引入真实 Route B professional assisted 资产作为同样本对照；
4. 建立泛化样本矩阵，区分 clear、partial、occluded、multi-cat、complex-background；
5. 用产品 UX 截图或 headless visual evidence 展示用户能看到的路径；
6. 用 final gate 决定 Route A2 继续、Route B 转主线、V36 partial、V36 blocked 或 V36 failed。

## Target User Experience

V36 完成后，维护者和测试者应能打开中文报告并快速判断：

- 不同猫照片是否能形成同一身份的 8 动作资产；
- 哪些样本达到目标体验级，哪些只达到工程通过；
- Route A2 是否仍有投入价值，还是应转向 Route B；
- Route B 专业辅助资产是否确实比 Route A2 更接近目标体验；
- 失败候选为什么不能应用；
- 用户是否能预览、只应用到目标 pet，并回滚；
- 当前能力边界是否仍是 named/public sample scoped，而不是任意猫 ready。

## In Scope

- 8+ 类真实猫视觉金标准样本；
- Route A2 ceiling analysis 和模板感/同质化风险评估；
- Route B professional assisted real asset source boundary、许可摘要、sampleId binding、part map binding、QA 和产品路径证据；
- Route A2 / Route B 同样本视觉对照；
- 20 张左右公开/安全样本泛化矩阵；
- 人工视觉审查 gate 和自动评分冲突记录；
- 产品 UX HTML 报告、截图或 headless derivative evidence；
- V36 final risk closure gate；
- PRD/spec review、claim scan、security scan。

## Out of Scope

- 任意猫自动生成 ready；
- provider integration verified；
- Petdex parity achieved；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready；
- MCP ready、Claude Code integration verified、OS-level Codex window binding ready、all Codex workflows verified。

## Technical Boundary

V36 继承 V33/V34/V35 代码实体和证据合同，不在文档阶段修改 runtime 公共接口：

- `v33-sample-intake.ts`
- `v33-identity-contract.ts`
- `v33-productized-photo-flow.ts`
- `v34-subject-detection.ts`
- `v34-segmentation-mask.ts`
- `v34-pose-part-map.ts`
- `v34-character-asset-contract.ts`
- `v34-rig-frame-synthesis.ts`
- `v34-generation-quality-gate.ts`
- `v35-target-experience-quality.ts`
- `scripts/v35_smoke_common.mjs`

V36 已新增并执行以下实现合同：

- `V36VisualGoldenSet`
- `V36RouteA2CeilingAnalysis`
- `V36RouteBRealAssetImport`
- `V36SameSampleRouteComparison`
- `V36GeneralizationMatrix`
- `V36HumanVisualReviewGate`
- `V36ProductUxScreenshotReport`
- `V36FinalRiskClosureDecision`

V36 每个子阶段必须按对应执行规格推进：

- `docs/V36.x/v36_1-visual-goldens-spec.md`
- `docs/V36.x/v36_2-route-a2-ceiling-spec.md`
- `docs/V36.x/v36_3-route-b-real-assets-spec.md`
- `docs/V36.x/v36_4-route-comparison-spec.md`
- `docs/V36.x/v36_5-generalization-matrix-spec.md`
- `docs/V36.x/v36_6-human-visual-review-spec.md`
- `docs/V36.x/v36_7-product-ux-report-spec.md`
- `docs/V36.x/v36_8-final-risk-closure-spec.md`

V36 execution evidence:

- `docs/V36.x/evidence/v36_1-visual-goldens-2026-06-26.md`
- `docs/V36.x/evidence/v36_2-route-a2-ceiling-2026-06-26.md`
- `docs/V36.x/evidence/v36_3-route-b-real-assets-2026-06-26.md`
- `docs/V36.x/evidence/v36_4-route-comparison-2026-06-26.md`
- `docs/V36.x/evidence/v36_5-generalization-matrix-2026-06-26.md`
- `docs/V36.x/evidence/v36_6-human-visual-review-2026-06-26.md`
- `docs/V36.x/evidence/v36_7-product-ux-report-2026-06-26.html`
- `docs/V36.x/evidence/v36_8-final-risk-closure-2026-06-26.md`
- `docs/V36.x/v36-final-risk-closure-report.md`

## Acceptance Boundary

V36 只能在真实 evidence 支撑的范围内 passed scoped。2026-06-26 出门结论为 partial scoped；已满足视觉金标准、Route A2 上限评估、泛化矩阵、人审门禁、产品 UX 报告和扫描要求，但 Route B real asset 与同样本真实对照未满足。完整 passed 仍需后续补齐真实 source-bound Route B 资产。

- 至少 8 类真实猫视觉金标准样本完成审查；
- 至少 2 个同样本 Route A2 / Route B 对照有真实视觉证据，若 Route B 无资产则必须 blocked；
- 泛化矩阵记录每个样本的 passed / engineering-only / blocked / failed；
- 人工视觉审查能覆盖自动评分冲突；
- 产品 UX evidence 证明通过候选可 preview/apply/rollback，失败候选 blocked；
- final report 明确路线建议和剩余风险；
- evidence 不包含 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents。

## Claim Boundary

V36 may claim only evidence-backed risk closure status for tested named/public samples. V36 must not claim arbitrary-cat automatic generation, provider integration, Petdex parity, 3D readiness, production release readiness, Windows readiness, cross-platform readiness, MCP readiness, Claude Code integration, OS-level Codex window binding, or all Codex workflows.
