# Agent Desktop Pet Transfer Handoff

date: 2026-06-22
repo: https://github.com/ljx418/codexPat.git
branch: main

## Purpose

This document is the safe cross-machine handoff for continuing this project in a new Codex terminal. It intentionally records project state, recovery commands, current acceptance boundaries, and the prompt to paste into a fresh Codex session.

It does not record API keys, tokens, raw provider payloads, shell history, local absolute paths, or private terminal transcript contents.

## Current Project State

The active product line is Agent Desktop Pet.

The latest completed scoped stage is V30:

```text
V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence.
```

V30 is not a provider or arbitrary-photo generation claim. It proves the quality gate that rejects weak transform-only motion and accepts tested local semantic character animation.

Important V30 files:

- `docs/active/agent_desktop_pet_prd_v30.md`
- `docs/V30.x/v30-target-architecture.md`
- `docs/V30.x/v30-development-plan.md`
- `docs/V30.x/v30-acceptance-plan.md`
- `docs/V30.x/v30-claim-matrix.md`
- `docs/V30.x/v30-final-acceptance-report.md`
- `docs/V30.x/evidence/v30_4-preview-ux-2026-06-17.html`
- `apps/desktop/src/assets/semantic-animation-quality.ts`
- `apps/desktop/src/assets/semantic-animation-quality.test.ts`
- `scripts/v30_semantic_animation_gate_smoke.mjs`

Latest local validation before this handoff:

```text
pnpm --filter desktop test                       passed
pnpm --filter desktop check                      passed
pnpm --filter @agent-desktop-pet/petctl test     passed
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs passed
git diff --check                                 passed
```

Runtime desktop smoke that requires the app to be running may report `desktop_not_running` if the desktop app is not started. Do not mark those runtime smokes as passed without starting the app and checking health.

## Claims That Remain Forbidden

Do not claim:

- Petdex parity achieved
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- provider integration verified
- 3D ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified

## Minimal Recovery Steps On Another Mac

1. Install prerequisites:

```bash
xcode-select --install
brew install node pnpm rust
```

If `pnpm` is managed by Corepack instead:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

2. Clone the repo:

```bash
git clone https://github.com/ljx418/codexPat.git
cd codexPat
git checkout main
```

3. Install dependencies:

```bash
pnpm install
```

4. Recreate local-only secrets if needed:

```bash
cp .env.example .env
```

If `.env.example` does not exist, create `.env` manually. Do not commit `.env`.

Known optional env vars used by provider smoke paths:

```text
MINIMAX_API_KEY=...
MINIMAX_PROVIDER_SMOKE_CONSENT=yes
MINIMAX_PROVIDER_TERMS_ACCEPTED=yes
```

Only set these when intentionally running provider smoke. V30 does not require provider credentials.

5. Verify baseline:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

6. Start the desktop app:

```bash
pnpm desktop:dev
```

If using a packaged app path instead, build locally:

```bash
pnpm desktop:build
```

## Restoring Codex Work-Cat Behavior

Project-level Codex hooks are stored in:

```text
.codex/hooks.json
```

They call:

```text
node scripts/codex-pet-hook.mjs <hook_event>
```

On a fresh Codex TUI session:

1. Open the repo root.
2. Start Codex from this directory.
3. Run `/hooks`.
4. Review/trust project hooks.
5. If you need a managed TUI work-cat session, use the existing petctl managed session path after the desktop app is running.

Typical wrapper-managed TUI path:

```bash
pnpm --filter @agent-desktop-pet/petctl build
node packages/petctl/dist/cli.js codex session start --mode tui --monitor hooks --name "Codex Work Cat" -- codex
```

Reliable wrapper-managed exec JSONL path:

```bash
node packages/petctl/dist/cli.js codex session start --mode exec --monitor jsonl --name "Codex Exec Cat" -- codex exec --json "Summarize the current project status"
```

Already-open Codex windows are still not auto-monitored. If the new Codex session needs one-to-one pet state mapping, relaunch through a managed wrapper path.

## What Cannot Be Recovered From Git

The raw conversation transcript from this exact Codex terminal window is not committed. The safe recoverable replacement is this handoff plus the active docs and evidence reports.

Do not commit:

- `.env`
- API keys or provider credentials
- local token/config files
- raw provider responses
- raw photo bytes
- shell history
- `node_modules/`
- `dist/`
- `target/`

## Prompt For A New Codex Terminal

Paste this into the new Codex terminal after cloning and installing dependencies:

```text
你现在接手 Agent Desktop Pet 项目，仓库是 https://github.com/ljx418/codexPat.git，当前目录是仓库根目录。

请先阅读：
- docs/TRANSFER_HANDOFF_2026-06-22.md
- docs/active/current-vs-target-gap.md
- docs/active/development-plan.md
- docs/active/acceptance-plan.md
- docs/active/agent_desktop_pet_prd_v30.md
- docs/V30.x/v30-final-acceptance-report.md
- docs/V30.x/evidence/v30_4-preview-ux-2026-06-17.html

当前最新 scoped passed 阶段是 V30：语义 2D 动作质量门禁已经通过，证明 tested local action packs 可以拒绝 transform-only 弱动作并接受语义动作候选。

不要声明 Petdex parity、任意猫自动生成动作资产 ready、provider integration verified、3D ready、production release ready、Windows/cross-platform ready。

请先运行：
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs

然后汇报当前状态、剩余风险、以及下一阶段建议。若要继续开发，必须 phase-by-phase 执行，每个子阶段完成后生成真实 evidence、PRD/spec review、安全扫描和 claim scan，不得 silent pass。
```

## Git Transfer Checklist

Before switching machines:

```bash
git status --short
git diff --check
git add .
git status --short
git commit -m "chore: checkpoint desktop pet v30 handoff"
git push origin main
```

After switching machines:

```bash
git fetch origin
git status --short
git log --oneline -5
```
