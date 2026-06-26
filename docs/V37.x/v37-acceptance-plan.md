# V37 Acceptance Plan

文档状态：active acceptance plan；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Acceptance Objective

V37 验收目标是证明 tested named photo samples 的照片到动作资产产品路径，而不是证明任意猫自动生成。

## Gate Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V37.0 | documentation readiness | `docs/V37.x/evidence/v37_0-document-readiness-review-2026-06-26.md`; V37 docs、drawio、doc audit、claim/security scan | passed scoped for documentation readiness only |
| V37.1 | product UX contract | `docs/V37.x/evidence/v37_1-product-ux-contract-2026-06-26.md`; 照片入口、生成状态、候选预览、应用、回滚、blocked path | passed scoped |
| V37.2 | named photo sample set | `docs/V37.x/evidence/v37_2-named-photo-sample-set-2026-06-26.md`; 至少 2 个 tested named samples，负例和 blocked 样本 | passed scoped |
| V37.3 | identity and character asset | `docs/V37.x/evidence/v37_3-identity-character-asset-2026-06-26.md`; sampleId、identity anchors、characterAssetId、cross-sample guard | passed scoped |
| V37.4 | action candidate generation | `docs/V37.x/evidence/v37_4-action-candidate-generation-2026-06-26.md`; 8 动作候选、非 transform-only、非占位、非内置猫复用 | passed scoped |
| V37.5 | product preview/apply/rollback | `docs/V37.x/evidence/v37_5-product-preview-apply-rollback-2026-06-26.md`; preview、target-only apply、rollback、failed blocked | passed scoped |
| V37.6 | visual review report | `docs/V37.x/evidence/v37_6-visual-review-report-2026-06-26.md`; `docs/V37.x/evidence/v37_6-visual-review-report-2026-06-26.html`; 中文 HTML、model-level visual review table、冲突表 | passed scoped; not screenshot-backed raw-photo animation acceptance |
| V37.7 | final scoped gate | `docs/V37.x/v37-final-photo-to-action-report.md`; PRD/spec review、claim scan、security scan | passed scoped for product-path contract only |

## User-Visible Acceptance

通过或 partial 通过时，审查者应能看到：

- 真实照片样本的安全摘要；
- 该照片对应的猫身份锚点；
- 该猫自己的 8 动作候选；
- 每个动作的质量状态、失败原因和人审结果；
- passed candidate 的产品内预览；
- target-only apply 和 rollback；
- failed/blocked candidate 的不可应用状态；
- final report 的窄声明。

## Engineering Acceptance Anchors

V37 后续实质开发必须按 `v37-engineering-implementation-blueprint.md` 验收：

- 代码实体：`v37-named-photo-sample-set.ts`、`v37-photo-to-action-product-path.ts`、`v37-human-visual-acceptance.ts` 和对应测试；
- UI anchor：`#v37-photo-action-entry`、`#v37-sample-status`、`#v37-action-candidate-list`、`#v37-action-preview-stage`、`[data-v37-apply-candidate]`、`#v37-rollback-candidate`、`#v37-blocked-candidate-reason`；
- 样本矩阵：至少 2 个 passing named samples、1 个 negative sample、1 个 blocked risk sample；
- 脚本：`scripts/v37_1_*` 到 `scripts/v37_7_*`；
- 出门条件：真实 visual evidence、人审表、claim scan、security scan、no built-in cat reuse、no failed candidate apply。

## Non-Pass Criteria

- 仍然只显示内置默认猫；
- 动作候选没有绑定真实 sampleId 和 characterAssetId；
- 一个样本的资产被跨样本复用为通过证据；
- 8 动作缺失、transform-only、占位图或视觉质量明显不达标；
- 人审失败候选可 apply；
- Route B 无真实资产却被写成通过；
- 报告缺截图或 visual evidence；
- 文档或报告扩大声明为任意猫、provider、production、Windows 或 cross-platform ready。

## Allowed Final Decisions

- `tested named samples photo-to-action product-path scoped pass`
- `V37 partial scoped`
- `V37 blocked scoped`
- `V37 failed`
- `Route B required before target-experience pass`

任何 final decision 都必须附带剩余风险和窄声明。

## Residual Non-Ready Items

V37.1-V37.7 evidence does not establish raw-photo pixel processing, screenshot-backed animated playback from a real photo, Route B professional-assisted asset quality, provider integration, or arbitrary-cat automatic generation. These remain explicit next-stage risks even when the product-path contract is scoped passed.
