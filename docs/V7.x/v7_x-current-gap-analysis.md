# V7.x Current Gap Analysis

status: V7.0-V7.15 passed scoped

date: 2026-06-01

## Baseline

V6 productization acceptance passed for tested local macOS developer workflow scenarios.

V5/V6 already provide:

- local asset import.
- manifest validation.
- sprite and GLTF runtime paths.
- guided prompt workflow baseline.
- provider feasibility boundary.
- visual QA baseline.

## Baseline Product Gap Closed By V7.0-V7.7

Users still cannot complete a clear personalized cat workflow from their own cat reference to a validated runtime asset without manually piecing together prompts, generated files, manifest rules, import checks, and action mapping.

## Gap Table

| Gap | Current | Target | V7 Owner |
| --- | --- | --- | --- |
| Photo privacy intake | accepted scoped | local no-upload photo/trait intake | V7.1 passed |
| Safe trait metadata | accepted scoped | user-reviewed trait metadata and local prompt pack | V7.2 passed |
| External AI instructions | accepted scoped | complete generation and import checklist | V7.3 passed |
| Provider consent | accepted scoped feasibility-only | explicit consent/credential boundary | V7.4 passed |
| Generated asset validation | accepted scoped | generated asset import and GLTF deep scan | V7.5 passed |
| Action retargeting | accepted scoped | generated action mapping per PetInstance | V7.6 passed |
| Product QA | accepted scoped | personalized workflow final gate | V7.7 passed |

## Advanced Gap Reopened Into V7.8-V7.15

| Gap | Current | Target | V7 Owner |
| --- | --- | --- | --- |
| PRD claim ambiguity | V7.7 scoped passed but advanced gaps remain | clear V7.8-V7.15 gated roadmap | V7.8 passed |
| Real image provider smoke | feasibility-only provider boundary | MiniMax explicit-consent image generation smoke | V7.9 passed scoped |
| Generated 2D action pack | MiniMax-generated sprite pack imported and activated for one target PetInstance | provider/external generated images assembled into core action pack | V7.10 passed scoped |
| External GLB/GLTF intake | local GLB/GLTF intake contract passed; real external provider output not used | real externally generated GLB/GLTF intake contract | V7.11 passed scoped local intake |
| Runtime 3D action mapping | passed scoped with 1x/0.75x nonblank GLTF runtime screenshots, action-state evidence, and corrupt fallback evidence | tested local imported GLB/GLTF runtime mapping | V7.12 passed scoped |
| Workflow orchestration | accepted scoped for tested local 2D generated and external GLB import paths; provider 3D branch blocked | guided photo-to-asset orchestration with stable reason codes | V7.13 passed scoped |
| Advanced visual QA | accepted scoped for generated 2D contact sheet and imported GLB/GLTF runtime screenshots | generated 2D and imported GLB/GLTF screenshots/recordings/performance | V7.14 passed scoped |
| Advanced final gate | accepted scoped with evidence-matched final claim | evidence-matched final advanced claim | V7.15 passed scoped |

## No-Go Areas

V7 scoped Productization Gate passed for V7.0-V7.7. V7 advanced planning still must not claim production release, Windows/cross-platform readiness, MCP ready, OS-level Codex window binding, all Codex workflows verified, broad provider integration, broad 3D readiness, or automatic photo-to-3D unless the exact conditional evidence in V7.13/V7.15 passes.

## Remaining Design References

- `docs/V7.x/v7_remaining_target_architecture.md`
- `docs/V7.x/v7_remaining_development_and_acceptance_plan.md`
