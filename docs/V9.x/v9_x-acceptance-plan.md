# V9.x Acceptance Plan

status: active
date: 2026-06-03

## Gates

| Phase | Acceptance Gate |
| --- | --- |
| V9.1 | readiness/consent smoke reports configured providers without leaking secrets |
| V9.2 | real MiniMax output generates 8 static action PNGs, manifest imports, target activation contract passes |
| V9.3 | real MiniMax output generates multi-frame PNGs, V8.9 assembler/import path passes, runtime animation evidence passes |
| V9.4 | real Tripo3D GLB output passes GLTF scan, normalization, runtime visual QA, and target activation contract |
| V9.5 | Desktop Manager guided flow exposes generation, preview, activation, delete, and diagnostics |
| V9.6 | corrupt/missing/deleted provider outputs fallback to visible safe cat |
| V9.7 | all accepted V9 evidence, regression, security, claim, license, and artifact scans pass |

## Required Commands

```bash
node scripts/v9_1_provider_readiness_consent_smoke.mjs
node scripts/v9_2_minimax_static_2d_generation_smoke.mjs
node scripts/v9_3_minimax_dynamic_2d_generation_smoke.mjs
node scripts/v9_4_tripo3d_generation_smoke.mjs
node scripts/v9_5_generated_asset_activation_smoke.mjs
node scripts/v9_6_runtime_visual_qa_smoke.mjs
node scripts/v9_7_productization_gate_smoke.mjs
```

Baseline regression:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml asset_import
node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs
```

## Pass / Block / Fail

- `passed`: real accepted provider output and local import/runtime evidence match
  the scoped claim.
- `blocked`: credential, consent, network, provider output, or provider terms are
  missing.
- `failed`: provider output leaks sensitive data, fails validation, affects the
  wrong PetInstance, or leaves a transparent/blank/off-canvas pet.
