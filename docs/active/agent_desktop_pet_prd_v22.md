# Agent Desktop Pet PRD V22

文档状态：active PRD；scoped accepted。  
阶段主题：Asset Quality Review & Rejection Gate。  
当前日期：2026-06-15。

## Product Problem

V21 证明了多路线可以产出候选动作资产，但用户视觉验收暴露了更关键的问题：生成出 8 个动作不等于生成出可爱的、可安装的、产品级桌宠。当前系统缺少一个强制质量审核层，导致丑资产、弱动作、身份漂移、闪帧资产有机会被包装成“通过”。

V22 的目标是把“生成结果”与“可应用资产”解耦。所有 provider、本地 rig、像素模板、motion sheet、video route 输出都必须先进入 candidate 状态，通过技术 QA、动作 QA、审美/人工审核后，才允许出现在可安装图库、应用到目标宠物或作为最终验收证据。

## Target User Experience

用户上传或选择一张猫图后，系统可以尝试多种生成路线，但结果不会直接污染桌宠：

```text
用户输入猫图
  -> 系统生成候选动作资产
  -> 系统自动检查是否缺动作、闪帧、出框、漂移、背景、水印
  -> 系统检查动作是否一眼能看懂
  -> 系统要求用户或审核员确认这只猫是否足够可爱、像同一只猫
  -> 合格资产进入预览和应用
  -> 不合格资产被拒绝，显示原因和下一步建议
```

用户能看到：

- 哪些候选资产通过；
- 哪些候选资产被拒绝；
- 被拒绝的原因；
- 建议重新上传什么样的照片；
- 是否应改用像素风、本地 rig、motion sheet 或其他 provider；
- 上一套可见宠物永远不会被坏资产覆盖。

## In Scope

- Candidate Asset Store；
- Technical QA Gate；
- Motion QA Gate；
- Visual Quality Review Gate；
- retry budget and route switching；
- rejection reasonCode；
- bad result quarantine；
- reviewer/operator pass/fail UI contract；
- HTML evidence with accepted and rejected examples；
- claim boundary and false-green prevention。

## Out of Scope

- Petdex parity claim；
- provider integration verified；
- arbitrary cats automatic photo-to-animation ready；
- production asset marketplace；
- remote asset loading readiness；
- production signed release；
- Windows / cross-platform readiness；
- 3D readiness。

## Quality Gate Required Decisions

Each candidate pack must end as exactly one status:

```text
generated
normalized
technical_failed
motion_failed
visual_review_required
visual_rejected
approved
applied
rollback_available
```

Only `approved` candidates can be applied. `technical_failed`, `motion_failed`, and `visual_rejected` must not enter the installable gallery or live runtime path.

## User-facing Failure Help

When generation repeatedly fails, the user should not receive a generic error. The UI must explain:

- what failed；
- whether it is a photo problem, provider problem, action problem, or style problem；
- what the user can do next；
- whether a different route is recommended。

Example:

```text
这张照片连续 3 次生成失败：
- 猫的动作幅度太小；
- 4 个动作看起来几乎一样；
- 生成结果里出现背景；
- 同一套动作中的猫脸不一致。

建议：上传正脸清晰、单猫、无遮挡照片，或改用像素风模板 / 本地 rig 路线。
```

## Acceptance Goal

V22 can pass only if bad visual assets are actively rejected before apply, retry/route guidance is visible, approved assets remain target-only, and final evidence includes both approved and rejected examples.

Allowed final claim:

```text
V22 asset quality review gate passed for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios.
```

Forbidden final claims:

- Petdex parity achieved；
- provider integration verified；
- arbitrary cats automatic photo-to-animation ready；
- automatic photo-to-2D ready for arbitrary cats；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。
