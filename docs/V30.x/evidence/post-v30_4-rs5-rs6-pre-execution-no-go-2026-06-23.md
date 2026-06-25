# Post-V30.4 RS-5 / RS-6 Pre-Execution Unblock Audit

status: unblocked for next slice planning; RS-5 / RS-6 code movement still pending
date: 2026-06-23

## Scope

This audit reviews whether Post-V30.4 can continue into:

- RS-5 Tauri runtime setup;
- RS-6 diagnostics boundary.

It does not claim Tauri / HTTP bridge refactor completed, runtime desktop smoke
passed after RS-4, managed Codex workflow verified after RS-4, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## PRD / Spec Review

Relevant slice requirements:

- `docs/active/post-v30-tauri-bridge-architecture-slices.md` requires RS-5 to
  preserve startup behavior and pass desktop check/test plus runtime smoke.
- The same spec requires RS-6 to preserve safe diagnostics and pass security
  scan plus diagnostics smoke.
- `docs/active/agent_desktop_pet_prd_post_v30.md` requires real desktop
  runtime evidence or stable blocked reasons, not fixture-only acceptance.

## Original Runtime State

Validated after RS-4:

| Check | Result |
| --- | --- |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` |
| `curl --noproxy '*' http://127.0.0.1:17321/api/health` | blocked; no bridge listener reachable |
| WSL `pnpm --filter desktop exec tauri dev` | blocked; WSL cargo is unavailable |
| Windows host direct Tauri CLI launch from the WSL-installed dependency tree | blocked; Windows native Tauri CLI binding is not available from the current install shape |

Dependency recovery:

- A Windows-side install attempt broke the shared `node_modules` layout due a
  Windows/WSL permission conflict.
- The broken dependency directory was moved aside, dependencies were restored
  using non-sandbox network access with a workspace-local pnpm store, and the
  baseline checks above passed again.

## Resolution Update

The runtime bridge blocker was resolved without changing the RS-5 / RS-6
application code:

- Dependencies remained usable after the workspace dependency recovery.
- A stale local Vite listener on `127.0.0.1:1420` was stopped.
- The frontend dev server was started from WSL on `127.0.0.1:1420`.
- The desktop runtime was started by running the Windows Rust application
  directly with Cargo from the desktop package.
- The smoke shell reached the bridge at `127.0.0.1:17321`.
- The CLI used the existing desktop app token through process environment
  injection; the token value and host config location were not printed or
  recorded.

Validated after unblock:

| Check | Result |
| --- | --- |
| Bridge health | passed; returned `ok=true`, app `agent-desktop-pet`, phase `phase-4` |
| `petctl list` | passed; default instance was visible |
| `petctl notify --level success` | passed; notification accepted and event id returned |
| `petctl visibility diagnostics --instance default` | passed; sanitized visible diagnostics returned |
| `node scripts/v4_4_managed_session_smoke.mjs` | passed; local wrapper-launched managed workflow smoke completed against the running bridge |
| `node scripts/v3_1_runtime_smoke.mjs` | passed; health, attach/list/notify routing, rejection, hard limit, cleanup, and security redaction cases passed |

## Audit Opinion

Go for RS-5 / RS-6 pre-slice planning and evidence preparation.

Code movement is still not accepted by this file alone. RS-5 and RS-6 must each
create their own per-slice evidence before edits, then rerun the required
checks after edits.

Reason:

- RS-5 touches startup behavior, so its acceptance still requires runtime
  smoke after any code movement.
- RS-6 touches diagnostics behavior, so its acceptance still requires
  diagnostics smoke and security scan after any code movement.
- The current session has proven a viable real runtime launch path, but it has
  not implemented or accepted RS-5 or RS-6.

## Required Closure Before RS-5 / RS-6

The following must be true before implementation resumes:

- Create RS-5 per-slice evidence before startup-related code movement.
- Create RS-6 per-slice evidence before diagnostics-related code movement.
- Reuse the proven WSL frontend plus Windows Cargo runtime path, or record a
  fresh stable blocked reason if that path is unavailable.
- Rerun required desktop, petctl, runtime, diagnostics, PRD/spec, claim, and
  security checks after each slice.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <this-file>
```

Result: allowed matches only in forbidden/not-ready/no-go context.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <this-file>
```

Result: allowed matches only in safe-boundary and scan-command context.

## Decision

Unblocked for the next Post-V30.4 slice planning step. Do not claim RS-5,
RS-6, Post-V30.4 final acceptance, or Post-V30.5 readiness from this audit
alone.
