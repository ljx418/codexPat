# Post-V30.4 Architecture Slice Evidence: RS-6 Diagnostics Boundary

status: passed scoped
date: 2026-06-24
slice-id: RS-6-diagnostics-boundary

## Scope

This evidence defines the RS-6 diagnostics boundary slice before code
movement. RS-6 isolates sanitized visibility diagnostics DTOs, visibility
diagnostics assembly, and resurface diagnostics flow from the large `main.rs`
file.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: safe runtime visibility diagnostics.
- Current hotspot: `main.rs` owns diagnostics structs, visibility diagnostics
  assembly, resurface flow, monitor summaries, and screenshot observation
  placeholder assembly.
- Proposed module boundary:
  - `diagnostics.rs` owns:
    - `WindowSize`;
    - `WindowLayeringDiagnostics`;
    - `ScreenshotObservationDiagnostics`;
    - `PetVisibilityDiagnostics`;
    - `pet_visibility_diagnostics`;
    - `resurface_pet_instance_by_id`;
    - safe visibility diagnostics assembly helpers.
  - `main.rs` keeps Tauri command wrappers and re-exports diagnostics helpers
    for HTTP bridge callers.
- Public interface changes: none.
- Route / command / schema contracts expected to remain unchanged:
  - Tauri command `get_pet_visibility_diagnostics` response shape remains
    unchanged.
  - Tauri command `resurface_pet_instance` response shape remains unchanged.
  - HTTP visibility diagnostics route behavior remains unchanged.
  - `petctl visibility diagnostics --instance default` output remains
    sanitized and compatible.
- Files expected to change:
  - `apps/desktop/src-tauri/src/main.rs`
  - `apps/desktop/src-tauri/src/diagnostics.rs`
- Files explicitly out of scope:
  - HTTP route paths, methods, auth, reason codes, and event schema.
  - Tauri startup setup already extracted by RS-5.
  - Frontend UI and V30 semantic animation quality logic.
  - Provider, 3D, release, or platform readiness work.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Before status: passed after RS-5 in the same Post-V30.4 session.

After code movement:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
curl health against 127.0.0.1:17321 with a real desktop runtime
petctl visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

Diagnostics smoke must use a real running desktop app. Fixture-only acceptance
is not allowed for RS-6.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Diagnostics wire shape drift | move structs and assembly without renaming fields |
| Sensitive data exposure | keep placeholder and sanitized summary fields; do not add paths, tokens, raw payloads, terminal data, or prompts |
| Resurface behavior regression | keep reset/show/focus/layering flow unchanged and rerun visibility diagnostics |
| HTTP route regression | keep bridge routes unchanged; rerun petctl visibility diagnostics and runtime smoke |
| Evidence overclaim | claim only diagnostics boundary extraction after checks pass |

## PRD / Spec Review

- Matches `docs/active/agent_desktop_pet_prd_post_v30.md`: yes. It isolates
  safe diagnostics while requiring real runtime evidence.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
  RS-6 scope is diagnostics boundary with no sensitive data expansion.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found. The slice may
  proceed only if response fields, safe redaction, resurface behavior, and
  route behavior remain unchanged.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result: passed. Matches are limited to forbidden/not-ready boundary language
inside this evidence and the scan command; no new ready claim was introduced.

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
- `apps/desktop/src-tauri/src/diagnostics.rs`

Implementation summary:

- Added `diagnostics.rs` as the sanitized visibility diagnostics boundary.
- Moved visibility diagnostics DTOs, visibility diagnostics assembly,
  monitor summary helpers, visibility window size conversion, and resurface
  flow into the diagnostics module.
- Kept Tauri command wrappers in `main.rs`.
- Kept HTTP bridge route callers compatible through crate-level re-exports.
- Kept command names, response fields, route paths, HTTP methods, auth,
  reason-code behavior, and sanitized diagnostics fields unchanged.

After-code validation:

| Command / Smoke | Result |
| --- | --- |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` for an unused import |
| `pnpm --filter desktop test` | passed, 261 tests |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Real bridge health | passed; returned `ok=true`, app `agent-desktop-pet`, phase `phase-4` |
| Real `petctl visibility diagnostics --instance default` | passed; returned sanitized `desktop_visible` diagnostics |
| Real `petctl visibility resurface --instance default --reset-position` | passed; returned sanitized `desktop_visible` diagnostics |
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
- Runtime diagnostics smoke used a real running desktop app: yes.
- Visibility diagnostics remained sanitized and user-facing enough to confirm
  whether the pet is visible, hidden, offscreen, or unavailable: yes.
- Resurface remained scoped to showing/focusing/resetting the target pet and
  returning sanitized diagnostics: yes.
- Managed workflow, provider, 3D, production, Windows, and cross-platform
  readiness are not claimed: yes.
- Audit opinion: no fatal or major PRD/spec deviation found. RS-6 can pass
  scoped because the diagnostics boundary moved without schema or route drift
  and was verified against a real running bridge.

## Decision

Passed scoped for RS-6 diagnostics boundary extraction. This evidence does
not prove full Tauri / HTTP bridge refactor completion or any provider, 3D,
production, Windows, cross-platform, MCP, Claude Code, OS-level Codex window
binding, or all-workflows readiness.
