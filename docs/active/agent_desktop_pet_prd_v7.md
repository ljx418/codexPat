# PRD: Agent Desktop Pet V7 Personalized Cat Asset Workflow

status: V7.0-V7.15 scoped accepted

date: 2026-05-31

## Product Goal

V7 turns the accepted V6 local macOS developer workflow into a personalized cat asset workflow:

```text
user cat photo / traits -> safe local description -> standardized generation instructions or explicit-consent provider boundary -> validated local asset pack -> per-PetInstance runtime action mapping.
```

V7 is a post-V6 track. It must not reopen V6, create another V6 phase, or expand V6 productization claims.

V7.0-V7.7 are the accepted scoped baseline for local guided/provider-assisted personalized asset workflows. V7.8 accepted the advanced scope and claim boundary. V7.9 accepted a scoped MiniMax image provider smoke. V7.10 accepted generated 2D action pack assembly and target runtime activation for a tested MiniMax-generated sprite scenario. V7.11 accepted local GLB/GLTF intake contract evidence while keeping external photo-to-3D provider output not-ready. V7.12 accepted scoped tested local imported GLB/GLTF runtime action mapping evidence. V7.13 accepted scoped photo-to-asset orchestration for tested local 2D generated and external GLB import workflows. V7.14 accepted scoped advanced visual QA for those accepted paths. V7.15 accepted the evidence-matched advanced final gate.

## User Experience Target

The target user can:

1. choose a local cat photo or enter cat traits.
2. review and approve safe cat traits before any prompt or provider workflow uses them.
3. generate a standardized prompt pack and import checklist for external image/3D generation tools.
4. optionally use an explicit-consent provider workflow when credentials and consent are supplied.
5. import generated sprite or GLTF/GLB assets through the existing local asset validation pipeline.
6. map generated assets to core pet actions.
7. activate the generated pack for one PetInstance without affecting default or unrelated pets.

## Claim Boundaries

V7.0-V7.7 do not claim:

```text
production signed release ready
cross-platform ready
Windows ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
3D ready
Rive ready
Live2D ready
asset marketplace ready
MCP ready
Third-party agent integration verified
OS-level Codex window binding ready
all Codex workflows verified
```

V7.8-V7.15 may pursue narrower gated claims for tested scenarios:

- MiniMax image provider consent boundary for explicit-consent local smoke.
- generated 2D action asset pack assembly.
- external GLB/GLTF intake contract.
- tested local 3D runtime action mapping.
- conditional automatic photo-to-3D runtime asset workflow only if real photo input, real 3D provider output, GLTF deep scan, runtime action mapping, and visual QA all pass.

V7.8-V7.15 still do not claim production signed release, cross-platform readiness, Windows readiness, MCP ready, OS-level Codex window binding ready, or all Codex workflows verified.

## Privacy Boundary

Default behavior:

- no photo upload.
- no raw photo persistence.
- no EXIF/GPS persistence.
- no full local path in logs, prompts, evidence, manifests, diagnostics, or renderer payloads.
- no prompt text or provider payload enters renderer.
- no provider credential enters manifest, renderer, evidence, or logs.

Allowed local data:

- user-confirmed traits.
- safe pack/profile IDs.
- safe action IDs.
- sanitized metadata needed for import and runtime activation.

## Core Actions

V7-generated packs must target the existing core actions:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

## V7 Roadmap

| Phase | Goal | Allowed Claim |
| --- | --- | --- |
| V7.0 | scope freeze and claim matrix | V7 personalized cat asset workflow scope frozen with privacy, generation, import, action mapping, QA, and claim boundaries. |
| V7.1 | photo intake and privacy boundary | V7.1 local photo intake privacy boundary passed for tested local no-upload scenarios. |
| V7.2 | local trait extraction and prompt pack | V7.2 local trait and prompt pack generation passed for tested user-approved metadata scenarios. |
| V7.3 | external generation instruction workflow | V7.3 external generation instruction workflow passed for tested local guided asset scenarios. |
| V7.4 | provider consent and credential boundary | V7.4 provider consent and credential boundary passed for feasibility-only or explicitly tested provider scenarios. |
| V7.5 | generated asset import and GLTF deep scan | V7.5 generated asset import validation passed for tested local sprite and GLTF asset scenarios. |
| V7.6 | action mapping and runtime retargeting | V7.6 generated asset action mapping passed for tested per-PetInstance runtime scenarios. |
| V7.7 | productization gate | V7 personalized cat asset workflow passed for tested local guided/provider-assisted asset generation scenarios. |
| V7.8 | advanced gap scope reopen | passed: V7.8 advanced personalized asset gap scope frozen with updated claim gates. |
| V7.9 | MiniMax image provider smoke | passed: V7.9 MiniMax image provider consent boundary passed for tested explicit-consent local smoke scenario. |
| V7.10 | generated 2D action pack assembly | passed: V7.10 generated 2D action asset pack assembly and target PetInstance runtime activation passed for tested local MiniMax-generated sprite scenarios. |
| V7.11 | external GLB/GLTF intake contract | passed scoped: V7.11 GLB/GLTF intake contract passed for tested local GLB/GLTF asset scenario; external photo-to-3D provider output remains not-ready. |
| V7.12 | true 3D runtime action mapping | passed scoped: tested local imported GLB/GLTF runtime action mapping evidence. |
| V7.13 | photo-to-asset orchestration | passed: V7.13 photo-to-asset orchestration passed for tested local 2D generated asset workflow and external GLB import workflow. |
| V7.14 | advanced visual QA | passed: V7.14 advanced visual QA passed for tested generated 2D and imported GLB/GLTF cat asset scenarios. |
| V7.15 | advanced productization gate | passed: V7 advanced personalized cat asset workflow passed for tested generated 2D and imported GLB/GLTF runtime scenarios; automatic photo-to-3D remains not-ready. |

## Acceptance Principle

Every V7 phase must include:

- development plan.
- acceptance plan.
- claim matrix.
- PRD spec review.
- plan audit.
- evidence.
- final acceptance report.
- drift and false-green risk assessment.

If High risk remains unresolved, the next phase must not begin.
