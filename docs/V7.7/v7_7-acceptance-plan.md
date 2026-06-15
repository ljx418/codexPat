# V7.7 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- V7.1-V7.6 are passed or explicitly excluded with scoped claim language.
- at least one personalized local guided asset pack passes import, activation, action mapping, runtime rendering, and visual QA.
- provider path, if not tested, is explicitly feasibility-only or excluded.
- security scan passes.
- claim scan passes.
- license/attribution scan passes.
- generated artifacts are not tracked as source.

## Required Checks

```bash
pnpm run doctor
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v5_12_runtime_imported_pack_smoke.mjs
node scripts/v5_13_guided_workflow_smoke.mjs
node scripts/v5_14_provider_feasibility_smoke.mjs
git diff --check --
git ls-files | rg '(^|/)(node_modules|dist|target)/'
```

V7-specific smoke scripts must be added by implementation phases and included before final acceptance.

## Accepted V7-Specific Checks

- `node scripts/v7_1_photo_intake_privacy_smoke.mjs`: passed.
- `node scripts/v7_2_trait_prompt_pack_smoke.mjs`: passed.
- `node scripts/v7_3_external_generation_instruction_smoke.mjs`: passed.
- `node scripts/v7_4_provider_consent_boundary_smoke.mjs`: passed feasibility-only.
- `node scripts/v7_5_generated_asset_import_gltf_scan_smoke.mjs`: passed.
- `node scripts/v7_6_action_mapping_runtime_smoke.mjs`: passed.
- `node scripts/v7_7_productization_gate_smoke.mjs`: passed.
