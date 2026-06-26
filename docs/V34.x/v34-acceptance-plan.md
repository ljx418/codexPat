# V34 Acceptance Plan

文档状态：active acceptance；V34.1-V34.8 evidence-matched scoped passed。
当前日期：2026-06-25。

## Acceptance Principle

V34 验收必须证明“生成链完整”，不是证明“已有 pack 可应用”。每个 passed candidate 必须能追踪到自己的样本、主体检测、分割、部件图、角色资产、动作合成、QA 和产品路径。

验收同时必须证明风险已经被阶段性消减或明确转成 blocked/failed。风险控制事实源是 `docs/V34.x/v34-risk-burndown-and-route-decision.md`。

## Gate Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V34.0 | 文档与架构冻结 | PRD、target architecture、drawio、doc audit、claim/security scan | passed scoped |
| V34.1 | subject detection | 单猫/多猫/负例 reasonCodes evidence | passed scoped |
| V34.2 | segmentation mask | transparent crop 或 blocked reason，背景泄漏检查 | passed scoped |
| V34.3 | pose part map | 可见部位、缺失部位、低置信风险 evidence | passed scoped |
| V34.4 | character asset contract | 每个通过样本自己的角色资产合同 | passed scoped |
| V34.5 | rig/frame synthesis | 至少 2 个不同猫样本生成各自 8 动作候选 | passed scoped via Route A2 |
| V34.6 | QA and product path | gates + preview/apply/rollback | passed scoped |
| V34.7 | real-data report | 中文 HTML、截图、contact sheet、GIF/播放证据 | passed scoped |
| V34.8 | final gate | final report、baseline commands、claim/security scan | passed scoped |

## Closure Acceptance Focus

V34.6-V34.8 已完成验收。V34.6 只使用 V34.5 passed Route A2 candidates，并已证明：

- passed candidate 可进入 preview；
- passed candidate 可 target-only apply；
- rollback 可恢复上一状态；
- failed/transform-only candidate 被 product path 阻止；
- Route B 只被记录为质量比较和 fallback，不被写成已执行。

V34.7 已用中文 HTML 报告展示 Route A2 的真实视觉证据、产品路径自动化证据、失败样本和 Route B 是否可能改善目标体验。V34.8 已在 V34.6/V34.7 evidence 存在后完成 final gate。

## User-visible Pass Criteria

V34 passed scoped 后，用户可体验到：

- 单猫照片进入生成流程；
- 系统显示照片可用性和失败原因；
- 系统展示去背景主体、部件/姿态摘要和身份锚点；
- 系统为不同猫生成不同角色候选；
- 至少 2 个不同猫样本有各自 8 动作 frameSequence；
- 动作能预览、应用到目标 pet、回滚；
- 失败样本和失败候选不会应用。

## Non-pass Criteria

以下任一情况不能 passed scoped：

- 只有 V33 本地 tabby pack 复用；
- 只有静态角色图，没有动作帧；
- 只有整图平移/缩放/旋转/抖动；
- 没有 segmentation 或 part map evidence；
- 没有 8 个核心动作；
- 没有 contact sheet、GIF 或等效播放证据；
- identity drift 仍被应用；
- failed candidate 可以 apply；
- evidence 泄漏敏感信息；
- claim/security scan failed。

## Route-specific Acceptance

| Route | Can Pass V34? | Evidence Required | Claim Boundary |
| --- | --- | --- | --- |
| Route A local deterministic generation | 可以，推荐主路线 | 至少 2 个不同猫样本的本地生成 8 动作、QA、产品闭环和视觉证据 | scoped local deterministic generation only |
| Route B professional assisted import | 可以作为 fallback scoped pass 或 partial pass；当前仅记录为后续比较项 | source boundary、sampleId、part map、专业辅助帧、QA、产品闭环和视觉证据 | professional assisted, not fully automatic |
| Route C provider candidate import | 不作为 V34 pass 前置 | 仅未来批准后可作为 candidate evidence | provider not verified |
| Route D local ML segmentation/pose | 只能作为辅助能力 | 本地模型输出、测试、性能和安全 evidence | optional accelerator only |

## Required Scans

Claim scan 必须拒绝以下 ready claim：

- Forbidden ready claim: Petdex parity achieved；
- Forbidden ready claim: automatic photo-to-animation ready for arbitrary cats；
- Forbidden ready claim: automatic photo-to-2D ready for arbitrary cats；
- Forbidden ready claim: provider integration verified；
- Forbidden ready claim: 3D ready；
- Forbidden ready claim: production release ready；
- Forbidden ready claim: Windows ready；
- Forbidden ready claim: cross-platform ready；
- Forbidden ready claim: MCP ready；
- Forbidden ready claim: Claude Code integration verified；
- Forbidden ready claim: OS-level Codex window binding ready；
- Forbidden ready claim: all Codex workflows verified。

Security scan 必须拒绝 evidence 中出现 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents。
