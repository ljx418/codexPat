# PRD: Agent Desktop Pet V18 User Photo to Multi-action 2D Pet Workflow

版本：V18 active PRD  
日期：2026-06-12  
状态：planned；V17.0-V17.7 scoped passed 是输入基线，不作为 V18 passed evidence。

## 1. Product Positioning

V18 的目标是把 V17 已完成的“照片向导 + 动作表导入 + 预览 + 应用/回滚”升级为真正的普通用户闭环：

```text
用户直接输入一张猫图
  -> 明确同意上传/生成
  -> provider 或真实生成源基于该图生成多动作 2D 资产
  -> 系统自动归一化、质检和打包
  -> 用户在设置页预览 8 个动作
  -> 用户一键应用到指定宠物
  -> 不满意可回滚，上一只可见宠物不丢失
```

V18 不是 3D 阶段，不追求 Petdex parity、marketplace、生产签名发布、Windows 或 cross-platform。V18 只证明“用户输入猫图到 2D 多动作资产”的 tested local provider scenario。

## 2. Baseline

已完成能力：

- V17.1：设置页向导壳、照片预览、同意状态和安全 metadata。
- V17.2：生成模式与 loading/status/reasonCode UX。
- V17.3：4x2 action sheet 自动切图、打包成 `pet.json + frames`。
- V17.4：8 动作模态预览 QA。
- V17.5：target-only apply、retry、rollback。
- V17.7：MiniMax text-to-image provider API 可生成一张 4x2 动作表并进入 V17 打包链路。

未完成能力：

- 真实本地猫图作为 provider reference image 上传并驱动生成。
- image-to-image provider adapter、job lifecycle、credential/consent/redaction 证据。
- 生成结果和输入猫图之间的 same-cat identity QA。
- 在一个用户向导中完成“选图 -> 生成 -> 预览 -> 应用”的完整 E2E。
- 任意猫 automatic photo-to-2D ready、provider integration verified 或 Petdex parity。

## 3. V18 Product Goal

V18 完成后，用户可以：

1. 在设置页打开“照片生成动作资产”向导。
2. 选择或拖入一张猫照片。
3. 看到照片预览、安全 metadata、上传 consent、费用/隐私/留存/授权说明。
4. 输入或确认猫的外观 traits 和目标 pack 名称。
5. 点击生成，系统使用受控 provider image-to-image 路径生成 8 个 core actions。
6. 系统自动读取 provider 输出，归一化为 4x2 action sheet 或 frame sequence。
7. 系统执行 nonblank、出框、首尾闭合、帧间连续、same-cat identity、敏感字段扫描。
8. 用户在同一向导中预览 8 个动作并确认质量。
9. 用户选择目标宠物并应用；失败时保留 previous active pack。
10. 用户可一键回滚到应用前的宠物资产。

## 4. Core User Scenarios

| Scenario | User Story | Acceptance Signal |
| --- | --- | --- |
| Turn my cat into a pet | 用户选择一张本地猫图，系统生成 8 个动作。 | 真实 provider image-to-image evidence；不是纯文本 prompt 或 fixture。 |
| Understand consent | 用户在上传前看到费用、隐私、留存、授权说明。 | 未勾选 consent 时不能调用 provider。 |
| See progress | 用户看到 queued/running/output_received/packaging/qa_ready/blocked 状态。 | 每个失败都有 stable reasonCode。 |
| Preview before apply | 用户看到 8 个动作的动图/帧预览和 QA 结果。 | QA failed pack 不能应用。 |
| Apply safely | 用户选择目标猫，只有目标猫改变。 | default/unrelated pets unchanged。 |
| Recover safely | 用户不满意或失败后回滚。 | previous active pack preserved and restored。 |

## 5. V18 Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V18.0 | Scope freeze, claim boundary, PRD/drawio sync | planned |
| V18.1 | Reference photo consent, credential, provider boundary | planned |
| V18.2 | Image-to-image provider adapter and job lifecycle | planned |
| V18.3 | Multi-action output normalizer and pack assembly | planned |
| V18.4 | Same-cat and continuity QA gate | planned |
| V18.5 | In-app preview, target apply, rollback E2E | planned |
| V18.6 | Final acceptance gate with screenshots/HTML/security/claim scan | planned |

## 6. Out of Scope

V18 不做：

- automatic photo-to-2D ready for arbitrary cats。
- provider integration verified。
- Petdex parity。
- 3D ready / automatic photo-to-3D。
- remote asset marketplace。
- production signed / notarized release。
- Windows / cross-platform。
- OS-level Codex window binding ready。

## 7. Allowed Claim

只有 V18.1-V18.6 都有真实 passed evidence 后，才允许声明：

```text
V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local image-to-image provider scenario with in-app preview, target apply, and rollback.
```

如果真实 image-to-image provider output 不存在，V18.6 必须 blocked，不得用 V17 text-to-image action sheet 或手工导入替代。

## 8. Review Sources

- `docs/V18.x/v18_x-development-plan.md`
- `docs/V18.x/v18_x-detailed-development-and-acceptance-plan.md`
- `docs/V18.x/v18_x-acceptance-plan.md`
- `docs/V18.x/v18_x-target-architecture.md`
- `docs/V18.x/v18_x-current-gap-analysis.md`
- `docs/V18.x/v18_x-claim-matrix.md`
- `docs/V18.x/v18_x-milestones.md`
- `docs/V18.x/v18_x-exit-criteria.md`
- `docs/V18.x/v18_x-implementation-contract.md`
- `docs/V18.x/v18_x-provider-capability-preflight.md`
- `docs/V18.x/v18_x-wizard-state-and-evidence-spec.md`
- `docs/active/current-vs-target-gap.drawio`
