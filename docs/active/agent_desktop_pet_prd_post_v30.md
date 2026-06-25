# Agent Desktop Pet PRD Post-V30

文档状态：active PRD；Post-V30 architecture/runtime remediation passed scoped。
阶段主题：Runtime Baseline and Architecture Remediation。
当前日期：2026-06-24。

## Product Goal

Post-V30 的目标是把 V30 scoped passed 之后的项目推进到可继续安全开发的工程状态：

```text
V30 semantic 2D quality claim boundary
  -> real desktop runtime baseline
  -> managed Codex workflow baseline
  -> frontend architecture slice specs
  -> Tauri / HTTP bridge architecture slice specs
  -> final remediation gate with evidence and scans
```

本阶段不扩展产品能力声明。它解决的是“后续开发能否基于真实 runtime、清晰架构和可复核 evidence 继续推进”的问题。

## Current User / Maintainer Problem

当前项目已经有大量阶段 evidence 和丰富功能代码，但 Post-V30 之后继续开发存在这些风险：

- WSL 下单测/check/V30 gate 可以通过，但不能证明真实 desktop app 和 local bridge 正在运行。
- managed Codex workflow 必须依赖运行中的 bridge，不能用 fixture-only 结果代替。
- `apps/desktop/src/main.ts`、Tauri `main.rs`、`bridge/http.rs` 都是大模块，后续改动容易扩大回归面。
- 历史文档很多，active 事实源必须明确当前阶段和 claim 边界，避免 silent pass 或过度声明。

## Target Experience

维护者接手本阶段时，应能做到：

- 按一份 runtime smoke spec 启动真实 desktop app 并验证 `127.0.0.1:17321` bridge。
- 按一份 managed Codex smoke spec 验证 wrapper-launched local workflow。
- 在改代码前，为 frontend 或 Tauri/HTTP bridge 切片写清楚边界、测试、风险和 evidence。
- 每个阶段都产出真实 evidence、PRD/spec review、claim scan、安全扫描。
- 任何 blocked / failed 状态都有稳定原因和下一步，不出现 silent pass。

完成本阶段目标后，人类审核者应能看到的目标体验是：

- 桌宠应用被真实启动，local bridge 可被同一测试环境访问。
- `petctl` 可以列出实例、发送通知，并读取不含敏感信息的诊断。
- managed Codex workflow 只在 running bridge 前提下验证一个本地 wrapper-launched 场景。
- 前端和 Rust/Tauri 代码整改前，每个切片都有明确职责、影响范围、测试和退出条件。
- 最终报告能说明“哪些已经通过、哪些稳定 blocked、哪些仍不能声明 ready”。

## Stage Split

| Stage | Product / Engineering Purpose | Current Status |
| --- | --- | --- |
| Post-V30.0 | Fact-source sync and architecture review | passed scoped |
| Post-V30.1 | Runtime desktop smoke with real app and bridge | passed scoped |
| Post-V30.2 | Managed Codex workflow smoke against running bridge | passed scoped |
| Post-V30.3 | Frontend architecture slice specs before code movement | passed scoped |
| Post-V30.4 | Tauri / HTTP bridge architecture slice specs before code movement | passed scoped |
| Post-V30.5 | Final remediation gate with regression, claim scan, security scan | passed scoped |

## Acceptance Boundary

Post-V30 通过后最多只能声明：

```text
Post-V30 architecture/runtime remediation passed for tested local runtime, managed workflow, and documented architecture-slice planning scenarios with evidence, PRD/spec review, claim scan, and security scan.
```

不得把 Post-V30 scoped evidence 扩大成无范围限定或超出 evidence 的声明：

- runtime desktop smoke passed outside the tested local runtime scenario；
- managed Codex workflow verified beyond the tested wrapper-launched local scenario；
- frontend architecture refactor completed beyond FE-1 through FE-5 scoped slices；
- Tauri / HTTP bridge refactor completed beyond RS-1 through RS-6 scoped slices。

始终不得声明：

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- all Codex workflows verified；
- OS-level Codex window binding ready；
- MCP ready；
- Claude Code integration verified；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Non-goals

- 不新增 provider/photo/3D 生成能力。
- 不在没有 runtime evidence 时声明 desktop runtime 通过。
- 不在没有 running bridge 时声明 managed Codex workflow 通过。
- 不在本阶段直接执行大规模代码拆分；代码 movement 必须先有 architecture slice evidence。
- 不改写历史版本原始 planning 文档来制造“全局通过”的假象。
