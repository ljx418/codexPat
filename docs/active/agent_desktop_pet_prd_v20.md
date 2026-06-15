# Agent Desktop Pet PRD V20

文档状态：historical PRD；V20 provider motion-sheet branch blocked；V19 local motion-sheet scoped passed 是 fallback baseline；V21 是当前 active PRD。  
当前日期：2026-06-13。

## 1. 阶段目标

V20 将 V19 的本地 Petdex-style motion sheet 导入能力推进到“中国大陆真实 provider 生成动作表”的产品验证阶段。V20 重点验证：

```text
用户提供猫图
  -> 明确 provider、费用、隐私、留存、授权说明
  -> 优先 MiniMax reference-image / image-to-image
  -> 尝试生成同一只猫的 8 行 x 9 帧 motion sheet
  -> 自动裁切、归一化、QA、打包
  -> 设置页预览 8 个动作
  -> 应用到指定宠物
  -> 可回滚到上一套可见资产
```

V20 的核心目标不是“接入尽可能多 provider”，而是用多张真实猫图验证至少一个中国大陆 provider 在真实输出下能否支撑普通用户期待的“照片生成多动作动画猫”体验。V20 不再把单次 provider smoke 当成充分证据；MiniMax 必须经过多样本 benchmark、reasonCode 驱动的 prompt repair loop、QA 和低重试次数统计。

## 2. 用户体验目标

V20 完成后，用户应能体验到：

- 在设置页选择本地猫照片。
- 选择大陆 provider，默认优先 MiniMax。
- 看到上传/生成前的费用、隐私、留存、授权和 attribution 说明。
- 看到 provider capability preflight 结果：支持 reference image、只支持 text-to-image、credential missing、terms missing 或 provider unavailable。
- 在 provider 支持时发起真实生成，并对多张猫图执行受控 benchmark。
- 看到每张猫图的生成状态、失败 reasonCode、重试次数和最终是否可应用。
- 如果 provider 返回单张 motion sheet，系统自动裁切成 8 个 core action 的多帧资产。
- 如果 provider 不能返回合格 sheet，系统明确显示失败原因，不应用坏资产。
- 用户可以预览所有 8 个动作，并确认动作幅度、同猫一致性、无背景/透明、无漂移、首尾闭环。
- 用户可以一键应用到目标宠物，并能回滚。

## 3. Provider 候选

V20 只把 MiniMax 作为首选真实 provider 候选，不声明 provider integration verified。

| Provider | V20 角色 | 进入条件 |
| --- | --- | --- |
| MiniMax / 海螺 | P0 首选；复用现有 reference-image adapter 基础 | credential、consent、terms、reference-image capability、真实输出 |
| 阿里云百炼 / 通义万相 | P1 候选；文档级 capability review | 不进入默认实现，除非单独 gate |
| 火山方舟 / 豆包 Seedream / 即梦 | P1 候选；适合图像编辑或视频动作探索 | 不进入默认实现，除非单独 gate |
| 可灵 / Kling | P2；偏视频/抽帧路线 | V20 不默认启动 |
| 百度千帆 / 腾讯混元 | P2；备选图像生成候选 | V20 不默认启动 |

## 4. 必须支持的动作

V20 provider 输出必须覆盖 8 个 core actions：

- idle
- thinking
- running
- success
- warning
- error
- need_input
- sleeping

默认 sheet 规格：

- 8 行，每行对应一个 core action。
- 9 列，每列对应一个连续帧。
- 每个 action 至少 6 个非空可见帧；transient action 可接受 3 帧以上，但 V20 默认仍以 9 帧 sheet 处理。
- 首帧和尾帧必须闭合或可平滑 loop。
- 相邻帧位移和姿态变化不能出现跳变。

## 5. Provider Benchmark 门槛

V20 provider 生成路径必须使用真实猫图样本集：

- 最少 3 张用户提供猫图；如果少于 3 张，必须记录 `sample_size_limited`，不得声明低重试可靠性。
- 每张图最多 3 个 prompt variant，每个 variant 最多 2 次尝试。
- 第二次尝试必须根据 QA reasonCode 修复 prompt，不能盲目重复。
- 如果 3 张样本中至少 2 张在每张不超过 6 次 provider call 内产出可接受 sheet，且中位 accepted-attempt count 不超过 4，才允许说 MiniMax 是 V20 tested provider candidate。
- 如果只有 1 张图通过，只能声明 scoped smoke，不得声明 low-retry reliability。

## 6. 质量门槛

V20 provider 输出必须通过：

- nonblank / nontransparent 检查。
- off-canvas / bounding box 检查。
- 背景/透明检查；如果 provider 输出有背景，必须进入背景移除或 blocked，不得直接应用。
- same-cat consistency 检查。
- motion amplitude 检查：running、success、warning、error、need_input 至少有肉眼可辨的大动作差异。
- loop closure 检查：idle、thinking、running、sleeping 首尾帧闭合。
- adjacent-frame delta 检查：不能出现明显闪帧、漂移、瞬移。
- 1x 和 0.75x 可读性。
- 目标宠物隔离：default 和 unrelated pets 不变。

## 7. 安全与隐私

V20 evidence 和 UI 不得记录：

- token
- Authorization
- raw provider response
- raw HTTP payload
- raw photo bytes
- EXIF / GPS
- full local path
- original private filename
- workspace path
- config path
- api-token.json
- prompt private text

V20 provider adapter 只能输出：

- providerName
- endpointHost
- model
- capability
- safe reasonCode
- safe input metadata
- output kind
- output count
- safe generated file names
- action coverage summary
- QA decision

## 8. Allowed Claim

仅当真实 provider 输出、QA、预览、应用、回滚全部通过后，允许声明：

```text
V20 mainland provider photo-to-motion-sheet workflow passed for the tested MiniMax reference-image motion-sheet scenario with QA, preview, target apply, and rollback.
```

仅当至少 3 张样本参与 benchmark 且达到成功率/重试次数门槛后，才允许补充：

```text
MiniMax passed the V20 tested sample benchmark as a mainland provider candidate for photo-to-motion-sheet generation.
```

如果 MiniMax 无法生成合格单张 motion sheet，但本地 V19 sheet 仍可用，只能声明：

```text
V20 MiniMax provider motion-sheet branch blocked; V19 local motion-sheet workflow remains the accepted fallback baseline.
```

## 9. Forbidden Claims

V20 不得声明：

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- 3D ready
- automatic photo-to-3D ready
- remote asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
