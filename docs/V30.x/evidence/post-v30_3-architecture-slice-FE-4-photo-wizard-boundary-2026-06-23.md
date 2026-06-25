# Post-V30.3 Architecture Slice Evidence: FE-4 Photo Wizard Boundary

status: passed scoped
date: 2026-06-23
slice-id: FE-4-photo-wizard-boundary

## Scope

Document and execute a narrow FE-4 frontend architecture slice before code
movement. This slice extracts photo-to-2D wizard provider disclosure control
selectors, read state, reset state, and change binding helpers from the large
desktop frontend module into a wizard UI boundary module.

This evidence does not claim frontend refactor completed, Tauri / HTTP bridge
refactor completed, provider integration verified, 3D ready, Windows ready,
cross-platform ready, production release ready, Petdex parity achieved, or
arbitrary-cat automatic animation ready.

## Slice Definition

- Target subsystem: frontend photo-to-2D wizard provider disclosure UI boundary.
- Current hotspot: `apps/desktop/src/main.ts` owns wizard rendering, local file
  preview, provider disclosure control selectors, provider disclosure read
  state, reset behavior, QA preview, and apply gating in one module.
- Proposed module boundary:
  `apps/desktop/src/assets/photo-2d-wizard-controls.ts` owns provider
  disclosure selector list plus DOM read/reset/bind helpers.
- Public interface changes: no product-level API, provider execution, upload
  behavior, action-sheet QA, apply/rollback, bridge route, asset manifest,
  command payload, or UI behavior change.
- Files expected to change:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/src/assets/photo-2d-wizard-controls.ts`
- Files explicitly out of scope:
  - Real provider API calls or credential handling.
  - Local photo bytes, EXIF/GPS, filename, or path handling.
  - Action-sheet crop/QA behavior.
  - Apply/rollback behavior.
  - Rust/Tauri bridge routes and auth.
  - Asset manifest validation or V30 semantic action quality logic.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed after FE-3 in the same Post-V30.3 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime desktop smoke rerun is not required unless command, provider, file, or
runtime behavior changes. This slice is intended as a no-behavior-change UI
control helper extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed, 261 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Provider disclosure state regression | preserve selector ids and boolean field names exactly; run desktop check/test |
| False provider-ready claim | keep credentialConfigured false in `main.ts`; do not add provider calls |
| File/privacy behavior change | no file intake, object URL, EXIF/GPS, path, or raw photo code in scope |
| Evidence overclaim | mark only FE-4 provider disclosure control extraction as scoped; do not claim full photo wizard refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-frontend-architecture-slices.md`: yes.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  extraction. The slice deliberately avoids provider execution, file handling,
  QA preview, and apply/rollback to prevent false readiness claims.

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

FE-4 passed scoped. `apps/desktop/src/assets/photo-2d-wizard-controls.ts` now
owns photo-to-2D provider disclosure selector, read, bind, and reset helpers.
`apps/desktop/src/main.ts` still owns provider not-ready policy, local file
preview handling, action-sheet QA, and apply gating. No provider execution,
file privacy behavior, bridge route, payload, or product claim change was made.
