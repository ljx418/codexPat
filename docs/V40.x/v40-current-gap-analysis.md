# V40 Current Gap Analysis

Date: 2026-06-30

## Current Baseline

V39 passed scoped for tested public-photo samples through Route A2++ local
characterized, part-based, layered 2D action asset evidence. It improved over
V38 photo-card/overlay prototypes but still has a visible target-experience gap:

- output is still deterministic SVG/frameSequence evidence;
- character appeal is below the desired high-quality desktop-pet result;
- no broad arbitrary-cat automation is proven;
- Route B professional/manual assets remain a possible future quality reference
  but are not supplied.

## V40 No-WebUI Target Gap

V40 should evaluate whether a no-WebUI direct local route can reduce this gap:

- Direct Local Runner creates higher-quality visual candidates without WebUI or
  ComfyUI as runtime dependencies;
- local Ollama assists prompt/rubric/review only;
- project-owned gates normalize and compare outputs against same-sample V39;
- manual/import assets remain a fallback only when local generation is blocked.

## Current Tool Reality

- GPU: available.
- Ollama: available with safe model summary.
- ComfyUI: installed but not scriptable from the current repo/WSL environment;
  V40.1 is blocked and must not be treated as generation readiness.
- WebUI Aki: blocked by V40.1A evidence and removed from the active route.
- Direct Local Runner readiness: V40.1A scoped passed for dependency/model/GPU
  boundary and safe output references.
- Direct prompt-only generation: V40.3 produced real local candidates but failed
  visual target-experience review.
- Direct img2img recovery: V40.3R used real V38 sanitized public cat samples and
  failed visual target-experience review.
- Identity-conditioned recovery: V40.3R initially reached the local adapter path
  but was blocked by runner-stack compatibility. V40.3R2 repaired the runner
  compatibility enough to generate real same-sample candidates plus one bounded
  stylized retry, but explicit visual review rejected both sets for photo-like
  backgrounds, artifacts, and weak eight-action semantics.
- Current runtime: desktop pet can launch and show the built-in orange cartoon
  pet with a healthy local bridge; this is not V40 image-to-action evidence.
- Host-process synthetic template probe: generated three local synthetic cat
  images and 24 deterministic GIF actions on 2026-07-01; this is process
  evidence only and is not accepted V40 high-quality image-to-action evidence.

## Remaining Gap

If direct-runner output does not visibly improve on V39, V40 must not pass as a
high-quality target-experience stage. It should either fail the quality gate or
record a blocked/failed decision toward manual/professional import-ready assets.

That gap is now active: prompt-only, img2img, and V40.3R2 identity-conditioned
routes did not produce accepted V40 candidates. V40.4 normalization, V40.5
product apply, V40.6 report, and V40.7 final gate cannot start until a future
approved route creates or imports at least two same-sample candidates that pass
explicit visual review.

V40.3R3 has now made that candidate-source decision and recorded
`remain_failed_or_blocked`: there are no acceptable source-bound manual/import
assets, no source/license/sample-binding/visual acceptance evidence, and no
materially different Direct Local Runner route. The immediate remaining gap is
V40.3R4 candidate-source replan. It now selects a constrained
`new_direct_runner_route_allowed` path and requires pre-development audit before
any implementation resumes.

The remaining development gap after V40.3R4 is intentionally split into two
gates before V40.4:

- V40.3R5 must prove source/license records, sample matrix, local model/control
  availability, mask/crop plans, identity anchors, action pose controls, safe
  runner invocation, and visual review rubric before generation.
- V40.3R6 must generate bounded candidate frame sequences and record explicit
  visual review against same-sample V39. Without two visual passes, V40.4
  remains No-Go.

## Required Documentation Closure

The active docs, drawio, phase specs, acceptance plan, and implementation
contract must all use the same current-state wording:

- V40.1A and V40.2 passed scoped.
- V40.3 failed.
- V40.3R img2img failed.
- V40.3R identity-conditioned route was blocked.
- V40.3R2 identity-conditioned repair generated real candidates but failed
  explicit visual review, including the bounded stylized retry.
- V40.3R3 candidate-source decision is blocked scoped with
  `remain_failed_or_blocked`.
- V40.3R4 candidate-source replan is the next required documentation gate before
  any more implementation, and it constrains that implementation to direct local
  runner source records, subject mask/crop planning, identity anchors, action
  pose conditions, candidate quality review, and V39 same-sample comparison.
- V40.3R5 and V40.3R6 are required before V40.4: predev audit first, controlled
  frame generation and explicit visual review second.
- V40.4-V40.7 remain No-Go.
- The only next V40 work is the selected constrained direct local runner
  pre-development audit under the same no-WebUI/no-ComfyUI boundary; it must not
  silently reinterpret V40.3R2 failed evidence as readiness.
- Host synthetic template GIFs must stay labeled as `generated_not_accepted` and
  cannot unlock V40.4.
