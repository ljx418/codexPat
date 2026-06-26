# V36 Acceptance Plan

文档状态：active acceptance plan；V36.1-V36.8 executed on 2026-06-26；V36 final decision is partial scoped because Route B real professional-assisted assets remained blocked。
当前日期：2026-06-26。

## Acceptance Objective

V36 验收目标是关闭高质量 2D 动作资产目标的关键风险：视觉质量、Route A2 上限、Route B 可行性、泛化能力、人审可靠性、产品路径证据和声明边界。

## Gate Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V36.0 | documentation readiness | V36 docs、drawio、doc audit、claim/security scan；`docs/V36.x/evidence/v36_0-document-readiness-review-2026-06-26.md` | passed scoped for documentation readiness only |
| V36.1 | visual goldens | `docs/V36.x/evidence/v36_1-visual-goldens-2026-06-26.md`；8 类真实猫样本、来源、难度、视觉 evidence、人审字段 | passed scoped |
| V36.2 | Route A2 ceiling | `docs/V36.x/evidence/v36_2-route-a2-ceiling-2026-06-26.md`；模板感、同质化、动作可读、局部运动上限分析 | passed scoped; continue Route A2 |
| V36.3 | Route B real assets | `docs/V36.x/evidence/v36_3-route-b-real-assets-2026-06-26.md`；source boundary、permission、sampleId binding、part map binding、QA、产品路径 | blocked scoped; no real Route B asset |
| V36.4 | same-sample comparison | `docs/V36.x/evidence/v36_4-route-comparison-2026-06-26.md`；同样本 Route A2 / Route B 对照 | blocked scoped; Route B unavailable |
| V36.5 | generalization matrix | `docs/V36.x/evidence/v36_5-generalization-matrix-2026-06-26.md`；20 张样本状态矩阵和 reasonCodes | passed scoped with boundaries |
| V36.6 | human visual review | `docs/V36.x/evidence/v36_6-human-visual-review-2026-06-26.md`；人审表、自动评分冲突、非通过原因 | passed scoped |
| V36.7 | product UX report | `docs/V36.x/evidence/v36_7-product-ux-report-2026-06-26.html`；中文 HTML、截图或 headless visual evidence、preview/apply/rollback/blocked | passed scoped |
| V36.8 | final risk closure | `docs/V36.x/evidence/v36_8-final-risk-closure-2026-06-26.md`；`docs/V36.x/v36-final-risk-closure-report.md` | partial scoped |

## User-Visible Acceptance

通过或 partial 通过时，审查者应能看到：

- 不同猫身份的 8 动作视觉证据；
- 每个样本是否 target-experience、engineering-only、blocked 或 failed；
- Route A2 和 Route B 的同样本对照；
- 失败候选为什么不能应用；
- 通过候选可以预览、应用、回滚；
- 最终路线建议是否由真实证据支撑。

## Non-Pass Criteria

- 只用自动指标声明目标体验通过；
- Route B 缺真实资产或来源边界却参与通过判断；
- 不同样本之间比较 Route A2 和 Route B；
- 动作仍像线条占位、整图变形或模板复制；
- failed candidate 可应用；
- 报告缺视觉证据；
- 文档或报告扩大声明为任意猫、provider、production、Windows 或 cross-platform ready。

## Allowed Final Decisions

- `Route A2 continue with scoped evidence`
- `Route B recommended as next main route`
- `Hybrid route recommended for scoped target experience`
- `V36 partial scoped`
- `V36 blocked scoped`
- `V36 failed`

任何 final decision 都必须附带剩余风险和窄声明。

## Current Execution Assessment

V36 acceptance executed under phase gates and produced partial scoped closure.
Route A2 target-experience evidence remains scoped and can continue, but Route
B and same-sample route comparison did not pass because no real
professional-assisted Route B assets were available. The remaining failure
risk is now explicit and cannot be closed by automated scoring alone.
