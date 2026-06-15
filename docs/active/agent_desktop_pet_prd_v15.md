# PRD: Agent Desktop Pet V15 Living Desktop Interaction Upgrade

版本：V15 active PRD  
日期：2026-06-09  
状态：V15.0-V15.13 passed scoped；V14 premium pet gallery and stable animated asset experience is the accepted scoped baseline；post-V15 work requires a new scoped plan。  

## 1. Product Positioning

V15 的目标是把 Agent Desktop Pet 从“可浏览、可切换、动画稳定的桌面宠物产品”推进到“像真的桌面伙伴一样会回应用户、会自主活动、会被自然拖拽、会在工作状态和用户交互之间保持一致行为的 living desktop pet”。

V15 先聚焦本地桌面交互体验；V15.9 已完成照片导入、隐私脱敏、no-default-upload 与 explicit consent scoped evidence；V15.10 已完成用户批准猫特征和 digest-only 8-action prompt pack scoped evidence；V15.11 已完成 import-ready provider/import branch scoped evidence，真实 provider 分支仍未运行；V15.12 已完成本地帧装配与连续性校验 scoped evidence；V15.13 已完成“预览/应用该猫 2D 多动作资产”的 scoped preview/apply 证据。V15 不做 Petdex parity、远程 marketplace、3D ready、automatic photo-to-3D ready、provider integration verified、production signed release、Windows、cross-platform 或 OS-level Codex window binding。未通过真实 provider 和任意猫端到端证据前，也不得声明 automatic photo-to-2D ready。

## 2. Current Baseline

当前已完成：

- V11：living work-cat interaction experience passed scoped。
- V12：真实桌面可见性与截图验收 passed scoped。
- V13：本地 macOS beta user-ready closure passed scoped。
- V14：本地 premium animated pet gallery、稳定 2D 动画播放、收藏、预览、一键切换 passed scoped。

当前体验差距：

```text
高质量动画宠物图库
  -> 猫能被自然拖拽
  -> 猫能自主走动 / 停下 / 转身 / 小憩
  -> 猫能感知鼠标靠近 / 悬停 / 点击 / 双击
  -> 猫能在 Codex 状态、用户交互、idle 行为之间做优先级合成
  -> 用户能配置互动强度与安静模式
  -> 最终用真实桌面截图/录制式证据证明体验可见
  -> 用户可以从自己的猫照片出发，安全生成或导入该猫的 2D 多动作资产
```

## 3. V15 Product Goal

V15 结束后，用户应该能体验到：

- 猫在桌面上不只是循环播放状态动画，而是会自然呼吸、眨眼、观察、伸懒腰、睡觉、醒来。
- 鼠标靠近猫时，猫会抬头、看向鼠标、耳朵/尾巴有反馈。
- 单击/双击猫时，猫有明确但不打扰工作的反馈动作。
- 拖拽猫时，猫表现出“被拿起/悬空/释放落地/站稳”的连续动作，不再像拖动一张图片。
- 猫可以在安全桌面区域内自由走动、停下、转身、靠近边缘时避让。
- 工作状态仍然可信：`error`、`need_input`、`running`、`thinking` 不被 idle/random/click 误覆盖。
- 用户可以在设置页打开/关闭自由走动、鼠标互动、拖拽物理、动作频率、安静模式。
- 用户可以选择一张猫照片，在隐私/同意边界内确认猫的视觉特征，生成 8 个核心动作的 prompt 或 provider 输出，并把通过连续性校验的 2D 动作包预览、应用到指定猫。

## 4. User Scenarios

| 场景 | 用户能做什么 | V15 验收重点 |
| --- | --- | --- |
| 桌面陪伴 | 猫在空闲时自主眨眼、摆尾、伸懒腰、睡觉、醒来。 | idle scheduler 不发 PetEvent、不改 agent state。 |
| 鼠标靠近 | 猫抬头看鼠标、转头、耳朵动，不抢走工作状态。 | pointer-near priority and visual evidence。 |
| 点一下猫 | 猫抬爪、眨眼、轻微反馈。 | click feedback does not mutate CatStateMachine。 |
| 双击猫 | 猫跳一下、翻身或更明显的愉悦反馈。 | double-click priority higher than click。 |
| 拖动猫 | 猫进入 grabbed/dragging/release/land 动作，位置持久化。 | no image ghost / no dragged-out asset / persisted position。 |
| 自由走动 | 猫在安全区域走动、停下、转身，避开屏幕边缘。 | autonomous walk bounded and configurable。 |
| Codex 出错 | 猫仍保持 error 表达，不被点击或 idle 覆盖。 | priority: error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random。 |
| 安静工作 | 用户开启安静模式，减少自由走动和强动作。 | settings persistence and low-motion mode。 |
| 自己的猫 | 用户选择一张猫照片，确认毛色/花纹/眼睛等特征，生成或导入该猫的 8 动作 2D 资产包。 | no raw photo leakage、explicit consent、8 action coverage、continuity、target-only apply。 |

## 5. V15 Phase Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V15.0 | Scope freeze, PRD/spec/drawio sync | passed scoped |
| V15.1 | Interaction priority model and living scheduler rebaseline | passed scoped |
| V15.2 | Drag physics and release/land animation | passed scoped |
| V15.3 | Pointer-aware click/double-click/hover behavior | passed scoped |
| V15.4 | Autonomous walk and edge-aware motion | passed scoped |
| V15.5 | Emotion/action composer for agent + user interaction | passed scoped |
| V15.6 | Desktop Manager interaction settings and preview | passed scoped |
| V15.7 | Final desktop interaction QA gate | passed scoped |
| V15.8 | Default/gallery 2D animation continuity hardening | passed scoped |
| V15.9 | Photo intake, privacy, EXIF/path redaction, explicit consent | passed scoped |
| V15.10 | Cat trait review and 8-action prompt pack generation | passed scoped |
| V15.11 | Named-provider 2D generation smoke or import-ready prompt branch | passed scoped import-ready |
| V15.12 | Generated/imported frame continuity assembly and pack validation | passed scoped |
| V15.13 | Desktop Manager preview, target-pet apply, final photo-to-2D gate | passed scoped |

## 6. Target Architecture

```text
V14 Premium Gallery Baseline
  -> InteractionPriorityEngine
  -> LivingIdleScheduler
  -> DragPhysicsController
  -> PointerAwarenessController
  -> AutonomousWalkController
  -> EmotionActionComposer
  -> InteractionSettingsStore
  -> DesktopInteractionEvidenceHarness
  -> PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> Photo2DPromptPackGenerator
  -> ProviderOrImportBranch
  -> Photo2DContinuityAssembler
  -> GeneratedPackPreviewApplyFlow
```

V15 不改变 PetEvent schema、Codex monitoring、MCP、third-party integration、provider pipeline、3D renderer readiness 或 production release 语义。

## 7. Acceptance Model

V15.0-V15.6 plus V15.7 final QA and V15.8 continuity hardening may be treated
as passed only after:

- all V15.1-V15.6 evidence exists and is passed / blocked / failed explicitly.
- drag interaction proves no dragged-out image artifact and persisted final position.
- pointer/click/double-click evidence proves visual response and zero PetEvent.
- autonomous walk stays within safe desktop bounds and can be disabled.
- priority checks prove `error` and `need_input` are not overwritten by idle, pointer, click, success, or walk.
- settings UX lets users tune or disable interaction features.
- final HTML embeds real desktop screenshots/captures and summarizes before/after user scenarios.
- security scan, claim scan, regression scan, and PRD/spec review pass.
- V15.8 2D continuity hardening proves scoped default/gallery 2D core actions have closed first/final frames and bounded adjacent-frame deltas.
- V15.9-V15.13 may pass only after photo privacy/consent, trait approval, 8-action generation/import, continuity assembly, preview, target-only apply, security scan, claim scan, and screenshot/contact/runtime evidence pass or explicitly block.

## 8. Forbidden Claims

V15 must not claim:

```text
Petdex parity achieved
Petdex ecosystem parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
automatic photo-to-2D ready
automatic photo-to-animation ready
photo customization ready for arbitrary cats
remote asset loading ready
asset marketplace ready
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
OS-level Codex window binding ready
all Codex workflows verified
```

## 9. Allowed Final Claim

Allowed only after V15.7 passed:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

This does not imply Petdex parity, production release readiness, 3D readiness, provider readiness, Windows support, or cross-platform support.

Allowed only after V15.13 evidence:

```text
V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios.
```

This does not imply automatic photo-to-2D readiness for arbitrary cats, provider integration verified, marketplace readiness, production release readiness, or 3D readiness.

## 10. Review Sources

- `docs/V15.x/v15_x-development-plan.md`
- `docs/V15.x/v15_x-acceptance-plan.md`
- `docs/V15.x/v15_x-target-architecture.md`
- `docs/V15.x/v15_x-current-gap-analysis.md`
- `docs/V15.x/v15_x-milestones.md`
- `docs/V15.x/v15_x-claim-matrix.md`
- `docs/V15.x/v15_x-exit-criteria.md`
- `docs/V15.x/v15_x-implementation-contract.md`
- `docs/V15.x/v15_0-scope-freeze-checklist.md`
- `docs/V15.x/v15_1-interaction-priority-spec.md`
- `docs/V15.x/v15_2-drag-physics-release-spec.md`
- `docs/V15.x/v15_3-pointer-feedback-spec.md`
- `docs/V15.x/v15_4-autonomous-walk-spec.md`
- `docs/V15.x/v15_5-emotion-action-composer-spec.md`
- `docs/V15.x/v15_6-interaction-settings-preview-spec.md`
- `docs/V15.x/v15_7-final-qa-evidence-plan.md`
- `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-YYYY-MM-DD.md`
- `docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md`
- `docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md`
- `docs/active/current-vs-target-gap.drawio`
