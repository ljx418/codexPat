# V36.8 Final Risk Closure Execution Spec

文档状态：active execution spec；documentation-only phase gate。
当前日期：2026-06-26。

## Objective

V36.8 汇总 V36.1-V36.7，判断本阶段是否关闭高质量 2D 动作资产目标的关键风险，并给出下一阶段路线建议。V36.8 不能用文档完整性替代真实 evidence。

## Required Inputs

- V36.1 visual goldens evidence；
- V36.2 Route A2 ceiling evidence；
- V36.3 Route B real assets evidence；
- V36.4 same-sample route comparison evidence；
- V36.5 generalization matrix evidence；
- V36.6 human visual review evidence；
- V36.7 product UX report；
- baseline command results or stable blocked reasons。

## Development Actions

1. 汇总所有阶段的 pass/partial/blocked/failed。
2. 对 PRD 目标逐条映射实现证据。
3. 判断 Route A2 是否继续、Route B 是否应转主路线、是否需要混合路线或降级目标。
4. 记录无法闭环的风险和下一阶段缓解计划。

## Acceptance Actions

- 检查每个阶段都有真实 evidence 或 stable blocked reason；
- 检查最终结论没有越过证据；
- 生成 final report：`docs/V36.x/v36-final-risk-closure-report.md`。

## Allowed Final Decisions

- `Route A2 continue with scoped evidence`
- `Route B recommended as next main route`
- `Hybrid route recommended for scoped target experience`
- `V36 partial scoped`
- `V36 blocked scoped`
- `V36 failed`

## Non-Pass Criteria

- 任一必需阶段缺 evidence 且无 blocked reason；
- Route B blocked 却被写成已验证；
- 泛化矩阵失败被隐藏；
- 人审失败仍声明目标体验通过；
- 文档出现任意猫、provider、3D、production、Windows 或 cross-platform ready 过度声明。

## Stop Conditions

- 发现重大 PRD 偏移；
- 发现虚假验收风险；
- 发现高风险路线选择需要人类确认；
- claim/security scan failed。

## Evidence Checklist

- phase summary；
- PRD/spec mapping；
- command results or blocked reasons；
- route decision；
- remaining risk table；
- claim scan；
- security scan；
- narrow final claim。
