# V40 No-Comfy Documentation Audit

Date: 2026-06-27

## Objective

Revise the current V40 documentation after the user explicitly removed ComfyUI
from the active route. This evidence covers documentation only. It does not
prove WebUI Aki API readiness, generation quality, product runtime application,
arbitrary-photo readiness, Petdex parity, provider execution, production
readiness, Windows readiness, or cross-platform readiness.

## PRD / Spec Review

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`.
- Target architecture: `docs/V40.x/v40-target-architecture.md`.
- Development plan: `docs/V40.x/v40-development-and-acceptance-plan.md`.
- Phase specs: `docs/V40.x/v40-phase-specs.md`.
- Acceptance plan: `docs/V40.x/v40-acceptance-plan.md`.
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`.
- Active gap and drawio synchronized to the no-Comfy WebUI route.

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

Current documentation is now sufficient to guide the next documentation-reviewed
implementation phase, V40.1A WebUI Aki smoke. It is not sufficient to claim
high-quality 2D action asset generation, arbitrary-cat automation, Petdex parity,
provider execution, production readiness, Windows readiness, or cross-platform
readiness.

## Claim Scan

- Status: passed.
- Positive ready claims: none.

## Security Scan

- Status: passed.
- Sensitive values: none.

## Decision

- Status: passed scoped for documentation readiness only.
- Next phase: V40.1A WebUI Aki API/model smoke.
