# Agent Desktop Pet PRD V37 - Tested Photo-to-Action Asset Product Path

文档状态：active PRD；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26；V36 partial scoped is the input baseline。
当前日期：2026-06-26。

## Current Truth

V36 已完成风险闭环，但最终结论是 `V36 partial scoped`：

- Route A2 在 tested named/public metadata samples 上仍有继续投入价值；
- Route B real professional-assisted assets 缺失，V36.3/V36.4 为 blocked scoped；
- 当前浏览器预览仍显示内置猫，不能作为“图生动作资产”用户体验；
- 项目不能声明任意猫照片自动生成高质量动作资产 ready。

V37 的目标是把“真实照片到用户可见动作资产链路”推进到 scoped product-path evidence，而不是扩大 V36 结论。

## Product Goal

V37 目标是让后续实现能按阶段证明：

```text
真实猫照片
  -> 安全样本接入
  -> 单猫检测 / 分割 / 姿态部位图
  -> 身份锚点和角色资产合同
  -> 该猫专属 8 动作资产候选
  -> 质量、人审和声明门禁
  -> 产品内预览
  -> target-only apply
  -> rollback
```

V37 成功后，最多只能声明：tested named samples photo-to-action product-path scoped ready。
V37 不得声明 arbitrary-cat automatic generation ready。

## Target User Experience

用户或审查者应能看到：

- 选择或导入一张真实猫照片；
- 产品展示该照片对应的安全身份摘要和样本状态；
- 系统生成或导入该猫自己的 8 动作候选，而不是复用内置默认猫；
- 每个动作有可见预览、质量状态和失败原因；
- 通过候选可以只应用到目标 pet；
- 回滚能恢复前一个资产；
- 失败、blocked、人审不通过候选不能 apply；
- 报告清楚写明当前能力只覆盖 tested named samples。

## In Scope

- V37 PRD、目标架构、里程碑、验收门槛、drawio gap 图；
- V37 工程实现蓝图，明确后续代码实体、UI anchor、样本合同、脚本和出门门槛；
- tested named sample set 的照片到动作资产产品路径规格；
- Route A2 默认可控路线的产品化合同；
- Route B real professional-assisted asset 的接入前置条件和 blocked 规则；
- 角色资产、8 动作资产、预览、应用、回滚、人审和证据合同；
- claim scan、security scan、PRD/spec review 和真实 evidence 要求。

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

V37.1-V37.7 已按 scoped product-path 路线新增代码、测试、smoke 脚本和 evidence。实现优先复用这些实体：

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
- `v36-risk-closure.ts`
- `main.ts` 中的 photo wizard、asset manager、gallery、preview/apply/rollback UI 区域

V37 已新增合同：

- `V37PhotoToActionProductPath`
- `V37NamedPhotoSampleSet`
- `V37PhotoIdentityAssetContract`
- `V37ActionAssetCandidate`
- `V37ProductPreviewApplyRollbackGate`
- `V37HumanVisualAcceptanceGate`
- `V37FinalPhotoToActionDecision`

V37 代码开发以 `docs/V37.x/v37-engineering-implementation-blueprint.md` 为工程落点。本轮已新增：

- `apps/desktop/src/assets/v37-named-photo-sample-set.ts`
- `apps/desktop/src/assets/v37-photo-to-action-product-path.ts`
- `apps/desktop/src/assets/v37-human-visual-acceptance.ts`
- 对应 `.test.ts` 文件；
- `scripts/v37_1_*` 到 `scripts/v37_7_*` 的阶段 smoke 脚本；
- 产品 UI 中稳定的 V37 DOM anchor：`#v37-photo-action-entry`、`#v37-sample-status`、`#v37-action-candidate-list`、`#v37-action-preview-stage`、`[data-v37-apply-candidate]`、`#v37-rollback-candidate`、`#v37-blocked-candidate-reason`。

## Acceptance Boundary

V37 scoped product-path 出门必须满足：

- 至少 2 个 tested named samples 走通 photo -> character asset -> 8 actions -> QA -> preview/apply/rollback；
- 至少 1 个 negative sample 和 1 个 blocked risk sample 被正确拒绝或阻塞并记录 reasonCodes；
- 每个 passed sample 都有独立 `sampleId`、`characterAssetId`、identity anchors、action candidate id；
- 不能复用内置预览猫伪装成照片生成结果；
- 8 动作必须覆盖目标动作集，且不能是 transform-only 或占位图；
- failed/blocked/human-rejected candidate 不可 apply；
- evidence 必须包含用户可见截图或 HTML visual evidence；
- evidence 不包含 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents。

## Claim Boundary

V37 may claim only evidence-backed scoped product-path readiness for tested named photo samples after real evidence exists. V37 must not claim raw-photo pixel generation, arbitrary-cat automatic generation, provider integration, Petdex parity, 3D readiness, production release readiness, Windows readiness, cross-platform readiness, MCP readiness, Claude Code integration, OS-level Codex window binding, or all Codex workflows.

## V37.1-V37.7 Evidence Status

V37.1-V37.7 generated scoped evidence on 2026-06-26:

- `docs/V37.x/evidence/v37_1-product-ux-contract-2026-06-26.md`
- `docs/V37.x/evidence/v37_2-named-photo-sample-set-2026-06-26.md`
- `docs/V37.x/evidence/v37_3-identity-character-asset-2026-06-26.md`
- `docs/V37.x/evidence/v37_4-action-candidate-generation-2026-06-26.md`
- `docs/V37.x/evidence/v37_5-product-preview-apply-rollback-2026-06-26.md`
- `docs/V37.x/evidence/v37_6-visual-review-report-2026-06-26.md`
- `docs/V37.x/evidence/v37_6-visual-review-report-2026-06-26.html`
- `docs/V37.x/v37-final-photo-to-action-report.md`

The result is scoped to safe named sample metadata and deterministic Route A2 product-path evidence. It does not prove raw photo pixel processing, screenshot-backed animated playback from a real photo, Route B real professional-assisted quality, provider integration, or broad automatic generation.
