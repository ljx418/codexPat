# V5.x Development Plan

status: v5-0-v5-15-passed-scoped / productization-gate-passed-scoped-local

date: 2026-05-29

## Scope

V5.x is the dedicated Cat Renderer & Asset System track.

This stage owns:

- high-quality 2D action assets.
- renderer plugin boundary.
- GLTF / Three.js 3D cat prototype.
- bundled 3D action asset pack.
- future custom asset pack import after separate security review.
- personalized cat prompt-pack and local standardized import.
- renderer / asset architecture design.
- visual evidence and performance baseline for renderer changes.
- productized personalized asset import, runtime rendering, guided photo-to-asset workflow, and visual QA after V5.10.

This stage is separate from:

- V3.x Codex workflow monitoring.
- V4.x OS-level Codex window/session binding.
- V4.x feasibility, probe, binding, and routing work.
- production signed release readiness.
- marketplace / remote asset distribution.

Detailed scope and architecture:

- `docs/V5.x/v5_x-development-scope.md`
- `docs/V5.x/v5_x-detailed-design.md`

## Current Baseline

The current product has:

- built-in CSS cat profiles.
- per-instance appearance selection.
- CatStateMachine action/state mapping.
- PetEvent action / sound white-listing.
- no Rive / Live2D / 3D renderer readiness.
- no user asset upload.
- no remote asset download.
- no custom asset pack import.

Reference design:

- `docs/reference/06-cat-pack.md`
- `docs/blueprint/01-tech-stack.md`
- `docs/blueprint/04-cat-state-machine.md`
- `docs/blueprint/05-desktop-window.md`
- `docs/blueprint/10-risks-and-decisions.md`
- `docs/V3.0/evidence/asset-pack-v1-2026-05-20.md`

## Product Goal

Make the pet feel more like a polished companion without weakening the existing Agent integration safety model.

The renderer must remain driven by safe state/action IDs:

```text
PetEvent -> CatStateMachine -> safe action ID -> renderer clip
```

Agents must not directly control model internals, local files, URLs, scripts, bones, shaders, or arbitrary animation names.

## Phase Plan

| Phase | Goal | Output |
| --- | --- | --- |
| V5.0 | Asset System Freeze | manifest schema, action mapping, fallback rules, security boundary |
| V5.1 | Sprite / 2D Asset Pack v2 | high-quality bundled 2D actions for core states |
| V5.2 | Renderer Plugin Interface | renderer abstraction for CSS/sprite/GLTF/Rive/Live2D |
| V5.3 | GLTF / Three.js 3D Cat Prototype | bundled GLB/GLTF renderer prototype |
| V5.4 | 3D Action Asset Pack | bundled 3D clips for core pet states |
| V5.5 | Runtime Renderer Selection | explicit local CSS/sprite/GLTF selection with CSS fallback |
| V5.6 | Photo Personalization Scope Freeze | privacy, claim, and provider boundary |
| V5.7 | AI Prompt Pack Generator | standardized external-generation prompts |
| V5.8 | Standardized Local Asset Import | manifest-validated local sprite/GLTF import |
| V5.9 | Dynamic Action Pack Builder | imported pack activation and safe action mapping |
| V5.10 | Provider Feasibility | optional external provider adapter boundary |
| V5.11 | Personalized Asset Import UI | Desktop Manager local import UX |
| V5.12 | Runtime Imported Pack Rendering | activated imported pack renders per PetInstance |
| V5.13 | Photo-To-Asset Guided Workflow | local prompt and import-instruction workflow |
| V5.14 | Provider Adapter Feasibility / Consent | explicit-consent provider boundary or smoke |
| V5.15 | Visual Quality And Action QA | action clarity, performance, visual evidence |
| V5.x Productization Gate | scoped productization acceptance | final report, visual evidence, security scan, claim scan |

## Required Design Documents Before Implementation

V5.0 must create and pass review for:

- `docs/V5.x/v5_0-asset-system-freeze.md`
- `docs/V5.x/v5_0-asset-manifest-schema.md`
- `docs/V5.x/v5_0-security-boundary.md`
- `docs/V5.x/v5_0-architecture-design.md`
- `docs/V5.x/v5_x-development-scope.md`
- `docs/V5.x/v5_x-detailed-design.md`

V5.1-V5.5 must create phase-specific design and evidence documents before implementation begins:

- `docs/V5.x/v5_1-sprite-renderer-design.md`
- `docs/V5.x/v5_2-renderer-plugin-interface-design.md`
- `docs/V5.x/v5_3-threejs-renderer-architecture.md`
- `docs/V5.x/v5_4-action-clip-priority-design.md`
- `docs/V5.x/v5_5-development-plan.md`

Each phase must include a plan audit and PRD/spec review before code changes:

```text
docs/V5.x/v5_N-plan-audit.md
docs/V5.x/v5_N-prd-spec-review.md
```

## V5.0 Asset System Freeze

Define the stable asset pack contract before adding new renderers.

Required decisions:

- required core actions: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
- optional actions: `walk`, `tease`, `stretch`, `blink`.
- renderer types: `css`, `sprite`, `gltf`, `rive`, `live2d`.
- fallback: missing optional action falls back to `idle` and records warning.
- missing required core action fails manifest validation.
- no arbitrary local paths, remote URLs, scripts, or shell commands.
- no raw PetEvent, raw Agent payload, prompt text, tool command text, token, Authorization header, workspace path, config path, or full local path enters renderer or asset manifests.

## V5.1 Sprite / 2D Asset Pack v2

Produce or integrate a higher-quality bundled 2D pack first.

Reason:

- validates action semantics before 3D complexity.
- keeps productization risk lower than immediate 3D.
- provides fallback if 3D performance or packaging is not acceptable.
- gives V5 a shippable visual improvement even if V5.3/V5.4 remain prototype-only.

## V5.2 Renderer Plugin Interface

Introduce renderer abstraction without changing PetEvent.

The state machine should continue to emit safe actions. Renderer plugins only receive:

```text
profileId
rendererKind
actionId
loop/one-shot intent
scale
```

They must not receive raw Agent payloads.

The renderer interface must be deterministic and side-effect constrained:

```text
mount(container, profile)
setAction(actionId, playbackIntent)
setScale(scale)
setVisible(visible)
dispose()
```

Renderer plugins must not fetch remote assets, execute code from assets, or read arbitrary local paths.

## V5.3 GLTF / Three.js 3D Cat Prototype

Implement bundled GLTF / GLB rendering only.

No user upload, no remote download, and no custom model import in this phase.

This phase may only claim a bundled GLTF/GLB prototype smoke. It must not claim `3D ready`.

Acceptance must include:

- transparent window still works.
- drag does not jitter.
- animation switching is stable.
- idle animation continues when no Agent event is present.
- CPU/GPU usage remains acceptable on target macOS hardware.

## V5.4 3D Action Asset Pack

Add bundled 3D clips for core states.

Action behavior:

- `thinking` and `running` are low-distraction loops.
- `success`, `warning`, `error`, and `need_input` are short one-shot or priority clips.
- `error` and `need_input` must be visually distinct.
- `Stop` / completion events must not force a happy animation after an error state.
- clip transitions must avoid blank frames and uncontrolled resizing.

## V5.5 Runtime Renderer Selection

Only bundled renderers are selectable.

CSS remains the default. GLTF can be selected explicitly through local runtime selection for tested scenarios.

Required constraints:

- no remote URL loading.
- no arbitrary local paths.
- no user upload or custom import.
- invalid renderer choices fall back to CSS.
- renderer adapters remain safe action-id driven.

## V5.6-V5.10 Personalized Cat Asset Pipeline

V5.6-V5.10 extend V5 with personalized cat assets while preserving the accepted V5.0-V5.5 baseline.

The default path is prompt-pack generation plus manifest-validated local import. The project does not default-upload user photos and does not claim automatic photo-to-3D readiness.

Supported scoped workflow:

```text
cat description/photo notes -> prompt pack -> external asset generation by user -> local manifest import -> safe action mapping
```

Provider integration remains feasibility-only until a separate privacy, cost, license, and real-smoke acceptance exists.

## V5.11-V5.15 Productized Personalized Asset Workflow

V5.11-V5.15 are the remaining V5 productization phases after the accepted CLI pipeline.

Required design documents:

- `docs/V5.x/v5_11-import-ui-development-plan.md`
- `docs/V5.x/v5_11-import-ui-acceptance-plan.md`
- `docs/V5.x/v5_11-import-ui-prd-spec-review.md`
- `docs/V5.x/v5_12-runtime-imported-pack-rendering-development-plan.md`
- `docs/V5.x/v5_12-runtime-imported-pack-rendering-acceptance-plan.md`
- `docs/V5.x/v5_13-photo-to-asset-guided-workflow-development-plan.md`
- `docs/V5.x/v5_13-photo-to-asset-guided-workflow-privacy-review.md`
- `docs/V5.x/v5_14-provider-adapter-feasibility-and-consent-plan.md`
- `docs/V5.x/v5_15-visual-quality-action-qa-plan.md`
- `docs/V5.x/v5_x-productization-gate-plan.md`

Current phase status:

| Phase | Status | Implementation Target | Acceptance Boundary |
| --- | --- | --- | --- |
| V5.11 | passed scoped | Desktop Manager local import UI | does not imply runtime rendering |
| V5.12 | passed scoped | activate and render imported packs per PetInstance | does not imply photo/provider/productization readiness |
| V5.13 | passed scoped | photo/description guided prompt and import-instruction workflow | no default upload, no automatic photo-to-3D |
| V5.14 | passed feasibility-only | provider feasibility or explicit-consent smoke | no provider integration verified claim |
| V5.15 | passed scoped | visual quality, performance, and action QA | no production signed release claim |
| V5.x Productization Gate | passed scoped local | final evidence, security scan, claim scan | external provider generation and production release remain not ready |

Completed scoped productization order:

1. V5.12 made activated imported packs render in the live pet runtime per PetInstance.
2. V5.13 added a privacy-preserving guided workflow for photo/description-to-standardized prompts and import instructions.
3. V5.14 kept provider work feasibility-only and separate from the default path.
4. V5.15 hardened visual quality, action clarity, and performance evidence.
5. V5.x Productization Gate closed for scoped local productization after evidence, scan, and regression closure.

V5.11-V5.15 must not change V3/V4 Codex monitoring, PetEvent security semantics, or OS-level binding behavior.

## V5.12 Runtime Imported Pack Rendering

V5.12 is the next development phase. It must close the gap between V5.11 import UI and live runtime rendering.

Required implementation content:

- Desktop Manager pack activation control for a specific PetInstance.
- current active imported pack display per PetInstance.
- switch back to bundled/default renderer.
- persisted PetInstance -> active pack mapping across app restart.
- runtime resolver that maps PetInstance + safe action ID to imported pack renderer data.
- P0 GLTF / GLB deep scan before activation or local GLB runtime use.
- stale, missing, corrupt, or renderer-kind mismatch fallback to CSS.
- sanitized diagnostics and evidence.

V5.12 must prove:

- imported pack can be activated to a specified PetInstance.
- imported sprite pack renders in the live runtime.
- imported GLTF pack renders in the live runtime when selected and available.
- only the target PetInstance uses imported visuals.
- default and unrelated pets remain unchanged.
- restart restores the PetInstance active pack mapping.
- invalid pack, corrupt frame, or corrupt GLB falls back to CSS.
- renderer kind mismatch returns a stable error and does not partially render.
- two pets using the same imported pack do not share mutable renderer state.

V5.12 P0 GLTF / GLB deep scan before activation:

- reject `http://`, `https://`, `file://`, `javascript:`, and `data:` URI references.
- reject external `.bin` files and external image references in local single-file mode.
- reject absolute paths and path traversal.
- reject unknown `extensionsRequired` unless explicitly allowlisted.
- enforce maximum file size, mesh count, material count, texture count, animation count, and animation duration.
- require accepted action clip names only: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
- evidence must record only safe field names and accept/reject decisions, never raw JSON chunks or local paths.

V5.12 renderer payload evidence must include a sanitized input snapshot proving the renderer receives only:

- safe action ID.
- renderer kind.
- safe profile/pack IDs.
- playback intent.
- scale.
- visibility.

The renderer must not receive raw manifest paths, raw provider payloads, prompt text, photo metadata, token, Authorization, workspace path, config path, full local path, raw Agent / Codex / terminal / MCP / HTTP payload, shell command, or script source.

V5.12 must not claim:

```text
photo-to-3D ready
provider integration verified
remote asset loading ready
3D ready
production signed release ready
```

## V5.13 Photo-To-Asset Guided Workflow

V5.13 may start only after its privacy review is re-checked against implementation details.

Required implementation content:

- local cat trait form.
- optional local photo reference flow that does not persist raw photo bytes by default.
- user-approved descriptive notes only.
- standardized prompt pack generation for sprite and GLTF/action assets.
- manifest template and import checklist output.
- deletion path for saved prompt packs and photo-derived notes.

The workflow must tell the user that external generation happens outside the app unless a later provider adapter is explicitly enabled and accepted.

V5.13 boundary:

- no default upload.
- no local photo-to-3D generation.
- raw photo is not persisted by default.
- generated assets still go through existing local import validation.

V5.13 must not claim:

```text
photo customization ready
photo-to-3D ready
provider integration ready
```

## V5.14 Provider Adapter Feasibility / Consent

V5.14 is not a default upload path.

If it remains feasibility-only, it must document consent, cost, privacy, retention, credential, and license boundaries without uploading user data.

If real provider smoke is attempted, it requires:

- explicit user consent.
- named provider and scenario.
- credential redaction evidence.
- retention/license/cost disclosure evidence.
- generated output imported through the V5.8/V5.11/V5.12 validated local path.

It must not be shortened to `provider integration verified`.

If no real provider smoke runs, the only allowed V5.14 claim is:

```text
V5.14 external generation provider feasibility completed with explicit consent boundary.
```

V5.14 must not claim:

```text
provider adapter ready
remote generation ready
photo generation ready
```

## V5.15 Visual Quality And Action QA

V5.15 is the visual and performance hardening gate.

Required implementation content:

- screenshots or recordings for every core action.
- at least one bundled pack and one imported pack tested.
- nonblank checks for canvas/GLTF rendering.
- action readability at 1x and 0.75x scale.
- bounding-box/off-canvas checks.
- idle and active CPU/memory baselines.
- success does not override active error / need_input priority state.
- hidden/minimized renderer work reduction or technical justification.
- regression notes for imported pack rendering after V5.12.

## V5.x Productization Gate

The Productization Gate has passed for scoped local productization because:

- V5.12 passed.
- V5.13 passed.
- V5.14 passed feasibility-only, with no real provider smoke claim.
- V5.15 passed.
- security scan passed.
- claim scan passed.
- license/attribution scan passed.
- regression passed.

Historical V5.x final/baseline wording must use:

```text
V5.x scoped renderer/import pipeline baseline passed
```

The scoped local final gate uses:

```text
V5.x Productization Gate
```

## Allowed Planning Claim

```text
V5.x Cat Renderer & Asset System is planned for high-quality 2D, 3D, and action asset development.
```

## Forbidden Claims Until Accepted

```text
Rive / Live2D / 3D ready
bundled 3D action pack ready
photo customization ready
user asset upload ready
remote asset download ready
custom asset pack import ready
asset marketplace ready
production signed release ready
automatic photo-to-3D ready
provider integration verified
remote asset loading ready
asset marketplace ready
```

## Development Stop Rules

Stop and return to planning if any phase audit finds High risk in:

- renderer accepting raw Agent payloads.
- asset manifest allowing remote URL or arbitrary local path.
- custom import before bundled assets and manifest validation pass.
- visual evidence missing for a visual claim.
- performance evidence missing for GLTF / Three.js claims.
- claim wording implying Rive / Live2D / 3D / custom import readiness before scoped acceptance.

## V4.x Boundary

V4.x does not include asset, renderer, release packaging, or productization acceptance gates.

V4.x owns OS-level Codex window/session binding feasibility and any later scoped probe / binding / routing work.

Full 3D, action asset development, bundled asset integrity, license / attribution, and asset productization checks belong to V5.x or a later productization track.
