# V12.x Documentation Audit

status: passed scoped docs complete
date: 2026-06-07

## Audit Summary

The V12 documentation set supported V12.1-V12.7 phase-specific implementation
and final acceptance. It defines the core user-visible gap, architecture
additions, phase gates, evidence requirements, allowed claims, forbidden claims,
and final exit criteria.

## Key Audit Findings

| Finding | Severity | Resolution |
| --- | --- | --- |
| V11 runtime capture is not enough for desktop proof | High | V12.3 requires real desktop screenshot with visible cat |
| Visible flag and screenshot result can disagree | High | V12.1 diagnostics must explain mismatch |
| Acceptance HTML previously acted as index page | High | V12.6 requires embedded screenshots and evidence type labels |
| Window layering behavior is not fully proven | High | V12.2 owns re-show/focus/Space/layer tests |
| Implementation details were not concrete enough for all phases | Major | Added `v12_x-implementation-contract.md` with script names, schema, artifacts, pixel checks, and HTML contract |
| Risk of overclaiming release readiness | Medium | V12 claim matrix forbids production/cross-platform claims |

## Required Review Paths

- `docs/active/agent_desktop_pet_prd_v12.md`
- `docs/V12.x/v12_x-development-plan.md`
- `docs/V12.x/v12_x-acceptance-plan.md`
- `docs/V12.x/v12_x-target-architecture.md`
- `docs/V12.x/v12_x-current-gap-analysis.md`
- `docs/V12.x/v12_x-milestones.md`
- `docs/V12.x/v12_x-claim-matrix.md`
- `docs/V12.x/v12_x-exit-criteria.md`
- `docs/V12.x/v12_x-implementation-contract.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`

## Go / No-Go

V12.1-V12.7 implementation: passed scoped.  
V12.7 final gate evidence: `docs/V12.x/v12_7-final-acceptance-report.md`.
