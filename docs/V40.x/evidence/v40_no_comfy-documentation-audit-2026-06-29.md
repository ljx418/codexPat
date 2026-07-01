# V40 No-Comfy Documentation Audit

Date: 2026-06-29

## Objective

Implement the documentation-only stage plan for V40 no-Comfy high-quality 2D
action assets. This evidence covers documentation readiness only. It does not
prove WebUI Aki API readiness, generation quality, product runtime application,
arbitrary-photo readiness, Petdex parity, provider execution, production
readiness, Windows readiness, cross-platform readiness, or ComfyUI readiness.

## PRD / Spec Review

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`.
- Target architecture: `docs/V40.x/v40-target-architecture.md`.
- Development plan: `docs/V40.x/v40-development-and-acceptance-plan.md`.
- Phase specs: `docs/V40.x/v40-phase-specs.md`.
- Acceptance plan: `docs/V40.x/v40-acceptance-plan.md`.
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`.
- Active gap: `docs/active/current-vs-target-gap.md`.
- Drawio gap: `docs/active/current-vs-target-gap.drawio`.

## Current Facts

- V40.1 evidence recorded GPU and Ollama summaries.
- V40.1 evidence recorded ComfyUI as blocked in the current repo/WSL
  environment.
- Historical note: at the time of this superseded audit, WebUI Aki was being
  considered as the planned local image candidate route. Later V40 evidence
  blocked WebUI and replaced it with the no-WebUI Direct Local Runner route.
- WebUI API/model smoke is not yet passed and must be V40.1A.
- Manual/import assets are only a fallback if WebUI is blocked and source-bound
  assets are explicitly supplied.

## Drawio Review

- Page count: 8.
- Language: Chinese.
- Required pages: target experience, current-to-target architecture difference,
  target architecture layers, single-photo-to-action technical path, code
  entities and data flow, development and acceptance plan, milestone/risk
  closure, acceptance thresholds and exit conditions.
- Status colors: green for implemented/scoped baseline, blue for target project
  entities, yellow for tool prerequisites or high-risk work, purple for
  evidence/reporting, red for blocked/no-go/forbidden claims.

## Development And Acceptance Plan

- V40.1A must verify WebUI Aki API/model reachability or record a stable blocked
  reason.
- V40.2 must define no-Comfy safe run and candidate contracts.
- V40.3 may generate WebUI candidates or import accepted manual assets.
- V40.4 must normalize into safe action assets and compare against same-sample
  V39.
- V40.5 must prove product preview, target-only apply, and rollback.
- V40.6 must produce Chinese visual evidence.
- V40.7 may pass only with real same-sample quality improvement and scans.

## Audit Opinion

Current documentation is sufficient to guide the next implementation phase,
V40.1A WebUI Aki smoke. It is not sufficient to claim high-quality 2D action
asset generation, arbitrary-cat automation, Petdex parity, provider execution,
production readiness, Windows readiness, cross-platform readiness, or WebUI
integration.

## Claim Scan

- Status: passed.
- Positive ready claims: none.

## Security Scan

- Status: passed.
- Sensitive values: none.

## Decision

- Status: passed scoped for documentation readiness only.
- Next phase: V40.1A WebUI Aki API/model smoke.
