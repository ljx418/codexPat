# V34 Current Gap Analysis

文档状态：active gap analysis；V34.1-V34.8 已 evidence-matched scoped passed。
当前日期：2026-06-25。

## Current State

V33 的外部猫图报告证明当前项目仍是 partial scoped：

- 4 个公开单猫样本能进入安全 intake；
- 1 个双猫样本按 `multi_subject` 失败；
- 橘色样本可以与现有本地 tabby pack 组成 scoped product path；
- 三花、暹罗、另一只虎斑直接套同一 tabby pack 会触发 `identity_drift`；
- 当前没有从不同猫照片生成各自动作资产的能力。

V34.1 已补齐 scoped subject detection：

- 3 个单猫样本 passed；
- 2 个负例样本 rejected；
- 1 个低可见单猫样本 blocked；
- evidence：`docs/V34.x/evidence/v34_1-subject-detection-2026-06-25.md`。

V34.2 已补齐 scoped segmentation/mask record：

- 3 个 V34.1 passed 单猫样本生成 passed mask record；
- 1 个高背景泄漏 review case blocked；
- 2 个负例样本 failed，1 个低可见样本 blocked；
- 3 个 mask record eligible for later character asset contract；
- evidence：`docs/V34.x/evidence/v34_2-segmentation-mask-2026-06-25.md`。

V34.3 已补齐 scoped pose/part map record：

- 3 个 V34.2 passed mask 样本生成 passed part map；
- 1 个低置信/缺失部位 review case blocked；
- 3 个 part map referencable by later V34 character asset contract；
- evidence：`docs/V34.x/evidence/v34_3-pose-part-map-2026-06-25.md`。

V34.4 已补齐 scoped character asset contract：

- 3 个 V34.3 passed part map 样本生成 passed character asset contract；
- 3 个 non-ready/risk records blocked；
- passed contracts 的 duplicate characterAssetId count 为 0；
- passed contracts 的 duplicate identity signature count 为 0；
- evidence：`docs/V34.x/evidence/v34_4-character-asset-contract-2026-06-25.md`。

V34.5 已通过 scoped Route A2 rig/frame synthesis：

- Route A2 dual action contract 被采用；
- 2 个不同 named samples 生成各自 Route A2 candidates；
- V34 target actions 与 runtime core projection 分开记录；
- transform-only negative candidate 被拒绝；
- Route B professional assisted import 被记录为后续 target-quality fallback comparison，当前未执行；
- evidence：`docs/V34.x/evidence/v34_5-rig-frame-synthesis-2026-06-25.md`。

V34.6-V34.8 已完成 scoped product path、report 和 final gate：

- 2 个 V34.5 passed Route A2 candidates 可 preview、target-only apply、rollback；
- transform-only 和 missing-target-action negative 被 product path 阻塞；
- 中文 HTML 报告包含 visual refs、产品路径自动化证据、失败样本和 Route A2 / Route B 对照；
- final gate 命令日志、claim scan、security scan 通过；
- evidence：`docs/V34.x/evidence/v34_6-generation-product-e2e-2026-06-25.md`、`docs/V34.x/evidence/v34_7-real-data-report-2026-06-25.html`、`docs/V34.x/v34-final-acceptance-report.md`。

## Gap Table

| Area | Current | V34 Target |
| --- | --- | --- |
| Subject detection | V34.1 已有 named sample scoped evidence。 | 继续作为 V34.2/V34.3 输入；不代表 pose 或动作生成已通过。 |
| Segmentation | V34.2 已有 named sample mask scoped evidence。 | 作为 V34.3/V34.4 输入；不代表角色资产或动作生成已通过。 |
| Pose / parts | V34.3 已有 named sample pose/part map scoped evidence。 | 作为 V34.4/V34.5 输入；不代表动作生成已通过。 |
| Character asset | V34.4 已有 sample-bound character asset contract scoped evidence。 | 作为 V34.5 rig/frame synthesis 输入；不代表 8 动作已生成。 |
| Action synthesis | V34.5 Route A2 已有 scoped evidence；Route B 仅记录为后续质量 fallback。 | V34.6-V34.8 已把 passed Route A2 candidates 接入 product path，并完成 Route B 对照和 final gate。 |
| Identity preservation | V33 能发现 drift，但不能生成新身份资产。 | 不同猫生成不同 characterAssetId 和 candidateId。 |
| Product UX | 已有 pack 可预览/应用/回滚。 | photo-generated pack 可预览/应用/回滚。 |
| Evidence | V33 报告证明 partial scoped。 | V34 报告证明生成链 passed/blocked/failed。 |
| Risk control | 风险分散在各阶段说明中。 | 有 `v34-risk-burndown-and-route-decision.md`，明确 Route A、Route B、kill switch 和 fallback。 |

## Main Risks

- 把 V33 的本地 tabby pack 复用误写成照片生成；
- segmentation 质量不足导致背景参与动作；
- pose/part map 低置信仍 silent pass；
- 生成动作仍是整图变形；
- 只有单一猫样本通过，不具备跨身份生成证据；
- 禁止 evidence 泄漏原始照片、EXIF/GPS 或完整路径；
- provider output 被直接信任；
- final gate 过度声明任意猫 ready。

## Risk Burndown Gap

当前最大缺口不是“缺一个动作 pack”，而是缺一条可审计、可失败、可切换路线的生成链。V34 采用：

- Route A local deterministic generation 作为默认主路线；
- Route B professional assisted import 作为质量 fallback；
- Route C provider candidate import 作为 future candidate，不作为 V34 pass 前置；
- Route D local ML segmentation/pose 作为 optional accelerator。

如果 Route A 在 V34.5 只能产出整图变形、身份复用或缺核心动作，则必须 failed 或切换 Route B，不得进入 V34.6 产品路径。

## Closure Status

V34 本阶段开发已完成 scoped closure。后续若继续提升目标体验，应另立 V35 或 Route B 专项阶段，重新制定 PRD/spec/evidence，不在 V34 窄声明内扩大。

## Drawio Navigation

`docs/active/current-vs-target-gap.drawio` 是当前 V34 架构和验收导航图。新版图保持 8 页以内，并使用颜色表达状态：

- 绿色：已实现或已 scoped passed；
- 蓝色：复用现有实体；
- 黄色：未来阶段待实现；
- 橙色：Route B、fallback 或质量比较；
- 红色：kill switch、No-Go 或禁止声明。

页面覆盖：

1. V34 目标体验与阶段边界；
2. 当前架构与目标架构差异；
3. 端到端代码实体分层架构；
4. 单照片到角色资产数据合同；
5. 角色资产到 8 动作生成链路；
6. Route A2 与 Route B 技术路线比较；
7. 开发计划与项目里程碑；
8. 验收门槛与出门条件。
