# Post-V30 Milestones

文档状态：active milestones；MP30.1-MP30.5 passed scoped。
当前日期：2026-06-24。

Detailed development and acceptance control plan:
`docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md`.

| Milestone | Phase | Exit Signal |
| --- | --- | --- |
| MP30.0 | Post-V30.0 | Active fact sources, docs, README, ops notes, and remediation evidence synchronized |
| MP30.1 | Post-V30.1 | Real desktop app process and `127.0.0.1:17321` bridge verified or blocked with stable environment reason |
| MP30.2 | Post-V30.2 | Managed Codex workflow smoke runs against the bridge or blocks with stable Codex/runtime reason |
| MP30.3 | Post-V30.3 | Frontend FE-1 to FE-5 slice specs and per-slice evidence exist before asset workflow / preview / gallery / settings code movement |
| MP30.4 | Post-V30.4 | Rust/Tauri RS-1 to RS-6 slice specs and per-slice evidence exist before runtime, auth, diagnostics, or route code movement |
| MP30.5 | Post-V30.5 | Final remediation gate closes with regression, PRD/spec review, claim scan, security scan, and evidence decision |

Current decision: MP30.1 through MP30.5 passed scoped. MP30.1 records real
host-side Tauri bridge, petctl, and runtime smoke evidence. MP30.2 records one
local wrapper-launched managed workflow smoke against the running bridge.
MP30.3 records FE-1 through FE-5 frontend slice evidence, PRD/spec review,
checks, and scans. MP30.4 records RS-1 through RS-6 Rust/Tauri/HTTP bridge
slice evidence and closure evidence. MP30.5 records final regression, real
runtime smoke, managed smoke, PRD/spec review, claim scan, and security scan.

## Milestone Experience Outcome

| Milestone | What A Reviewer Should Understand |
| --- | --- |
| MP30.1 | Whether the real desktop app and bridge are reachable in this environment. |
| MP30.2 | Whether one local managed Codex workflow can operate against that running bridge. |
| MP30.3 | Which frontend slices are safe to implement next and which tests protect them. |
| MP30.4 | Which Rust/Tauri bridge slices are safe to implement next and which contracts cannot move silently. |
| MP30.5 | Whether the stage can close as passed scoped, blocked, or failed without overclaiming readiness. |

## Required Evidence Map

| Phase | Evidence |
| --- | --- |
| Post-V30.0 | `docs/V30.x/evidence/post-v30-architecture-remediation-2026-06-23.md` |
| Post-V30 documentation development | `docs/V30.x/evidence/post-v30-documentation-development-2026-06-23.md` |
| Post-V30.1 | `docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-2026-06-23.md` |
| Post-V30.2 | `docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-2026-06-23.md` |
| Post-V30.3 FE-1 | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-1-command-boundary-2026-06-23.md` |
| Post-V30.3 FE-2 | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-2-runtime-state-boundary-2026-06-23.md` |
| Post-V30.3 FE-3 | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-3-asset-manager-boundary-2026-06-23.md` |
| Post-V30.3 FE-4 | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-4-photo-wizard-boundary-2026-06-23.md` |
| Post-V30.3 FE-5 | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-5-preview-gallery-boundary-2026-06-23.md` |
| Post-V30.4 RS-1 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-1-bridge-route-registry-2026-06-23.md` |
| Post-V30.4 RS-2 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-2-bridge-auth-rejection-helpers-2026-06-23.md` |
| Post-V30.4 RS-3 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-3-bridge-instance-visibility-handlers-2026-06-23.md` |
| Post-V30.4 RS-4 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-4-bridge-event-handlers-validation-2026-06-23.md` |
| Post-V30.4 RS-5/RS-6 unblock audit | `docs/V30.x/evidence/post-v30_4-rs5-rs6-pre-execution-no-go-2026-06-23.md` |
| Post-V30.4 RS-5 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-5-tauri-runtime-setup-2026-06-24.md` |
| Post-V30.4 RS-6 | `docs/V30.x/evidence/post-v30_4-architecture-slice-RS-6-diagnostics-boundary-2026-06-24.md` |
| Post-V30.4 closure | `docs/V30.x/evidence/post-v30_4-tauri-bridge-slice-closure-2026-06-24.md` |
| Post-V30.5 pre-execution audit | `docs/V30.x/evidence/post-v30_5-pre-execution-audit-2026-06-24.md` |
| Post-V30.5 | `docs/V30.x/evidence/post-v30_5-final-remediation-gate-2026-06-24.md` |

Slice spec inputs:

- Post-V30.3: `docs/active/post-v30-frontend-architecture-slices.md`
- Post-V30.4: `docs/active/post-v30-tauri-bridge-architecture-slices.md`

## Milestone Rules

- A milestone may pass only with real evidence.
- A blocked milestone must name a stable reason and next action.
- A failed milestone must distinguish product defect from environment limitation.
- Later milestones may not convert earlier blocked evidence into passed evidence without rerun.
- No milestone may expand V30 semantic animation claim boundaries.
