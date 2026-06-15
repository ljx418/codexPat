# V10.5 Final Visual QA Smoke

status: passed-scoped
date: 2026-06-04

## Scope

This evidence closes the V10.5 scoped final gate for the implemented V10.1-V10.4
path:

- bundled `sprite-v3-animated` 2D action pack.
- Desktop Manager isolated action preview model.
- bundled state-linked runtime animation.
- GLTF / GLB clip gate detection and static / partial labeling.

This evidence does not claim:

- Petdex parity achieved.
- 3D ready.
- animated GLTF runtime playback passed.
- automatic photo-to-3D ready.
- provider integration verified.
- Rive ready.
- Live2D ready.
- asset marketplace ready.
- remote asset loading ready.
- production signed release ready.
- cross-platform ready.
- Windows ready.

## Real Desktop Visual Evidence

Desktop runtime screenshot:

```text
docs/V10.x/evidence/v10_5-runtime-visible-desktop-screenshot-2026-06-04.png
```

Observed result:

- desktop app launched successfully.
- default and temporary visual-check PetInstances were visible.
- runtime window position was inside the visible desktop bounds after the Tauri
  monitor coordinate fix.
- visible pet used the V10 bundled sprite renderer path.
- no fully transparent or off-canvas pet was observed in the captured desktop
  evidence.

The screenshot is visual evidence for the bundled animated 2D path only. It is
not 3D evidence.

## V10 Phase Evidence

| Phase | Result | Evidence |
| --- | --- | --- |
| V10.1 default animated 2D pack | passed | `docs/V10.x/evidence/v10_1-default-animated-2d-pack-smoke-2026-06-04.md` |
| V10.1 contact sheet | passed | `docs/V10.x/evidence/v10_1-default-animated-2d-contact-sheet-2026-06-04.html` |
| V10.1 runtime playback capture | passed | `docs/V10.x/evidence/v10_1-runtime-playback-capture-2026-06-04.html` |
| V10.2 action preview UX | passed | `docs/V10.x/evidence/v10_2-action-preview-ux-smoke-2026-06-04.md` |
| V10.3 state-linked runtime animation | passed scoped | `docs/V10.x/evidence/v10_3-state-linked-animation-smoke-2026-06-04.md` |
| V10.4 animated GLTF clip gate | detection passed; animated claim excluded | `docs/V10.x/evidence/v10_4-animated-gltf-clip-gate-smoke-2026-06-04.md` |

## Checks Run

- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: passed.
- `pnpm --filter desktop check`: passed.
- `pnpm --filter desktop test`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed.
- `node scripts/v10_1_default_animated_2d_pack_smoke.mjs`: passed.
- `node scripts/v10_2_action_preview_ux_smoke.mjs`: passed.
- `node scripts/v10_3_state_linked_animation_smoke.mjs`: passed.
- `node scripts/v10_4_animated_gltf_clip_gate_smoke.mjs`: passed with
  `animatedGltfClaim=excluded`.
- `node scripts/v3_1_runtime_smoke.mjs`: passed.
- `node scripts/v4_4_managed_session_smoke.mjs`: passed.
- `node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs`: passed.
- `node scripts/v9_2_minimax_static_2d_generation_smoke.mjs`: passed.
- `node scripts/v9_3_minimax_dynamic_2d_generation_smoke.mjs`: passed.

## Runtime Fix Verified

The V10.5 desktop screenshot verified the monitor coordinate fix for high-DPI
macOS displays. Pet spawn and visibility checks now use monitor logical
position size derived from the monitor scale factor, so newly spawned pets are
not placed beyond the visible desktop bounds.

Legacy runtime renderer preference `css` is migrated to `sprite` for the V10
default experience. This prevents old local preferences from hiding the V10
bundled animated 2D pack behind the old CSS fallback.

## Security Scan Result

Evidence records only:

- safe action IDs.
- renderer kind.
- pack IDs.
- coverage states.
- reason codes.
- frame counts.
- clip counts.
- relative evidence artifact names.
- pass / excluded / blocked decisions.

Evidence does not record:

- token.
- Authorization header.
- raw payload.
- raw unsafe SVG payload.
- raw GLTF JSON chunk.
- prompt text.
- provider payload.
- shell command text.
- full local path.
- workspace path.
- config path.

## Claim Scan Result

Allowed final scoped claim:

```text
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

## Final Decision

V10.5 is passed for the scoped V10 animated 2D action playback path. Animated
GLTF runtime playback remains excluded because no real accepted animated GLTF
fixture was provided or verified.
