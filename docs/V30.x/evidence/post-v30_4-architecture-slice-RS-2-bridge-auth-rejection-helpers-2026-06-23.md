# Post-V30.4 Architecture Slice Evidence: RS-2 Bridge Auth / Rejection Helpers

status: passed scoped
date: 2026-06-23
slice-id: RS-2-bridge-auth-rejection-helpers

## Scope

Document and execute the RS-2 Rust/Tauri bridge architecture slice before code
movement. This slice extracts authorization and sanitized rejection response
helpers from `bridge/http.rs` into a focused `bridge/http/rejection.rs` module.

This evidence does not claim Tauri / HTTP bridge refactor completed, provider
integration verified, 3D ready, Windows ready, cross-platform ready,
production release ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## Slice Definition

- Target subsystem: local HTTP bridge auth and sanitized rejection helpers.
- Current hotspot: `apps/desktop/src-tauri/src/bridge/http.rs` mixes handlers,
  route registration, authorization parsing, reason field normalization,
  response body shaping, and tests in one file.
- Proposed module boundary:
  `apps/desktop/src-tauri/src/bridge/http/rejection.rs` owns:
  - bearer authorization validation;
  - `SanitizedRejectReason`;
  - reason field normalization;
  - safe reason messages;
  - safe reason code strings;
  - `error_response`.
- Public interface changes: none.
- Auth / rejection contracts expected to remain unchanged:
  - missing auth returns `401`, `auth_missing`, `auth`;
  - invalid auth returns `401`, `auth_invalid`, `auth`;
  - all error responses keep `ok`, `accepted`, `reasonCode`,
    `reasonField`, and `reason`;
  - no token value, raw Authorization value, or raw payload is echoed.
- Files expected to change:
  - `apps/desktop/src-tauri/src/bridge/http.rs`
  - `apps/desktop/src-tauri/src/bridge/http/rejection.rs`
- Files explicitly out of scope:
  - Route paths and HTTP methods.
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
Windows host cargo test --manifest-path src-tauri\Cargo.toml
```

Before status: passed after RS-1 in the same Post-V30.4 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
Windows host cargo test --manifest-path src-tauri\Cargo.toml
```

Runtime desktop smoke rerun is not required unless auth, route, or runtime
behavior changes. This slice is intended as a no-behavior-change helper
extraction.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Auth status or reason drift | move existing code without changing branches or literals; run Rust tests and petctl tests |
| Sensitive value exposure | no handler payload logging or raw Authorization echoing; run security scan |
| Route/handler regression | no route chain or handler control flow in scope |
| Evidence overclaim | mark only RS-2 helper extraction as scoped; do not claim full bridge refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Does not expand V30 or Post-V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  auth/rejection helper extraction.

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
- `apps/desktop/src-tauri/src/bridge/http/rejection.rs`

Implementation summary:

- Extracted bearer authorization validation into `bridge/http/rejection.rs`.
- Extracted `SanitizedRejectReason`, reason field normalization, safe reason
  messages, safe reason code strings, and `error_response` into the same
  module.
- Kept route paths, HTTP methods, handler entry points, event validation,
  instance behavior, diagnostics behavior, and startup setup unchanged.

After-code validation:

| Command | Result |
| --- | --- |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing warning remains in `src\sound.rs` for an unused import |

## Decision

Passed scoped. RS-2 proves only the scoped authorization and sanitized
rejection helper extraction. It does not prove full Tauri / HTTP bridge
refactor completion or any provider, 3D, production, Windows, cross-platform,
MCP, Claude Code, OS-level Codex window binding, or all-workflows readiness.
