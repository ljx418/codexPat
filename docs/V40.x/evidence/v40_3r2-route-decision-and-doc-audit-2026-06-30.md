# V40.3R2 Route Decision And Documentation Audit

Date: 2026-06-30

## Objective

This evidence records a documentation-only route decision inside the existing
V40 stage. It does not implement code and does not create a new project stage.

The goal is to remove ambiguity before automated development resumes.

## Current Evidence Baseline

- V40.1A Direct Local Runner smoke: passed scoped.
- V40.2 no-WebUI workflow contract: passed scoped.
- V40.3 prompt-only direct generation: failed visual target-experience review.
- V40.3R direct img2img recovery: failed visual target-experience review.
- V40.3R identity-conditioned direct runner: blocked by runner-stack
  compatibility before candidate generation.
- Current desktop runtime visibility: built-in orange cartoon pet with healthy
  bridge only; not V40 image-to-action asset evidence.
- V40.4-V40.7: No-Go.

## Route Decision

V40.3R2 defaults to identity-conditioned direct-runner compatibility repair.

Same-sample manual/import assets are allowed only as a fallback when all of
these are available before implementation starts:

- source-bound same-sample asset files;
- source/license evidence;
- sample binding to the tested cat sample;
- explicit visual acceptance evidence;
- safe relative references only.

If identity-conditioned repair cannot produce accepted candidates and no
accepted same-sample import assets exist, V40.3R2 must be blocked or failed and
V39 remains the product fallback.

## Development Support Assessment

The document set now supports automated development to a truthful
passed/blocked/failed result for V40.3R2 and later gates. It does not guarantee a
passed visual-quality result, because model compatibility, identity preservation,
full-body action semantics, and human visual preference must be proven by real
candidate evidence.

V40.4 can start only after at least two same-sample V40.3R2 candidates pass
explicit visual review.

## Updated Documents

- `docs/active/agent_desktop_pet_prd_v40.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/V40.x/v40-target-architecture.md`
- `docs/V40.x/v40-development-and-acceptance-plan.md`
- `docs/V40.x/v40-phase-specs.md`
- `docs/V40.x/v40-risk-and-claim-matrix.md`
- `docs/V40.x/v40-milestones.md`

## Risk Closure Result

| Risk | Closure |
| --- | --- |
| Route ambiguity | closed by defaulting to identity-conditioned runner repair |
| False V40.4 unlock | closed by requiring two explicit visual-review passes |
| WebUI/ComfyUI re-entry | closed by keeping them historical blocked routes |
| Import asset ambiguity | closed by requiring source/license/sample-binding/visual acceptance evidence |
| Visual quality uncertainty | not fully removable; controlled by pass/block/fail gates |

## Claim Scan

- Status: passed.
- This evidence does not claim arbitrary-cat automatic generation, Petdex
  parity, provider integration, 3D readiness, production release readiness,
  Windows readiness, cross-platform readiness, WebUI readiness, or ComfyUI
  readiness.

## Security Scan

- Status: passed.
- This evidence records safe relative document references only.
- It does not record token values, Authorization values, raw prompts, raw
  payloads, raw generated image bytes, raw photo bytes, EXIF/GPS, full local
  paths, workspace paths, config paths, credential paths, terminal titles, or raw
  command transcripts.

## Decision

- Status: passed scoped for documentation readiness only.
- Implementation may resume only with a V40.3R2 pre-development audit for
  identity-conditioned direct-runner compatibility repair.
- If implementation cannot repair that route, it may use accepted same-sample
  import assets only when the import evidence exists before development starts.
