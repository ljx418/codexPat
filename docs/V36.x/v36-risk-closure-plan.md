# V36 Risk Closure Plan

文档状态：active risk closure plan；V36 documentation development stage；V36.0 documentation readiness passed scoped。
当前日期：2026-06-26。

## Risk Closure Table

| Risk | Why It Remains | Closure Action | Exit Decision |
| --- | --- | --- | --- |
| R1 视觉质量不达用户预期 | V35 contact sheet 和指标不能完全代表真实主观质量。 | V36.1 建立视觉金标准；V36.6 加人工视觉审查。 | target / engineering-only / failed |
| R2 Route A2 模板上限 | 本地确定性 route 可能同质化。 | V36.2 做模板感、动作重复度、身份差异分析。 | continue / downgrade / replace |
| R3 Route B 未执行 | V35 没有真实专业资产。 | V36.3 要求 source-bound 真实资产；否则 blocked。 | available / blocked |
| R4 泛化能力未证明 | named samples 不能代表更多猫图。 | V36.5 建立约 20 样本矩阵。 | scoped / partial / blocked |
| R5 自动评分虚假通过 | 指标可能掩盖难看资产。 | V36.6 人工视觉审查覆盖冲突表。 | pass / conflict / fail |
| R6 产品体验证据偏轻 | derivative evidence 不等于完整用户路径。 | V36.7 输出 HTML 和截图/visual evidence。 | passed / blocked |
| R7 声明边界误读 | scoped pass 容易被扩大。 | 每阶段 claim/security scan。 | passed / failed |

## Route Decision Policy

- 如果 Route A2 在视觉金标准中稳定 target-experience，继续 Route A2。
- 如果 Route A2 工程通过但视觉质量不足，且 Route B 有更好同样本证据，推荐 Route B。
- 如果 Route B 没有真实资产，不能作为通过路线，只能记录 blocked。
- 如果 Route B 只有一个真实同样本资产，只能作为 partial scoped 路线信号，不能支撑 V36 final full pass。
- 如果泛化矩阵显示 clear 样本也大量失败，V36 final 必须 partial、blocked 或 failed。

## Human Escalation

以下情况必须停止并找用户确认：

- 需要购买、委托或导入外部专业资产；
- 需要使用会上传图片的 provider；
- 需要可见窗口、焦点抢占或真实桌面截图；
- evidence 显示 Route A2 和 Route B 都无法接近目标体验。
