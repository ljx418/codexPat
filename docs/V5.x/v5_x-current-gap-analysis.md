# V5.x Current Gap Analysis

status: v5-productization-gate-passed-scoped

date: 2026-05-30

## Current State

Implemented today:

- built-in CSS cat profiles.
- per-instance appearance selection.
- safe action / sound whitelist.
- CatStateMachine-driven behavior.

Implemented scoped:

- high-quality 2D action smoke path.
- renderer plugin interface.
- GLTF / Three.js prototype renderer.
- bundled scripted GLTF core action clips.
- local explicit runtime renderer selection.
- personalized prompt-pack generation.
- manifest-validated local personalized asset import smoke.
- imported pack activation records.
- Desktop Manager local manifest import UI with manual acceptance evidence.
- runtime rendering of imported packs per PetInstance.
- local photo/description guided prompt and import-instruction workflow.
- provider feasibility-only consent boundary.
- visual QA for tested bundled and imported asset scenarios.

Not implemented:

- explicit-consent provider adapter smoke.
- Rive renderer.
- Live2D renderer.
- user asset upload.
- remote asset download.
- marketplace.
- automatic photo-to-3D generation.
- external provider integration.

## Gap Matrix

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Asset manifest | V5.0 passed scoped | frozen validated schema | passed V5.0 |
| Asset security boundary | V5.0 passed scoped | explicit no path / no URL / no script / no raw payload contract | passed V5.0 |
| Architecture design | V5.0 passed scoped | renderer registry, manifest loader, action resolver, visual evidence flow | passed V5.0 |
| Bundled 2D sprite smoke | V5.1 passed scoped | bundled 2D core state visuals with evidence | passed V5.1 |
| Runtime renderer plugin interface | V5.2 passed scoped | live pet runtime uses safe action-id renderer contract | passed V5.2 |
| GLTF 3D prototype | V5.3 passed scoped | bundled scripted GLB and Three.js prototype evidence | passed V5.3 |
| Core action assets | V5.4 passed scoped for GLTF prototype | accepted visual assets per core state | passed V5.4 |
| Renderer abstraction | V5.2 passed scoped | plugin boundary for css/sprite/gltf/rive/live2d | passed V5.2 for css/sprite/gltf |
| 3D renderer | V5.3 passed scoped | bundled GLTF / Three.js prototype | passed V5.3 |
| 3D action clips | V5.4 passed scoped | bundled core action clips | passed V5.4 |
| Runtime renderer selection | V5.5 passed scoped | explicit local CSS/sprite/GLTF selection with CSS fallback | passed V5.5 |
| Personalized prompt pack | V5.7 passed | standardized external-generation prompts | passed V5.7 |
| User import | V5.8 passed scoped | manifest-validated local import after bundled assets pass | passed V5.8 CLI smoke |
| Imported pack activation | V5.9 passed scoped | imported pack to PetInstance mapping | passed V5.9 CLI smoke |
| Provider feasibility | V5.10 completed scoped | optional adapter boundary | completed V5.10 |
| Import UI | Implemented and manually accepted | Desktop Manager local manifest import UX | passed V5.11 scoped |
| Runtime imported rendering | V5.12 passed scoped | activated imported pack renders per PetInstance | passed V5.12 |
| Photo-guided workflow | V5.13 passed scoped | local prompt and import-instruction flow | passed V5.13 |
| Provider adapter | V5.14 passed feasibility-only | explicit-consent provider smoke if pursued | no real provider smoke |
| Visual QA | V5.15 passed scoped | productized bundled/imported action quality evidence | passed V5.15 |
| Remote assets | forbidden | no target until separate security review | out of scope |
| Photo customization | forbidden | separate future stage | out of scope |
| Production signed release | not covered | separate productization track | out of scope |

## Main Risks

| Risk | Level | Notes |
| --- | --- | --- |
| Scope drift | Medium | V5.12-V5.15 must not describe V5.11 import UI as runtime rendering or photo customization readiness. |
| Asset production cost | Medium | Current 3D action clips are prototype motion, not final art quality. |
| Performance | Medium | Transparent always-on windows plus 3D can increase CPU/GPU use. |
| Security | Medium | User asset import can introduce path, script, and remote loading risks. |
| Claim expansion | Medium | Final claim remains scoped and keeps `3D ready` forbidden. |
| Evidence weakness | Medium | GLB structural smoke, nonblank fixture evidence, and build checks exist; full animation quality remains future work. |

overall risk: Medium

go / no-go: V5.0 through V5.15 passed scoped acceptance, with V5.14 feasibility-only and no real provider smoke. V5.x Productization Gate passed for scoped local productization. No-go for production 3D readiness, provider integration, marketplace, or signed release claims.

## Remaining Product Gaps

- Production-quality 3D art and animation polish.
- Lazy loading or code splitting for Three.js before any product default.
- Rive / Live2D exploration.
- Additional Desktop Manager preview/rollback polish for imported asset packs beyond the accepted scoped activation path.
- Real external provider integration after separate privacy/cost/license review.
- Production-grade visual QA beyond the accepted scoped bundled/imported fixture evidence.
- Productization packaging, signing, license audit, and release artifact integrity.

## Current Allowed Claim

```text
V5.x Cat Renderer & Asset System is planned for high-quality 2D, 3D, and action asset development.
V5.x scoped renderer/import pipeline baseline passed.
V5 personalized prompt-pack and local import pipeline passed scoped CLI acceptance.
V5.11 personalized asset import UI passed for tested local manifest import scenarios. Imported packs are listed with sanitized metadata only. Runtime activation/rendering is covered separately by V5.12.
V5.12 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
V5.13 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
V5.14 external generation provider feasibility completed with explicit consent boundary.
V5.15 visual quality and action QA passed for tested bundled and imported asset scenarios.
V5.x personalized cat renderer and asset workflow productization passed for tested local import, runtime rendering, guided external asset instruction, and visual QA scenarios. External provider generation remains not verified.
```

Historical V5.x baseline reports must be named and interpreted as:

```text
V5.x scoped renderer/import pipeline baseline passed
```

The scoped local productization gate is named:

```text
V5.x Productization Gate
```

Historical V5.x baseline reports must not be used to imply Productization Gate passed before `docs/V5.x/v5_x-productization-final-acceptance-report.md`.

## Current Forbidden Claims

```text
3D ready
photo customization ready
automatic photo-to-3D ready
custom asset pack import ready as end-to-end user workflow
provider integration verified
remote asset loading ready
asset marketplace ready
production signed release ready
```
