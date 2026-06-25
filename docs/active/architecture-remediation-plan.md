# Post-V30 Architecture Remediation Plan

文档状态：active remediation plan。
当前日期：2026-06-23。

## Purpose

This plan follows the V30 scoped pass. It does not expand product claims. Its
job is to make the current architecture, development facts, runtime smoke path,
and next code-debt slices explicit enough that later phases can proceed with
real evidence instead of silent pass.

Current active PRD: `docs/active/agent_desktop_pet_prd_post_v30.md`.
Target architecture: `docs/V30.x/post-v30-target-architecture.md`.
Milestones: `docs/V30.x/post-v30-milestones.md`.
Acceptance plan: `docs/V30.x/post-v30-acceptance-plan.md`.
Frontend slice specs: `docs/active/post-v30-frontend-architecture-slices.md`.
Tauri / HTTP bridge slice specs:
`docs/active/post-v30-tauri-bridge-architecture-slices.md`.

## Current Architecture Map

```text
pnpm workspace
  -> apps/desktop
      -> Vite/TypeScript frontend
      -> Tauri Rust runtime
      -> local HTTP bridge on 127.0.0.1:17321
      -> asset generation, gallery, preview, action-pack QA, settings
  -> packages/pet-protocol
      -> PetEvent schema and shared event types
  -> packages/petctl
      -> local CLI and Codex workflow helpers
  -> packages/pet-mcp
      -> placeholder package; not MCP ready
  -> scripts
      -> phase gates, smoke checks, evidence utilities
```

Key implementation hotspots:

| Area | Current Shape | Risk |
| --- | --- | --- |
| `apps/desktop/src/main.ts` | large frontend state/UI/asset workflow module | hard to review, easy to couple new UI and asset logic |
| `apps/desktop/src-tauri/src/main.rs` | large Tauri runtime setup, settings, tray, window, instance logic | runtime changes carry broad regression risk |
| `apps/desktop/src-tauri/src/bridge/http.rs` | large local bridge route module | auth, diagnostics, event, visibility, and instance routes are mixed |
| V30 evidence/docs | scoped pass exists | active fact sources were stale before this remediation |
| WSL development | static tests/checks can pass | desktop runtime proof still requires a real app process and platform-aware smoke |

## Remediation Principles

- Keep V30 claim boundaries unchanged.
- Do not mark runtime, provider, 3D, Windows, cross-platform, or production
  release claims as ready without phase evidence.
- Every remediation phase must produce evidence, PRD/spec review, claim scan,
  and security scan.
- Code extraction must be done in small slices with tests before and after the
  slice.
- Runtime smoke must prove the app is actually running; unit tests alone are
  not desktop runtime evidence.

## Phase Plan

| Phase | Scope | Deliverables | Exit Gate |
| --- | --- | --- | --- |
| Post-V30.0 | fact-source sync and architecture review | active docs, V30 docs, README, ops notes, remediation evidence | regression tests and scans pass |
| Post-V30.1 | desktop runtime baseline | `post-v30-runtime-smoke-spec.md`, runtime evidence | evidence shows real desktop process and local HTTP bridge |
| Post-V30.2 | managed Codex workflow baseline | `post-v30-managed-codex-smoke-spec.md`, managed workflow evidence | evidence shows lifecycle mapping without forbidden claims |
| Post-V30.3 | frontend architecture slice plan | FE-1 to FE-5 slice specs and architecture slice evidence for asset workflow / preview / gallery / settings | spec review and focused tests before code movement |
| Post-V30.4 | Tauri bridge architecture slice plan | RS-1 to RS-6 slice specs and architecture slice evidence for route grouping / auth / diagnostics | spec review and focused Rust/bridge tests before code movement |
| Post-V30.5 | final remediation gate | consolidated report, regression, security scan, claim scan | scoped pass / blocked / failed with evidence |

## Execution Specs

- Post-V30.1 runtime desktop smoke: `docs/active/post-v30-runtime-smoke-spec.md`
- Post-V30.2 managed Codex workflow smoke: `docs/active/post-v30-managed-codex-smoke-spec.md`
- Post-V30.3 frontend architecture slices: `docs/active/post-v30-frontend-architecture-slices.md`
- Post-V30.4 Tauri / HTTP bridge architecture slices: `docs/active/post-v30-tauri-bridge-architecture-slices.md`
- Shared evidence and scan checklist: `docs/active/post-v30-evidence-and-scan-checklist.md`

Evidence templates:

- `docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-TEMPLATE.md`
- `docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-TEMPLATE.md`
- `docs/V30.x/evidence/post-v30_3-architecture-slice-TEMPLATE.md`

## Phase Exit Requirements

Every Post-V30 phase must:

- produce a real evidence file under `docs/V30.x/evidence/`；
- include PRD/spec review；
- run claim scan and security scan；
- record `passed scoped`, `blocked`, or `failed` explicitly；
- preserve V30 claim boundaries。

## Immediate Next Development Recommendation

After Post-V30.0, do not start new asset-provider or 3D work. First run a real
desktop smoke in the current WSL/Windows environment or a supported macOS
environment, then decide whether runtime failures are environment-specific or
product defects.

## Forbidden Claim Boundary

This plan does not support claiming:

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready；
- MCP ready；
- Claude Code integration verified。
