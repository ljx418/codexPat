# V34.7 Real-Data HTML Report Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.7 生成中文 HTML 自动化验收报告，让人类快速理解目标架构、当前实现、真实样本路径、视觉证据、失败原因和剩余风险。

V34.7 不是新的生成阶段。它汇总 V34.1-V34.6 evidence，说明当前项目实际能做到什么、不能做到什么，并比较 Route A2 与 Route B 是否可能带来更好的目标体验。

## Planned Report Path

`docs/V34.x/evidence/v34_7-real-data-report-YYYY-MM-DD.html`

## Required Sections

- V34 目标体验和阶段边界；
- 当前架构实现与目标架构差距；
- 单照片到角色资产再到 8 动作的真实链路；
- sample set summary；
- subject detection、mask、part map、character contract、action generation QA；
- 用户体验路径截图：导入、预览、应用、回滚或 blocked reason；
- contact sheet / playback evidence；
- Route A2 当前结果和 Route B 质量对照判断；
- passed/blocked/failed summary；
- claim scan；
- security scan；
- no-go / remaining risk。

## Required Route Comparison

报告必须用单独章节列出：

- Route A2 已验证内容：named samples、8 V34 target actions、runtime core projection、transform-only negative rejection、product path result；
- Route A2 局限：本地模板/启发式质量上限、不是任意猫、不是 provider 或 professional pipeline；
- Route B 可能改善内容：更自然的部件运动、更高质量关键帧、更接近目标用户体验；
- Route B 进入验收所需证据：professional assisted source boundary、sampleId、part map、frameSequence、contact sheet、QA、preview/apply/rollback；
- Route B 当前结论：recorded for comparison only, not executed, not automatic.

## Acceptance

通过条件：

- 报告为中文；
- 包含真实截图或真实生成视觉证据；
- 每个 passed claim 都能追溯 evidence；
- blocked/failed 不被隐藏；
- Route A2 和 Route B 的结论不混淆；
- V34.6 产品路径结果被明确列出；
- 人类可以在 5 分钟内判断是否过度承诺。

失败条件：

- 只有文字，没有视觉证据；
- 把 scoped sample pass 写成任意猫 ready；
- 把 Route B 写成已执行或全自动；
- 缺少目标架构和当前架构对比；
- 缺少 Route A2 局限和 Route B fallback 条件；
- 包含敏感数据。
