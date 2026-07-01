# V40 Target Architecture

Date: 2026-06-30

## Architecture Goal

V40 upgrades the target from V39 deterministic characterized SVG/frameSequence
assets to a no-WebUI direct local candidate-production architecture. The goal is
to use a project-owned Direct Local Runner and local Ollama advisory review as
quality inputs while keeping the Agent Desktop Pet runtime, asset contracts,
product gates, evidence rules, and claim boundaries under project control.

## Target Chain

```text
tested cat sample / safe user photo
  -> PhotoSafetyIntake and source boundary
  -> V39 baseline asset snapshot
  -> LocalImageCandidateOrchestrator
  -> DirectLocalModelRunner
  -> DirectLocalImageModelAdapter
  -> OllamaPromptReviewAdapter
  -> local candidate output directory
  -> CandidateSourceDecisionGate
  -> HybridAssetNormalizationGate
  -> HybridVisualPreferenceGate
  -> HybridPreviewApplyRollbackGate
  -> same-sample V39 vs V40 comparison
  -> Chinese HTML evidence report
  -> scoped final gate
```

## Existing Baseline Entities

- `apps/desktop/src/assets/v39-characterized-action-assets.ts`: current scoped
  V39 source/sample, character, rig, action-pack, product-gate, claim-scan, and
  security-scan implementation.
- `apps/desktop/src/main.ts`: settings UI panels that currently expose V37,
  V38, and V39 personalization evidence.
- `apps/desktop/src/assets/v40-direct-local-runner.ts`: current V40.1A scoped
  readiness contract for the project-owned direct runner boundary.
- `apps/desktop/src/assets/v40-no-webui-workflow-contract.ts`: current V40.2
  safe run request, candidate summary, visual review, reason-code, claim-scan,
  and security-scan contract.
- `scripts/v39_*.mjs`: phase evidence and final-gate scripts that V40 should
  reuse as the shape for smoke scripts and acceptance evidence.
- `scripts/v40_1_local_tool_smoke.mjs`: current V40.1 evidence producer that
  records ComfyUI blocked and confirms GPU/Ollama summaries.
- `scripts/v40_1a_webui_aki_smoke.mjs`: historical V40.1A evidence producer
  that records WebUI blocked; it is not an active dependency for the revised
  V40 route.
- `scripts/v40_3_candidate_generation_smoke.mjs`,
  `scripts/v40_3r_img2img_recovery_smoke.mjs`, and
  `scripts/v40_3r_identity_conditioned_smoke.mjs`, and
  `scripts/v40_3r2_identity_conditioned_repair_smoke.mjs`: current
  V40.3/V40.3R/V40.3R2 evidence producers. Prompt-only generation and img2img
  failed visual target experience; V40.3R identity-conditioned generation was
  blocked by runner-stack compatibility; V40.3R2 repaired compatibility enough
  to generate candidates but failed explicit visual review.

## Remaining V40 Target Entities

- `LocalImageCandidateOrchestrator`: owns the no-WebUI route state machine,
  sample binding, run IDs, retry policy, and blocked/failed reason propagation.
- `DirectLocalModelRunner`: already has scoped readiness evidence; V40.3R2
  proved the identity-conditioned runner can generate candidates, but current
  local model/adapter output is not visually acceptable.
- `DirectLocalImageModelAdapter`: submits sanitized generation jobs to the
  direct runner and returns only safe output references, candidate summaries,
  visual-review inputs, and stable reason codes.
- `OllamaPromptReviewAdapter`: creates local prompt/rubric suggestions and
  sanitized review notes using local Ollama; it never becomes pass evidence by
  itself.
- `HybridAssetNormalizationGate`: converts candidate outputs into the project
  asset manifest shape only after explicit visual review passes.
- `CandidateSourceDecisionGate`: V40.3R3 gate that decides whether the next
  candidate source is accepted manual/import, a materially different direct
  runner route, or failed/blocked with V39 fallback. It runs before
  normalization and cannot approve asset quality by itself.
- `HybridVisualPreferenceGate`: compares V40 output against same-sample V39
  output for identity, appeal, action readability, and desktop-pet scale.
- `HybridPreviewApplyRollbackGate`: exposes only accepted candidates to preview,
  target-only apply, rollback, and blocked-reason UI.

The detailed interface, reason-code, UI, and evidence contract is controlled by
`docs/V40.x/v40-implementation-contract.md`.

## Environment Boundary

| Component | Observed State | Architecture Treatment |
| --- | --- | --- |
| RTX 4090 GPU | available, 24GB VRAM | local generation prerequisite |
| Ollama | Windows-side `ollama.exe`, `gemma4:26b` found | planned local advisory text adapter |
| ComfyUI | installed but V40.1 says API/CLI blocked | recorded blocked route, not active dependency |
| WebUI Aki | blocked by V40.1A API/runtime evidence | recorded blocked route, not active dependency |
| Direct Local Runner | V40.1A readiness passed scoped | active route boundary, not quality proof |
| Prompt-only generation | V40.3 generated real candidates but failed visual review | failed route, cannot unlock V40.4 |
| Direct img2img | V40.3R generated real candidates but failed visual review | failed route, cannot unlock V40.4 |
| Identity-conditioned runner | V40.3R2 generated real candidates and a stylized retry, but both failed visual review | failed route, cannot unlock V40.4 |
| V40.3R3 candidate-source decision | next planned documentation and audit gate | chooses accepted manual/import, materially different direct-runner route, or failed/blocked |
| Manual/import assets | not supplied | fallback only with source/license/sample-binding/visual evidence |
| V39 A2++ | scoped passed for tested public-photo samples | baseline and fallback |

## Current To Target Difference

| Area | V39 Current | V40 No-WebUI Target |
| --- | --- | --- |
| Quality source | deterministic SVG/frameSequence | direct local model visual candidates |
| Text assistance | fixed local rules | local Ollama prompt/rubric assistance |
| Product route | V39 panel and product contract evidence | preview/apply/rollback for accepted V40 candidate |
| Acceptance | V39 scoped pass | same-sample improvement over V39 plus product gate |
| Failure handling | Route B blocked | runner/Ollama/model/quality failures become stable blocked reasons |
| Claim | tested public-photo characterized assets | tested-sample local no-WebUI candidate scoped result only |

## Scoped Pass Floor

V40 scoped pass requires at least two tested cat samples to complete the no-WebUI
local direct-runner chain with accepted same-sample V40 assets that a human
reviewer can reasonably prefer over V39. A single good sample, generated prompt
text, runner smoke, or imported image alone cannot pass V40.

Current architecture status is No-Go for V40.4 because no V40.3, V40.3R, or
V40.3R2 candidate has passed explicit visual review. The V40.3R2 architecture
route is decision-complete and failed visual target-experience review:

1. identity-conditioned direct-runner compatibility repair was attempted;
2. real same-sample candidates and one bounded stylized retry were generated;
3. explicit visual review rejected both sets;
4. same-sample manual/import assets remain a future route only when source,
   license, sample binding, and visual acceptance evidence exist before
   implementation;
5. V39 remains the fallback until a future route produces at least two accepted
   candidates.

Any successful route must preserve the same safe contracts and must still pass
V40.4-V40.7 before any scoped quality claim.

V40.3R3 is the only next architecture gate after the V40.3R2 failure. It must
not repeat the failed prompt-only, img2img, or V40.3R2 identity-conditioned route
unless a pre-development audit proves a materially different control mechanism
for identity preservation, full-body action semantics, and desktop-pet visual
quality.

The phase-by-phase pass/block/fail details are controlled by
`docs/V40.x/v40-phase-specs.md`.
