# V8.x Acceptance Plan

status: active
date: 2026-06-03

## Acceptance Principle

V8 acceptance is evidence-matched. Import success, provider job success, fixture
rendering, or image generation success cannot stand in for automatic
photo-to-3D readiness.

Each phase must include:

- development plan.
- acceptance plan.
- claim matrix or claim section.
- PRD/spec review.
- plan audit.
- runtime evidence.
- security scan.
- claim scan.
- final acceptance report.

## Phase Gates

### V8.0

Pass when:

- V8 docs exist and are internally consistent.
- V7 remains closed scoped.
- V8.1 has no unresolved High planning risk.

### V8.1

Pass when:

- provider readiness diagnostics run with real local config state.
- missing credential and missing consent fail safely.
- configured credential state is redacted.
- evidence contains no token, Authorization, raw payload, prompt text, raw
  photo, full local path, workspace path, config path, or provider credential.

### V8.2

Pass when:

- real named provider is called only after explicit consent.
- provider output is real 3D GLB/GLTF accepted into quarantined staging.
- provider terms/license/retention are recorded.
- raw provider response and credential are redacted.

Blocked when:

- no provider credential.
- provider lacks 3D output.
- provider returns only image/video.
- provider terms disallow required use.
- network/provider failure prevents repeatable evidence.

### V8.3

Pass when:

- GLTF/GLB deep scan rejects unsafe fixtures.
- accepted provider output is normalized into local pack structure.
- action coverage table covers all core actions.
- invalid normalization preserves previous active pack.

### V8.4

Pass when:

- every claimed action path has screenshot/recording evidence.
- nonblank pixel check passes.
- bounding box remains in viewport.
- 1x and 0.75x scale pass.
- deleted/corrupt/failure fallback leaves visible safe cat.
- default and unrelated pets are unchanged.

### V8.5

Pass when:

- user can complete the tested provider/local import path from Desktop Manager.
- upload/generation requires explicit confirmation.
- recommended fallback path is visible when provider branch is blocked.
- diagnostics are understandable without exposing sensitive data.

### V8.6

Pass when:

- diagnostics export redaction scan passes.
- license/attribution scan passes.
- local deletion/deactivation is accepted.
- remote retention is documented but not overclaimed as controlled.
- artifact scan confirms generated binaries/assets are not accidentally treated
  as source unless intentionally tracked with attribution.

### V8.7

Pass when:

- V8.1-V8.6 are passed or explicitly excluded from the final claim.
- no unresolved High risk remains.
- final report includes a Claim Basis Table:
  - real provider 3D output.
  - generated/imported local pack.
  - action coverage.
  - runtime visual QA.
  - guided UX.
  - final allowed claim.

### V8.8

Pass when:

- prototype GLB rendering quality improves with camera, lighting, and viewport normalization evidence.
- static GLB fallback handling is documented.
- visual QA evidence does not overclaim broad 3D readiness.

### V8.9

Pass when:

- local frame-sequence folder assembles into a valid animated sprite manifest.
- every core action has 2-48 PNG frames or fails with a stable reason code.
- fps is 1-24 or fails with `animated_sprite_fps_invalid`.
- generated manifest uses safe `frameFiles` and `fps` fields only.
- import uses existing app-managed validation.
- optional activation targets one PetInstance only.
- invalid assembly/import preserves the previous active pack.
- evidence does not contain token, Authorization, raw payload, prompt text, provider payload, raw photo, full source folder path, workspace path, config path, or api-token.json.

### V8.10

Pass when:

- local prompt/instruction generation covers all core actions.
- generated instructions include multi-frame naming, transparent background, action consistency, and import checklist.
- provider branch remains disabled unless explicit consent and credential boundary are separately accepted.
- generated text does not contain local paths, raw photo data, token, Authorization, or raw provider response.

### V8.11

Pass when:

- V8.9 accepted path is visually tested at runtime.
- all eight core actions show visible multi-frame animation.
- default and unrelated pets remain unchanged.
- corrupt/missing/deleted animated pack falls back to a visible safe cat.
- 1x and 0.75x scale pass.
- renderer input snapshot contains only safe action ID, renderer kind, safe pack/profile IDs, playback intent, scale, and visibility.
- final claim matches the narrowest accepted animated sprite evidence.

## Required Regression Baseline

V8 final regression must include the latest accepted relevant checks:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v7_13_photo_to_asset_orchestration_smoke.mjs
node scripts/v7_14_advanced_visual_qa_smoke.mjs
node scripts/v7_15_advanced_productization_gate_smoke.mjs
node scripts/v8_9_animated_sprite_assembler_smoke.mjs
node scripts/v8_10_ai_animated_sprite_prompt_smoke.mjs
node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs
```

Provider calls may be skipped only when the phase is explicitly blocked or
excluded; they cannot be replaced with fixture evidence for provider claims.

V8.9-V8.11 animated sprite checks may be skipped from earlier V8 final evidence.
They are required only for the new animated-sprite subtrack and must not alter
V8.7 provider-backed photo-to-3D claim scope.
