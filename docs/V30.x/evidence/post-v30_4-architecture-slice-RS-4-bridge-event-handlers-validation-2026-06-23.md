# Post-V30.4 Architecture Slice Evidence: RS-4 Bridge Event Handlers / Validation

status: passed scoped with runtime-managed-smoke blocked
date: 2026-06-23
slice-id: RS-4-bridge-event-handlers-validation

## Scope

Document and execute the RS-4 Rust/Tauri bridge architecture slice before code
movement. This slice extracts local HTTP bridge event route handlers and
event-only validation helpers from `bridge/http.rs` into
`bridge/http/events.rs`.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: local HTTP bridge global event and instance-targeted event
  endpoints.
- Proposed module boundary:
  `apps/desktop/src-tauri/src/bridge/http/events.rs` owns:
  - `post_event`;
  - `post_instance_event`;
  - `post_invalid_instance_path`;
  - event target resolution;
  - event body size / JSON parsing / PetEvent validation flow;
  - event-only safe source, level, rate limit key, and field inference helpers.
- Public interface changes: none.
- Route / schema contracts expected to remain unchanged:
  - `POST /api/events`;
  - `POST /api/instances/:instance_id/events`;
  - invalid nested instance event paths still reject with sanitized instance
    errors;
  - PetEvent schema validation behavior remains unchanged;
  - accepted response keeps `ok`, `accepted`, `eventId`, and `queued`;
  - rejected response keeps existing sanitized reason fields.
- Files expected to change:
  - `apps/desktop/src-tauri/src/bridge/http.rs`
  - `apps/desktop/src-tauri/src/bridge/http/events.rs`
- Files explicitly out of scope:
  - Route paths and HTTP methods.
  - Instance CRUD and visibility handlers already extracted by RS-3.
  - Auth/rejection helper behavior already extracted by RS-2.
  - PetEvent schema files.
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

Before status: passed after RS-3 in the same Post-V30.4 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
Windows host cargo test --manifest-path src-tauri\Cargo.toml
```

Managed workflow smoke must be rerun if a running bridge is available in the
same session because this slice touches event delivery behavior. If the bridge
is not reachable, the evidence must record a stable blocked reason rather than
claiming managed-session event behavior from static tests alone.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| PetEvent schema drift | do not edit schema or protocol module; move existing validation flow only |
| Accepted/rejected response drift | keep response literals, status codes, and sanitized reason fields unchanged |
| Instance-targeted routing drift | keep route registration in `http.rs` and move only handler body |
| Sensitive value exposure | do not log raw payloads, raw JSONL, prompts, terminal data, tokens, or paths |
| Evidence overclaim | mark only RS-4 event handler extraction as scoped; do not claim full bridge refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Does not expand V30 or Post-V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  event handler and validation flow extraction. If PetEvent schema behavior,
  route paths, accepted/rejected response fields, or sensitive redaction drift,
  this slice must return to planning before further code movement.

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
raw JSONL, raw prompt, terminal value, private filename, workspace path, config
path, or local photo bytes were recorded.

## Implementation Result

Changed files:

- `apps/desktop/src-tauri/src/bridge/http.rs`
- `apps/desktop/src-tauri/src/bridge/http/events.rs`

Implementation summary:

- Extracted global event, instance-targeted event, and invalid nested instance
  event handlers into `bridge/http/events.rs`.
- Extracted event-only target resolution, rate limit key, safe source/level,
  validation classification, and field inference helpers into the same module.
- Kept route registration, route paths, HTTP methods, PetEvent schema files,
  instance CRUD/visibility handlers, auth/rejection helpers, diagnostics
  payload, and startup setup unchanged.

After-code validation:

| Command | Result |
| --- | --- |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` for an unused import |
| `curl --noproxy '*' http://127.0.0.1:17321/api/health` | blocked; no bridge listener was reachable from the WSL shell |
| `pnpm --filter desktop exec tauri dev` | blocked in WSL because `cargo` is not on WSL PATH |
| Windows host Tauri CLI launch through direct Node path | blocked because the WSL-installed dependency set does not include the Windows native Tauri CLI binding |

Dependency recovery note:

- A Windows-side `pnpm install --frozen-lockfile` attempt was made to resolve
  the Windows native Tauri CLI binding but failed with a Windows/WSL
  `node_modules` permission conflict.
- The broken `node_modules` directory was moved aside and the WSL workspace
  dependencies were restored with non-sandbox network access using
  `pnpm install --frozen-lockfile --store-dir <workspace-local-store>`.
- After recovery, `desktop check`, `petctl test`, Tauri CLI version, Windows
  cargo tests, and the V30 semantic gate all passed again.

Runtime managed smoke decision:

- Not passed.
- Stable blocked reason: no running bridge was reachable, WSL cannot start
  Tauri dev because cargo is unavailable in WSL, and Windows host Tauri dev
  cannot be launched from the current WSL-installed dependency set without a
  Windows native Tauri CLI binding.
- This evidence therefore proves only the scoped RS-4 code extraction and
  static/unit/CLI regression behavior. It does not prove managed-session event
  delivery against a running bridge after RS-4.

## Decision

Passed scoped for code extraction, with runtime managed smoke blocked by the
environment reason above. RS-4 does not prove full Tauri / HTTP bridge refactor
completion or any provider, 3D, production, Windows, cross-platform, MCP,
Claude Code, OS-level Codex window binding, or all-workflows readiness.
