# V21 Current Gap Analysis

文档状态：scoped accepted gap analysis。  
当前日期：2026-06-14。

## Current Baseline

V20.0-V20.2 已经证明三张真实猫图可以触发 MiniMax reference-image provider 输出，但 V20.3 blocked，因为输出不是可归一化的 8x9 motion sheet。V19 local motion-sheet workflow 仍是 accepted fallback baseline。

V21.0-V21.7 已完成 scoped acceptance：Route A 从 V20/MiniMax 派生关键姿势生成本地动画包并通过 QA、对比、目标应用和回滚；Route C 本地 2D rig 作为 fallback/comparison route 通过；Route B 是 capability review only；Route D 因缺少安全 explicit-consent video source 被 excluded。

## Primary Gap

当前缺口不是“能不能生成猫图”，而是：

```text
真实猫图 -> 可控同猫动作素材 -> 可归一化安全动画包 -> 预览 -> 目标应用 -> 回滚
```

其中 provider 直接生成完整 motion sheet 的路径已在 V20 暂时失败，需要多路线融合。

## Route Gap Matrix

| Route | Current Evidence | Gap | V21 Target |
| --- | --- | --- | --- |
| A Provider key-pose -> local pack | V20 MiniMax outputs include multi-pose/concept material | 缺少本地姿势抽取、动作映射、对齐、插帧、pack assembly | V21.1 passed |
| B Alternate providers | 仅 MiniMax P0 有真实输出；其他 provider 未审计 | 缺 provider capability、credential boundary、成本/隐私/license 证据 | V21.2 passed as review |
| C Unified identity + local rig | V18/V20 有同猫身份图和本地派生经验 | 缺产品化 rig 模板、锚点、动作曲线、导出 QA | V21.3 passed |
| D Image-to-video -> frames | 未形成稳定产品路径 | 缺 video provider/preflight、抽帧、稳定、去背景、loop gate | V21.4 excluded |
| Fusion comparator | 无统一路线比较页面 | 用户无法高效比较效果 | V21.5/V21.6 passed |

## High-risk Areas

- Provider 输出不可控，不能保证按动作表格式返回。
- 多 provider 调用存在费用、隐私、license 和 credential 风险。
- 本地 rig 可控但视觉自然度可能不足。
- Image-to-video 可能动作自然，但背景、漂移和裁切难度高。
- 任何路线失败都不能被写成 passed。

## Required Decision

V21 final 已做 evidence-matched decision：

- passed：Route A 真实产出可预览、可应用、可回滚的 QA passed pack；
- blocked：没有路线通过，但原因清楚且 V19 fallback 保留；
- failed：实现或验收违反安全/claim/用户体验硬门槛。
