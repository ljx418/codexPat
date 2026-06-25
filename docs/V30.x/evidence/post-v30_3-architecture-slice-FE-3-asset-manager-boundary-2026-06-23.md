# Post-V30.3 Architecture Slice Evidence: FE-3 Asset Manager Boundary

status: passed scoped
date: 2026-06-23
slice-id: FE-3-asset-manager-boundary

## Scope

Document and execute a narrow FE-3 frontend architecture slice before code
movement. This slice extracts pure personalized asset manager panel rendering
helpers from the large desktop frontend module into an asset manager boundary
module.

This evidence does not claim frontend refactor completed, Tauri / HTTP bridge
refactor completed, provider integration verified, 3D ready, Windows ready,
cross-platform ready, production release ready, Petdex parity achieved, or
arbitrary-cat automatic animation ready.

## Slice Definition

- Target subsystem: frontend personalized asset manager UI helper boundary.
- Current hotspot: `apps/desktop/src/main.ts` owns asset import command
  handlers, personalized pack list rendering, preview-panel shell rendering,
  gallery rendering, and preview/apply behavior in one module.
- Proposed module boundary:
  `apps/desktop/src/assets/asset-manager-panel.ts` owns pure HTML helper
  rendering for the personalized asset pack list and its empty preview panel.
- Public interface changes: no product-level API, bridge route, asset manifest,
  action quality, renderer behavior, command payload, or UI behavior change.
  The new helper module receives escaping/formatting callbacks from `main.ts`
  so existing sanitization remains unchanged.
- Files expected to change:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/src/assets/asset-manager-panel.ts`
- Files explicitly out of scope:
  - Rust/Tauri bridge routes and auth.
  - PetEvent schema.
  - Asset manifest validation or V30 semantic action quality logic.
  - Gallery filters, favorites, isolated gallery preview, apply/rollback.
  - Import, rename, delete, activate, or deactivate command behavior.
  - Runtime renderer selection and runtime preview data loading.
  - Provider/photo/3D generation behavior.

## Before / After Test Plan

Before code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before status: passed after FE-2 in the same Post-V30.3 session.

After code movement:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime desktop smoke rerun is not required unless command or runtime behavior
changes. This slice is intended as a no-behavior-change pure rendering helper
extraction.

After status:

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed, 261 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Asset manager UI regression | preserve generated markup, data attributes, button labels, and formatter behavior exactly; run desktop check/test |
| Bridge/auth behavior change | no Rust bridge, HTTP route, auth, or Tauri command behavior in scope |
| Gallery / preview boundary creep | keep gallery, apply/rollback, runtime preview data, and renderer selection in `main.ts` for later FE-5 |
| Evidence overclaim | mark only FE-3 asset manager helper extraction as scoped; do not claim full frontend refactor completed |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: yes.
- Matches `docs/active/post-v30-frontend-architecture-slices.md`: yes.
- Does not expand V30 claim boundary: yes.
- Defines tests before code movement: yes.
- Audit opinion: no fatal or major PRD/spec deviation found for this narrow
  extraction. The slice deliberately avoids gallery/apply/rollback and command
  side effects to prevent FE-3 from overlapping FE-5 or Post-V30.4.

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

FE-3 passed scoped. `apps/desktop/src/assets/asset-manager-panel.ts` now owns
pure personalized asset pack list and empty preview-panel rendering helpers.
`apps/desktop/src/main.ts` still owns event handlers, command side effects,
runtime preview data loading, gallery filtering, and apply/rollback behavior.
No asset format, UI behavior, bridge route, payload, or product claim change
was made.
