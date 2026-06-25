# Developer Setup

本文面向源码开发和本地构建。普通用户不应依赖源码安装；当前 macOS 产物仍是 local unsigned app，不是 production release。

## Required Tools

项目当前工具链来源：

- Node：`.nvmrc`，当前 `22`。
- pnpm：根 `package.json` 的 `packageManager`，当前 `pnpm@10.32.1`。
- Rust：`rust-toolchain.toml`，当前 `1.95.0`。
- Tauri CLI：workspace dependency，通过 `pnpm --filter desktop tauri ...` 使用。
- macOS：Xcode Command Line Tools。

检查：

```bash
node --version
pnpm --version
rustc --version
cargo --version
xcode-select -p
```

## macOS Setup

安装 Xcode Command Line Tools：

```bash
xcode-select --install
```

推荐使用 rustup，让 `rust-toolchain.toml` 自动选择项目工具链：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

如果使用 Homebrew Rust，也可以构建当前项目，但 `rust-toolchain.toml` 不会自动切换工具链。

## Install And Build

```bash
pnpm install
pnpm run doctor
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm --filter desktop tauri dev
```

迁移或重建本地 app 前，可先参考 [V3.1 Local App Migration and Backup](../V3.1/v3_1-local-app-migration-backup.md) 确认哪些配置需要保留，哪些构建产物可以重建。

构建 macOS local `.app`：

```bash
pnpm --filter desktop tauri build -b app
```

输出路径：

```text
apps/desktop/src-tauri/target/release/bundle/macos/Agent Desktop Pet.app
```

## Doctor

运行：

```bash
pnpm run doctor
```

`doctor` 只做检查和提示，不会安装工具链，不会修改系统权限，不会修复环境。

结果分级：

- `OK`：检查通过。
- `WARN`：可能影响首次安装或首次构建，但不一定阻塞已有缓存的构建。
- `FAIL`：阻塞启动或构建，需要先修复。

网络 WARN 常见于受限网络环境。若依赖已缓存，后续 check/build 仍可能通过。

## Windows

Windows 仍是后续目标，但当前不做 Windows smoke，不声明 Windows ready 或 cross-platform ready。

后续验证前至少需要：

- Node.js LTS。
- pnpm。
- Rustup。
- Microsoft C++ Build Tools。
- WebView2 Runtime。

## WSL On Windows

当前 Windows 下的 WSL 环境可用于源码阅读、TypeScript 单测、静态检查和
V30 smoke gate，但这不等于 Windows runtime smoke，也不等于
cross-platform ready。

WSL 开发注意事项：

- 不要混用 Windows 生成的 `node_modules` 和 WSL 中的 Node/pnpm。
- 如果 `pnpm`、`tsx` 或 `tsc` 报出无法解析 workspace bin / link 的错误，
  在 WSL 内重新执行：

```bash
CI=true pnpm install --frozen-lockfile
```

- 桌面 runtime 证据必须证明 app 进程和 `127.0.0.1:17321` bridge 真实运行。
- WSL 中通过 `pnpm --filter desktop test`、`pnpm --filter desktop check`、
  `pnpm --filter @agent-desktop-pet/petctl test` 和 V30 smoke gate 只能作为
  静态/单测/脚本基线，不能替代真实桌面烟测。

Post-V30 runtime smoke 前置条件见：

- `docs/active/post-v30-runtime-smoke-spec.md`
- `docs/active/post-v30-managed-codex-smoke-spec.md`

执行 Post-V30.1 前必须先启动真实 desktop app，并从运行 smoke 的 shell
确认 `http://127.0.0.1:17321/api/health` 可访问。执行 Post-V30.2 前必须先
完成 Post-V30.1 或在同一会话中重新证明 bridge 可访问。

## No False-Green

仅完成源码构建或 WSL 测试不等于 production release。当前不得因为单测、
check 或脚本 smoke 通过而声明 Windows ready、cross-platform ready、
production signed release ready、provider integration verified、3D ready 或
任意猫自动生成动作资产 ready。
