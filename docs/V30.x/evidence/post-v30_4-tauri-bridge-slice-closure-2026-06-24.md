# Post-V30.4 Tauri / HTTP Bridge Slice Closure

status: passed scoped
date: 2026-06-24
phase: Post-V30.4 Rust / Tauri / HTTP bridge architecture slices

## Scope

This evidence closes Post-V30.4 after RS-1 through RS-6 slice evidence exists
and the remaining runtime blocker for RS-5 and RS-6 was resolved with a real
WSL frontend plus Windows Cargo desktop runtime.

This evidence does not claim Petdex parity, arbitrary-cat automatic animation
assets ready, provider integration verified, 3D ready, production release
ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration
verified, OS-level Codex window binding ready, or all Codex workflows verified.

## Phase Summary

| Slice | Evidence | Result |
| --- | --- | --- |
| RS-1 bridge route registry | `post-v30_4-architecture-slice-RS-1-bridge-route-registry-2026-06-23.md` | passed scoped; route registry extraction kept path/method behavior scoped |
| RS-2 bridge auth/rejection helpers | `post-v30_4-architecture-slice-RS-2-bridge-auth-rejection-helpers-2026-06-23.md` | passed scoped; auth and sanitized rejection helper boundary preserved safe errors |
| RS-3 bridge instance/visibility handlers | `post-v30_4-architecture-slice-RS-3-bridge-instance-visibility-handlers-2026-06-23.md` | passed scoped; instance and visibility HTTP handler boundary preserved response contracts |
| RS-4 bridge event handlers validation | `post-v30_4-architecture-slice-RS-4-bridge-event-handlers-validation-2026-06-23.md` | passed scoped for code extraction; runtime-managed smoke was blocked at the time by no reachable bridge |
| RS-5 Tauri runtime setup | `post-v30_4-architecture-slice-RS-5-tauri-runtime-setup-2026-06-24.md` | passed scoped with real bridge health, petctl list/notify/diagnostics, and V3.1 runtime smoke |
| RS-6 diagnostics boundary | `post-v30_4-architecture-slice-RS-6-diagnostics-boundary-2026-06-24.md` | passed scoped with real bridge health, diagnostics, resurface, and V3.1 runtime smoke |

## Current Architecture Result

- HTTP bridge route registration, auth/rejection helpers, instance/visibility
  handlers, and event validation handlers are split into narrower bridge
  boundaries.
- Tauri runtime setup, settings persistence, tray/window setup, instance
  restore, and window position helpers are split into `runtime_setup.rs`.
- Sanitized visibility diagnostics DTOs, diagnostics assembly, and resurface
  diagnostics flow are split into `diagnostics.rs`.
- `main.rs` remains responsible for the Tauri builder, command wrappers,
  application state models, and domain commands that have not yet been moved.
- Public HTTP route paths, methods, auth requirements, sanitized error fields,
  PetEvent schema behavior, Tauri command names, and diagnostics response
  shape were not intentionally changed in this phase.

## Acceptance Results

| Command / Smoke | Result |
| --- | --- |
| `pnpm --filter desktop test` | passed, 261 tests |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter @agent-desktop-pet/petctl build` | passed during RS-5 |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; one existing `src\sound.rs` unused import warning remains |
| Real bridge health on `127.0.0.1:17321` | passed |
| Real `petctl list` | passed during RS-5 |
| Real `petctl notify --level success` | passed during RS-5 |
| Real `petctl visibility diagnostics --instance default` | passed during RS-5 and RS-6 |
| Real `petctl visibility resurface --instance default --reset-position` | passed during RS-6 |
| `node scripts/v3_1_runtime_smoke.mjs` against running bridge | passed during RS-5 and RS-6 |

## PRD / Spec Review

- Matches `docs/active/agent_desktop_pet_prd_post_v30.md`: yes.
- Matches `docs/V30.x/post-v30-target-architecture.md`: yes for the scoped
  architecture remediation layer.
- Matches `docs/active/post-v30-tauri-bridge-architecture-slices.md`: yes.
- Supports user-visible target experience for this phase: yes. The pet runtime
  can be started locally, the bridge is reachable, visibility diagnostics show
  whether the pet is visible, resurface can bring the target pet back, and
  notify/list flows work through real local commands.
- Does not prove provider, arbitrary asset generation, 3D, production release,
  Windows readiness, cross-platform readiness, or all workflow readiness: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for closing
  Post-V30.4 as passed scoped. RS-4's historical runtime-managed-smoke block is
  not rewritten; later real runtime smoke evidence from RS-5/RS-6 covers the
  bridge/runtime baseline needed before the final gate.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" docs/V30.x/evidence/post-v30_4-*.md apps/desktop/src-tauri/src/main.rs apps/desktop/src-tauri/src/bridge apps/desktop/src-tauri/src/runtime_setup.rs apps/desktop/src-tauri/src/diagnostics.rs
```

Result: passed. Matches are limited to forbidden/not-ready boundary language
and scan-command context; no new ready claim was introduced.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" docs/V30.x/evidence/post-v30_4-*.md apps/desktop/src-tauri/src/main.rs apps/desktop/src-tauri/src/bridge apps/desktop/src-tauri/src/runtime_setup.rs apps/desktop/src-tauri/src/diagnostics.rs
```

Result: passed. Evidence-file matches are limited to safe-boundary and
scan-command context. Source-code matches include existing bridge
authentication identifiers such as token fields and the token filename used by
the local bridge implementation; no token value, raw Authorization value, raw
payload, raw provider response, raw JSONL, raw prompt, terminal value, private
filename, workspace path, config path, or local photo bytes were recorded in
evidence.

## Decision

Post-V30.4 is passed scoped. The bridge and Tauri runtime architecture slices
now have per-slice evidence and real runtime validation for the remaining
startup/diagnostics boundaries. The next allowed phase is Post-V30.5 final
remediation gate, which must consolidate all prior phase evidence and rerun
final checks instead of inheriting this closure as final release readiness.
