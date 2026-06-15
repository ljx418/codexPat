# Agent Desktop Pet PRD V23-V28

文档状态：active PRD；planned。  
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-15。

## Product Goal

V23-V28 将 V22 的“坏资产拒绝门禁”向前推进为普通用户可理解的照片到动画资产产品链路：

```text
用户上传一张猫图
  -> 系统判断照片是否适合生成
  -> 提取猫的稳定视觉特征
  -> 多路线生成动作资产候选
  -> 自动同猫 / 动作 / 连续性 QA
  -> 用户在设置页预览 8 个动作
  -> 仅 approved 候选包可应用到目标宠物
  -> 不满意可回滚
```

V23-V28 的目标不是保证任意猫、任意照片都一次成功。目标是让系统在真实用户路径中：

- 尽早拒绝不适合生成的照片；
- 尽可能选择成功率更高的生成路线；
- 自动拒绝差结果；
- 给出可执行的重试或换路线建议；
- 让用户只面对“可预览、可判断、可应用、可回滚”的清晰流程。

## User Experience

用户可以做什么：

1. 在设置页选择或拖入一张猫照片。
2. 看到照片质量检查结果：是否清晰、是否完整、是否单猫、背景是否复杂。
3. 看到系统提取的猫特征摘要：毛色、花纹、眼睛、耳朵、体态、尾巴等。
4. 选择生成风格：写实可爱、精致 2D、像素风、简笔低保真 fallback。
5. 点击生成后，系统自动尝试多条路线：
   - provider 关键姿势；
   - provider 动作表；
   - 统一身份图 + 本地 2D rig；
   - image-to-video 抽帧；
   - 保底风格化本地动作包。
6. 在应用前看到 8 个 core actions 的动图预览。
7. QA 不通过的候选包不能应用。
8. 通过后可一键应用到目标猫，也可以回滚到上一套可见资产。

## Core Actions

V23-V28 继续要求 8 个 core actions：

- idle
- thinking
- running
- success
- warning
- error
- need_input
- sleeping

## Stage Split

| Stage | Product Purpose |
| --- | --- |
| V23 | 照片输入质量和猫特征抽取，先判断“这张图能不能生成”。 |
| V24 | 多路线生成编排，避免押注单一 provider 或单一 prompt。 |
| V25 | 同猫一致性与动作质量自动评审，拒绝漂移、弱动作、闪帧。 |
| V26 | 自动打包、设置页预览、用户逐动作确认和目标应用。 |
| V27 | 失败重试、成本控制、reasonCode 驱动修复和换路线建议。 |
| V28 | 普通用户产品化闭环：上传 -> 生成 -> 预览 -> 应用 -> 回滚。 |

## Acceptance Boundary

V28 通过后最多只能声明：

```text
V23-V28 photo-to-animated-2D workflow passed for tested local photo intake, multi-route candidate generation, QA rejection, preview, target apply, and rollback scenarios.
```

仍不得声明：

- automatic photo-to-2D ready for arbitrary cats；
- arbitrary cats automatic photo-to-animation ready；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- 3D ready；
- automatic photo-to-3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Non-goals

- 不承诺所有猫图都能生成好资产。
- 不承诺 provider 一定可用。
- 不绕过 V22 质量门禁。
- 不复用 Petdex 资产，Petdex 只作为格式和体验参考。
- 不声明 3D 或生产发布能力。
