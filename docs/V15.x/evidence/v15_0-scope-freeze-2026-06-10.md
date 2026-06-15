# V15.0 Scope Freeze Evidence

日期：2026-06-10  
status: passed  

## Scope

V15 is frozen as the living desktop pet interaction upgrade track. It starts from the V14 scoped baseline and focuses only on local macOS desktop interaction experience:

- priority-safe interaction model.
- natural drag / release / land.
- pointer-aware hover / click / double-click.
- bounded autonomous walk.
- emotion/action composition.
- configurable interaction settings.
- screenshot-backed final interaction QA.

V15 does not reopen Codex monitoring, MCP, third-party integration, OS-level binding, 3D readiness, provider/photo-to-3D readiness, production signing, notarization, auto-update, Windows, cross-platform, or remote marketplace work.

## Checked Documents

| Document | Result |
| --- | --- |
| `docs/active/agent_desktop_pet_prd_v15.md` | exists |
| `docs/V15.x/v15_x-development-plan.md` | exists |
| `docs/V15.x/v15_x-acceptance-plan.md` | exists |
| `docs/V15.x/v15_x-target-architecture.md` | exists |
| `docs/V15.x/v15_x-current-gap-analysis.md` | exists |
| `docs/V15.x/v15_x-milestones.md` | exists |
| `docs/V15.x/v15_x-claim-matrix.md` | exists |
| `docs/V15.x/v15_x-exit-criteria.md` | exists |
| `docs/V15.x/v15_x-implementation-contract.md` | exists |
| `docs/V15.x/v15_0-scope-freeze-checklist.md` | exists |
| `docs/V15.x/v15_1-interaction-priority-spec.md` | exists |
| `docs/V15.x/v15_2-drag-physics-release-spec.md` | exists |
| `docs/V15.x/v15_3-pointer-feedback-spec.md` | exists |
| `docs/V15.x/v15_4-autonomous-walk-spec.md` | exists |
| `docs/V15.x/v15_5-emotion-action-composer-spec.md` | exists |
| `docs/V15.x/v15_6-interaction-settings-preview-spec.md` | exists |
| `docs/V15.x/v15_7-final-qa-evidence-plan.md` | exists |
| `docs/active/current-vs-target-gap.drawio` | exists |

## Active Doc Pointer

Result: passed.

- `docs/active/development-plan.md` identifies V15 as the current active planned interaction-experience track.
- `docs/active/acceptance-plan.md` lists V15.0-V15.7 evidence gates.
- `docs/active/current-vs-target-gap.md` points to `docs/active/agent_desktop_pet_prd_v15.md`.

## V14 Baseline Boundary

Result: passed.

V14 remains the scoped accepted baseline for local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching. V14 evidence is not reused as V15 runtime interaction evidence.

## Drawio Parse Result

Result: passed.

Parsed `docs/active/current-vs-target-gap.drawio` as XML:

```text
mxfile 4 ['01 当前状态与体验差距', '02 当前架构与目标架构差异', '03 开发及验收计划', '04 里程碑与出门条件']
```

## Evidence Names

Result: passed.

| Phase | Evidence |
| --- | --- |
| V15.0 | `docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md` |
| V15.1 | `docs/V15.x/evidence/v15_1-interaction-model-smoke-YYYY-MM-DD.md` |
| V15.2 | `docs/V15.x/evidence/v15_2-drag-physics-smoke-YYYY-MM-DD.md` |
| V15.3 | `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-YYYY-MM-DD.md` |
| V15.4 | `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-YYYY-MM-DD.md` |
| V15.5 | `docs/V15.x/evidence/v15_5-emotion-composer-smoke-YYYY-MM-DD.md` |
| V15.6 | `docs/V15.x/evidence/v15_6-interaction-settings-smoke-YYYY-MM-DD.md` |
| V15.7 | `docs/V15.x/v15_7-final-acceptance-report.md` |

## Security Scan

Result: passed.

Scanned V15 docs and active V15 docs for direct token / Authorization / api-token / full local path leakage. No leaked secret or full local path was found.

Forbidden field names appear only as redaction rules or prohibited evidence fields.

## Claim Scan

Result: passed.

Forbidden claims appear only in forbidden / not-ready / non-goal contexts. No ready / verified / passed claim was found for:

- Petdex parity achieved.
- 3D ready.
- automatic photo-to-3D ready.
- provider integration verified.
- remote asset loading ready.
- asset marketplace ready.
- production signed release ready.
- cross-platform ready.
- Windows ready.
- OS-level Codex window binding ready.
- all Codex workflows verified.
- MCP ready.
- Third-party agent integration verified.
- Claude Code integration verified.

## PRD / Spec Review

Result: passed.

The V15 PRD, target architecture, acceptance plan, implementation contract, and phase specs were aligned at scope freeze. At that time, the remaining non-High risk was false-green risk in V15.7 if final evidence used static HTML without embedded real desktop screenshots/captures. This risk was closed by `docs/V15.x/v15_7-final-acceptance-report.md`, which includes V15.1-V15.6 evidence, embedded interaction captures, and real desktop screenshot evidence.

## Allowed Claim

Allowed after this evidence:

```text
V15 living desktop interaction upgrade scope frozen with claim boundaries.
```

## Forbidden Claims

V15.0 does not allow any of the following as ready claims:

- V15 living desktop pet interaction upgrade passed.
- Petdex parity achieved.
- 3D ready.
- automatic photo-to-3D ready.
- provider integration verified.
- production signed release ready.
- Windows ready.
- cross-platform ready.

## Go / No-Go

V15.1 implementation: Go.

V15.2-V15.7: No-Go until prerequisite phase evidence exists.
