# Agent Desktop Pet PRD V30

文档状态：active PRD and claim boundary；V30 scoped passed；retained for Post-V30 remediation and internal document review.
阶段主题：Semantic Character Animation Quality Track。
当前日期：2026-06-24。

## Current Status

V30 final acceptance passed on 2026-06-17 for tested local semantic 2D action
packs. The scoped proof is that transform-only weak action packs can be
rejected and semantic action candidates can be accepted through storyboard,
motion-readability QA, preview, target apply, and rollback evidence.

As of 2026-06-23, this PRD remains the current claim boundary while the active
execution line moves to Post-V30 architecture/runtime remediation. That work
does not expand V30 into Petdex parity, arbitrary-cat automatic animation,
provider integration verification, 3D readiness, production release readiness,
Windows readiness, or cross-platform readiness.

Post-V30 documentation development adds execution specs and evidence templates
for runtime desktop smoke, managed Codex workflow smoke, and architecture
slice planning. Those documents define how to gather future evidence; they do
not make runtime, managed workflow, provider, 3D, Windows, cross-platform, or
production release claims ready by themselves.

## Product Goal

V30 的目标是修正 V29 之后暴露的核心体验问题：当前生成资产虽然可以播放多帧，但动作本质仍是整图缩放、旋转、漂移或提示符号叠加，不符合用户对“宠物动作”的直觉。

V30 结束后，项目必须能证明：

```text
用户看到的宠物动作不是“图片扭来扭去”
  -> 而是有明确动作语义的角色动画
  -> 每个动作有关键姿势、重心变化、肢体逻辑和节奏
  -> 预览页能直接对比旧弱动作和新语义动作
  -> 差动作会被质量门禁拒绝
  -> 只有通过动作可读性和视觉质量评审的资产才能应用
```

## Stage Goal For Internal Review

本阶段目标被固化为一套可审查的“语义 2D 动作质量门禁”：

- 让维护者和非开发审核者能直接判断动作是否像角色动画，而不是贴纸特效。
- 让开发者在生成、导入或应用动作资产前，先知道每个动作应具备哪些关键姿势和禁止捷径。
- 让系统用 motion readability QA 拒绝 transform-only 弱动作，而不是只看 nonblank、frame delta 或 loop closure。
- 让设置页或验收 HTML 同时展示 storyboard、contact sheet、animated playback、旧弱动作对照和 QA 结果。
- 让通过 QA 的动作包只能应用到目标 PetInstance，并支持 rollback。

本阶段完成后的目标体验不是“任意猫自动生成动画已可用”，而是：

```text
用户或审核者打开预览
  -> 看见 8 个动作的语义说明和关键帧
  -> 能肉眼识别 running / success / error / need_input 等动作
  -> 看到旧弱动作为什么被拒绝
  -> 看到新候选为什么通过
  -> 只能应用通过质量门禁的动作包
  -> 应用后可回滚到上一套可见资产
```

## Approved Technical Route

V30 不再把整图 scale / translate / rotate / jitter 作为合格动作路线。
整图变形只能作为 weak baseline 和回归对照，用来证明质量门禁能够拒绝
motion-effect-only 弱动作。

本阶段认可的技术路线按优先级推进：

| Horizon | Route | Purpose | Acceptance Boundary |
| --- | --- | --- | --- |
| Short term | Manual high-quality frame import + normalizer + QA + preview/apply/rollback | 先用高质量人工或本地帧包证明语义动作体验和验收闭环。 | 可作为 V30 scoped pass 证据，前提是通过 storyboard、QA、preview、target apply、rollback。 |
| Mid term | Local 2D part rig / layered rig | 将猫拆成头、身体、四肢、尾巴、耳朵、眼睛等部件，用关键姿势和部件运动生成更自然动作。 | 作为后续默认推荐生产路线；必须导出同一 normalized frame pack 并通过 V30 QA。 |
| Long term | Provider key-pose candidate route | 让 provider 只产出候选关键帧或参考姿势。 | 不得绕过本地 QA；不得据此声明 provider integration verified 或任意猫自动生成 ready。 |
| Rejected as final route | Whole-image transform baseline | 只用于 old-vs-new comparison 和 reject proof。 | 不能作为 approved semantic animation pack。 |

Canonical route names used by development and audit documents:

- `manual high-quality frame import`
- `local 2D part rig`
- `provider key-pose candidate`
- `whole-image transform baseline`

目标用户体验上的技术选择含义：

- 用户不再只看到贴纸被整体拉伸或滑动。
- running / success / error / need_input 等动作必须来自关键姿势、部件运动或高质量逐帧资产。
- provider 输出即使看起来可用，也只能作为候选，必须经过同一套本地质量门禁。
- 所有路线最终都必须落到统一预览、QA、approved-only apply 和 rollback 闭环。

## Why V30 Exists

V29 关注 Petdex-level 图库与稳定照片生成，但实际验证发现：

- 生成帧动作幅度可能太小；
- 动作经常只是整图缩放、旋转、平移；
- running / success / error / need_input 等动作缺少清晰的姿态逻辑；
- 同一张静态图做形变无法达到成熟宠物产品的动画观感；
- 仅靠 nonblank、frame delta、loop closure 不能判断动作是否好看。

因此 V30 新增“动作语义”和“角色动画质量”作为硬门槛。

## Target User Experience

用户在桌面宠物设置页或验收 HTML 中应能看到：

- 每个动作的 storyboard：这个动作为什么这样动；
- 每个动作的 contact sheet：关键帧姿态清晰；
- 每个动作的实际播放：不是抖动/缩放，而是可读动作；
- 弱动作对照：旧资产被标记为 motion-effect-only；
- 自动 QA 结果：动作幅度、重心变化、姿态差异、首尾闭合、帧间连续；
- 人工视觉验收入口：用户能直观看到是否像 Petdex 风格的成熟动画宠物。

用户最终感知到的差异：

| 旧体验 | V30 目标体验 |
| --- | --- |
| 动作像贴纸缩放、平移、旋转。 | 动作像猫在执行可识别的角色行为。 |
| QA 只证明帧存在、循环能跑。 | QA 同时证明动作语义、姿态差异、连续性和可读性。 |
| 预览难以解释为什么好或不好。 | 预览能对照 storyboard、关键帧、旧弱动作和新语义动作。 |
| 差动画可能被误应用。 | QA failed pack 不能应用，approved pack 才能 target-only apply。 |
| 应用出错时风险不清晰。 | 只影响目标宠物，且可 rollback。 |

## Action Semantics

V30 继续覆盖 8 个 core actions，但每个动作必须有明确语义：

| Action | Required semantic motion |
| --- | --- |
| idle | 轻微呼吸、眨眼、尾巴/耳朵微动；不能大幅漂移。 |
| thinking | 看向一侧、抬爪/扶下巴、头部倾斜；表达思考。 |
| running | 明确前冲或跑步姿态，四肢/身体有速度感和重心前移。 |
| success | 预备、起跳或举爪、开心展开、落地或回稳。 |
| warning | 警觉、后缩或左右查看，情绪明显但不乱抖。 |
| error | 塌下、失衡、眩晕或困惑；必须区别于 warning。 |
| need_input | 看向用户、举爪/提示、等待回应；必须表达“需要你”。 |
| sleeping | 卧倒/蜷缩、闭眼、平稳呼吸；不能只是坐姿下沉。 |

## Quality Definition

通过的动作资产必须满足：

- 动作能被非开发者肉眼识别；
- 动作不是仅由整图 scale / translate / rotate 构成；
- 至少 3 个动作包含明显姿态变化；
- running / success / error / need_input 必须有强语义关键姿势；
- idle / sleeping 可以克制，但仍需有合理生命感；
- 首尾闭合，循环时不闪帧；
- 帧间变化连续，不突然跳位；
- 猫身份一致，毛色、脸型、体型、尾巴不漂移；
- 背景透明或安全统一，无脏边；
- 1x 和 0.75x 下都可读。

## Stage Split

| Stage | Product Purpose | Current Status |
| --- | --- | --- |
| V30.0 | Scope freeze and semantic animation benchmark definition. | passed scoped |
| V30.1 | Action storyboard and key-pose contract. | passed scoped |
| V30.2 | Semantic frame generation route: key-pose / rig / provider / manual asset import. | passed scoped |
| V30.3 | Motion readability QA and motion-effect rejection gate. | passed scoped |
| V30.4 | Preview UX: old-vs-new comparison, contact sheets, animated playback. | passed scoped |
| V30.5 | Target apply and rollback for approved semantic animation packs. | passed scoped |
| V30.6 | Final gate with embedded HTML/GIF evidence and PRD/spec review. | passed scoped |

## Acceptance Boundary

V30 通过后最多只能声明：

```text
V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence.
```

仍不得声明：

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- low-retry provider reliability；
- 3D ready；
- automatic photo-to-3D ready；
- asset marketplace ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Non-goals

- 不复用或打包 Petdex 资产，除非未来有明确授权。
- 不把 CSS transform 或整图形变当作角色动画通过。
- 不要求 V30 解决所有任意猫照片生成问题。
- 不声明生态规模追平 Petdex。
- 不声明 provider 能稳定生成所有动作。
