# Post-V30 Detailed Development And Acceptance Plan

文档状态：active detailed plan；Post-V30.1-Post-V30.5 passed scoped。
当前日期：2026-06-24。

## Purpose

This plan turns the Post-V30 PRD and target architecture into an executable
phase-by-phase development and acceptance checklist. It is the control plan for
the current stage after the drawio direction has been accepted.

This document does not claim runtime desktop smoke passed, managed Codex
workflow verified, frontend refactor completed, Tauri / HTTP bridge refactor
completed, provider integration verified, 3D ready, production release ready,
Windows ready, or cross-platform ready.

## Critical Limitation

This plan supports Post-V30.1 through Post-V30.5 as a phase-by-phase
development and acceptance track. It does not support jumping directly to
Post-V30.5 final remediation gate.

Documentation completeness is not execution evidence:

- it does not prove the desktop app is running；
- it does not prove the local bridge is reachable；
- it does not prove managed Codex workflow behavior；
- it does not prove frontend or Rust/Tauri refactor completion；
- it does not approve any ready claim outside the evidence produced by a
  specific phase。

## Stage Objective

Post-V30 is complete only when the project can safely continue from:

```text
V30 semantic 2D quality claim boundary
  -> real desktop runtime baseline
  -> managed Codex workflow baseline
  -> frontend architecture slice specs
  -> Tauri / HTTP bridge architecture slice specs
  -> final remediation gate with evidence and scans
```

The expected maintainer experience at the end of the stage:

- the desktop app runtime state is proven with real local evidence or is
  blocked with a stable environment reason；
- the local bridge can be validated through health, `petctl list`,
  `petctl notify`, and diagnostics evidence；
- managed Codex workflow is tested only against a running bridge；
- frontend and Rust/Tauri code movement has per-slice evidence before any
  implementation；
- final evidence states exactly what passed, what blocked, and what remains
  not ready。

## Phase Plan

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| Post-V30.1 | Start real desktop app and validate bridge behavior | Run runtime smoke, baseline commands, PRD/spec review, claim scan, security scan | `post-v30_1-runtime-desktop-smoke-YYYY-MM-DD.md` |
| Post-V30.2 | Run managed Codex workflow against the running bridge | Run managed smoke, petctl regression, PRD/spec review, claim scan, security scan | `post-v30_2-managed-codex-workflow-smoke-YYYY-MM-DD.md` |
| Post-V30.3 | For each frontend slice FE-1 to FE-5, write per-slice evidence before code movement | Confirm slice boundary, before/after tests, PRD/spec review, claim scan, security scan | `post-v30_3-architecture-slice-<slice-id>-YYYY-MM-DD.md` |
| Post-V30.4 | For each Rust/Tauri slice RS-1 to RS-6, write per-slice evidence before code movement | Confirm route/auth/runtime contract preservation, tests, PRD/spec review, claim scan, security scan | `post-v30_4-architecture-slice-<slice-id>-YYYY-MM-DD.md` |
| Post-V30.5 | Consolidate all phase results | Run final regression, evidence review, claim scan, security scan, decision | `post-v30_5-final-remediation-gate-YYYY-MM-DD.md` |

## Current Go / No-Go

| Phase | Current Decision | Reason |
| --- | --- | --- |
| Post-V30.1 Runtime Desktop Smoke | Passed scoped | real host-side Tauri bridge, petctl, and runtime smoke evidence exists |
| Post-V30.2 Managed Codex Workflow Smoke | Passed scoped | one local wrapper-launched managed workflow smoke passed against the running bridge |
| Post-V30.3 Frontend Slices | Passed scoped | FE-1 through FE-5 frontend slices have per-slice evidence, PRD/spec review, checks, and scans |
| Post-V30.4 Rust / Tauri / HTTP Bridge Slices | Passed scoped | RS-1 through RS-6 have per-slice evidence; RS-5/RS-6 passed with real WSL frontend plus Windows Cargo runtime smoke; closure evidence exists |
| Post-V30.5 Final Remediation Gate | Passed scoped | final regression, real runtime smoke, managed smoke, PRD/spec review, claim scan, and security scan passed |

Post-V30.5 is closed as passed scoped. Any next stage must create a new PRD or
slice plan before further large code movement, provider work, platform work,
3D work, packaging work, or expanded workflow claims.

## Post-V30.1 Runtime Desktop Smoke

Entry criteria:

- dependencies are installed；
- desktop app can be started in the current environment；
- `127.0.0.1:17321` is reachable from the smoke shell or a stable WSL/host
  loopback limitation is recorded。

Required commands:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
curl -sS http://127.0.0.1:17321/api/health
pnpm --filter @agent-desktop-pet/petctl build
pnpm --filter @agent-desktop-pet/petctl petctl -- list
pnpm --filter @agent-desktop-pet/petctl petctl -- notify --level success --title "Post-V30 runtime smoke"
pnpm --filter @agent-desktop-pet/petctl petctl -- visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

Pass when:

- the app is running；
- bridge health succeeds；
- `petctl` list, notify, and diagnostics return sanitized results；
- runtime smoke passes；
- evidence contains no sensitive values。

Blocked when:

- GUI startup is impossible in the environment；
- WSL cannot reach the host bridge；
- platform prerequisites are unavailable。

Failed when prerequisites are available but runtime behavior violates the spec.

## Post-V30.2 Managed Codex Workflow Smoke

Entry criteria:

- Post-V30.1 passed, or a fresh same-session bridge check passed；
- Codex CLI and repository managed workflow commands are available；
- the desktop app and bridge are still running。

Post-V30.2 must not run from fixture-only evidence or static checks. It must
use a running bridge.

Required commands:

```bash
node scripts/v4_4_managed_session_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

Pass when:

- one local wrapper-launched managed workflow passes against the running
  bridge；
- petctl regression still passes；
- evidence records only scoped local behavior。

Blocked when:

- bridge is unavailable；
- Codex CLI is unavailable；
- wrapper-launched Codex sessions cannot run in the environment。

Failed when prerequisites are available but managed workflow behavior violates
the spec.

## Post-V30.3 Frontend Architecture Slices

Use `docs/active/post-v30-frontend-architecture-slices.md`.

| Slice | Development Intent | Required Acceptance |
| --- | --- | --- |
| FE-1 | Typed Tauri command wrapper boundary | no UI behavior change; desktop check passes |
| FE-2 | Runtime state boundary | no bridge contract change; desktop tests pass; runtime smoke rerun if behavior changed |
| FE-3 | Asset manager boundary | no asset format or claim change; desktop tests and V30 gate if action logic changed |
| FE-4 | Photo wizard boundary | no provider-ready claim; privacy/security scan and existing photo workflow tests |
| FE-5 | Preview/gallery boundary | no Petdex parity claim; desktop tests and relevant preview smoke where available |

Each slice must create evidence before code movement. A slice evidence file
must name files in scope, files out of scope, public interface changes, tests
before editing, tests after editing, and rollback or mitigation notes.

## Post-V30.4 Rust / Tauri / HTTP Bridge Architecture Slices

Use `docs/active/post-v30-tauri-bridge-architecture-slices.md`.

| Slice | Development Intent | Required Acceptance |
| --- | --- | --- |
| RS-1 | Bridge route registry | same paths and HTTP methods; Rust tests; runtime smoke if app can start |
| RS-2 | Auth and sanitized rejection helpers | no token or raw payload exposure; auth/sanitization tests |
| RS-3 | Instance and visibility handlers | no response contract change; Rust and petctl tests |
| RS-4 | Event handlers and validation | no PetEvent schema change; Rust, petctl, and managed smoke when bridge is running |
| RS-5 | Tauri runtime setup | no startup behavior change; desktop check/test and runtime smoke |
| RS-6 | Diagnostics boundary | no sensitive data expansion; security scan and diagnostics smoke |

Each Rust/Tauri slice must preserve route paths, HTTP methods, auth
requirements, sanitized error fields, runtime startup behavior, and safe
diagnostics unless a future PRD explicitly approves a contract change.

## Post-V30.5 Final Remediation Gate

Entry criteria:

- Post-V30.1 and Post-V30.2 have passed or are explicitly blocked with stable
  reasons；
- Post-V30.3 and Post-V30.4 have slice evidence for any code movement；
- baseline commands can run or have stable blocked reasons。

Post-V30.5 has passed scoped after the entry criteria above were satisfied by
real evidence.

Required final checks:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Final evidence must include:

- phase summary；
- command results；
- user-visible target experience status；
- architecture target status；
- blocked or failed reasons；
- claim scan；
- security scan；
- narrow final claim。

## External Audit Package

Give an external reviewer no more than these documents:

1. `docs/active/agent_desktop_pet_prd_post_v30.md`
2. `docs/V30.x/post-v30-target-architecture.md`
3. `docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md`
4. `docs/V30.x/post-v30-acceptance-plan.md`
5. `docs/V30.x/post-v30-milestones.md`
6. `docs/active/current-vs-target-gap.drawio`
7. `docs/active/post-v30-runtime-smoke-spec.md`
8. `docs/active/post-v30-managed-codex-smoke-spec.md`
9. `docs/active/post-v30-frontend-architecture-slices.md`
10. `docs/active/post-v30-tauri-bridge-architecture-slices.md`
11. `docs/active/post-v30-evidence-and-scan-checklist.md`
12. `docs/V30.x/v30-final-acceptance-report.md`
13. `docs/V30.x/evidence/post-v30-drawio-human-review-sync-2026-06-23.md`

This package is intentionally below 20 documents.

Optional audit artifact: if an external reviewer cannot open `.drawio`, export
the five drawio pages to PNG or SVG and attach the generated files to the phase
evidence. The exported images are review aids only; the source of record
remains `docs/active/current-vs-target-gap.drawio`.

## Readiness Assessment

After this plan is added, the documentation can fully guide the current
Post-V30 stage. It supports the PRD target experience and target architecture
if the later execution phases produce real evidence. The documentation itself
does not prove runtime, managed workflow, refactor completion, platform
readiness, provider readiness, 3D readiness, or production release readiness.
