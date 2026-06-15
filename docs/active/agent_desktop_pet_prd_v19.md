# PRD: Agent Desktop Pet V19 Petdex-style Motion Sheet Experience

版本：V19 active PRD  
日期：2026-06-12  
状态：planned；V18.0-V18.6 passed scoped 是输入基线，不作为 V19 passed evidence。

## 1. Product Positioning

V19 的目标是把 V18 的“用户猫图 -> provider canonical identity image -> 本地派生 8 动作包”升级为更接近优秀桌宠产品的高动作幅度 2D 动画体验：

```text
用户输入猫图
  -> provider 或本地导入生成同一只猫的 motion sheet
  -> 系统按 Petdex-style 动作表裁切、校验、打包
  -> 用户在设置页看到高幅度动作预览
  -> 一键应用到指定宠物
  -> 不满意可回滚
```

V19 不以“Petdex parity achieved”为目标，也不复用或内置 Petdex 社区资产。Petdex 只作为结构、帧数、动作幅度和用户体验参考。除非后续取得明确授权和 license evidence，否则不得将 Petdex 用户提交资产打包进本项目。

## 2. Baseline

已完成能力：

- V18.2：MiniMax image-to-image/reference-image path passed scoped。
- V18.3：使用同一 canonical identity image 派生 8 个本地动作包。
- V18.4：same-cat source hash、nonblank、off-canvas、continuity QA passed scoped。
- V18.5：预览、target-only apply、rollback model path passed scoped。
- V18.6：final HTML/regression/security/claim gate passed scoped。

关键不足：

- V18 动作来自同一张 canonical image 的本地 transform，动作幅度明显低于 Petdex-style 多帧重绘资产。
- 生成资产在用户视觉上可能仍像“轻微抖动”，不够像自然动作。
- 当前没有一套产品化的 motion sheet 输入、裁切、幅度 QA、预览、应用闭环。
- 不能声明 Petdex parity、arbitrary cats automatic photo-to-animation ready、provider integration verified。

## 3. V19 Product Goal

V19 完成后，用户可以：

1. 在设置页选择“生成高动作幅度 2D 动作表”。
2. 输入一张猫图，或导入一张符合安全格式的 motion sheet。
3. 看到上传/生成 consent、provider boundary、license/attribution 提示。
4. 由 provider 生成或用户导入一个单张 motion sheet，优先避免每个动作单独生成造成同猫漂移。
5. 系统按 8 个 core actions 自动裁切帧序列。
6. 系统执行 nonblank、透明背景、出框、首尾闭合、帧间连续、动作幅度、same-cat continuity、license/安全扫描。
7. 用户在 Desktop Manager 预览每个动作的真实动画。
8. 用户将通过 QA 的 pack 应用到目标宠物；失败时 previous active pack 保留。
9. 用户可回滚到应用前的资产。

## 4. User Scenarios

| Scenario | User Story | Acceptance Signal |
| --- | --- | --- |
| Make my cat feel alive | 用户输入猫图后得到动作幅度明显的 8 动作 2D 动画。 | 动作幅度 QA 达标，至少 6 个动作肉眼可辨优于 V18 transform baseline。 |
| Import a motion sheet | 用户从外部工具拿到一张动作表并导入。 | motion sheet 被裁切、校验、预览、应用，失败时不破坏当前宠物。 |
| Avoid inconsistent cats | 用户不接受每个动作像不同猫。 | 单 sheet source 或同一 provider job 证据；same-cat QA 和人工可视验收通过。 |
| Preview before switching | 用户可先看每个动作再应用。 | isolated preview zero PetEvent，不写 CatStateMachine。 |
| Recover safely | 用户应用后不满意可回滚。 | target-only apply and rollback passed；default/unrelated pets unchanged。 |

## 5. V19 Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V19.0 | Scope freeze, Petdex resource boundary, claim matrix | planned |
| V19.1 | Petdex-compatible motion sheet format and safe import spec | planned |
| V19.2 | Provider single-sheet generation path or blocked decision | planned |
| V19.3 | Sheet crop, normalize, pack assembly | planned |
| V19.4 | Motion amplitude and same-cat QA | planned |
| V19.5 | Manager preview, target apply, rollback | planned |
| V19.6 | Final screenshot-backed gate | planned |

## 6. Out of Scope

V19 不做：

- Petdex parity achieved。
- 使用或分发 Petdex 社区资产。
- arbitrary cats automatic photo-to-animation ready。
- provider integration verified。
- 3D ready / automatic photo-to-3D。
- Rive / Live2D。
- remote asset marketplace。
- production signed / notarized release。
- Windows / cross-platform。

## 7. Allowed Claim

只有 V19.0-V19.6 都有真实 evidence 后，才允许使用最窄声明：

```text
V19 Petdex-style high-amplitude 2D motion sheet workflow passed for tested local/provider-generated same-cat sprite sheet scenarios with preview, target apply, rollback, and license-safe boundaries.
```

如果 provider 无法生成合格 motion sheet，只能声明：

```text
V19 provider motion-sheet branch blocked; local Petdex-format import/QA may pass scoped.
```

## 8. Review Sources

- `docs/V19.x/v19_x-development-plan.md`
- `docs/V19.x/v19_x-detailed-development-and-acceptance-plan.md`
- `docs/V19.x/v19_x-acceptance-plan.md`
- `docs/V19.x/v19_x-target-architecture.md`
- `docs/V19.x/v19_x-current-gap-analysis.md`
- `docs/V19.x/v19_x-claim-matrix.md`
- `docs/V19.x/v19_x-milestones.md`
- `docs/V19.x/v19_x-exit-criteria.md`
- `docs/V19.x/v19_x-implementation-contract.md`
- `docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md`
- `docs/V19.x/v19_x-petdex-resource-boundary.md`
- `docs/active/current-vs-target-gap.drawio`
