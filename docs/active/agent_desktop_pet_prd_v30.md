# Agent Desktop Pet PRD V30

文档状态：active PRD；planned。
阶段主题：Semantic Character Animation Quality Track。
当前日期：2026-06-17。

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

| Stage | Product Purpose |
| --- | --- |
| V30.0 | Scope freeze and semantic animation benchmark definition. |
| V30.1 | Action storyboard and key-pose contract. |
| V30.2 | Semantic frame generation route: key-pose / rig / provider / manual asset import. |
| V30.3 | Motion readability QA and motion-effect rejection gate. |
| V30.4 | Preview UX: old-vs-new comparison, contact sheets, animated playback. |
| V30.5 | Target apply and rollback for approved semantic animation packs. |
| V30.6 | Final gate with embedded HTML/GIF evidence and PRD/spec review. |

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
