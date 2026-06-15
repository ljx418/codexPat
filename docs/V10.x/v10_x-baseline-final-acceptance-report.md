# V10.x Baseline Final Acceptance Report

status: v10.1-v10.5-baseline-passed-scoped
date: 2026-06-04

This report covers the V10.1-V10.5 scoped baseline only. It is not evidence for
the later V10.6-V10.10 product-grade animated work-cat goal.

## Scope

This report records V10.x scoped final acceptance for the implemented V10.1,
V10.2, V10.3, V10.4 detection / labeling, and V10.5 visual QA scope.

It does not claim:

- Petdex parity achieved.
- 3D ready.
- automatic photo-to-3D ready.
- provider integration verified.
- Rive ready.
- Live2D ready.
- asset marketplace ready.
- remote asset loading ready.
- production signed release ready.
- cross-platform ready.
- Windows ready.

## Phase Results

| Phase | Status | Evidence | Notes |
| --- | --- | --- | --- |
| V10.1 Default High-quality Animated 2D Pack | scoped passed | `docs/V10.x/evidence/v10_1-default-animated-2d-pack-smoke-2026-06-04.md` | `sprite-v3-animated` covers all 8 core actions with required multi-frame counts. |
| V10.2 Desktop Manager Action Preview UX | scoped passed | `docs/V10.x/evidence/v10_2-action-preview-ux-smoke-2026-06-04.md` | Preview uses isolated renderer and emits safe coverage metadata. |
| V10.3 State-linked Runtime Animation | scoped passed | `docs/V10.x/evidence/v10_3-state-linked-animation-smoke-2026-06-04.md` | Bundled `sprite-v3-animated` path passed. Imported animated sprite path is explicitly excluded from this smoke. |
| V10.4 Animated GLTF Clip Gate | detection passed; animated GLTF claim excluded | `docs/V10.x/evidence/v10_4-animated-gltf-clip-gate-smoke-2026-06-04.md` | Clip allowlist detection and static/partial labeling passed. No real animated GLTF playback fixture was accepted. |
| V10.5 Final Visual QA | scoped passed | `docs/V10.x/evidence/v10_5-final-visual-qa-smoke-2026-06-04.md` | Real desktop screenshot confirmed visible V10 bundled animated 2D runtime path after coordinate and legacy renderer migration fixes. |

## Visual Evidence

- V10.1 contact sheet:
  `docs/V10.x/evidence/v10_1-default-animated-2d-contact-sheet-2026-06-04.html`
- V10.1 runtime playback capture:
  `docs/V10.x/evidence/v10_1-runtime-playback-capture-2026-06-04.html`
- V10.5 real desktop screenshot:
  `docs/V10.x/evidence/v10_5-runtime-visible-desktop-screenshot-2026-06-04.png`

## Checks Run

- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed.
- `node scripts/v10_1_default_animated_2d_pack_smoke.mjs`: passed.
- `node scripts/v10_2_action_preview_ux_smoke.mjs`: passed.
- `node scripts/v10_3_state_linked_animation_smoke.mjs`: passed.
- `node scripts/v10_4_animated_gltf_clip_gate_smoke.mjs`: passed, with animated GLTF claim excluded.
- `node scripts/v3_1_runtime_smoke.mjs`: passed after starting the desktop app for runtime health.
- `node scripts/v4_4_managed_session_smoke.mjs`: passed after starting the desktop app for runtime health.
- `node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs`: passed.
- `node scripts/v9_2_minimax_static_2d_generation_smoke.mjs`: passed.
- `node scripts/v9_3_minimax_dynamic_2d_generation_smoke.mjs`: passed.

The desktop app was started for runtime regression and visual screenshot
evidence. The visible screenshot verifies the bundled animated 2D runtime path;
it is not 3D evidence.

## Security Scan Result

The V10.1-V10.5 smoke evidence records safe action IDs, renderer kinds,
coverage states, reason codes, frame counts, clip counts, and relative evidence
artifact names only.

Evidence does not record:

- token.
- Authorization header.
- raw payload.
- raw unsafe SVG payload.
- raw GLTF JSON chunk.
- prompt text.
- provider payload.
- shell command.
- full local path.
- workspace path.
- config path.

## Claim Scan Result

Allowed scoped claims:

```text
V10.1 default high-quality animated 2D pack passed for tested bundled sprite-v3-animated scenarios.
V10.2 Desktop Manager action preview UX passed for tested local preview scenarios.
V10.3 state-linked runtime animation passed for tested bundled sprite-v3-animated scenarios.
V10.4 animated GLTF clip gate detection and static/partial labeling completed.
V10.x animated pet action playback passed for tested bundled animated 2D pack, Desktop Manager action preview, bundled state-linked runtime animation, and GLTF clip gate detection scenarios; animated GLTF runtime playback remains excluded.
```

Forbidden claims are not made:

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

## V10.5 Decision

V10.5 passed scoped because:

- V10.1, V10.2, V10.3, and V10.4 evidence were reviewed.
- real desktop screenshot evidence shows a visible V10 bundled animated 2D pet.
- security scan and claim scan passed.
- required regression set passed.
- animated GLTF runtime playback was explicitly excluded from the final claim.

## Baseline Decision

V10.1-V10.5 passed scoped for the bundled animated 2D action playback baseline.
V10.x does not pass or claim 3D readiness, Petdex parity, automatic
photo-to-3D readiness, provider integration readiness, or production release
readiness.

## Product-grade V10 Status

The product-grade V10 target moved to V10.6-V10.10 and has now passed scoped
with `docs/V10.x/v10_x-product-grade-final-acceptance-report.md`. The final
claim remains limited to tested local bundled `work-cat-v1` scenarios.
