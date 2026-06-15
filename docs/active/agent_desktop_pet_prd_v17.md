# PRD: Agent Desktop Pet V17 Photo-to-2D Productized Wizard

版本：V17 active PRD  
日期：2026-06-11  
状态：V17.0-V17.7 scoped passed；V16 passed scoped 是输入基线，MiniMax text-to-image action-sheet API passed scoped；local photo upload to provider remains not-ready。

## 1. Product Positioning

V17 的目标是把 V16 已证明可行的“照片到 2D 多动作资产”从工程验收链路升级为普通用户可操作的产品流程。

用户不应该再阅读命令、复制 smoke 步骤或手动理解 evidence 文件。用户应该在设置面板或加载模态窗里完成：

```text
选择猫照片
  -> 查看照片预览和隐私说明
  -> 选择生成方式
  -> 看到生成 / 等待 / 上传动作表 / 打包进度
  -> 看到 8 个动作预览和质量检查结果
  -> 一键应用到目标猫
  -> 不满意可重试 / 回滚 / 保留上一只可见猫
```

V17 不追求 3D、marketplace、生产签名发布、Windows、cross-platform、Petdex parity 或 provider integration verified。它只做 2D 多动作资产产品化向导，并在 V17.7 补齐了一个 scoped MiniMax text-to-image action-sheet API 路径。

## 2. Baseline

已完成能力：

- V15.9-V15.13：照片 intake、traits、prompt/import-ready、连续性组装、preview/apply。
- V16.0-V16.6：host image tool 测试场景下，真实 8-action 输出、同猫一致性、自动打包、preview/apply、final HTML evidence 已 scoped passed。
- 当前设置页已有一个说明型向导壳子，但它只是展示流程、复制提示词，不是完整产品流程。

未完成能力：

- 用户不能在一个向导中完成照片预览、生成状态、动作表上传/切图、质量结果、目标猫应用。
- 当前 provider/job 流程仍偏工程证据，不是普通用户能理解的状态机。
- 当前 `docs/猫.jpg` 这样的照片还没有一键通过 UI 生成并应用到猫。
- 还没有将 4x2 动作表上传、自动切图、连续性检查、应用到目标猫收敛到一个加载模态窗。

## 3. V17 Product Goal

V17 完成后，用户可以：

1. 在设置页打开“照片生成动作资产”向导。
2. 选择或拖入一张猫照片。
3. 看到照片预览、格式/大小摘要、隐私说明和同意项。
4. 选择生成模式：
   - Host image tool assisted：复制提示词、上传动作表结果。
   - Provider API：V17.7 已验证 MiniMax text-to-image 生成 4x2 动作表的 scoped 路径；本地照片直传 provider 仍 not-ready。
   - Local action sheet import：直接上传外部生成的 4x2 动作表。
5. 看到明确进度状态和稳定 reasonCode。
6. 上传或获得 4x2 动作图后，由系统自动识别 8 个动作格子。
7. 系统自动切图、生成 frame sequence、生成 `pet.json`。
8. 系统执行 nonblank、首尾闭合、帧间连续、出框、同猫一致性、敏感字段扫描。
9. 用户在模态窗中预览 8 个动作。
10. 用户选择目标猫，一键应用；失败则保留原资产并显示原因。

## 4. Core User Scenarios

| Scenario | User Story | Acceptance Signal |
| --- | --- | --- |
| Make my cat alive | 用户选择 `docs/猫.jpg` 或任意本地猫照片，看到预览和隐私摘要。 | 不显示完整路径，不保存 EXIF/GPS，不上传默认关闭。 |
| Generate actions without reading docs | 用户点击向导，按模式完成动作图生成。 | 向导展示状态、下一步、reasonCode，不要求用户读命令文档。 |
| Upload a 4x2 action sheet | 用户上传外部生成动作表，系统自动切成 8 个动作。 | 8 action cells detected; no manual crop required in happy path. |
| Quality gate before apply | 用户看到每个动作的通过/失败原因。 | nonblank、first/final、frame delta、off-canvas、same-cat review visible. |
| Apply safely | 用户选择目标猫并应用。 | Only target PetInstance changes; default/unrelated pets unchanged. |
| Bad output recovery | 动作表缺格、透明、跳帧、身份不一致。 | Previous active pack preserved; visible fallback remains. |

## 5. V17 Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V17.0 | Scope freeze, PRD, claim matrix, drawio sync | planned |
| V17.1 | Productized wizard shell with photo preview, consent, state machine | planned |
| V17.2 | Generation mode selector and provider/manual job status UX | planned |
| V17.3 | 4x2 action sheet upload, crop, pack normalization | planned |
| V17.4 | In-modal QA: 8-action preview, continuity, same-cat, reasonCodes | planned |
| V17.5 | Target-pet apply, rollback, retry, previous pack preservation | planned |
| V17.6 | Final visual/security/regression/claim gate with HTML report | planned |

## 6. Out of Scope

V17 不做：

- automatic photo-to-2D ready for arbitrary cats.
- fully automatic provider integration verified.
- 3D ready / photo-to-3D.
- remote asset marketplace.
- production signed / notarized release.
- Windows / cross-platform.
- Petdex parity.

## 7. Allowed Claim

V17.6 真实证据通过后，允许声明：

```text
V17 photo-to-2D action asset wizard passed for tested local photo, action-sheet import, preview, target apply, and rollback scenarios.
```

如果 provider API 未打通，但 host/manual 动作表路径通过，claim 必须收窄：

```text
V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready.
```

V17.7 MiniMax provider API addendum 通过后，最终 V17 claim 收窄为：

```text
V17 photo-to-2D wizard passed for tested local photo/action-sheet import and tested MiniMax text-to-image action-sheet API scenarios; local cat photo upload to provider and arbitrary-cat automatic generation remain not-ready.
```

## 8. Review Sources

- `docs/V17.x/v17_x-development-plan.md`
- `docs/V17.x/v17_x-acceptance-plan.md`
- `docs/V17.x/v17_x-target-architecture.md`
- `docs/V17.x/v17_x-claim-matrix.md`
- `docs/V17.x/v17_x-current-gap-analysis.md`
- `docs/V17.x/v17_x-milestones.md`
- `docs/V17.x/v17_x-exit-criteria.md`
- `docs/V17.x/v17_x-implementation-contract.md`
- `docs/active/current-vs-target-gap.drawio`
