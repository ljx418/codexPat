# Agent Desktop Pet PRD V21

文档状态：active PRD；V21 scoped accepted。  
当前日期：2026-06-14。

## 1. 背景

V20 已证明 MiniMax reference-image provider 能返回三张真实猫图对应的 provider 输出，但输出无法稳定归一化为项目需要的 8 行 x 9 帧同猫动作表。V20.3 blocked 的核心原因不是“没有图片”，而是：

- provider 输出更像概念图、多姿态拼图或重复姿势网格；
- 不是稳定的 8 core actions x 9 frames motion sheet；
- 同猫一致性、动作幅度、背景、裁切和帧连续性无法直接满足 runtime pack；
- 单一路线继续调 prompt 的收益不确定。

V21 因此不再押注单一 provider 直接产出完美 motion sheet，而是并行验证四条路线，再用统一 QA、预览、应用和回滚流程选择最可产品化的路径。

## 2. 阶段目标

V21 的目标是把“用户提供猫图后获得可预览、可应用、可回滚的多动作 2D 宠物资产”从单一 provider motion-sheet 失败状态推进到多路线融合验证状态。

V21 必须同时规划和验证四条路线：

1. Route A：Provider key-pose to local animation pack  
   使用 MiniMax 或同类 provider 返回的多姿态/概念图作为关键姿势素材，由本地系统做裁切、对齐、动作映射、插帧或复用，生成项目安全动画包。

2. Route B：Alternate provider capability preflight  
   评估更适合 reference image、角色一致性、sprite sheet、image-to-video 或透明背景输出的 provider。只有真实 credential、consent、cost/privacy/license 边界齐全时才做 live smoke。

3. Route C：Unified character plus local 2D rig  
   先生成或选定统一猫身份图，再本地拆层、锚点、骨架/形变模板、动作曲线和帧导出，以本地可控方式保证同猫和连续性。

4. Route D：Image-to-video to frames  
   使用 image-to-video 或动作视频输出作为动作源，再本地抽帧、稳定、去背景、裁切、循环闭合、打包。

## 3. 用户体验目标

V21 结束时，用户应能看到一个面向效果比较的产品化验证页面：

- 三张本地猫图作为样本输入；
- 四条路线分别显示状态：passed / blocked / failed / excluded；
- 每条可用路线展示 8 个 core actions 的预览；
- 系统标明动作幅度、同猫一致性、背景透明度、首尾闭合、帧间连续性和 1x/0.75x 可读性；
- 用户可以选择通过 QA 的最佳路线应用到指定宠物；
- 应用只影响目标 PetInstance；
- 不满意可以回滚上一套可见资产。

## 4. 不做范围

V21 不声明：

- arbitrary cats automatic photo-to-animation ready；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- Petdex asset reuse/redistribution authorized；
- 3D ready；
- automatic photo-to-3D ready；
- remote asset loading ready；
- asset marketplace ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## 5. 验收门槛

V21 final gate 只有在至少一条路线生成真实可用资产，并通过以下条件后才能 passed：

- 8 core actions 均可见：idle、thinking、running、success、warning、error、need_input、sleeping；
- 不允许 blank、fully transparent、off-canvas frame；
- 动作幅度肉眼可辨，不能只是轻微抖动；
- 同猫一致性通过人工/自动 QA；
- loop/base actions 首尾闭合，transient actions 不突兀；
- frame delta 在阈值内，不出现闪帧、跳帧和漂移；
- preview 不发送 PetEvent，不写 CatStateMachine，不修改 live pet；
- apply 只影响目标 PetInstance；
- rollback 恢复 previous active pack；
- evidence 不包含 token、Authorization、raw provider response、raw photo bytes、EXIF/GPS、full local path、workspace path、config path 或 prompt private text。

## 6. 最窄允许声明

如果某条路线 passed，最终声明必须绑定具体路线和测试场景。例如：

```text
V21 multi-route animation asset recovery passed for the tested Route C unified-character local rig scenario with QA, preview, target apply, and rollback.
```

如果没有路线 passed：

```text
V21 multi-route animation asset recovery remains blocked; V19 local motion-sheet workflow remains the accepted fallback baseline.
```
