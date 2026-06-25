# Post-V30 Architecture Remediation Evidence

status: passed scoped
date: 2026-06-23

## Scope

This evidence covers Post-V30.0 fact-source sync and architecture remediation
planning. It updates the active docs, V30 docs, README, and ops notes so they
agree that V30 is scoped passed and Post-V30 architecture/runtime remediation
is the next active line.

This evidence does not claim Petdex parity, arbitrary-cat automatic animation,
provider integration verification, 3D readiness, production release readiness,
Windows readiness, or cross-platform readiness.

## Documents Updated

- `docs/active/current-vs-target-gap.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/agent_desktop_pet_prd_v30.md`
- `docs/active/architecture-remediation-plan.md`
- `docs/V30.x/v30-target-architecture.md`
- `docs/V30.x/v30-development-plan.md`
- `docs/V30.x/v30-acceptance-plan.md`
- `docs/V30.x/v30-current-gap-analysis.md`
- `docs/V30.x/v30-claim-matrix.md`
- `docs/V30.x/v30-milestones.md`
- `docs/V30.x/v30-implementation-contract.md`
- `docs/V30.x/v30-doc-audit.md`
- `docs/README.md`
- `docs/ops/developer-setup.md`
- `docs/ops/troubleshooting.md`

## Architecture Review Summary

Current monorepo responsibilities:

- `apps/desktop`: Tauri desktop app, Vite/TypeScript frontend, local HTTP
  bridge, asset workflows, gallery, preview, action-pack QA, settings.
- `packages/pet-protocol`: shared PetEvent schema and event types.
- `packages/petctl`: local CLI and Codex workflow helper surface.
- `packages/pet-mcp`: placeholder package; not MCP ready.
- `scripts`: phase gates, smoke checks, and evidence utilities.

Identified architecture debt:

- `apps/desktop/src/main.ts` is a large frontend module mixing UI state,
  gallery, preview, and asset workflow responsibilities.
- `apps/desktop/src-tauri/src/main.rs` is a large runtime module mixing app
  setup, settings, tray, window, and instance concerns.
- `apps/desktop/src-tauri/src/bridge/http.rs` is a large bridge module mixing
  auth, diagnostics, events, visibility, settings, and instance routes.
- Runtime desktop proof remains separate from WSL static/unit/script baselines.

Decision: do not perform a broad code split in Post-V30.0. The next phases
must first prove runtime desktop and managed Codex workflow baselines, then
extract code in small reviewed slices with before/after tests.

## Commands Run

```text
pnpm --filter desktop test
```

Result: passed, 261 tests.

```text
pnpm --filter desktop check
```

Result: passed.

```text
pnpm --filter @agent-desktop-pet/petctl test
```

Result: passed, 71 tests.

```text
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Result: passed.

Key V30 gate results:

- V30.0-V30.5 phase status: passed.
- weak baseline status: failed as expected.
- weak baseline reason codes include `whole_image_transform_only`,
  `action_semantics_unreadable`, `key_pose_diversity_too_low`,
  `motion_amplitude_too_low`, and `visual_review_rejected`.
- semantic candidate status: passed.
- semantic candidate route: `local_2d_rig`.
- claim scan: passed.
- security scan: passed.

## PRD / Spec Review

Reviewed and synchronized:

- active PRD status now says V30 scoped passed and remains the current claim
  boundary.
- active development plan now points to Post-V30 remediation phases.
- active acceptance plan now points V30.0-V30.6 to real evidence paths.
- V30 planning documents now say scoped passed where appropriate.
- README now routes developers and auditors through V30 and Post-V30 docs.
- ops docs now document WSL dependency-link recovery and runtime evidence
  boundaries.

## Claim Scan

Command scanned the touched docs for forbidden ready claims. Matches exist only
in forbidden / must-not-claim / not-ready / not-implied contexts.

No new allowed claim exceeds:

```text
V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence.
```

## Security Scan

Command scanned the touched docs for token, authorization, raw provider, raw
HTTP, raw photo, EXIF/GPS, local path, workspace path, config path, and
api-token terms.

Matches are in forbidden-content lists, redaction requirements, or
troubleshooting instructions. No real secret, raw provider response, raw HTTP
payload, raw photo bytes, EXIF/GPS, private local filename, or full local
workspace path was added.

## Remaining Risks

- Runtime desktop smoke was not performed in this phase; WSL static/unit/script
  success does not prove a running desktop bridge.
- Managed Codex workflow smoke still requires a running desktop bridge.
- Large module remediation is planned but not implemented; future slices need
  focused tests and evidence before code movement.
- The repository worktree contains broader pre-existing changes outside this
  evidence scope; this phase did not revert unrelated files.

## Decision

Post-V30.0 fact-source sync and architecture remediation planning passed
scoped. The next recommended phase is Post-V30.1 runtime desktop smoke.
