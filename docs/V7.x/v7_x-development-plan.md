# V7.x Development Plan

status: V7.0-V7.15 accepted scoped

date: 2026-06-01

## Summary

V7.x builds a personalized cat asset workflow on top of the accepted V6 scoped baseline.

V7.x does not modify V3/V4 Codex monitoring semantics, does not reopen V6, and does not claim production release, Windows/cross-platform readiness, MCP ready, OS-level Codex window binding, or all Codex workflows verified.

V7.0-V7.7 are accepted scoped as of 2026-05-31.

V7.8 accepted the advanced gap closure scope and claim boundary. V7.9 accepted scoped MiniMax image provider smoke. V7.10 accepted generated 2D action pack assembly and target runtime activation for a tested MiniMax-generated sprite scenario. V7.11 accepted local GLB/GLTF intake contract evidence. V7.12 accepted scoped tested local imported GLB/GLTF runtime action mapping evidence. V7.13 accepted scoped photo-to-asset orchestration for tested local 2D generated and external GLB import paths. V7.14 accepted scoped advanced visual QA for those accepted paths. V7.15 accepted the evidence-matched advanced final gate.

Detailed remaining V7 design is split into:

- `docs/V7.x/v7_remaining_target_architecture.md`
- `docs/V7.x/v7_remaining_development_and_acceptance_plan.md`

## Roadmap

| Phase | Goal | Implementation Focus |
| --- | --- | --- |
| V7.0 | Scope Freeze & Claim Matrix | PRD, claim boundary, evidence map, no-false-green gates |
| V7.1 | Photo Intake & Privacy Boundary | local photo chooser, no-upload/no-persist policy, safe trait review |
| V7.2 | Local Trait Extraction & Prompt Pack | user-approved trait metadata, prompt pack, manifest template |
| V7.3 | External Generation Instruction Workflow | guided external AI instructions, asset checklist, fallback paths |
| V7.4 | Provider Consent & Credential Boundary | explicit consent UI, credential redaction, feasibility or scoped provider smoke |
| V7.5 | Generated Asset Import & GLTF Deep Scan | generated pack import, GLTF/GLB deep scan, manifest validation |
| V7.6 | Action Mapping & Runtime Retargeting | per-PetInstance mapping, runtime rendering, fallback behavior |
| V7.7 | Productization Gate | final evidence, regression, visual QA, security/claim/license/artifact scan |
| V7.8 | Advanced Scope Reopen & Claim Boundary | passed: PRD/gap/claim sync for advanced V7 phases |
| V7.9 | MiniMax Image Provider Consent Boundary | passed: explicit-consent real image provider smoke |
| V7.10 | Generated 2D Action Pack Assembly | passed: provider image outputs to validated sprite/action pack and target runtime activation |
| V7.11 | External GLB/GLTF Intake Contract | passed scoped: local GLB/GLTF instructions, license checklist, deep scan gate |
| V7.12 | True 3D Runtime Action Mapping | passed scoped: tested local imported GLB/GLTF runtime mapping |
| V7.13 | Photo-To-Asset Orchestration | passed scoped: guided workflow with stable reason codes for tested local 2D and external GLB import paths |
| V7.14 | Advanced Visual QA | passed scoped: generated 2D contact sheet and imported GLB/GLTF runtime screenshot QA |
| V7.15 | Advanced Productization Gate | passed scoped: evidence-matched final claim, regression, security/claim/license/artifact scans |

## Required Data Flow

```text
Local photo / user traits
  -> user-approved safe traits
  -> prompt pack or explicit-consent provider boundary
  -> generated local asset files
  -> asset import validation / GLTF deep scan
  -> AssetManifestRegistry
  -> CatActionResolver
  -> RendererRegistry
  -> RendererAdapter
```

The detailed remaining target architecture is defined in
`docs/V7.x/v7_remaining_target_architecture.md`.

Renderer adapters must not receive raw photo data, prompt text, provider payloads, local paths, tokens, Authorization values, shell commands, or raw Agent/Codex/MCP/HTTP payloads.

## Phase Rules

- V7.1-V7.3 must work without provider credentials.
- V7.4 real provider smoke is conditional and cannot be required for local guided workflow acceptance.
- V7.5 is the security gate before any generated asset reaches runtime.
- V7.6 must prove per-PetInstance isolation.
- V7.7 cannot pass if V7.5 or V7.6 is blocked.
- V7.9 cannot pass without real MiniMax credential, explicit user consent, and redacted evidence.
- V7.10 passed scoped with real MiniMax-generated sprite images and target runtime activation evidence.
- V7.11 passed scoped with a real local GLB/GLTF asset; external photo-to-3D provider output remains not-ready.
- V7.12 cannot pass without user-visible nonblank runtime 3D evidence.
- V7.13 cannot claim automatic photo-to-3D unless real photo input, real 3D provider output, GLTF scan, runtime mapping, and visual QA all pass.
- V7.14 cannot pass without user-visible screenshots or recordings proving nonblank visible assets and distinguishable action changes for each claimed path.
- V7.15 must choose the narrowest claim supported by evidence.

## Post-V7 Not Covered

- production signed release.
- cross-platform packaging.
- marketplace.
- arbitrary remote asset loading.
- full provider ecosystem readiness unless a separate provider integration program is accepted.
- broad 3D readiness unless a separate renderer/product readiness gate is accepted.
