# V34.5 Rig And Frame Synthesis Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.5 从 V34.4 的角色资产合同生成每只猫自己的 8 动作 frameSequence 候选。该阶段必须拒绝整图变形和复用错误身份的动作包。

Route A2 已被选择为当前实现路线。V34.5 必须显式区分：

- V34 target actions：`idle`、`walk`、`jump`、`sleep`、`eat`、`play`、`alert`、`celebrate`；
- runtime core projection：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`。

runtime core projection 仅用于复用现有 V30/V31/V32/V33 gates，不得把 target actions 和 runtime actions 写成语义等价。

## Planned Code Entities

- `apps/desktop/src/assets/v34-rig-frame-synthesis.ts`
- `apps/desktop/src/assets/v34-generation-quality-gate.ts`
- `apps/desktop/src/assets/v34-rig-frame-synthesis.test.ts`
- `scripts/v34_5_rig_frame_synthesis_smoke.mjs`

## Inputs

- `V34CharacterAssetContract`
- action template library
- part map
- foreground derivative

## Outputs

- `V34RigFrameSeed`
- `V34GeneratedActionPack`
- 8 actions：idle、walk、jump、sleep、eat、play、alert、celebrate
- runtime core projection mapping for current V30/V31/V32/V33 gates
- per-action frameSequence manifest
- contact sheet
- playback evidence ref
- generation QA result

## Acceptance

通过条件：

- 至少 2 个不同猫样本生成各自的 8 动作候选，或记录稳定 blocked reason；
- 每个动作都有局部部位、姿态、表情、耳朵、尾巴、四肢或语义符号变化；
- target actions 和 runtime core projection 都必须可审计；
- transform-only negative candidate 被拒绝；
- 每个 passed action pack 通过 V30/V31/V32/V33/V34 gates。

失败条件：

- 只有整图缩放、旋转、平移；
- 两只不同猫复用同一个角色帧；
- target action 和 runtime projection 混写、缺映射或无说明；
- 缺少核心动作；
- contact sheet 或播放证据缺失。

## Evidence

生成：

`docs/V34.x/evidence/v34_5-rig-frame-synthesis-YYYY-MM-DD.md`

evidence 必须包含 contact sheet、frame manifest summary、QA table、blocked/failed reason 和 scans。
