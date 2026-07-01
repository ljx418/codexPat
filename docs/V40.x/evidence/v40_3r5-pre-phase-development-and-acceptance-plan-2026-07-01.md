# V40.3R5 Pre-Phase Development And Acceptance Plan

Date: 2026-07-01

## Objective
Prepare the constrained Direct Local Runner route for one later bounded generation attempt. This phase does not generate candidate images and does not unlock V40.4.

## Controlling PRD And Specs
- PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Contract: docs/V40.x/v40-implementation-contract.md.
- Evidence checklist: docs/V40.x/v40-evidence-and-scan-checklist.md.

## Development Plan
- Close the code-entity drift by adding concrete V40 no-WebUI orchestrator and direct-model adapter boundaries.
- Build a real sample matrix from V38/V39 tested public samples.
- Audit local model, control component, output directory, and runner redaction boundaries.
- Define mask/crop plans, identity anchors, eight action pose controls, action-name mapping, and visual rubric before generation.

## Acceptance Plan
- Pass only when all R5 artifacts exist as safe summaries or safe relative references and scans pass.
- Block when local model/control components, sample source/license evidence, or runner invocation are unavailable.
- Fail when evidence uses prompt-only, template GIF, whole-image transform, WebUI/ComfyUI, provider output, unsafe refs, or forbidden claims.

## Audit Closure
- Finding: V40 docs referenced LocalImageCandidateOrchestrator and DirectLocalImageModelAdapter while code lacked matching entities.
- Closure: R5 implementation adds the concrete V40 local orchestrator and direct local image model boundaries before the audit can pass.

## Human Risk Boundary
- No human confirmation is required for R5 because it only records pre-generation audit state.
- Human confirmation is required later if generated R6 assets are visually marginal but automation attempts to treat them as acceptable.
