# V10.x Development Plan: Product-grade Animated Work-Cat Experience

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Goal

V10 is re-scoped from "animation can play" to "the default desktop work-cat is
pleasant, readable, previewable, and state-linked enough for daily use".

Current V10.1-V10.5 evidence remains a scoped baseline: bundled animated 2D can
play, preview metadata exists, runtime state mapping works for the tested local
path, and GLTF clip detection can label static / partial assets. That baseline
is not enough for a Petdex-like product experience. V10.6-V10.10 close the
experience gap without adding ecosystem, marketplace, remote loading, or broad
3D claims.

## Non-goals

- Do not claim Petdex parity achieved.
- Do not claim broad `3D ready`.
- Do not claim automatic photo-to-3D ready.
- Do not claim provider integration verified.
- Do not add marketplace, remote asset loading, or public distribution.
- Do not copy Petdex visual assets.
- Do not change V3/V4 Codex monitoring semantics.

## V10.11 Product Experience Rebaseline

Status: passed scoped.

Goal: correct the active documentation line and make the accepted V10 local
work-cat capability understandable, onboardable, and provable with real
screenshots.

Implementation plan:

- Remove the wrong non-V10 active-stage wording from README and active docs.
- Keep V10.1-V10.10 as accepted scoped animation baseline evidence.
- Add a concise V10.11 plan and final report template.
- Update the active drawio gap map so it shows current architecture, target
  architecture delta, development/acceptance plan, milestones, gates, and exit
  conditions for V10.
- Capture or reference real desktop screenshots under `docs/V10.x/evidence/`;
  HTML pages may summarize these screenshots but must not replace them.

Exit evidence:

- `docs/V10.x/v10_11-product-experience-rebaseline.md`
- `docs/V10.x/v10_11-final-acceptance-report.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/V10.x/evidence/v10_11-settings-real-window-YYYY-MM-DD.png`

Accepted scope after final acceptance:

- product-experience documentation, onboarding, settings, and screenshot
  evidence for tested local desktop-pet scenarios.
- no new provider, 3D, OS-level binding, release, or Petdex parity claim.

## V10.12-V10.16 Open-source Benchmark Surpass Track

Status: accepted scoped.

Goal: exceed selected open-source benchmark dimensions in visual quality and
ordinary-user first-run onboarding, while keeping V10 scoped to tested local
macOS scenarios.

Implementation plan:

- V10.12 freezes the selected benchmark set and comparison metrics.
- V10.13 adds at least 6 premium bundled animated 2D cat packs.
- V10.14 adds an ordinary-user first-run wizard for default pet and Codex
  work-cat setup.
- V10.15 adds a built-in local pet gallery and safe pack UX.
- V10.16 closes with benchmark comparison, screenshots/recordings, regression,
  security scan, claim scan, PRD/spec review, and drawio sync.

Exit evidence:

- `docs/V10.x/v10_12-v10_16-open-source-surpass-plan.md`
- `docs/V10.x/v10_12-open-source-benchmark-spec.md`
- `docs/V10.x/v10_13-premium-cat-library-acceptance-plan.md`
- `docs/V10.x/v10_13-premium-cat-asset-production-spec.md`
- `docs/V10.x/v10_14-first-run-wizard-acceptance-plan.md`
- `docs/V10.x/v10_14-first-run-wizard-ui-state-spec.md`
- `docs/V10.x/v10_15-built-in-gallery-ux-acceptance-plan.md`
- `docs/V10.x/v10_15-gallery-data-model-and-ux-spec.md`
- `docs/V10.x/v10_16-benchmark-scoring-rubric.md`
- `docs/V10.x/v10_16-benchmark-surpass-gate.md`
- `docs/V10.x/v10_12-v10_16-final-report-templates.md`

Allowed final claim after V10.16 only:

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

V10.12-V10.16 must not claim Petdex parity, full ecosystem parity, broad 3D
readiness, provider integration readiness, production signed release readiness,
cross-platform readiness, or Windows readiness.

## Baseline Already Accepted

| Phase | Status | Meaning |
| --- | --- | --- |
| V10.1 | passed scoped | `sprite-v3-animated` proves bundled animated 2D playback is feasible. |
| V10.2 | passed scoped | Desktop Manager action preview model is isolated and safe. |
| V10.3 | passed scoped | bundled state-linked runtime animation works for tested local path. |
| V10.4 | passed detection / excluded playback | GLTF static / partial labeling exists; animated GLTF playback is not accepted. |
| V10.5 | passed scoped | real desktop screenshot confirms visible bundled animated 2D runtime path. |

## V10.6 Animation Format Rebaseline

Status: passed scoped.

Goal: support a simpler, product-oriented local animation format inspired by
desktop pet packs:

```text
pet.json + spritesheet.webp/png OR pet.json + png frame sequence
```

Implementation plan:

- Add an `AnimationPackAdapter` design and implementation plan for converting
  local `pet.json` pack metadata into the existing safe action model.
- Keep existing V5 manifest support; do not break imported pack validation.
- Support fields: `packId`, `displayName`, `rendererKind`, `actions`,
  `frames`, `fps`, `loop`, `durationMs`, `fallbackActionId`.
- Keep all resolved runtime inputs as safe pack ID, action ID, renderer kind,
  playback intent, scale, and visibility.
- Reject script, remote URL, absolute path, path traversal, event handlers,
  arbitrary local path, raw provider payload, prompt text, token, Authorization,
  and shell/script source.

Exit evidence:

- `docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md`

Accepted scope:

- `pet.json + spritesheet.png/webp` accepted for tested safe local fixture.
- `pet.json + png frame sequence` accepted for tested safe local fixture.
- rejected unsafe metadata and path/payload-like fields with stable reasonCode.
- preserved the V5 manifest import path.
- did not prove product-grade `work-cat-v1` visual quality.

## V10.7 High-quality Default 2D Work Cat Pack

Status: passed scoped.

Goal: replace the rough procedural default with a visibly better bundled local
2D work-cat pack.

Implementation plan:

- Add `packId: work-cat-v1`.
- Use `rendererKind: sprite`.
- Cover all 8 core actions: `idle`, `thinking`, `running`, `success`,
  `warning`, `error`, `need_input`, `sleeping`.
- Loop actions must have at least 8 frames.
- Transient actions must have at least 4 frames.
- Preserve consistent cat identity, proportions, color palette, transparent
  background, and readable silhouettes.
- Keep `sprite-v3-animated` as fallback / baseline, not final quality evidence.

Exit evidence:

- `docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md`
- contact sheet for every core action.
- runtime playback capture for every core action.

Accepted scope:

- bundled `work-cat-v1` is the default sprite manifest for runtime renderer selection.
- all core actions have V10.7 frame counts, unique poses, nonblank SVG geometry,
  1x and 0.75x capture evidence, and baseline comparison evidence.
- V10.7 does not prove runtime micro-interactions, Manager restore UX, or final
  product-grade V10 acceptance.

## V10.8 Runtime Micro-interaction Layer

Status: passed scoped.

Goal: make the cat feel like a desktop companion, not just a state indicator.

Implementation plan:

- Add idle random micro-actions: blink, tail sway, stretch.
- Add click feedback that is visible but does not mutate agent state.
- Add drag feedback that is visible and preserves saved position.
- Preserve priority rules: `success` must not overwrite active `error` or
  `need_input`.
- Keep all micro-interactions local; no PetEvent is emitted for click / drag
  feedback unless a future explicit feature adds it.

Exit evidence:

- `docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-2026-06-04.md`
- idle 30-second visual evidence.
- click and drag feedback capture.

Accepted scope:

- idle random, click, drag, priority blocking, no PetEvent emission, and no
  CatStateMachine write passed in tested local controller/UI-safe mapping
  scenarios.
- V10.8 does not prove Manager restore UX or final product-grade V10 acceptance.

## V10.9 Manager Preview & Activation UX Polish

Status: passed scoped.

Goal: make actions discoverable and activation understandable for normal users.

Implementation plan:

- Manager displays current active pack and fallback pack.
- Manager previews all 8 core actions.
- Preview displays `animated`, `static`, `fallback`, or `missing`.
- Preview displays frame count, fps, loop/transient label, and reasonCode.
- Add "restore default work cat" action.
- Preview never calls `notify`, never mutates `CatStateMachine`, and never
  changes live PetInstance state.

Exit evidence:

- `docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md`

Accepted scope:

- active/fallback pack display, all 8 core action preview metadata, restore
  default modeling, restart persistence modeling, preview zero accepted
  PetEvent, and live PetInstance unchanged by preview passed in tested local
  Manager view-model scenarios.
- V10.9 does not prove final product-grade V10 acceptance.

## V10.10 Product-grade Animation Gate

Status: passed.

Goal: close V10 only if the daily-use visual experience is genuinely improved.

Required:

- `work-cat-v1` passes all visual and runtime checks.
- Manager preview and activation are usable.
- runtime state-linked animation is visible.
- idle/click/drag micro-interactions pass.
- fallback remains visible for corrupt / missing / partial assets.
- default and unrelated pets remain unchanged.
- required V3/V4/V8/V9 regressions pass.
- security scan, claim scan, and PRD/spec review pass.
- drawio gap map matches final status.

Exit evidence:

- `docs/V10.x/v10_x-product-grade-final-acceptance-report.md` updated as V10.10 final gate.

Accepted scope:

- V10.6-V10.9 evidence exists and passed.
- visual QA, regression, security scan, claim scan, PRD/spec review, and drawio
  sync passed.
- final claim remains limited to tested local bundled `work-cat-v1` scenarios.

## Allowed Final Scoped Claim

```text
V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.
```

## Forbidden Claims

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
```
