# V30 Milestones

文档状态：scoped passed milestones；V30.0-V30.6 completed with evidence；retained for internal review。
当前日期：2026-06-24。

| Milestone | Phase | Exit Signal |
| --- | --- | --- |
| M30.0 | V30.0 | Scope, docs, drawio, claim boundary frozen |
| M30.1 | V30.1 | 8 action storyboard and key-pose contract accepted |
| M30.2 | V30.2 | At least one 8-action semantic candidate exists |
| M30.3 | V30.3 | Motion readability QA rejects transform-only asset and accepts semantic candidate |
| M30.4 | V30.4 | HTML/Manager preview shows old-vs-new animated comparison |
| M30.5 | V30.5 | Approved pack target-only apply and rollback pass |
| M30.6 | V30.6 | Final dashboard and checks closed with passed scoped |

## Milestone Target Experience

Canonical route names for milestone review: `manual high-quality frame import`,
`local 2D part rig`, `provider key-pose candidate`, and `whole-image transform
baseline`.

| Milestone | Human-Review Outcome | User-Visible Outcome |
| --- | --- | --- |
| M30.0 | 阶段目标、claim boundary、drawio 和文档入口清楚。 | 用户不会被承诺为任意猫、provider、3D 或发布能力。 |
| M30.1 | 8 个动作的语义、关键姿势和禁止捷径清楚。 | 用户能理解每个动作应该表达的宠物行为。 |
| M30.2 | 至少一个 8-action semantic candidate 可检查，且技术路线边界清楚：manual import 短期证明，local 2D part rig 中期主线，provider key-pose 候选，whole-image baseline reject-only。 | 用户能看到候选动作不是单纯贴纸变形，维护者知道哪条路线能形成通过证据。 |
| M30.3 | QA 能拒绝 weak transform-only baseline。 | 用户不会把抖动、缩放、滑动误认为合格动作。 |
| M30.4 | old-vs-new preview 嵌入视觉证据。 | 用户能直观看到旧弱动作和新语义动作差异。 |
| M30.5 | approved-only target apply 和 rollback 通过。 | 用户能安全应用合格包并恢复上一套资产。 |
| M30.6 | final report、PRD/spec review、claim/security scan 完整。 | 用户和维护者能复核 V30 scoped pass 的真实边界。 |

## V30 Exit Conditions

V30 passed scoped because:

- V30.0-V30.5 evidence exists；
- at least one candidate has 8 semantic actions；
- running / success / error / need_input pass manual visual rubric；
- weak transform-only candidate is rejected；
- final report embeds visual playback and contact sheets；
- target-only apply and rollback pass；
- security and claim scans pass。

Future claim expansion must remain blocked if:

- no candidate looks better than transform-only motion effects；
- actions cannot be recognized without labels；
- QA failed candidate can be applied；
- final evidence is link-only or text-only；
- forbidden claims appear as ready/passed。
