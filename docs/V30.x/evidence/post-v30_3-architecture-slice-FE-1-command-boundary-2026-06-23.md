# Post-V30.3 Architecture Slice Evidence: FE-1 Command Boundary

status: passed scoped
date: 2026-06-23
slice-id: FE-1-command-boundary

## Scope

Document and execute the FE-1 frontend architecture slice before code movement.
This slice extracts typed Tauri command wrappers and response types from the
large desktop frontend module into a dedicated command boundary module.

This evidence does not claim frontend refactor completed, Tauri / HTTP bridge
refactor completed, provider integration verified, 3D ready, Windows ready,
cross-platform ready, production release ready, Petdex parity achieved, or
arbitrary-cat automatic animation ready.

## Slice Definition

- Target subsystem: frontend Tauri command boundary.
- Current hotspot: `apps/desktop/src/main.ts` mixes UI state, view rendering,
  runtime state, asset workflows, and direct `invoke` calls.
- Proposed module boundary:
  `apps/desktop/src/tauri-commands.ts` owns command response types and direct
  `invoke` wrapper functions.
- Public interface changes: no product-level API or bridge contract change;
  wrappers are exported for existing frontend callers.
- Files expected to change:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/src/tauri-commands.ts`
- Files explicitly out of scope:
  - Rust/Tauri bridge routes and auth.
  - PetEvent schema.
  - Asset manifest or action-pack quality logic.
  - UI layout and styling.
  - Provider/photo/3D generation behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed earlier in the Post-V30.1/Post-V30.2 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime smoke rerun is not required unless command behavior changes. This
slice is intended as a no-behavior-change extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed, 261 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Regression in runtime state | keep command names, argument object shapes, and return types identical; run desktop check/test |
| Bridge/auth behavior change | no Rust bridge or HTTP route files in scope |
| UI behavior change | keep call sites and fallback behavior unchanged |
| Evidence overclaim | mark only FE-1 as scoped; do not claim full frontend refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-frontend-architecture-slices.md`: yes.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.

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

FE-1 passed scoped. `apps/desktop/src/tauri-commands.ts` now owns typed Tauri
command wrappers and response types. `apps/desktop/src/main.ts` no longer owns
direct command wrapper implementations. No UI behavior, bridge route, payload,
or product claim change was made.
