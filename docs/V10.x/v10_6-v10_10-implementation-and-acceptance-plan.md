# V10.6-V10.10 Implementation and Acceptance Plan

status: ready-for-v10-6-implementation
date: 2026-06-04

## 1. Purpose

This document turns the V10.6-V10.10 specs into an executable development and
acceptance sequence.

V10.1-V10.5 remain a scoped animation baseline. They prove the existing
pipeline can animate, preview, and render a visible bundled 2D pet. They do not
prove the product-grade daily-use work-cat experience.

V10.6-V10.10 must deliver:

```text
safe local animation format
-> bundled work-cat-v1
-> runtime playback and micro-interactions
-> Manager preview / restore UX
-> final visual QA and claim gate
```

## 2. Product Boundary

Allowed final scoped claim after V10.10 passes:

```text
V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.
```

Forbidden claims:

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
automatic photo-to-animation ready for all providers
provider integration verified
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
```

V10 must not copy Petdex assets. Petdex is only a quality reference for visible
action richness and companion feel.

## 3. Target Architecture Check

Implementation must preserve this flow:

```text
PetEvent / UserInteraction
  -> CatStateMachine
  -> CatActionResolver / InteractionActionResolver
  -> AnimationPackAdapter
  -> AnimationCoverageResolver
  -> RuntimePlaybackController
  -> RendererRegistry
  -> SpriteRenderer
  -> RuntimePetWindow / ManagerPreviewPanel
```

Renderer adapters may receive only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

Renderer adapters must not receive raw events, raw provider payloads, prompt
text, tool command text, credentials, full local paths, remote URLs, shell
commands, or script source.

## 4. V10.6 Animation Format Rebaseline

### Development Scope

- Implement `AnimationPackAdapter` for:
  - `pet.json + spritesheet.png|webp`.
  - `pet.json + png frame sequence`.
- Preserve existing V5 manifest import and activation path.
- Normalize both formats into the existing safe action coverage model.
- Add fixture packs for accepted spritesheet and frame-sequence cases.
- Add rejected fixtures for unsafe fields and path/URL/script-like input.
- Preserve previous active pack after invalid import or activation.

### Acceptance Standard

V10.6 passes only if:

- accepted spritesheet fixture maps all 8 core actions.
- accepted frame-sequence fixture maps all 8 core actions.
- malformed metadata fails with stable sanitized reasonCode.
- invalid pack activation preserves previous active pack.
- runtime adapter output contains only safe fields.
- existing V5 manifest tests still pass.
- no evidence includes raw local path, raw payload, provider payload, prompt
  text, credential, auth header, or shell/script source.

### Required Evidence

```text
docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md
```

### PRD / Spec Review

Review against:

- `v10_6-animation-pack-format-spec.md`
- `v10_x-target-architecture.md`
- `v10_x-model-detailed-design.md`

Stop if format implementation bypasses existing validator or renderer boundary.

## 5. V10.7 work-cat-v1 Asset Production

### Development Scope

- Add bundled `work-cat-v1`.
- Use `rendererKind: sprite`.
- Use `pet.json` pack format from V10.6.
- Cover all core actions:
  - idle
  - thinking
  - running
  - success
  - warning
  - error
  - need_input
  - sleeping
- Loop actions must have at least 8 frames.
- Transient actions must have at least 4 frames.
- Keep `sprite-v3-animated` as fallback / baseline only.

### Acceptance Standard

V10.7 passes only if:

- every action has a contact sheet.
- every action has runtime playback capture.
- nonblank scan passes.
- frame-difference scan passes.
- loop actions have at least 4 unique poses.
- transient actions have at least 3 unique poses.
- 1x and 0.75x readability pass.
- bounding box remains within the canvas safe margin.
- operator visual rubric passes for every action.
- `work-cat-v1` is visibly better than `sprite-v3-animated` in side-by-side
  review.

### Required Evidence

```text
docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md
```

### PRD / Spec Review

Review against:

- `v10_7-work-cat-v1-asset-production-spec.md`
- `v10_x-exit-criteria.md`

Stop if any action is blank, transparent, off-canvas, indistinguishable, or not
visibly better than the rough baseline.

## 6. V10.8 Runtime Micro-interaction Layer

### Development Scope

- Add local idle random micro-actions:
  - blink.
  - tail sway.
  - stretch.
- Add click feedback.
- Add drag feedback.
- Add `RuntimePlaybackController` priority enforcement.
- Preserve existing PetEvent and CatStateMachine semantics.

### Acceptance Standard

V10.8 passes only if:

- one idle random action is visible within a bounded test interval.
- click feedback is visible and does not emit PetEvent.
- drag feedback is visible and persisted position still updates.
- `error` and `need_input` block success and idle random overrides.
- success transient returns to idle unless priority state blocks it.
- only the target PetInstance changes.
- default and unrelated pets remain unchanged.

### Required Evidence

```text
docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-2026-06-04.md
```

### PRD / Spec Review

Review against:

- `v10_8-runtime-micro-interaction-state-machine.md`
- `v10_x-target-architecture.md`

Stop if any micro-interaction writes CatStateMachine, calls notify, or changes
agent state.

## 7. V10.9 Manager Preview and Activation UX Polish

Status: passed scoped.

### Development Scope

- Show active pack and fallback pack.
- Preview all 8 core actions.
- Show coverage state:
  - animated
  - static
  - fallback
  - missing
- Show frame count, fps, loop/transient, fallbackActionId, and sanitized
  reasonCode.
- Add restore default work cat action.
- Preserve restart persistence for active pack mapping.

### Acceptance Standard

V10.9 passes only if:

- all actions are previewable.
- missing/corrupt/partial action preview shows visible fallback.
- preview uses isolated renderer.
- preview creates zero accepted PetEvent.
- preview does not write CatStateMachine.
- preview does not change live PetInstance state.
- restore default work cat activates `work-cat-v1`.
- failed restore preserves previous active pack.
- restart restores active mapping.

### Required Evidence

```text
docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md
```

### PRD / Spec Review

Review against:

- `v10_9-manager-preview-ux-spec.md`
- `v10_x-acceptance-plan.md`

Stop if preview mutates live runtime state or hides failures behind a blank pet.

Accepted scope: V10.9 passed scoped for active/fallback pack display, all core
action preview metadata, restore default modeling, restart persistence
modeling, preview zero accepted PetEvent, safe preview renderer input, visible
fallback for partial action, and live PetInstance unchanged by preview in
tested local Manager view-model scenarios.

## 8. V10.10 Product-grade Animation Gate

### Development Scope

No new product feature should be added in V10.10. V10.10 is closure only:

- gather V10.6-V10.9 evidence.
- run visual QA.
- run regressions.
- run security scan.
- run claim scan.
- run PRD/spec review.
- sync drawio status.
- update final acceptance report.

### Acceptance Standard

V10.10 passes only if:

- V10.6-V10.9 evidence files exist and are passed.
- `work-cat-v1` all core actions pass contact sheet and runtime playback QA.
- nonblank, frame-difference, bbox, 1x, and 0.75x checks pass.
- idle/click/drag evidence exists.
- fallback remains visible after corrupt/missing/deleted/partial asset cases.
- default and unrelated pets remain unchanged.
- performance baseline is recorded.
- security scan passes.
- claim scan passes.
- drawio matches final status.
- final report uses only the allowed scoped final claim.

### Required Evidence

```text
docs/V10.x/v10_x-product-grade-final-acceptance-report.md
```

### Minimum Regression

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs
node scripts/v9_2_minimax_static_2d_generation_smoke.mjs
node scripts/v9_3_minimax_dynamic_2d_generation_smoke.mjs
```

If an environment-specific smoke is unavailable, the final report must mark it
blocked or non-blocking with reasonCode. It must not silently count it as
passed.

## 9. Phase Transition Rules

Before entering each next phase:

- previous phase evidence exists.
- previous phase PRD/spec review has no High risk.
- previous phase false-green risk is not High.
- current phase implementation and acceptance scope are reviewed.
- no forbidden claim is introduced.

If High risk appears, stop implementation and return to planning.

## 10. Documentation Sufficiency Decision

After this implementation plan, the V10 document set is sufficient to guide
V10.6-V10.10 implementation because it defines:

- product boundary.
- target architecture.
- data models.
- asset format.
- default asset quality bar.
- runtime interaction priority.
- Manager preview UX.
- visual QA matrix.
- regression gates.
- claim boundaries.
- drawio sync requirement.

Remaining implementation risk is visual execution quality, not missing
architecture or acceptance definition.
