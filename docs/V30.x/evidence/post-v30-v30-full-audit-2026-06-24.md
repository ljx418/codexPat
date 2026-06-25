# Post-V30 / V30 Full PRD-Code-Docs-Function Audit

status: passed scoped with residual risks
date: 2026-06-24
scope: Post-V30 active PRD, V30 semantic animation claim boundary, active docs,
implementation mapping, static checks, unit tests, real runtime E2E, managed
workflow smoke, claim scan, security scan, and drawio consistency check.

## Scope Boundary

This audit verifies whether the current code, architecture documents, function
checks, and end-to-end acceptance evidence support the active Post-V30 stage and
the V30 semantic animation quality boundary.

This audit does not claim Petdex parity, arbitrary-cat automatic animation
assets ready, provider integration verified, 3D ready, production release
ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration
verified, OS-level Codex window binding ready, or all Codex workflows verified.

## PRD Coverage Review

| PRD / Target Item | Implementation / Evidence Mapping | Audit Result |
| --- | --- | --- |
| V30 semantic 2D action quality gate | `apps/desktop/src/assets/semantic-animation-quality.ts`, related tests, and `scripts/v30_semantic_animation_gate_smoke.mjs` | passed scoped |
| Reject transform-only weak actions | semantic gate smoke rejected the weak baseline with transform-only / unreadable-action reason codes | passed scoped |
| Accept tested semantic local action candidates | semantic gate smoke accepted the local `flagship-work-cat-v2` candidate | passed scoped |
| Real desktop runtime baseline | Windows host Tauri app plus WSL Vite dev server, bridge health, petctl commands, and `scripts/v3_1_runtime_smoke.mjs` | passed scoped |
| Managed Codex workflow baseline | `scripts/v4_4_managed_session_smoke.mjs` against the running bridge | passed scoped |
| Frontend architecture slices | command boundary, runtime state, asset manager, photo wizard, and preview/gallery modules plus prior FE-1 through FE-5 evidence | passed scoped, with residual size risk in `main.ts` |
| Rust/Tauri/HTTP bridge slices | route registry, auth/rejection, instance/visibility, event handlers, runtime setup, and diagnostics modules plus RS evidence | passed scoped |
| Evidence, claim, and security discipline | Post-V30 evidence files, claim scan, security scan, and drawio page-count check | passed scoped |

## Command Results

| Command / Check | Result |
| --- | --- |
| `pnpm --filter desktop test` | passed, 261 tests |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 71 tests |
| `pnpm --filter @agent-desktop-pet/petctl check` | passed |
| `pnpm --filter @agent-desktop-pet/pet-protocol test` | passed, 3 tests |
| `pnpm --filter @agent-desktop-pet/pet-protocol check` | passed |
| `pnpm --filter @agent-desktop-pet/pet-mcp test` | passed, 7 tests; scoped package tests only, not MCP readiness |
| `pnpm --filter @agent-desktop-pet/pet-mcp check` | passed |
| `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs` | passed |
| Windows host `cargo test --manifest-path src-tauri\Cargo.toml` | passed, 20 tests; existing `src\sound.rs` unused import warning remains |
| real bridge health on `127.0.0.1:17321` | passed, returned `ok=true` and phase `phase-4` |
| `pnpm --filter @agent-desktop-pet/petctl build` | passed |
| real `petctl list` | passed, default instance listed |
| real `petctl notify --level success` | passed, event accepted |
| real `petctl visibility diagnostics --instance default` | passed, sanitized `desktop_visible` diagnostics returned |
| real `petctl visibility resurface --instance default --reset-position` | passed, sanitized `desktop_visible` diagnostics returned |
| `node scripts/v3_1_runtime_smoke.mjs` against running bridge | passed: health, attach/list/notify routing, rejection, hard limit, cleanup, and security redaction cases passed |
| `node scripts/v4_4_managed_session_smoke.mjs` against running bridge | passed: managed success, tool success, tool failure mapping, cleanup, security redaction, and claim scan cases passed |

Runtime acceptance used the current WSL plus Windows host development setup.
The existing desktop API token was injected only through process environment for
CLI smoke commands. Token values and host config locations were not recorded.

## Code Review Findings

No fatal or major functional blocker was found in this audit.

Residual risks:

- `apps/desktop/src/main.ts` remains a large frontend composition module at
  4359 lines. Post-V30 slices improved boundaries, but future UI extraction
  should continue through scoped slice evidence instead of broad movement.
- Current automated checks prove functional command coverage and scoped E2E
  behavior, not a line or branch coverage percentage. The repository does not
  currently publish a coverage threshold for this stage.
- This run validates the real bridge, CLI, runtime smoke, managed workflow
  smoke, and semantic animation gate. It does not provide fresh visual
  screenshot proof for every frontend panel.
- Existing Rust warning remains in `src\sound.rs` for an unused
  `process::Command` import.

## Documentation and Concept Consistency

- Active Post-V30 documents consistently describe Post-V30 as scoped
  architecture/runtime remediation, not provider, platform, 3D, production, or
  arbitrary-asset readiness.
- V30 documents consistently describe semantic 2D action quality for tested
  local action packs and retain the transform-only rejection boundary.
- Stale No-Go wording found by scan was limited to historical evidence files
  that recorded earlier pre-execution status.
- `docs/active/current-vs-target-gap.drawio` has 5 Chinese pages.
- `docs/V30.x/v30-target-state.drawio` has 6 Chinese pages.
- Both drawio files remain within the requested maximum of 8 pages.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" docs/active docs/V30.x apps/desktop/src-tauri/src/main.rs apps/desktop/src-tauri/src/bridge apps/desktop/src-tauri/src/runtime_setup.rs apps/desktop/src-tauri/src/diagnostics.rs
```

Result: passed. Matches are forbidden/not-ready boundary language, historical
claim matrices, or scan-command context. No new ready claim was found.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" docs/V30.x/evidence/post-v30_5-*.md docs/V30.x/evidence/post-v30_4-*.md
```

Result: passed. Matches are safe-boundary language and scan-command context. No
token value, raw Authorization value, raw payload, raw provider response, raw
JSONL, raw prompt, terminal value, private filename, workspace path, config
path, or local photo bytes were recorded.

## Audit Decision

The current documentation, implementation structure, regression suite, and real
runtime E2E evidence are sufficient to support the active Post-V30 stage as a
scoped local development remediation baseline and V30 as the semantic 2D action
quality boundary.

The project is ready for a next stage only after that stage defines its own PRD,
slice plan, acceptance plan, and evidence requirements. Any future expansion
toward provider integration, arbitrary-cat asset generation, 3D, production
release, platform readiness, MCP readiness, Claude integration, OS-level Codex
window binding, or all-workflow readiness requires separate evidence and must
not inherit this scoped pass.
