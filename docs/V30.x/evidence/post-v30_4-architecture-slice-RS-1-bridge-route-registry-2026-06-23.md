# Post-V30.4 Architecture Slice Evidence: RS-1 Bridge Route Registry

status: passed scoped
date: 2026-06-23
slice-id: RS-1-bridge-route-registry

## Scope

Document and execute the RS-1 Rust/Tauri bridge architecture slice before code
movement. This slice extracts the local HTTP bridge route registration chain
into a dedicated helper inside `bridge/http.rs`.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: local HTTP bridge route registry.
- Current hotspot: `apps/desktop/src-tauri/src/bridge/http.rs` mixes listener
  startup, route registration, auth/rejection handling, instance handlers,
  visibility handlers, event handlers, diagnostics, and tests in one module.
- Proposed module boundary: `bridge_router(state: HttpState) -> Router`
  owns route registration while existing handlers remain unchanged.
- Public interface changes: none.
- Route / method / auth contracts expected to remain unchanged:
  - `GET /api/health`
  - `GET /api/capabilities`
  - `GET /api/diagnostics`
  - `POST /api/settings/open`
  - `GET /api/instances`
  - `POST /api/instances`
  - `DELETE /api/instances/:instance_id`
  - `GET /api/instances/:instance_id/visibility`
  - `POST /api/instances/:instance_id/visibility/resurface`
  - `POST /api/events`
  - `POST /api/instances/:instance_id/events`
  - invalid nested instance event path rejection routes
- Files expected to change:
  - `apps/desktop/src-tauri/src/bridge/http.rs`
- Files explicitly out of scope:
  - Auth logic and sanitized rejection fields.
  - Event schema and PetEvent validation.
  - Instance CRUD behavior.
  - Visibility/resurface behavior.
  - Diagnostics payload content.
  - Tauri startup setup in `main.rs`.
  - petctl command behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed after Post-V30.3 FE-5 in the same session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec cargo test --manifest-path src-tauri/Cargo.toml
```

Runtime desktop smoke rerun is not required unless route behavior changes. This
slice is intended as a no-behavior-change route registration extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed, 71 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.
- `pnpm --filter desktop exec cargo test --manifest-path src-tauri/Cargo.toml`: WSL shell blocked because `cargo` was not on WSL PATH.
- Windows host Rust fallback command: passed, 20 Rust tests. Existing warning:
  unused import `process::Command` in `src/sound.rs`.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Route path or method regression | move the exact route chain into `bridge_router`; inspect diff for identical paths and handlers |
| Auth behavior regression | no handler or `authorize` code in scope; run petctl tests |
| Diagnostics/security regression | no diagnostics payload or rejection helper code in scope; run claim/security scans |
| Evidence overclaim | mark only RS-1 route registry extraction as scoped; do not claim full bridge refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Does not expand V30 or Post-V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  route registration extraction.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result: passed. Matches appeared only in forbidden / not-ready /
must-not-claim contexts.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result: passed. Matches appeared only in safe-boundary, redaction,
troubleshooting, historical caveat, or scan-command contexts.

## Decision

RS-1 passed scoped. `bridge_router(state)` now owns local HTTP route
registration in `apps/desktop/src-tauri/src/bridge/http.rs`. The route paths,
HTTP methods, handlers, auth behavior, diagnostics behavior, and response
contracts are unchanged by this slice.
