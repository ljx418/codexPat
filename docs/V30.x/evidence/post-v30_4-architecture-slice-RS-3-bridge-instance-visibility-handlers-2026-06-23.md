# Post-V30.4 Architecture Slice Evidence: RS-3 Bridge Instance / Visibility Handlers

status: passed scoped
date: 2026-06-23
slice-id: RS-3-bridge-instance-visibility-handlers

## Scope

Document and execute the RS-3 Rust/Tauri bridge architecture slice before code
movement. This slice extracts local HTTP bridge instance CRUD and
visibility/resurface handlers from `bridge/http.rs` into a focused
`bridge/http/instances.rs` module.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: local HTTP bridge instance management and visibility
  endpoints.
- Current hotspot: `apps/desktop/src-tauri/src/bridge/http.rs` still mixes
  instance request DTOs, instance CRUD handlers, visibility diagnostics,
  resurface handling, event handlers, validation helpers, and tests.
- Proposed module boundary:
  `apps/desktop/src-tauri/src/bridge/http/instances.rs` owns:
  - `CreateInstanceRequest`;
  - `ResurfaceVisibilityRequest`;
  - `get_instances`;
  - `post_instance`;
  - `delete_instance`;
  - `get_instance_visibility`;
  - `post_instance_visibility_resurface`.
- Public interface changes: none.
- Route / response contracts expected to remain unchanged:
  - `GET /api/instances`;
  - `POST /api/instances`;
  - `DELETE /api/instances/:instance_id`;
  - `GET /api/instances/:instance_id/visibility`;
  - `POST /api/instances/:instance_id/visibility/resurface`;
  - response field names, status codes, auth behavior, and sanitized error
    fields remain unchanged.
- Files expected to change:
  - `apps/desktop/src-tauri/src/bridge/http.rs`
  - `apps/desktop/src-tauri/src/bridge/http/instances.rs`
- Files explicitly out of scope:
  - Route paths and HTTP methods.
  - Global event and instance-target event handlers.
  - PetEvent schema and event validation.
  - Diagnostics snapshot payload.
  - Tauri startup setup in `main.rs`.
  - petctl command behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
Windows host cargo test --manifest-path src-tauri\Cargo.toml
```

Before status: passed after RS-2 in the same Post-V30.4 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
Windows host cargo test --manifest-path src-tauri\Cargo.toml
```

Runtime desktop smoke is not required for this no-contract-change extraction
unless route registration, startup behavior, or visibility response semantics
change unexpectedly.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Response contract drift for list/create/delete/visibility/resurface | move existing handler bodies without changing literals, route registration, status codes, or JSON field names |
| Sensitive value exposure | keep existing sanitized error helpers; do not log request bodies or raw auth values |
| Event handler regression | keep global and instance event handler code out of this slice |
| Evidence overclaim | mark only RS-3 handler extraction as scoped; do not claim full bridge refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Does not expand V30 or Post-V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  instance/visibility handler extraction. If route paths, response fields, or
  event behavior drift, this slice must return to planning before further code
  movement.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result: passed. Matches are limited to forbidden/not-ready boundary language
inside this evidence and the active control documents; no new ready claim was
introduced.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result: passed. Matches are limited to safe-boundary and scan-command context;
no token value, raw Authorization value, raw payload, raw provider response,
raw prompt, terminal value, private filename, workspace path, config path, or
local photo bytes were recorded.

## Implementation Result

Changed files:

- `apps/desktop/src-tauri/src/bridge/http.rs`
- `apps/desktop/src-tauri/src/bridge/http/instances.rs`

Implementation summary:

- Extracted instance CRUD request DTOs and handlers into
  `bridge/http/instances.rs`.
- Extracted visibility diagnostics and resurface handlers into the same
  module.
- Kept route registration, route paths, HTTP methods, event handlers, PetEvent
  validation, diagnostics snapshot behavior, and startup setup unchanged.

After-code validation:

| Command | Result |
| --- | --- |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` for an unused import |

## Decision

Passed scoped. RS-3 proves only the scoped instance CRUD and
visibility/resurface handler extraction. It does not prove full Tauri / HTTP
bridge refactor completion or any provider, 3D, production, Windows,
cross-platform, MCP, Claude Code, OS-level Codex window binding, or
all-workflows readiness.
