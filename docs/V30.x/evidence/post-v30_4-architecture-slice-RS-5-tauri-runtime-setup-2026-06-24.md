# Post-V30.4 Architecture Slice Evidence: RS-5 Tauri Runtime Setup

status: passed scoped
date: 2026-06-24
slice-id: RS-5-tauri-runtime-setup

## Scope

This evidence defines the RS-5 runtime setup slice before code movement. RS-5
isolates Tauri startup, settings storage, tray setup, initial pet window setup,
instance window restore, and window position persistence from the large
`main.rs` file.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: Tauri runtime setup and desktop window lifecycle.
- Current hotspot: `apps/desktop/src-tauri/src/main.rs` mixes app setup,
  settings load/save, tray menu behavior, main window setup, spawned instance
  window setup, position persistence, and diagnostics commands.
- Proposed module boundary:
  - `runtime_setup.rs` owns setup orchestration, settings path/read/save,
    initial main window setup, instance restore, created instance window setup,
    window position persistence, spawn/clamp helpers, tray setup, and settings
    window open/toggle helpers.
  - `main.rs` keeps Tauri commands, data models, instance business logic, and
    the builder entrypoint.
- Public interface changes: none.
- Route / command / schema contracts expected to remain unchanged:
  - Tauri command names and payloads remain unchanged.
  - settings file schema remains unchanged.
  - window labels `main`, `settings`, and instance labels remain unchanged.
  - bridge startup still happens during Tauri setup before runtime smoke.
  - tray menu item IDs remain unchanged.
- Files expected to change:
  - `apps/desktop/src-tauri/src/main.rs`
  - `apps/desktop/src-tauri/src/runtime_setup.rs`
- Files explicitly out of scope:
  - HTTP route paths, methods, auth, and reason codes.
  - PetEvent schema.
  - Diagnostics response fields.
  - Frontend TypeScript UI behavior.
  - V30 semantic animation quality logic.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

After code movement:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
curl health against 127.0.0.1:17321 with a real desktop runtime
petctl list
petctl notify
petctl visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

Runtime smoke must use a real running desktop app. Fixture-only acceptance is
not allowed for RS-5.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Startup order changes | keep bridge startup, state management, window setup, instance restore, tray setup order identical |
| Settings schema drift | move read/save helpers without changing `AppSettings` fields or JSON shape |
| Window label drift | preserve `main`, `settings`, instance `window_label`, and tray item IDs |
| Instance restore regression | rerun runtime smoke and `petctl list` against a real desktop runtime |
| Position/layering regression | keep clamp/spawn/layering helpers behavior-preserving and rerun visibility diagnostics |
| Evidence overclaim | claim only RS-5 runtime setup extraction after checks pass |

## PRD / Spec Review

- Matches `docs/active/agent_desktop_pet_prd_post_v30.md`: yes. It improves
  architecture safety before future development and requires real runtime
  evidence.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
  RS-5 scope is Tauri runtime setup with no startup behavior change.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found. The slice may
  proceed only if runtime startup behavior, settings schema, tray IDs, window
  labels, and diagnostics contracts remain unchanged.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result: passed. Matches are limited to forbidden/not-ready boundary language
inside this evidence and active control documents; no new ready claim was
introduced.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result: passed. Matches are limited to safe-boundary and scan-command context;
no token value, raw Authorization value, raw payload, raw provider response,
raw JSONL, raw prompt, terminal value, private filename, workspace path, config
path, or local photo bytes were recorded.

## Implementation Result

Changed files:

- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src-tauri/src/runtime_setup.rs`

Implementation summary:

- Added `runtime_setup.rs` as the Tauri runtime setup boundary.
- Moved setup orchestration, settings path/read/save, main pet window setup,
  instance window restore, created instance window setup, window position
  persistence, spawn/clamp helpers, tray setup, settings window open, mute
  toggle, visibility toggle, and reset position helpers into the runtime setup
  module.
- Kept Tauri command names, settings schema, route paths, HTTP methods, bridge
  auth, diagnostics response fields, PetEvent schema, window labels, and tray
  item IDs unchanged.
- Kept diagnostics DTO and diagnostics assembly in `main.rs`; RS-6 owns that
  later boundary.

After-code validation:

| Command / Smoke | Result |
| --- | --- |
| `pnpm --filter desktop test` | passed, 261 tests |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter @agent-desktop-pet/petctl build` | passed |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` for an unused import |
| Real bridge health | passed; returned `ok=true`, app `agent-desktop-pet`, phase `phase-4` |
| Real `petctl list` | passed; default instance listed |
| Real `petctl notify --level success` | passed; event accepted |
| Real `petctl visibility diagnostics --instance default` | passed; sanitized visible diagnostics returned |
| `node scripts/v3_1_runtime_smoke.mjs` against running bridge | passed; health, attach/list/notify routing, rejection, hard limit, cleanup, and security redaction cases passed |

Runtime path used for acceptance:

- WSL Vite dev server on `127.0.0.1:1420`.
- Windows host Cargo desktop app run from the desktop package.
- Existing desktop app API token injected only through process environment for
  CLI smoke commands; token value and host config location were not recorded in
  evidence.

## PRD / Spec Review After Implementation

- Matches `docs/active/agent_desktop_pet_prd_post_v30.md`: yes.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Runtime desktop smoke used a real running desktop app: yes.
- Managed workflow, provider, 3D, production, Windows, and cross-platform
  readiness are not claimed: yes.
- Audit opinion: no fatal or major PRD/spec deviation found. RS-5 can pass
  scoped because startup behavior remained testable with real bridge evidence.

## Decision

Passed scoped for RS-5 Tauri runtime setup extraction. This evidence does not
prove full Tauri / HTTP bridge refactor completion or any provider, 3D,
production, Windows, cross-platform, MCP, Claude Code, OS-level Codex window
binding, or all-workflows readiness.
