# Post-V30 Tauri / HTTP Bridge Architecture Slice Specs

文档状态：active slice spec；planning only before code movement。
当前日期：2026-06-23。

## Purpose

This document makes Post-V30.4 executable. It defines Rust runtime and local
HTTP bridge code-debt slices before any extraction or refactor begins.

It does not approve code movement by itself and does not claim managed Codex
workflow verified, MCP ready, OS-level Codex window binding ready, Windows,
cross-platform, production release, or provider integration readiness.

## Current Hotspots

| File | Current Shape | Primary Risk |
| --- | --- | --- |
| `apps/desktop/src-tauri/src/main.rs` | runtime setup, settings, tray, window persistence, instance lifecycle, diagnostics commands | unrelated runtime behavior can regress together |
| `apps/desktop/src-tauri/src/bridge/http.rs` | server startup, route registration, auth, diagnostics, instances, visibility, events, validation, tests | auth, route behavior, and sanitized error contracts are coupled |

## Slice Order

| Slice | Scope | First Allowed Outcome | Required Tests |
| --- | --- | --- | --- |
| RS-1 bridge route registry | group route registration without changing paths or methods | route map remains identical | Rust tests plus runtime smoke if app can start |
| RS-2 bridge auth/rejection helpers | isolate authorization and sanitized rejection helpers | no token or raw payload exposure | Rust tests covering auth and sanitization |
| RS-3 bridge instance/visibility handlers | isolate instance CRUD and visibility/resurface handlers | no response contract change | Rust tests and `petctl` tests |
| RS-4 bridge event handlers | isolate global and instance event handlers and validation | no PetEvent schema change | Rust tests, `petctl` tests, managed smoke when bridge is running |
| RS-5 Tauri runtime setup | isolate app setup, tray, settings, window persistence, instance restore | no startup behavior change | desktop check/test and runtime smoke |
| RS-6 diagnostics boundary | isolate sanitized diagnostics assembly | no sensitive data expansion | security scan and diagnostics smoke |

## Slice Entry Requirements

Before implementing any slice:

- Create an evidence file from
  `docs/V30.x/evidence/post-v30_3-architecture-slice-TEMPLATE.md` and use a
  `post-v30_4-architecture-slice-<slice-id>-YYYY-MM-DD.md` filename.
- List exact Rust files and route/command contracts in scope.
- State whether `127.0.0.1:17321` runtime smoke is required after the change.
- Record all expected tests before editing code.

## Contract Preservation Rules

- Do not change route paths, HTTP methods, auth requirements, or sanitized
  error fields unless the slice explicitly declares a contract change.
- Do not expose token values, raw Authorization values, raw payloads, raw JSONL,
  raw prompt text, terminal title, TTY, workspace path, config path, or
  `api-token.json` contents.
- Do not replace running-bridge managed workflow evidence with fixture-only
  evidence.
- Do not mark Windows/cross-platform readiness from WSL-only results.

## Slice Exit Requirements

Each Rust/Tauri slice may pass only when:

- the implemented diff matches the slice evidence；
- `pnpm --filter desktop check` passes；
- `pnpm --filter @agent-desktop-pet/petctl test` passes if bridge contracts are
  touched；
- runtime desktop smoke is rerun when startup, route, visibility, diagnostics,
  or event behavior changed；
- managed Codex smoke is rerun when managed-session bridge behavior changed；
- PRD/spec review, claim scan, and security scan are recorded。

## Out Of Scope

- MCP readiness；
- Claude Code integration verification；
- all Codex workflows verification；
- provider integration；
- production signing or release；
- broad platform readiness claims。
