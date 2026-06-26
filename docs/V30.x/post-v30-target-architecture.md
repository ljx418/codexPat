# Post-V30 Target Architecture

文档状态：active target architecture；Post-V30 remediation baseline passed scoped。
当前日期：2026-06-24。

## Architecture Goal

Post-V30 的目标架构不是新增产品功能，而是建立下一阶段开发所需的工程安全层。该工程安全层已在 Post-V30.5 final remediation gate 中 passed scoped：

```text
V30 claim boundary
  -> Active fact sources
  -> Runtime desktop smoke
  -> Managed Codex workflow smoke
  -> Architecture slice specs
  -> Evidence / scan gate
  -> Future scoped implementation slices only after new evidence
```

## Temporal Status Note

2026-06-23 planning reviews that treated Post-V30.1 as next and Post-V30.5 as
No-Go were correct at that time. They are now historical evidence. The current
Post-V30 architecture status is `passed scoped` through Post-V30.5, and future
work must start from a new active PRD or slice plan. See
`docs/V30.x/evidence/post-v30-external-advice-reconciliation-2026-06-25.md`.

## Current Architecture

```text
pnpm workspace
  -> apps/desktop
      -> large TypeScript frontend module
      -> large Tauri runtime main module
      -> large local HTTP bridge module
      -> asset workflow, gallery, preview, settings, runtime state
  -> packages/pet-protocol
      -> PetEvent schema and shared types
  -> packages/petctl
      -> CLI, local bridge commands, managed Codex helpers
  -> packages/pet-mcp
      -> placeholder package; not MCP ready
  -> scripts
      -> phase smoke gates and evidence utilities
```

Current strengths:

- V30 semantic animation quality has scoped passed evidence.
- Unit/static baselines are recoverable in WSL.
- PetEvent, petctl, desktop app, V4.x managed workflow, and V30 smoke scripts already exist.

Remaining risks:

- Evidence remains local development evidence, not packaging, signing, release,
  Windows readiness, or cross-platform readiness.
- Managed Codex workflow evidence covers one scoped wrapper-launched local
  scenario, not every possible workflow.
- Large modules are reduced through FE/RS slices, but further code movement
  still needs new slice evidence before edits.
- Active docs must keep claim boundaries explicit across future phases.

## Current To Target Relationship

Post-V30 does not replace the existing architecture. It adds verification and
planning layers around the current implementation:

| Current Element | Target Relationship | Target Experience |
| --- | --- | --- |
| Vite/TypeScript frontend | split only through FE-1 to FE-5 slice evidence | UI, gallery, preview, settings, and asset workflows remain understandable before refactor |
| Tauri `main.rs` runtime | split only through RS-5 runtime setup evidence | startup, tray, settings, window persistence, and instance restore remain testable |
| `bridge/http.rs` local bridge | split only through RS-1 to RS-4 and RS-6 evidence | health, diagnostics, instances, visibility, and events keep stable route contracts |
| `petctl` CLI | becomes runtime smoke and managed workflow verifier | users can validate list, notify, diagnostics, and bridge behavior from CLI |
| V30 semantic gate | remains quality claim boundary | tested local action packs reject weak transform-only motion |
| evidence docs | become phase exit record | reviewers can distinguish passed scoped, blocked, failed, and not-ready claims |

## Target Architecture

```text
Post-V30 Active Fact Sources
  -> PRD / target architecture / milestones / acceptance / drawio
  -> Runtime Smoke Layer
      -> real desktop app process
      -> local bridge health
      -> petctl list / notify / diagnostics
      -> v3_1 runtime smoke
  -> Managed Workflow Layer
      -> running bridge precondition
      -> v4_4 managed session smoke
      -> petctl regression
      -> scoped local wrapper-launched evidence
  -> Architecture Slice Layer
      -> frontend asset workflow slice spec
      -> frontend preview/gallery/settings slice spec
      -> Tauri app runtime slice spec
      -> HTTP bridge route/auth/diagnostics slice spec
  -> Evidence Gate
      -> PRD/spec review
      -> regression checks
      -> claim scan
      -> security scan
      -> passed scoped / blocked / failed decision
```

## Component Responsibilities

### Active Fact Sources

- `docs/active/agent_desktop_pet_prd_post_v30.md` owns the current product and engineering goal.
- `docs/V30.x/post-v30-target-architecture.md` owns this architecture contract.
- `docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md` owns the
  ordered development and acceptance control plan.
- `docs/V30.x/post-v30-milestones.md` owns milestone exit signals.
- `docs/V30.x/post-v30-acceptance-plan.md` owns acceptance gates.
- `docs/active/post-v30-frontend-architecture-slices.md` owns Post-V30.3
  frontend slice order and entry/exit rules.
- `docs/active/post-v30-tauri-bridge-architecture-slices.md` owns Post-V30.4
  Rust/Tauri and HTTP bridge slice order and entry/exit rules.
- `docs/active/current-vs-target-gap.drawio` visualizes current architecture, target architecture, plan, milestones, gates, and exit conditions.

### Runtime Smoke Layer

- Proves app process and bridge are real, not implied by unit tests.
- Uses `docs/active/post-v30-runtime-smoke-spec.md`.
- Produces `post-v30_1-runtime-desktop-smoke-YYYY-MM-DD.md`.

### Managed Workflow Layer

- Runs only after bridge availability is proven.
- Uses `docs/active/post-v30-managed-codex-smoke-spec.md`.
- Produces `post-v30_2-managed-codex-workflow-smoke-YYYY-MM-DD.md`.

### Architecture Slice Layer

- Records code-movement scope before implementation.
- Uses frontend FE-1 to FE-5 slice specs for `apps/desktop/src/main.ts`.
- Uses Rust/Tauri RS-1 to RS-6 slice specs for `main.rs` and `bridge/http.rs`.
- Uses `post-v30_3-architecture-slice-TEMPLATE.md`.
- Requires tests and scans before any frontend/Tauri/HTTP bridge refactor.

### Evidence Gate

- Uses `docs/active/post-v30-evidence-and-scan-checklist.md`.
- Blocks silent pass.
- Preserves V30 and Post-V30 claim boundaries.

## Safe Data Boundary

Post-V30 evidence must not include:

- token；
- Authorization value；
- raw HTTP payload；
- raw provider response；
- raw JSONL；
- raw prompt；
- raw command text；
- TTY；
- terminal title；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- `api-token.json` contents。

## Architecture Exit

Post-V30 architecture remediation passed scoped because:

- Post-V30.1 runtime desktop smoke passed scoped；
- Post-V30.2 managed Codex smoke passed scoped；
- Post-V30.3/Post-V30.4 architecture slice specs and evidence exist for scoped code movement；
- Post-V30.5 final gate records regression, PRD/spec review, claim scan, and security scan；
- no forbidden ready claims appear outside forbidden / not-ready contexts。
