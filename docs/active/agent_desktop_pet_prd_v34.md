# Agent Desktop Pet PRD V34 - Photo-to-Character-to-Actions Generation Core

文档状态：active PRD；V34.1-V34.8 已 evidence-matched scoped passed；结论仅覆盖 named samples、local Route A2 candidates 和 product path。
当前日期：2026-06-25。

## Current Truth

V33 已经完成 scoped 本地闭环：安全样本记录、身份契约、本地 `quality-rescue-tabby-v1` frameSequence 候选、V30/V31/V32/V33 QA、预览、应用和回滚均有 evidence。

V33 外部猫图验收进一步证明：

- 公开外部猫图可以进入安全样本接入；
- 多主体样本会失败；
- 不同猫照片直接套用同一个本地 tabby 动作包会触发 `identity_drift`；
- 当前项目尚不能从不同猫照片自动生成各自高质量 2D 动作资产。

V34.1-V34.5 当前已完成 scoped evidence：

- V34.1 subject detection：3 个单猫样本 passed，负例被拒绝；
- V34.2 segmentation/mask：3 个 passed mask records，风险样本 blocked/failed；
- V34.3 pose/part map：3 个 passed part maps，低置信风险 blocked；
- V34.4 character asset contract：3 个 passed contracts，passed contracts 未复用同一 `characterAssetId`；
- V34.5 Route A2 rig/frame synthesis：2 个不同 named samples 生成各自 Route A2 candidates，transform-only negative 被拒绝，Route B professional assisted import 记录为后续质量比较项但未执行。

V34.6-V34.8 当前也已完成 scoped evidence：

- V34.6 generation QA and product path：2 个 V34.5 passed Route A2 candidates 通过 preview、target-only apply、rollback，transform-only 和 missing-target-action negative 被阻塞；
- V34.7 real-data report：中文 HTML 报告展示真实 visual refs、产品路径自动化证据、失败候选和 Route A2 / Route B 对照；
- V34.8 final gate：命令日志、PRD/spec review、claim scan、security scan 和 final report 通过，final route decision 为 `Route A2 sufficient for scoped pass`。

因此 V34 的目标不是继续包装已有本地 pack，而是补齐真正的生成核心：

```text
single cat photo
  -> privacy-safe intake
  -> subject detection
  -> segmentation / foreground mask
  -> pose and visible part map
  -> identity anchors
  -> character asset contract
  -> rig-ready parts or frame seed
  -> 8-action synthesis
  -> QA gates
  -> preview / apply / rollback
```

## Product Goal

V34 要让用户看到一条可失败、可审计、可验收的照片生成路径：

1. 用户选择一张单猫照片。
2. 系统说明照片是否适合生成动作资产。
3. 系统生成安全主体摘要、前景分割结果、可见部位图和身份锚点。
4. 系统把照片身份转成同一只猫的动画角色资产合同。
5. 系统基于角色资产生成 8 个核心动作 frameSequence。
6. 系统用 V30/V31/V32/V33/V34 门禁检查动作语义、美术质量、帧质量、身份一致性和生成链路完整性。
7. 通过候选可预览、只应用到目标 pet，并可回滚。
8. 失败样本或失败候选显示明确 reasonCode，不 silent pass。

## Target User Experience

V34 完成后，用户应能体验到：

- 上传或选择一张猫图后，看到“可生成 / 需补图 / 不可生成”的判断；
- 看到去隐私后的样本摘要，而不是原始路径、EXIF/GPS 或原始照片字节；
- 看到猫主体被分离，背景不会参与动作；
- 看到毛色、花纹、体型、脸型、眼睛、耳朵、尾巴等身份锚点；
- 看到同一只猫的角色资产候选和 8 动作候选；
- 看到动作不是整图平移、缩放、旋转或抖动，而是有局部姿态、表情、耳朵、尾巴、四肢或动作符号变化；
- 看到失败原因，例如 `multi_subject`、`segmentation_failed`、`pose_estimate_failed`、`identity_drift`、`weak_motion`；
- 通过候选能预览、应用、回滚；失败候选不能应用。

## Technical Route Boundary

V34 首选本地可审计路线，不以外部 provider 作为通过条件。

目标实现必须包含以下可追踪数据：

- `V34SubjectDetectionRecord`
- `V34SegmentationMaskRecord`
- `V34PosePartMapRecord`
- `V34CharacterAssetContract`
- `V34RigFrameSeed`
- `V34GeneratedActionPack`
- `V34GenerationQaResult`

V34 不接受以下做法作为通过：

- 直接对整张照片做 translate、scale、rotate、jitter；
- 用同一个本地 tabby pack 代表不同猫；
- 只有文字 prompt、没有帧序列或视觉证据；
- 只有角色静态图、没有 8 动作；
- provider raw response 直接进入 accepted pack；
- 把一个命名样本通过扩大成任意猫 ready。

## Risk Burndown Strategy

V34 使用风险燃尽路线，而不是一次性大爆炸实现：

1. V34.1-V34.3 先证明照片理解链路可靠：主体检测、分割、姿态/部件图必须能通过真实样本和负例。
2. V34.4 再证明同一样本的身份能进入独立角色资产合同。
3. V34.5 才进入动作生成，并把 transform-only、身份复用、缺核心动作作为硬失败。
4. V34.6-V34.8 只允许已通过 QA 的候选进入产品路径和 final gate。

默认路线是 Route A local deterministic generation。若 Route A 在 V34.5 无法产出可接受动作质量，但 V34.1-V34.4 证据可靠，则允许启用 Route B professional assisted import 作为目标体验 fallback。Route B 必须明确 source boundary，不能写成全自动。

当前 V34.5 已选择并通过 Route A2 dual action contract：

- V34 target actions：`idle`、`walk`、`jump`、`sleep`、`eat`、`play`、`alert`、`celebrate`；
- runtime core projection：仅用于复用现有 V30/V31/V32/V33 gates，不声明语义等价；
- V34.6 已验证 passed Route A2 candidates 的 preview、target-only apply 和 rollback；
- V34.7/V34.8 已比较 Route B 是否可能达成更好的目标体验，但不能把 Route B 写成已执行或全自动。

详细风险、kill switch 和路线优劣见 `docs/V34.x/v34-risk-burndown-and-route-decision.md`。

## In Scope

- named external/local cat photo sample set；
- privacy-safe intake 和 sample evidence；
- subject detection contract；
- foreground segmentation / transparent crop contract；
- visible anatomy / pose / part map contract；
- identity anchors 和 character asset contract；
- rig-ready parts、canonical pose 或 frame seed；
- 8-action frameSequence synthesis；
- V30 semantic gate、V31 art gate、V32 measured frame gate、V33 identity gate、V34 generation-chain gate；
- preview、target-only apply、rollback；
- Chinese HTML report、contact sheet、GIF 或等效播放证据；
- PRD/spec review、claim scan、security scan。

## Out of Scope

- 任意猫自动生成 ready；
- Forbidden ready claim: provider integration verified；
- Petdex parity；
- Petdex 资产复用授权；
- Forbidden ready claim: 3D ready；
- Forbidden ready claim: production release ready；
- Forbidden ready claim: Windows ready；
- Forbidden ready claim: cross-platform ready；
- Forbidden ready claim: MCP ready、Claude Code integration verified、OS-level Codex window binding ready、all Codex workflows verified。

## Acceptance Boundary

V34 只能在 named sample set 范围内 passed scoped。必须满足：

- 至少 3 个不同单猫样本进入生成链路；
- 至少 2 个不同猫身份样本生成各自的 8 动作候选并通过 QA；
- 至少 1 个负例样本失败且不能应用；
- 每个通过样本都有 subject detection、segmentation、pose/part map、identity anchors、character asset、action frames、QA、preview/apply/rollback evidence；
- V34 generation-chain gate 证明候选不是复用错误身份 pack，也不是整图变形；
- evidence 不包含 token、Authorization、raw provider payload、raw prompt、raw JSONL、EXIF/GPS、raw photo bytes、full local path、workspace path、config path 或 `api-token.json` contents；
- final report 明确区分 passed scoped、partial、blocked、failed。

## Claim Boundary

V34 must not claim Petdex parity achieved, automatic photo-to-animation ready for arbitrary cats, automatic photo-to-2D ready for arbitrary cats, provider integration verified, low-retry provider reliability, 3D ready, production signed release ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
