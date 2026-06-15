# PRD: Agent Desktop Pet V11 Living Work-Cat Interaction Experience

版本：V11 active PRD  
日期：2026-06-07  
状态：V11 living work-cat interaction experience passed for tested local desktop scenarios。  

## 1. Product Positioning

`agent-desktop-pet` 是面向本地开发者的低打扰 AI Agent 状态桌宠。V11 的目标是把 V10 已接受的 animated work-cat 从“状态动画组件”升级为“有生命感的桌面工作猫”。

V11 不重开 Codex monitoring、provider generation、3D、marketplace、release-signing 或跨平台路线。

## 2. Current Baseline

当前可复用基线：

- V3.x / V4.x：Codex wrapper、JSONL monitor、hooks、managed session、Terminal.app scoped binding 等已 scoped accepted。
- V5.x / V6.x / V7.x / V8.x / V9.x：资产、个性化、provider / 3D / animated sprite 相关能力已有 scoped evidence，但不构成 broad provider / 3D / photo-to-3D readiness。
- V10.16：selected open-source visual/onboarding benchmark track passed scoped。
- V11.1：living idle system passed scoped，包含 3-minute varied idle、sleep/wake、priority blocking、zero PetEvent。

当前 active target：

```text
V11.2 pointer-aware interaction passed scoped.
V11.3 emotion layer passed scoped.
V11.4 visual ActionComposer passed scoped.
V11.5 flagship living cat passed scoped.
V11.6 first-run living pet delight passed scoped.
V11.7 final gate passed for scoped local living work-cat interaction experience.
```

## 3. V11 Product Goal

V11 需要让桌宠具备日常陪伴感：

- 空闲时能表现眨眼、看向用户、尾巴摆动、伸展、安定、打盹、醒来。
- 用户靠近、点击、双击、拖动、放下时有即时反馈。
- 8 个核心状态具备明确情绪表达：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`。
- 动作切换不是机械替换，而是通过 enter / loop / exit / transient 组合。
- 首次打开应用优先看到“活的猫”，而不是先进入配置。
- 所有本地交互不产生 Agent/Codex 状态副作用。

### 3.1 User-Facing Experience Gate

V11 阶段结束后，用户应该能在本地桌面上拥有一只“有生命感的工作猫”：

- 它能日常待机、睡觉、醒来、看向用户、响应鼠标靠近 / 点击 / 双击 / 拖拽。
- 它能把 Codex / Agent 的工作状态转译成清晰可见的情绪和动作。
- 它能在首次启动时无需阅读大量内部文档就被用户感知和理解。
- 它不会把本地鼠标交互误写成 Agent 状态，也不会影响其他猫。

V11 通过不是因为代码存在，而是因为用户能在真实桌面运行中看到、理解、操作一只有生命感的工作猫。

当前项目已经具备的用户能力：

- 用户可以启动一个 macOS 桌面宠物应用。
- 用户可以看到多只桌面猫，并管理不同猫实例。
- 用户可以创建 Codex 工作猫。
- 用户可以通过 wrapper-launched Codex exec JSONL 路径把 Codex 状态映射到指定猫。
- 用户可以使用 scoped TUI hooks 路径，但需要 `/hooks review/trust`。
- 用户可以选择内置动态 2D 猫资产。
- 用户可以导入、预览、激活、删除本地猫资产包。
- 用户可以看到 `idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping` 等核心状态的猫动作。
- V11.1 后，猫在空闲时已经能表现眨眼、看向用户、尾巴摆动、伸展、打盹、醒来等 living idle 行为。

V11 完成后的目标用户体验：

- 用户首次打开应用 10 秒内能看到一只可爱的、会动的工作猫。
- 用户不需要先理解 PetEvent、manifest、renderer、hook、JSONL 等内部概念。
- 鼠标靠近猫，猫能注意到用户。
- 点击猫，猫有即时反馈。
- 双击猫，猫有更明显的亲近反馈。
- 拖动猫，猫能表现抓住、被拖动、放下 / 落地的完整反馈。
- Codex 思考、运行、成功、警告、出错、等待用户输入时，目标猫能有肉眼可分辨的表情和动作。
- 多只猫同时存在时，只影响目标猫，不影响默认猫或其他 Codex 猫。
- 猫的动作切换自然，不空白、不透明、不出画、不闪烁。
- 本地鼠标交互只是视觉反馈，不会冒充 Codex / Agent 状态。

### 3.2 User Scenarios

场景 A：开发者启动 Codex 工作猫。

用户从桌面管理器创建一只 Codex 工作猫，复制推荐 wrapper 命令启动 Codex。当 Codex 开始处理任务时，猫进入 `thinking` / `running`；当需要用户确认时，猫进入 `need_input`；任务完成后猫进入 `success` transient 并回到 `idle`。

场景 B：用户不想盯终端。

用户让 Codex 跑测试或改代码，然后把注意力转到浏览器或编辑器。用户只需要用余光看猫：猫忙碌表示还在工作，猫警觉表示需要输入，猫沮丧表示出错。

场景 C：多个 Codex session 多只猫。

用户同时开两个 Codex 工作流：一个修 bug，一个写文档。每个 session 对应一只猫，状态互不串扰；一只猫出错不会让另一只猫变成 `error`。

场景 D：桌面陪伴感。

即使没有 Codex 事件，猫也不会像静态贴纸。它会眨眼、看向用户、甩尾巴、伸懒腰、打盹；鼠标靠近会醒来或看向用户。

场景 E：用户整理桌面。

用户拖动猫到屏幕角落，猫有拖拽开始、拖动中、放下反馈。放下后位置持久化，重启后仍在合理位置。

场景 F：首次使用者试用。

用户第一次打开应用，不需要读完整文档，就能看到一只活猫。用户可以点击、双击、拖动，看见反馈；也可以进入 demo 看 `thinking`、`running`、`success`、`error`、`need_input` 的状态演示。

场景 G：换猫和本地资产。

用户从内置图库切换不同猫样式，或导入本地资产包。激活失败时保留上一只可见猫，不出现透明猫或消失状态。

场景 H：安全边界。

用户点击、拖动、靠近猫不会触发 PetEvent，不会调用 `notify`，不会改变 Codex 状态。证据中不出现 token、Authorization、prompt、命令、完整本地路径或原始 payload。

## 4. V11 Phase Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V11.1 | Living idle scheduler | passed scoped |
| V11.2 | Pointer-aware hover/click/double-click/drag/drop feedback | passed scoped |
| V11.3 | Emotion layer for all 8 states | passed scoped |
| V11.4 | Priority-safe visual ActionComposer | passed scoped |
| V11.5 | Flagship `living-work-cat-v1` asset pack | passed scoped |
| V11.6 | First-run living cat delight and safe demo | passed scoped |
| V11.7 | Final interaction QA gate | passed scoped |

## 5. Target Architecture

```text
PetEvent / UserPointerEvent / TimerTick
  -> CatStateMachine
  -> InteractionStateController
  -> EmotionStateResolver
  -> ActionComposer
  -> RuntimePlaybackController
  -> RendererRegistry
  -> SpriteRenderer
  -> RuntimePetWindow / ManagerPreviewPanel
```

V11 新增的是视觉交互层，不是新的 Agent event source。

## 6. Safety Boundary

V11 micro-interactions must:

- not emit `PetEvent`.
- not call `notify`.
- not write `CatStateMachine`.
- not mutate Agent/Codex state.
- not affect default or unrelated pets.
- pass only safe action/pack/playback fields to renderer.

Renderer must not receive raw PetEvent, raw Agent/Codex payload, provider payload, prompt text, tool command text, token, Authorization, workspace path, config path, full local path, remote URL, shell command, or script source.

## 7. Acceptance Model

V11 may pass only after V11.7 verifies:

- V11.1-V11.6 final reports exist and pass.
- runtime screenshots or recordings exist for living idle, pointer interaction, state emotion, transitions, flagship pack, and first-run.
- nonblank / frame-difference / off-canvas checks pass.
- target isolation passes.
- regression passes.
- security scan passes.
- claim scan passes.
- PRD/spec review passes.
- drawio sync evidence exists.

Final allowed claim after V11.7 only:

```text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
```

## 8. Forbidden Claims

V11 must not claim:

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
per-instance queue ready
```

## 9. Review Sources

- `docs/V11.x/v11_x-development-plan.md`
- `docs/V11.x/v11_x-acceptance-plan.md`
- `docs/V11.x/v11_x-target-architecture.md`
- `docs/V11.x/v11_x-current-gap-analysis.md`
- `docs/V11.x/v11_x-claim-matrix.md`
- `docs/V11.x/v11_x-milestones.md`
- `docs/V11.x/v11_x-doc-audit.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
