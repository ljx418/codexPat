# PRD: Agent Desktop Pet V12 Desktop Visibility & Evidence Hardening

版本：V12 active PRD  
日期：2026-06-07  
状态：V12 scoped accepted；V11 scoped final accepted。  

## 1. Product Positioning

`agent-desktop-pet` 已经在 V11 证明了 living work-cat 的交互与动画体验。
V12 的目标不是继续增加新猫动作，而是解决真实用户验收中的可信度问题：

```text
运行态捕获能看到猫
  -> 真实 macOS 桌面必须稳定看到猫
  -> 截图/验收 HTML 必须直接展示真实效果
  -> 用户不需要自己重新构建、运行、点击才能验收
```

V12 是 **Desktop Visibility & Evidence Hardening** 阶段。

## 2. Current Baseline

已完成基线：

- V10.16 selected benchmark track passed scoped。
- V11 living work-cat interaction experience passed for tested local desktop scenarios。
- V11.7 HTML 汇总页已包含运行态 capture 截图。

当前真实 gap：

- V11 验收中，`living-work-cat-v1` 的运行态 capture 页面能看到猫。
- 但真实 macOS 桌面全屏截图和宠物位置区域截图没有捕获到浮层猫。
- 这会造成用户无法仅靠汇报页确认“桌面上真的有猫”。

## 3. V12 Product Goal

V12 结束后，用户应该能：

- 启动应用后，在真实 macOS 桌面上稳定看到猫。
- 切换浏览器、终端、编辑器、桌面 Space 后，猫仍有可解释的可见性行为。
- 在设置页或诊断页看到“为什么当前猫可见 / 不可见”的明确原因。
- 打开验收 HTML 后，直接看到真实桌面截图、窗口诊断、运行态截图和失败说明。
- 不需要自己重新构建、运行、点按钮，仍能判断本阶段是否通过。

## 4. V12 User Scenarios

| 场景 | 用户体验 | V12 验收重点 |
| --- | --- | --- |
| 首次打开 | 用户启动应用，10 秒内真实桌面上能看到猫。 | 真实 `screencapture` 截图必须看到猫。 |
| 切换窗口 | 用户在浏览器、终端、编辑器之间切换，猫不应不可解释地消失。 | 层级、focus、always-on-top、Space 行为有诊断。 |
| 多显示器/单显示器 | 用户移动显示器、改变窗口位置后，猫仍在可见区域或自动恢复。 | safe position / reset position evidence。 |
| 验收报告 | 用户打开 HTML 就能看到效果图和失败/通过判断。 | HTML 内嵌真实截图，不只是链接列表。 |
| 截图失败 | 如果系统截图没有捕获猫，报告必须说明原因和诊断字段。 | 不允许用运行态截图冒充真实桌面截图。 |
| 多猫场景 | 多只猫可见性互不污染；目标猫测试不隐藏默认猫。 | target isolation。 |

## 5. V12 Phase Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V12.1 | Desktop visibility diagnostics baseline | passed scoped |
| V12.2 | Pet window layering / focus / Space hardening | passed scoped |
| V12.3 | Real screenshot evidence harness | passed scoped |
| V12.4 | First-run real desktop visual proof | passed scoped |
| V12.5 | Multi-window / monitor / reset regression | passed scoped |
| V12.6 | Complete acceptance HTML with embedded screenshots | passed scoped |
| V12.7 | Final desktop visibility gate | passed scoped |

## 6. Target Architecture

```text
Tauri App Startup
  -> PetWindowLifecycleController
  -> WindowVisibilityDiagnostics
  -> WindowLayeringPolicy
  -> SafePositionController
  -> EvidenceCaptureHarness
  -> AcceptanceHtmlReporter
```

V12 不改变 PetEvent、Codex monitoring、asset manifest、renderer 安全边界。

## 7. Acceptance Model

V12 may pass only after:

- real desktop screenshot shows a visible cat in the tested local macOS scenario.
- evidence explains window state, position, visibility, focus/layer, monitor, and Space assumptions.
- screenshot harness captures desktop, pet region, settings/diagnostics, and report page.
- HTML report embeds actual screenshots and states whether each path passed or failed.
- V3/V4/V10/V11 regression remains green.
- security scan and claim scan pass.

## 8. Forbidden Claims

V12 must not claim:

```text
production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified
```

## 9. Allowed Final Claim

Allowed after V12.7 passed:

```text
V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.
```

## 10. Review Sources

- `docs/V12.x/v12_x-development-plan.md`
- `docs/V12.x/v12_x-acceptance-plan.md`
- `docs/V12.x/v12_x-target-architecture.md`
- `docs/V12.x/v12_x-current-gap-analysis.md`
- `docs/V12.x/v12_x-milestones.md`
- `docs/V12.x/v12_x-claim-matrix.md`
- `docs/V12.x/v12_x-exit-criteria.md`
- `docs/active/current-vs-target-gap.drawio`
