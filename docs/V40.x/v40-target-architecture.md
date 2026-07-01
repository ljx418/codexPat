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
  -> CandidateSourceReplanGate
  -> DirectRunnerPredevAuditGate
  -> ControlledCandidateFrameGenerationGate
  -> HybridAssetNormalizationGate
  -> HybridVisualPreferenceGate
  -> HybridPreviewApplyRollbackGate
  -> same-sample V39 vs V40 comparison
  -> Chinese HTML evidence report
  -> scoped final gate
```

## Reader's Map

V40.3R4 does not mean the project already has high-quality generated action
assets. It means the next implementation must follow a more specific route than
the failed prompt-only/img2img attempts:

```text
photo or accepted sample
  -> prove source is usable
  -> isolate the cat body
  -> record identity anchors for the same cat
  -> define eight action pose controls
  -> run local direct model wrapper
  -> review frame sequences
  -> compare against same-sample V39
```

The most important architectural distinction is that V40.3R4 introduces
pre-generation structure. The project should not ask a model to "make a cat
animation" from a raw image. It must first create source, mask, identity, and
action-control artifacts that make the generated frames auditable.

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
- `CandidateSourceReplanGate`: V40.3R4 documentation-only gate after V40.3R3
  `remain_failed_or_blocked`. It freezes the next candidate source strategy,
  pre-development audit requirements, sample set, route-specific risk controls,
  and acceptance evidence before any implementation resumes.
- `DirectRunnerPredevAuditGate`: V40.3R5 gate that proves source/license
  records, sample matrix, model/control availability, mask/crop plans, identity
  anchors, action pose controls, safe runner invocation, and visual rubric before
  any generation run.
- `ControlledCandidateFrameGenerationGate`: V40.3R6 gate that runs only after
  V40.3R5 passes. It produces bounded candidate frame sequences, explicit visual
  review, blocked/negative sample results, and same-sample V39 comparison before
  any normalization attempt.
- `SourceAndLicenseRecord`: evidence-only record for each accepted sample or
  imported asset source. It records sanitized source, permission/license,
  sample binding, retention decision, and safe relative references.
- `SubjectMaskAndCropPlan`: pre-generation contract for isolating the cat body,
  preserving useful silhouette, and avoiding raw-photo leakage in evidence.
- `IdentityAnchorPack`: pre-generation contract for markings, color palette,
  face/body proportions, and sample ID continuity.
- `ActionPoseConditionPack`: pre-generation contract for at least eight
  desktop-pet asset actions and pose/control inputs. The V40 asset action set is
  `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, `celebrate`.
  Runtime product states such as `thinking`, `running`, `success`, `warning`,
  `error`, `need_input`, and `sleeping` must be mapped to these asset actions
  before generation and must not rename the asset pack.
- `DirectDiffusersFrameRunner`: future direct local runner wrapper. It may call
  local model components directly, but must not depend on WebUI or ComfyUI.
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
| V40.3R3 candidate-source decision | blocked scoped with `remain_failed_or_blocked` | no accepted source; cannot unlock V40.4 |
| Host synthetic template probe | generated three local synthetic cat images and template GIF sets | process-only evidence, not V40 accepted asset evidence |
| V40.3R4 candidate-source replan | selected `new_direct_runner_route_allowed` for documentation | direct runner predev audit required before implementation |
| V40.3R5 direct-runner predev audit | planned | required before generation; no asset approval |
| V40.3R6 controlled candidate frame generation | planned | required before V40.4; two explicit visual passes needed |
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

V40.3R3 has recorded that no credible candidate source existed at that gate.
V40.3R4 selects a constrained direct-runner route for the next documented
attempt. The route is materially different only if pre-development audit proves
source/license records, subject mask/crop planning, identity anchors, action
pose conditions, local model/control availability, and safe runner invocation.
V40.3R5 must prove those prerequisites before generation. V40.3R6 must then
produce bounded candidate frame sequences and at least two explicit visual
passes before V40.4 can start.

The phase-by-phase pass/block/fail details are controlled by
`docs/V40.x/v40-phase-specs.md`.
