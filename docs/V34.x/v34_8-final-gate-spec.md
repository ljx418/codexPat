# V34.8 Final Gate Execution Spec

文档状态：active final gate spec。
当前日期：2026-06-25。

## Objective

V34.8 汇总 V34.1-V34.7 的真实 evidence，判断 V34 是否 scoped passed、partial scoped、blocked scoped 或 failed。V34.8 的原始 entry rule 是前序 evidence 存在前不得启动；截至 `docs/V34.x/v34-final-acceptance-report.md`，该前置条件已满足并完成 scoped final gate。

V34.8 的核心判断不是“文档是否完整”，而是 V34 是否已经用真实 evidence 证明 named sample 范围内的 photo -> character asset -> 8 actions -> QA -> product path。Route A2 与 Route B 的比较必须进入 final report，但不能扩大 claim。

## Entry Criteria

- V34.1-V34.7 均有 evidence，或有稳定 blocked reason；
- baseline commands 已运行；
- V34 新增 smoke commands 已运行或明确 blocked；
- HTML report 已生成；
- claim/security scan 无致命问题。
- V34.6 已证明 passed Route A2 candidates 的 preview/apply/rollback，或明确 blocked/failed；
- V34.7 已生成中文 HTML 报告并包含 Route A2 / Route B comparison。

## Required Review

- PRD review：`docs/active/agent_desktop_pet_prd_v34.md`
- architecture review：`docs/V34.x/v34-target-architecture.md`
- implementation contract review：`docs/V34.x/v34-implementation-contract.md`
- acceptance review：`docs/V34.x/v34-acceptance-plan.md`
- evidence checklist review：`docs/V34.x/v34-evidence-and-scan-checklist.md`

## Pass Criteria

`passed scoped` 只能在以下条件全部满足时使用：

- 至少 2 个不同猫样本完成 photo -> character asset -> 8 actions -> QA -> preview/apply/rollback；
- 生成链包含 subject detection、segmentation/mask、pose/part map、character contract、rig/frame synthesis；
- transform-only negative candidate 被拒绝；
- 用户可见报告和截图完整；
- final report 说明 Route A2 是否足够支撑当前 scoped target experience；
- final report 说明 Route B 是否可能产生更好开发结果，以及触发 Route B 的条件；
- claim/security scan passed；
- final claim 明确是 scoped local evidence。

## Partial Or Blocked Criteria

使用 `partial scoped`：

- 部分样本链路通过，但未达到至少 2 个不同猫样本；
- 产品路径通过但生成质量或视觉证据不足。
- Route A2 通过工程门禁，但目标体验质量明显不足，需要 Route B 才可能接近目标体验。

使用 `blocked scoped`：

- 平台、工具或安全前置条件导致无法完成真实验收；
- blocked reason 稳定、可复现、不可用 silent pass 替代。

## Failure Criteria

使用 `failed`：

- 生成资产无法保持猫身份；
- 只有整图变形；
- failed candidate 可被 apply；
- evidence 或报告有虚假验收；
- 发现敏感数据泄露。
- 不得把 Route B 写成已执行、全自动或 provider verified。

## Final Route Decision

final report 必须给出以下四选一结论：

- `Route A2 sufficient for scoped pass`：Route A2 的真实视觉证据、QA 和产品路径足以支撑 scoped target experience；
- `Route A2 partial; Route B recommended`：Route A2 工程链路成立，但视觉/动作质量不足，建议下一阶段执行 Route B；
- `Route A2 blocked; Route B required for target experience`：Route A2 无法通过必要质量门槛；
- `V34 failed`：Route A2/Route B 均无可接受证据，或存在虚假验收/安全问题。

## Output

生成：

`docs/V34.x/v34-final-acceptance-report.md`

报告必须包含 narrow final claim、phase summary、Route A2 / Route B final decision、remaining risk、next-stage recommendation。
