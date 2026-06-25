# Post-V30.3 Architecture Slice Evidence: FE-5 Preview / Gallery Boundary

status: passed scoped
date: 2026-06-23
slice-id: FE-5-preview-gallery-boundary

## Scope

Document and execute a narrow FE-5 frontend architecture slice before code
movement. This slice extracts built-in gallery filter control reading and card
visibility application from the large desktop frontend module into a gallery
control helper module.

This evidence does not claim frontend refactor completed, Tauri / HTTP bridge
refactor completed, provider integration verified, 3D ready, Windows ready,
cross-platform ready, production release ready, Petdex parity achieved, or
arbitrary-cat automatic animation ready.

## Slice Definition

- Target subsystem: frontend gallery filter UI boundary.
- Current hotspot: `apps/desktop/src/main.ts` owns gallery filter control
  reading, card visibility mutation, favorite writes, isolated preview
  rendering, bundled/imported activation, and restore-default behavior in one
  module.
- Proposed module boundary:
  `apps/desktop/src/assets/gallery-controls.ts` owns pure DOM filter reading
  and gallery card `hidden` application for existing data attributes.
- Public interface changes: no product-level API, bridge route, asset manifest,
  action quality, renderer behavior, command payload, favorite persistence,
  activation, restore-default, or preview rendering change.
- Files expected to change:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/src/assets/gallery-controls.ts`
- Files explicitly out of scope:
  - Favorite storage or favorite write behavior.
  - Gallery isolated preview renderer behavior.
  - Apply/activate/restore-default command behavior.
  - Runtime renderer selection and runtime preview data loading.
  - Rust/Tauri bridge routes and auth.
  - Provider/photo/3D generation behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed after FE-4 in the same Post-V30.3 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime desktop smoke rerun is not required unless command or runtime behavior
changes. This slice is intended as a no-behavior-change gallery filter helper
extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed, 261 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Gallery filtering regression | preserve input ids, data attributes, matching rules, and hidden behavior exactly; run desktop check/test |
| Preview / apply boundary creep | keep preview renderer, favorite writes, activate, and restore-default behavior in `main.ts` |
| Petdex parity overclaim | record only gallery filter helper extraction; do not claim Petdex parity or gallery completion |
| Evidence overclaim | mark only FE-5 filter extraction as scoped; do not claim full frontend refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-frontend-architecture-slices.md`: yes.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  extraction. The slice deliberately avoids favorite persistence, preview
  rendering, activation, and apply/rollback side effects.

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

FE-5 passed scoped. `apps/desktop/src/assets/gallery-controls.ts` now owns
built-in gallery filter control reading and card visibility application.
`apps/desktop/src/main.ts` still owns favorite persistence, isolated preview
renderer behavior, activation, restore-default, and runtime preview data
loading. No bridge route, asset format, payload, or product claim change was
made.
