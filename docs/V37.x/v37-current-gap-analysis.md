# V37 Current Gap Analysis

文档状态：active gap analysis；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Current State

V37 已新增 scoped product-path 入口、safe named sample metadata、身份/角色资产合同、Route A2 候选、preview/apply/rollback 模型和最终 evidence。当前仍不能声明完整图生动作资产 ready，因为本轮 evidence 不证明 raw-photo pixel processing、截图级动画播放验收、Route B 真实专业资产或任意猫自动生成。

## Target State

V37 目标状态：

- 用户能从产品路径选择或导入真实猫照片；
- 照片生成安全 sampleId、trait summary、identity anchors；
- 生成独立 characterAssetId；
- 生成或导入该猫自己的 8 动作候选；
- 候选通过质量、人审、产品路径 gate；
- 用户可 preview、target-only apply、rollback；
- final claim 只覆盖 tested named samples。

## Gap Matrix

| Gap | Current | Target | V37 Closure |
| --- | --- | --- | --- |
| 用户可见照片入口 | 浏览器原预览仍有内置猫历史问题。 | V37 产品入口和生成状态可见。 | V37.1 passed scoped；仍需真实截图验证 |
| 样本事实源 | V36 metadata samples，非产品照片链路。 | 至少 2 个 tested named photo samples。 | V37.2 passed scoped with safe metadata only |
| 身份绑定 | V34/V35 有合同，但未在产品里证明用户照片到角色资产。 | 每个照片样本有独立 characterAssetId。 | V37.3 passed scoped |
| 动作资产 | Route A2 scoped evidence，不是 raw-photo pixel generation。 | 每个 passed sample 有 8 动作候选。 | V37.4 passed scoped as deterministic product-path candidate |
| 产品路径 | V36 HTML/headless evidence，未证明网页内替换内置猫。 | 产品内 preview/apply/rollback。 | V37.5 passed scoped model path；仍需 screenshot-backed UI playback |
| 视觉验收 | 人审存在，但不能证明真实照片生成体验。 | 截图/HTML visual evidence + 人审硬门槛。 | V37.6 passed scoped for model-level review；raw-photo animation visual risk remains |
| 声明边界 | scoped pass 容易被误读。 | final claim 只写 tested named product-path samples。 | V37.7 passed scoped for product-path contract |

## Documentation Gap Closure

V37.0 第二轮文档修订补齐了工程实现蓝图：

- implemented TS modules；
- test file map；
- UI automation anchors；
- sample matrix；
- V37.1-V37.7 script map；
- phase exit gates；
- Route A2 visual-ceiling risk and Route B fallback decision。

V37.1-V37.7 已关闭 product-path 合同层缺口。剩余风险不再是“文档无法指导开发”，而是“Route A2 的真实像素级视觉质量和照片到动画产物仍可能不达标”。该风险只能通过下一阶段真实照片像素输入、可截图播放的动作资产、人工视觉审查和 Route B source-bound 对照来关闭。
