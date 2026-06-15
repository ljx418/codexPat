# V7.5 Generated Asset Import GLTF Scan Smoke Evidence

status: passed

date: 2026-05-31

commit: c07cdd0e

## Scope

Validated generated local sprite and GLTF asset import safety using real local fixtures and Rust import/deep-scan tests.

This evidence does not prove remote loading, marketplace imports, provider integration, runtime action quality, or broad 3D readiness.

## Commands

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml asset_import`
- `pnpm --filter desktop test`
- `pnpm --filter desktop check`
- `node scripts/v5_12_runtime_imported_pack_smoke.mjs`
- `node scripts/v7_5_generated_asset_import_gltf_scan_smoke.mjs`

## Smoke Result

```text
status: passed
generated sprite fixture coverage: passed
generated GLTF fixture coverage: passed
tauri asset import and GLTF deep scan tests: passed
desktop unit tests: passed
desktop typecheck: passed
V5.12 runtime imported pack baseline: passed
security redaction scan: passed
```

## Covered Decisions

- valid generated sprite fixture imports.
- valid generated GLTF fixture imports.
- GLTF external URI/resource rejection remains tested.
- unknown required extensions remain rejected unless allowlisted.
- invalid import preserves safe behavior through existing import baseline.

## Not Recorded

- raw GLTF chunks.
- full local paths.
- raw manifest path.
- token.
- Authorization.
- raw payload.
- workspace path.
- config path.

## Decision

V7.5 generated asset import validation passed for tested local sprite and GLTF asset scenarios.
