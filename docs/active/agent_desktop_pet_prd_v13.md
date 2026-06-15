# PRD: Agent Desktop Pet V13 Beta Distribution & User-ready Closure

版本：V13 active PRD  
日期：2026-06-08  
状态：passed scoped；V13 beta distribution and user-ready closure accepted for tested local macOS beta workflow scenarios。  

## 1. Product Positioning

`agent-desktop-pet` 已经在 V12 证明了真实 macOS 桌面可见性与截图验收可信度。
V13 的目标不是继续扩展猫动作、3D、AI provider 或跨平台能力，而是把当前本地能力整理成一个普通 beta 用户可以理解、安装、诊断和反馈的闭环。

V13 是 **Beta Distribution & User-ready Closure** 阶段。

## 2. Current Baseline

已完成基线：

- V10 selected open-source visual/onboarding track passed scoped。
- V11 living work-cat interaction experience passed scoped。
- V12 desktop visibility and screenshot-backed acceptance passed scoped。
- 当前应用已经具备桌面猫、设置页、Codex 工作猫、内置动态图包、截图证据和 HTML 汇报能力。

当前 gap：

```text
developer-run local app
  -> beta user can open packaged app
  -> beta user can understand first-run workflow
  -> beta user can export safe diagnostics
  -> maintainer can inspect evidence without leaking sensitive data
```

## 3. V13 Product Goal

V13 结束后，用户应该能：

- 使用本地 macOS beta 包启动应用。
- 首次启动后看到工作猫，并知道下一步可以创建 Codex 工作猫或浏览内置猫。
- 复制推荐的 Codex JSONL wrapper 命令，而不会误以为 already-open Codex window 已支持自动监听。
- 一键导出诊断包，诊断包能帮助维护者定位问题，但不包含 token、Authorization、raw payload、prompt、tool command、workspace path、config path、full `/Users` path 或 `api-token.json`。
- 打开最终 HTML 汇报页，直接看到安装、首次启动、设置、猫可见性、诊断导出、性能与回归证据。

## 4. User Scenarios

| 场景 | 用户能做什么 | V13 验收重点 |
| --- | --- | --- |
| 本地 beta 试用 | 用户打开本地 macOS 包并看到活猫。 | packaging smoke + first-run screenshot。 |
| 第一次理解产品 | 用户通过首屏/设置页知道“桌面猫 + Codex 工作猫 + 本地资产”。 | first-run guide review。 |
| 创建 Codex 工作猫 | 用户复制推荐 wrapper 命令，理解 managed exec JSONL 是可靠路径。 | 文案清晰，不声明 already-open 自动监听。 |
| 反馈问题 | 用户导出安全诊断包给维护者。 | redaction scan 必须通过。 |
| 运行一段时间 | 用户保持多只猫和动画运行，应用不明显卡顿、不闪退。 | stability/performance baseline。 |
| 审计交付 | 审计者打开 HTML 汇报页即可看到截图证据和门槛结论。 | screenshot-backed report。 |

## 5. V13 Phase Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V13.1 | Product scope freeze and beta claim matrix | passed scoped |
| V13.2 | macOS local packaging / install smoke foundation | passed scoped |
| V13.3 | first-run user journey and Codex work-cat onboarding proof | passed scoped |
| V13.4 | diagnostics and support export redaction boundary | passed scoped |
| V13.5 | stability and performance baseline | passed scoped |
| V13.6 | artifact, license, and claim hygiene | passed scoped |
| V13.7 | beta readiness gate | passed scoped |

## 6. Target Architecture

```text
V12 Desktop App + Evidence Harness
  -> Beta Packaging Smoke
  -> First-run User Journey Harness
  -> Safe Diagnostics Exporter
  -> Stability / Performance Baseline
  -> Artifact / License / Claim Scanner
  -> Beta Acceptance HTML Reporter
```

V13 不改变 PetEvent、Codex monitoring、asset manifest、renderer、provider 或 OS-level binding 语义。

## 7. Acceptance Model

V13 may pass only after:

- local macOS packaging / launch smoke passes in the tested local environment.
- first-run guide and permissions text are reviewed.
- diagnostics export redaction scan passes.
- screenshot-backed HTML report includes real images for the beta workflow.
- stability/performance baseline is recorded.
- artifact/license/claim scans pass.
- V3/V4/V10/V11/V12 regression evidence remains valid or rerun as documented.

## 8. Forbidden Claims

V13 must not claim:

```text
production signed release ready
notarized release ready
auto update ready
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

Allowed only after V13.7 passed:

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

This does not imply production signed release readiness, notarization, auto-update, Windows support, cross-platform support, provider readiness, or broader Codex workflow verification.

## 10. Review Sources

- `docs/V13.x/v13_x-development-plan.md`
- `docs/V13.x/v13_x-acceptance-plan.md`
- `docs/V13.x/v13_x-target-architecture.md`
- `docs/V13.x/v13_x-current-gap-analysis.md`
- `docs/V13.x/v13_x-milestones.md`
- `docs/V13.x/v13_x-claim-matrix.md`
- `docs/V13.x/v13_x-exit-criteria.md`
- `docs/V13.x/v13_x-implementation-contract.md`
- `docs/V13.x/v13_x-doc-audit.md`
- `docs/active/current-vs-target-gap.drawio`
