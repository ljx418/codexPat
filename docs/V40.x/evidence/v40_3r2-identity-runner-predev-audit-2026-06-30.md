# V40.3R2 Identity Runner Pre-Development Audit

Date: 2026-06-30

## Controlling Documents

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Target architecture: `docs/V40.x/v40-target-architecture.md`
- Development plan: `docs/V40.x/v40-development-and-acceptance-plan.md`
- Phase specs: `docs/V40.x/v40-phase-specs.md`
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`
- Route decision audit: `docs/V40.x/evidence/v40_3r2-route-decision-and-doc-audit-2026-06-30.md`
- Final documentation support audit: `docs/V40.x/evidence/v40_3r2-doc-support-final-audit-2026-06-30.md`

## Current Evidence Baseline

- V40.1A Direct Local Runner smoke: passed scoped.
- V40.2 no-WebUI workflow contract: passed scoped.
- V40.3 prompt-only generation: failed visual target-experience review.
- V40.3R direct img2img generation: failed visual target-experience review.
- V40.3R identity-conditioned generation: blocked by runner-stack
  compatibility before candidate generation.
- V40.4-V40.7 remain No-Go.

## Development Plan

Repair the project-owned identity-conditioned Direct Local Runner path without
introducing WebUI or ComfyUI as active dependencies.

In scope:

- `scripts/v40_direct_runner_ip_adapter_candidates.py`
- a V40.3R2 smoke wrapper under `scripts/`
- safe evidence under `docs/V40.x/evidence/`
- existing V40 no-WebUI contract validation

Out of scope:

- WebUI or ComfyUI runtime calls;
- cloud provider generation;
- Petdex asset reuse;
- production, Windows, cross-platform, 3D, or arbitrary-cat readiness claims;
- V40.4 normalization before explicit visual review passes.

## Acceptance Criteria

Pass only if:

- the runner uses real V38 sanitized public cat samples;
- at least two same-sample candidates are generated through the no-WebUI
  identity-conditioned route;
- every candidate exposes safe relative refs only;
- explicit visual review accepts at least two candidates for same-cat identity,
  eight-action readability, desktop-pet scale appeal, and improvement over V39;
- claim and security scans pass.

Block if:

- local runner dependencies, model files, image encoder, IP-Adapter weights, GPU,
  or VRAM are unavailable;
- compatibility repair requires a scope change;
- no accepted same-sample manual/import fallback evidence exists.

Fail if:

- generation runs but candidates drift identity, look photo-like, miss action
  semantics, include multi-subject/humanoid/text artifacts, or are not clearly
  better than V39;
- evidence leaks raw prompts, raw payloads, raw photo bytes, token values,
  Authorization values, full local paths, workspace paths, config paths, or
  credential paths.

## Audit Opinion

No fatal or major PRD/spec deviation is open before implementation. The only
permitted next implementation step is V40.3R2 identity-conditioned runner
compatibility repair. Later phases remain locked until explicit visual review
passes.

## Claim Scan

Status: passed.

Forbidden ready claims appear only as forbidden or not-ready boundaries in the
controlling documents.

## Security Scan

Status: passed.

This audit records safe relative document references only and no raw prompts,
raw runner payloads, raw photo bytes, generated image bytes, token values,
Authorization values, full local paths, workspace paths, config paths,
credential paths, terminal titles, or raw command transcripts.
