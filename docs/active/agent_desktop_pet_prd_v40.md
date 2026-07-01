# Agent Desktop Pet PRD V40 - No-WebUI Local High-Quality 2D Action Assets

Date: 2026-06-29

## Scope

V40 targets the quality gap left by V39. V39 proved a scoped local characterized
2D action-asset chain for tested public-photo samples, but those assets still
look like deterministic prototype SVG/frameSequence assets rather than
high-quality desktop pet assets that most users would clearly prefer.

V40 no longer uses ComfyUI or WebUI as active generation routes. V40.1 real
evidence showed that ComfyUI is installed but not scriptable from the current
repo/WSL environment. V40.1A real evidence showed that WebUI Aki is blocked by
API/runtime constraints. The active V40 route is now an in-project Direct Local
Runner route:

```text
tested cat photo/sample
  -> safe intake and source boundary
  -> V39 same-sample baseline snapshot
  -> Direct Local Runner smoke
  -> direct local image/model candidate generation or explicit blocked reason
  -> Ollama advisory prompt/review summary
  -> V40 normalization and safety gates
  -> high-quality 2D character/action candidate
  -> preview, target-only apply, rollback
  -> visual evidence and scoped final gate
```

The local machine has an RTX 4090 GPU and a Windows-side Ollama installation
with `gemma4:26b`. Local model files may be present, but WebUI and ComfyUI must
not be treated as project runtime dependencies. Therefore V40 must first verify
a project-owned direct local runner, dependency summary, model summary, and safe
artifact contract before any generation claim.

V40 must not claim arbitrary-cat automatic generation, provider integration
verified, Route B verified, Petdex parity, 3D readiness, production release
readiness, Windows readiness, cross-platform readiness, MCP readiness, Claude
Code integration, OS-level Codex window binding, or all workflow verification.

## Current Execution Status

As of 2026-06-29, V40.1A Direct Local Runner smoke has passed scoped and V40.2
no-WebUI workflow contract has passed scoped. V40.3 generated real local
checkpoint candidates for two tested public cat samples, but visual review
failed them: the outputs were more attractive than V39 deterministic SVG assets,
yet did not preserve source-bound same-cat identity and action consistency well
enough for normalization or product apply.

V40.3R recovery has also been attempted inside this same V40 plan. Direct
img2img used the real V38 sanitized public cat samples and preserved source
identity better than prompt-only generation, but explicit visual review still
failed the route because the outputs remained photo-like and did not provide
readable full-body action semantics. The identity-conditioned direct runner
route downloaded the required local IP-Adapter files and was tested without
WebUI/ComfyUI runtime dependency, but it was initially blocked by runner-stack
compatibility before candidate generation. V40.3R2 repaired that runner
compatibility enough to generate two real same-sample candidate sets, plus one
stylized retry set, on 2026-06-30. Explicit visual review failed both sets
because the outputs remained photo-like or artifact-prone and did not provide
readable eight-action desktop-pet semantics. V40.4-V40.7 remain No-Go.
Same-sample manual/import assets are allowed only as fallback when source,
license, sample binding, and visual acceptance evidence already exist.

The current desktop runtime can launch and show the built-in orange cartoon pet
with a healthy local bridge. That proves runtime visibility only. It does not
prove V40 image-to-action asset generation, V40 action asset application, or
high-quality target experience. The 2026-07-01 host-process probe generated
three synthetic cat images and deterministic template GIF action assets for
process inspection only; it is not accepted V40 image-to-action evidence.

The latest in-scope V40 implementation result is V40.3R2 failed. V40 must keep
the existing scope and use this route order for any further work:

1. treat the identity-conditioned direct runner repair as attempted and failed
   visual target-experience review for the current local model route;
2. run a V40.3R3 candidate-source decision before any more implementation,
   proving that the next source is not a silent retry of the failed prompt-only,
   img2img, or V40.3R2 identity-conditioned route;
3. use explicitly accepted same-sample manual/import assets only if source,
   license, sample binding, and visual acceptance evidence are supplied before
   implementation starts;
4. keep V39 as fallback if neither route can produce two accepted candidates.

V40.3R2 must not create a new project stage, reintroduce WebUI/ComfyUI, or unlock
V40.4 without explicit visual review pass evidence.

V40.3R3 is an in-place V40 risk-closure and candidate-source decision gate, not
a new project stage. It has now recorded `remain_failed_or_blocked`: no accepted
manual/import source, license, sample binding, and visual acceptance evidence
exists, and no materially different direct-runner evidence exists. V40.4-V40.7
remain No-Go.

V40.3R4 is the next documentation-only route replan gate inside the same V40
stage. It must not start product code or normalize assets. Its purpose is to
define a credible candidate source before any further implementation. It may
select exactly one next route:

- `accepted_manual_import_first`: source-bound same-sample assets already have
  source, license, sample binding, and visual acceptance evidence, so V40.4 may
  be planned against those assets only;
- `new_direct_runner_route_allowed`: a materially different local runner route
  has documented identity/action controls and pre-development audit evidence
  showing why it is not a repeat of the failed V40.3/V40.3R/V40.3R2 attempts;
- `remain_failed_or_blocked`: no credible candidate source exists, so V40 stays
  failed/blocked and V39 remains the product fallback.

V40.3R4 route decision: `new_direct_runner_route_allowed` is the selected next
route under strict constraints. The route must use a project-owned direct local
runner, explicit source/sample records, subject mask/crop planning, identity
anchors, action pose conditions, and V39 same-sample comparison. It must not use
WebUI, ComfyUI, cloud provider output, or Ollama as an image/animation
generator. It is allowed to proceed only to pre-development audit and later
route-specific implementation. It still cannot unlock V40.4 until at least two
same-sample candidates pass explicit visual review.

The intended user-facing improvement is that V40 should stop producing a stiff
whole-image transform. The future route must first understand the cat as a
subject, preserve that cat's identity, and generate distinct action frame
sequences. If the result is only one still image being moved, scaled, rotated,
or wrapped as a template GIF, it must fail.

V40.3R4 cannot itself claim generated asset quality. It only decides whether a
candidate source is credible enough to attempt the next implementation phase.
The host synthetic template probe, V40.3 prompt-only outputs, V40.3R img2img
outputs, and V40.3R2 identity-conditioned outputs cannot be reused as accepted
V40 candidates.

After V40.3R4 documentation acceptance, the remaining route is split before
V40.4:

- V40.3R5 direct-runner predev audit must prove source/license records, sample
  matrix, local model/control availability, subject mask/crop plans, identity
  anchors, action pose controls, safe runner invocation, and visual review
  rubric. It must also record the action-name mapping boundary: V40 generated
  assets use `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`,
  `celebrate`; product runtime states such as `thinking`, `running`, `success`,
  `warning`, `error`, `need_input`, and `sleeping` map onto those asset actions
  instead of replacing them.
- V40.3R6 controlled candidate frame generation may run only after V40.3R5
  passes. It must produce bounded candidate frame sequences, explicit visual
  review, and same-sample V39 comparison. If fewer than two candidates pass
  visual review, V40.4 remains No-Go.

## Target User Experience

The target user should be able to compare V39 prototype-quality action assets
against V40 no-WebUI local candidates and quickly see whether the V40 route
produces a more attractive desktop pet:

- the cat should look intentionally designed from the source photo, not like a
  simple line drawing, a photo card, or a raw generated image dump;
- visible identity traits should survive generation, review, and normalization;
- at least eight action previews should be readable and appealing at desktop-pet
  size;
- failed, unsafe, unavailable, or low-quality candidates should be blocked before
  apply;
- process-only probes and template GIFs should be visibly labeled as not
  accepted when they do not prove image understanding or target asset quality;
- the UI should show preview, target-only apply, rollback, blocked reason, and
  evidence status;
- the final report should be honest about whether V40 is better than V39 and
  still short of Petdex-level quality.

## Product Requirements

- Keep V39 A2++ as the baseline and fallback route.
- Add a Direct Local Runner route that can consume tested samples and produce
  candidate character/action assets only after a real runner/model smoke passes.
- For V40.3R4 and later work, the direct route must include `PhotoSafetyIntake`,
  `SourceAndLicenseRecord`, `SubjectMaskAndCropPlan`, `IdentityAnchorPack`,
  `ActionPoseConditionPack`, `DirectDiffusersFrameRunner`,
  `CandidateFrameSequence`, `CandidateQualityReview`, and
  `V39SameSampleComparison` as auditable route entities before product
  normalization starts.
- Use Ollama only for local prompt/rubric/review assistance. Ollama output cannot
  replace visual evidence, human review, or asset-quality gates.
- Keep ComfyUI and WebUI as recorded blocked routes, not active V40 dependencies.
- Require explicit local-source, consent, retention, and redaction boundaries for
  any photo used by the generation route.
- Store only sanitized candidate summaries, safe relative asset references, and
  stable reason codes in evidence.
- Normalize accepted local output into the same safe product shape used by
  existing asset preview/apply/rollback paths.
- Compare V40 candidates against V39 for the same sample IDs before claiming a
  scoped quality improvement.
- Record runner dependency missing, model missing, VRAM exhausted, generation
  failed, unsafe image, identity drift, action unreadable, and visual preference
  failed as stable blocked/failed reason codes.
- Require at least two tested cat samples and one negative or blocked sample for
  any scoped final pass.

## Technical Route Boundary

V40 is not a cloud provider route. It is a direct local model/tool route using
project-owned runner contracts and local gates. It may produce better visual
candidates than V39, but it cannot skip normalization, safety, product, claim, or
security gates.

The first implementation phase after this documentation update must verify:

- the direct local runner environment can be created or reached from the repo
  environment without WebUI or ComfyUI;
- at least one selected model/checkpoint can be summarized safely;
- a small controlled runner readiness probe can complete without leaking raw
  prompts, raw payloads, raw image bytes, or local paths into evidence;
- output can be copied into a sanitized local candidate directory and referenced
  by safe relative paths only.

If direct runner smoke fails, V40 must be marked blocked or narrowed to
import-ready manual/professional assets. It cannot be rewritten as a successful
automatic generation route.

## Exit Criteria

- V40 docs define the no-WebUI direct local route, concrete target code entities,
  phase-by-phase development, and acceptance gates before code continues.
- `current-vs-target-gap.drawio` is synchronized, Chinese, no more than eight
  pages, and shows specific code entities and interaction relationships.
- Active PRD, development plan, acceptance plan, gap analysis, milestones, risk
  matrix, and scan checklist agree on the same V40 no-WebUI target and
  boundaries.
- Direct Local Runner readiness smoke is scoped passed, but prompt-only and
  img2img candidate quality failed; Ollama remains advisory only.
- Final V40 implementation may only pass scoped if real same-sample visual
  evidence shows improvement over V39 and product preview/apply/rollback gates
  pass.
- If the generated output still looks like V39 prototype art, the correct result
  is failed or blocked evidence, not a false high-quality claim.
- If V40.3R3 cannot identify a credible candidate source, the correct result is
  to keep V40 failed/blocked with V39 fallback rather than start V40.4.
- If V40.3R4 cannot select a materially credible route with pre-development
  audit evidence, V40 remains failed/blocked and V39 remains the fallback.
- If the selected V40.3R4 direct runner route cannot prove local model/control
  availability, sample binding, identity controls, action controls, and visual
  review rules before implementation, it must be marked blocked or failed rather
  than downgraded to template GIFs or prompt-only generation.
