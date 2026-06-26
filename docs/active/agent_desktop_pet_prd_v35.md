# Agent Desktop Pet PRD V35 - Target-Experience 2D Action Asset Quality Track

文档状态：baseline PRD；V35.0-V35.6 passed scoped for tested named samples only；V36 risk closure and target-experience hardening is the input baseline for V37；V37 is the current active planned documentation line。
当前日期：2026-06-25。

## Current Truth

V34 已 evidence-matched scoped passed。它证明了 named sample set 范围内的本地 Route A2 路线可以完成：

```text
single cat photo
  -> privacy-safe intake
  -> subject detection
  -> segmentation / mask
  -> pose and visible part map
  -> character asset contract
  -> Route A2 8-action frameSequence candidate
  -> QA
  -> preview / target-only apply / rollback
```

V34 的窄结论只覆盖 named samples、local Route A2 candidates 和 product path evidence。V34 不证明任意猫自动生成高质量动作资产、不证明 provider integration、不证明 3D、不证明 production release、不证明 Windows 或 cross-platform readiness。

V34 final report 同时记录：Route A2 工程链路足以 scoped pass，但视觉自然度仍受本地确定性模板上限约束；Route B professional assisted import 可能带来更好的目标体验，但尚未执行。

## Product Goal

V35 的目标不是再次证明“能跑通生成链”，而是把生成结果提升到目标用户体验可接受的 2D 动作资产质量，并用同一套真实样本和同一套验收规则比较 Route A2 质量提升路线与 Route B 专业辅助路线。

用户应能看到：

1. 同一只猫的角色身份被保持；
2. 8 个动作具有可读姿态、局部运动、表情或动作符号变化；
3. 结果不再像简单线条占位图或整图变形；
4. 每条路线的来源、质量得分、失败原因和视觉证据清楚可见；
5. 通过候选可以预览、只应用到目标 pet，并可回滚；
6. 系统明确说明当前结果是否达到目标体验级，不 silent pass。

## Target User Experience

V35 完成后，维护者和测试者应能打开一份中文验收报告，快速判断：

- 哪些样本达到了目标体验级；
- 哪些样本只达到工程链路通过但视觉质量不足；
- Route A2 质量提升是否足以继续作为主路线；
- Route B 专业辅助导入是否明显更接近目标体验；
- 失败候选为什么不能应用；
- 最终路线建议是否有真实视觉证据和产品路径证据支撑。

## In Scope

- V35 目标体验视觉质量 rubric；
- V34 named sample set 的复用和必要扩展；
- Route A2 quality uplift 的文档契约、验收标准和证据要求；
- Route B professional assisted import 的 source boundary、样本绑定、资产来源、QA 和产品路径证据要求；
- Route A2 / Route B 同样本对照验收；
- 中文 HTML 报告和截图/接触表/播放证据要求；
- final route decision gate；
- claim scan、security scan、PRD/spec review。

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

V35 默认不新增 runtime 公共合同。它继承 V33/V34 的安全样本、身份、生成候选、QA 和产品路径合同：

- `V33SampleIntakeRecord`
- `V33CharacterDesignContract`
- `V34SubjectDetectionRecord`
- `V34SegmentationMaskRecord`
- `V34PosePartMapRecord`
- `V34CharacterAssetContract`
- `V34GeneratedActionPack`
- `V34GenerationQaResult`

V35 新增的是文档级质量合同和路线决策合同：

- `V35TargetExperienceRubric`
- `V35RouteA2QualityUpliftPlan`
- `V35RouteBSourceBoundary`
- `V35RouteComparisonResult`
- `V35FinalRouteDecision`

这些合同已在 V35.1-V35.6 execution specs 中具体化，后续进入代码实现前必须按对应 spec 生成 evidence。

## Execution Specs

- `docs/V35.x/v35_1-target-experience-rubric-spec.md`
- `docs/V35.x/v35_2-route-a2-quality-uplift-spec.md`
- `docs/V35.x/v35_3-route-b-source-boundary-spec.md`
- `docs/V35.x/v35_4-same-sample-route-comparison-spec.md`
- `docs/V35.x/v35_5-product-ux-evidence-spec.md`
- `docs/V35.x/v35_6-final-route-decision-spec.md`

## Acceptance Boundary

V35 只能在真实 evidence 支撑的范围内 passed scoped。出门条件：

- 至少 2 个不同猫身份样本参加 Route A2 / Route B 或 Route B-ready 对照；
- 每个 passed 候选都有视觉证据、动作覆盖、身份一致性、QA、preview/apply/rollback evidence；
- target-experience rubric 明确说明“目标体验级 / 工程通过但质量不足 / failed / blocked”；
- final report 给出 Route A2 继续优化、Route B 转主线、或 V35 blocked 的明确建议；
- evidence 不包含 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents；
- 不得把 scoped 样本结果扩大成任意猫 ready。

## Claim Boundary

V35 may claim only evidence-backed target-experience route assessment for named samples. V35 must not claim Petdex parity achieved, automatic photo-to-animation ready for arbitrary cats, automatic photo-to-2D ready for arbitrary cats, provider integration verified, low-retry provider reliability, 3D ready, production signed release ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
