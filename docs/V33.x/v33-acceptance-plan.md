# V33 Acceptance Plan

文档状态：planned acceptance plan；V33 final gate 当前 No-Go。
当前日期：2026-06-25。

## Acceptance Principle

V33 验收必须以真实数据、真实视觉证据和真实产品路径为准。文档完成、路线定义或候选文字说明都不能替代 runtime/evidence。

工程验收按 `docs/V33.x/v33-engineering-implementation-blueprint.md` 执行。第一实现切片必须证明 sample record、identity/character contract、本地 frameSequence 候选、V30/V31/V32/V33 QA 和 preview/apply/rollback 之间存在真实数据链路。

## Gate Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V33.0 | 文档与 claim 边界冻结 | PRD、target architecture、plan、acceptance、milestones、gap、claim matrix、drawio、doc audit | planned |
| V33.1 | 真实样本 intake | named sample set、安全元数据、suitability status、reasonCodes | planned |
| V33.2 | trait 与 identity contract | 安全 trait summary、character design contract、identity QA 输入 | planned |
| V33.3 | 8 动作候选 | manifest、frames、contact sheet、GIF/播放证据、source/license boundary | planned |
| V33.4 | rig/frame runtime route | V30/V31/V32/V33 gates、runtime-compatible frames/payload | planned |
| V33.5 | 应用内 preview/apply/rollback | failed blocked、approved preview、target-only apply、rollback | planned |
| V33.6 | real-data E2E report | 中文 HTML、截图、QA 表、blocked/failed reason、scan results | planned |
| V33.7 | final gate | phase summary、baseline commands、PRD/spec review、claim/security scan | No-Go |

## User-visible Pass Criteria

V33 通过后，用户能体验到：

- 从真实猫照片进入安全检查；
- 看到照片是否适合生成动作资产；
- 看到同猫身份特征如何进入角色候选；
- 看到 8 个核心动作的可视化候选；
- 预览通过候选；
- 将通过候选应用到目标 pet；
- 回滚到之前 pack；
- 对失败样本看到明确原因。

## Non-pass Criteria

以下情况不能 passed scoped：

- 没有真实照片样本；
- 只有 trait 或角色文字，没有动作资产；
- 只有静态图或整图变形；
- 没有视觉证据；
- failed asset 可以 apply；
- rollback 失败；
- evidence 包含敏感数据；
- claim scan 或 security scan failed；
- final report 声称任意猫自动生成 ready。

## Required Scans

Claim scan 必须拒绝以下 ready claim：

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- automatic photo-to-2D ready for arbitrary cats；
- provider integration verified；
- 3D ready；
- production release ready；
- Windows ready；
- cross-platform ready；
- MCP ready；
- Claude Code integration verified；
- OS-level Codex window binding ready；
- all Codex workflows verified。

Security scan 必须拒绝 evidence 中出现 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents。
