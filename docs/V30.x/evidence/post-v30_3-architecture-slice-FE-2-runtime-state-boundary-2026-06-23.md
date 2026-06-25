# Post-V30.3 Architecture Slice Evidence: FE-2 Runtime State Boundary

status: passed scoped
date: 2026-06-23
slice-id: FE-2-runtime-state-boundary

## Scope

Document and execute a narrow FE-2 frontend architecture slice before code
movement. This slice extracts pure pet instance runtime state helpers from the
large desktop frontend module into a dedicated runtime state module.

This evidence does not claim frontend refactor completed, Tauri / HTTP bridge
refactor completed, provider integration verified, 3D ready, Windows ready,
cross-platform ready, production release ready, Petdex parity achieved, or
arbitrary-cat automatic animation ready.

## Slice Definition

- Target subsystem: frontend runtime state helper boundary.
- Current hotspot: `apps/desktop/src/main.ts` still mixes runtime instance
  defaults and instance limit derivation with UI rendering, asset workflows,
  renderer selection, diagnostics, and Tauri command calls.
- Proposed module boundary:
  `apps/desktop/src/runtime-state.ts` owns pure pet instance defaults,
  instance list result shape, and instance limit derivation.
- Public interface changes: no product-level API, bridge route, HTTP payload,
  renderer, diagnostics, or UI behavior change; helper functions and types are
  exported for existing frontend callers.
- Files expected to change:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/src/runtime-state.ts`
- Files explicitly out of scope:
  - Rust/Tauri bridge routes and auth.
  - PetEvent schema.
  - Renderer registry or renderer fallback behavior.
  - Diagnostics view state and safe export behavior.
  - Asset manifest, action-pack quality logic, and V30 semantic gate logic.
  - UI layout, styling, and user-visible copy.
  - Provider/photo/3D generation behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed after FE-1 in the same Post-V30.3 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime desktop smoke rerun is not required unless runtime behavior changes.
This slice is intended as a no-behavior-change helper extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed, 261 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Regression in runtime state | move only pure default instance and limit helper code; preserve returned values exactly; run desktop check/test |
| Bridge/auth behavior change | no Rust bridge, HTTP route, auth, or Tauri command file in scope |
| UI behavior change | keep all call sites and rendered states unchanged |
| Evidence overclaim | mark only FE-2 helper extraction as scoped; do not claim full frontend refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-frontend-architecture-slices.md`: yes.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  extraction. Larger runtime concerns such as renderer selection and
  diagnostics state remain explicitly pending for later scoped work.

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

FE-2 passed scoped. `apps/desktop/src/runtime-state.ts` now owns pure pet
instance defaults, instance list result shape, and instance limit derivation.
`apps/desktop/src/main.ts` imports those helpers and no longer owns their
implementations. No UI behavior, renderer selection, diagnostics behavior,
bridge route, payload, or product claim change was made.
