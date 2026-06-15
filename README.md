# agent-desktop-pet

`agent-desktop-pet` 是一只可常驻桌面的开发者工作猫，用来把 Codex 和本地 AI Agent 的后台状态转译为低打扰、可感知的桌面反馈。

它不是通用桌面宠物，不是通知中心，也不是聊天机器人。

## Current Status

当前 active 阶段：

- V10.11 product experience rebaseline：在 V10.1-V10.10 已验收的动画工作猫基线上，把当前能力整理成外部用户能理解、能在三分钟内试用、并且有真实截图证据的产品体验。

当前已具备的核心能力：

- `macOS-first MVP ready: local desktop agent status pet with HTTP + petctl integration and safe sound feedback.`
- `V3.1 ready: multi-instance Codex pet workflow stabilized with user onboarding, manager polish, repeatable runtime smoke, and migration guidance.`
- `V3.7 Codex exec JSONL monitor state mapping passed for tested local wrapper-launched codex exec --json scenarios.`
- `V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.`

当前推荐使用方式：

- 普通本地桌宠：启动 Tauri app 后用托盘菜单打开设置页。
- Codex 工作猫：使用 wrapper-launched `codex exec --json` JSONL monitor。
- 手动集成：使用 local HTTP Event Bridge 或 `petctl notify`。

当前不能声明：

- `Claude Code integration verified`
- `Third-party agent integration verified`
- `unqualified multi-instance Codex verified beyond tested local scenarios`
- `all Codex workflows verified`
- `V3.6 selected Codex workflow hook coverage smoke passed`
- `PostToolUse failure hook evidence passed`
- `OS-level Codex window binding ready`
- `Windows ready`
- `cross-platform ready`
- `production signed release ready`
- `auto update ready`
- `MCP ready`
- `USB ready`
- `Petdex parity achieved`
- `Rive/Live2D/3D ready`
- `automatic photo-to-3D ready`
- `provider integration verified`
- `user asset upload ready`
- `custom asset pack import ready`

V2.0 final acceptance report: [docs/V2.0/v2_0-final-acceptance-report.md](docs/V2.0/v2_0-final-acceptance-report.md).
V3.0 final acceptance report: [docs/V3.0/v3_0-final-acceptance-report.md](docs/V3.0/v3_0-final-acceptance-report.md).
V3.x final acceptance report: [docs/V3.x/v3_x-final-acceptance-report.md](docs/V3.x/v3_x-final-acceptance-report.md).
V10.11 plan: [docs/V10.x/v10_11-product-experience-rebaseline.md](docs/V10.x/v10_11-product-experience-rebaseline.md).

## macOS Quick Start

环境要求：

- Node：见 `.nvmrc`，当前为 Node 22。
- pnpm：见 `package.json`，当前为 `pnpm@10.32.1`。
- Rust：见 `rust-toolchain.toml`，当前为 `1.95.0`。
- macOS 需要 Xcode Command Line Tools。

安装依赖：

```bash
pnpm install
```

启动开发版：

```bash
pnpm --filter desktop tauri dev
```

构建本地 `.app`：

```bash
pnpm --filter desktop tauri build -b app
```

构建产物路径：

```text
apps/desktop/src-tauri/target/release/bundle/macos/Agent Desktop Pet.app
```

启动已构建 `.app`：

```bash
open "apps/desktop/src-tauri/target/release/bundle/macos/Agent Desktop Pet.app"
```

当前 `.app` 是 unsigned local app，不是正式签名发布版。首次打开和迁移说明见 [macOS Local Distribution](docs/ops/macos-local-distribution.md)。

## Verify

确认桌面猫已启动后，验证本地 HTTP API：

```bash
curl -sS http://127.0.0.1:17321/api/health
```

用构建后的 CLI 触发状态：

```bash
node packages/petctl/dist/cli.js notify --level success --title "distribution smoke"
```

开发环境可用时，也可以使用：

```bash
pnpm --filter @agent-desktop-pet/petctl petctl -- notify --level success --title "distribution smoke"
```

然后打开托盘菜单中的设置页，检查 diagnostics 中是否出现 accepted event。

## Workflow Examples

## Three-minute Codex Work-cat Start

推荐路径是一只 wrapper-launched Codex session 对应一只猫：

```bash
node packages/petctl/dist/cli.js codex session start \
  --mode exec \
  --monitor jsonl \
  --name "Review Cat" \
  -- codex exec --json "summarize this repository"
```

这个路径只解析 Codex `--json` 的结构化 JSONL event type，不解析终端文本，不读取 `transcript_path`，不记录 prompt 原文、tool command、token、Authorization 或 workspace path。

不支持：

- already-open Codex window 自动监听。
- OS-level Codex window lifecycle monitoring。
- all Codex workflows verified。

## Workflow Examples

快速创建一只普通 Codex 猫：

```bash
node packages/petctl/dist/cli.js codex launch --name "Review Cat" -- --help
```

手动 attach / notify 仍可用：

```bash
node packages/petctl/dist/cli.js attach codex --name "Review Cat" --json
node packages/petctl/dist/cli.js notify --instance <instanceId> --level running --title "Codex running"
node packages/petctl/dist/cli.js notify --instance <instanceId> --level success --title "Codex success"
```

完整多 Codex 工作流见 [Multi-Codex Workflow Guide](docs/reference/multi-codex-workflow.md)。

Shell 示例必须用 `--` 分隔用户命令：

```bash
examples/shell/task-with-pet.sh -- pnpm test
examples/shell/task-with-pet.sh -- pnpm --filter desktop build
examples/shell/task-with-pet.sh -- false
```

Node 示例：

```bash
node examples/node/notify-pet.mjs running
node examples/node/notify-pet.mjs success
node examples/node/notify-pet.mjs error
node examples/node/notify-pet.mjs need_input
```

更多接入方式：

- [Agent 接入指南](docs/reference/agent-integration-guide.md)
- [Multi-Codex Workflow Guide](docs/reference/multi-codex-workflow.md)
- [petctl Recipes](docs/reference/petctl-recipes.md)
- [Third-party Agent Contract](docs/reference/third-party-agent-contract.md)
- [Codex instruction template](skills/codex-agent-pet/SKILL.md)
- [Claude Code instruction template](skills/claude-agent-pet/SKILL.md)

## Docs

- [Docs Map](docs/README.md)
- [V1.0 archive](docs/V1.0/README.md)
- [V2.0 baseline](docs/V2.0/README.md)
- [V2.1 real agent integration verification](docs/V2.1/README.md)
- [V3.0 multi-instance Codex working partner system](docs/V3.0/README.md)
- [V3.0 final acceptance report](docs/V3.0/v3_0-final-acceptance-report.md)
- [V10.11 product experience rebaseline](docs/V10.x/v10_11-product-experience-rebaseline.md)
- [Current development plan](docs/active/development-plan.md)
- [Current acceptance plan](docs/active/acceptance-plan.md)
- [Current gap analysis](docs/active/current-vs-target-gap.md)
- [V3.1 Manager UI polish](docs/V3.1/v3_1-manager-ui-polish.md)
- [V3.1 Runtime Regression Harness](docs/V3.1/v3_1-runtime-regression-harness.md)
- [V3.1 Local App Migration and Backup](docs/V3.1/v3_1-local-app-migration-backup.md)
- [V3.1 final manual acceptance checklist](docs/V3.1/v3_1-final-manual-acceptance-checklist.md)
- [V3.1 final acceptance report](docs/V3.1/v3_1-final-acceptance-report.md)
- [V3.2 development plan](docs/V3.2/v3_2-development-plan.md)
- [V3.2 acceptance plan](docs/V3.2/v3_2-acceptance-plan.md)
- [V3.2 claim matrix](docs/V3.2/v3_2-claim-matrix.md)
- [V3.2 evidence index](docs/V3.2/v3_2-evidence-index.md)
- [V3.3 development plan](docs/V3.3/v3_3-development-plan.md)
- [V3.3 Codex window binding design](docs/V3.3/v3_3-codex-window-binding-design.md)
- [V3.3 final acceptance report](docs/V3.3/v3_3-final-acceptance-report.md)
- [V3.7 final acceptance report](docs/V3.7/v3_7-final-acceptance-report.md)
- [V3.7 JSONL monitor evidence](docs/V3.7/evidence/codex-exec-jsonl-monitor-smoke-2026-05-25.md)
- [V4.x development plan](docs/V4.x/v4_x-development-plan.md)
- [V5.x renderer and asset development plan](docs/V5.x/v5_x-development-plan.md)

Ops:

- [Developer Setup](docs/ops/developer-setup.md)
- [Network Mirrors](docs/ops/network-mirrors.md)
- [Troubleshooting](docs/ops/troubleshooting.md)
- [macOS Local Distribution](docs/ops/macos-local-distribution.md)
- [Release and Distribution](docs/ops/release-and-distribution.md)

Blueprint:

- [Product Experience](docs/blueprint/00-product-experience.md)
- [Target Architecture](docs/blueprint/target-architecture.md)
- [PetEvent Protocol](docs/blueprint/03-pet-event-protocol.md)
- [Cat State Machine](docs/blueprint/04-cat-state-machine.md)

## Security Boundaries

- Local API only listens on `127.0.0.1:17321`.
- `POST /api/events` requires `Authorization: Bearer <token>`.
- Agent integrations can only send structured PetEvent payloads.
- Agents cannot directly control UI, execute desktop scripts, or pass local paths/URLs as sounds.
- Sound IDs are whitelist-only and map to bundled assets.
- diagnostics does not expose full token, raw payload, full metadata, full message text, or sound file paths.

Token lookup for `petctl`:

1. `--token`
2. `AGENT_DESKTOP_PET_TOKEN`
3. desktop app config `api-token.json`

On macOS the current config location is:

```text
~/Library/Application Support/com.agentdesktoppet.desktop/api-token.json
~/Library/Application Support/com.agentdesktoppet.desktop/settings.json
```

Do not commit tokens into scripts or public repositories.

## No False-Green

This repository currently supports a macOS-first local developer workflow. V10.11 is the active product-experience rebaseline; it makes the accepted V10 animated work-cat capabilities easier to understand, onboard, and verify with real screenshots. V3.7 remains the recommended Codex exec monitoring path for wrapper-launched `codex exec --json`; already-open Codex windows are not auto-monitored. `MCP ready`, Windows validation, cross-platform readiness, production signing, notarization, auto update, USB, Petdex parity, broad 3D readiness, Rive/Live2D, provider integration, and automatic photo-to-3D remain future work unless separately implemented and accepted.
