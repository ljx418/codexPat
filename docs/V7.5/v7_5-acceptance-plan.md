# V7.5 Acceptance Plan

status: accepted

date: 2026-05-31

## Acceptance Criteria

- valid generated sprite pack imports.
- valid generated GLTF/GLB pack imports.
- remote URL, external resources, absolute paths, path traversal, unknown required extensions, corrupt GLB, and renderer mismatch are rejected.
- invalid import preserves previous active pack.
- evidence records safe field names and decisions only, never raw GLTF chunks or full paths.

## Required Checks

- import validator unit tests: passed.
- GLTF deep scan tests: passed.
- generated fixture smoke: passed.
- security redaction scan: passed.

## Evidence

- `docs/V7.5/evidence/v7_5-generated-asset-import-gltf-scan-smoke-2026-05-31.md`
- `scripts/v7_5_generated_asset_import_gltf_scan_smoke.mjs`
- `apps/desktop/src-tauri/src/asset_import.rs`
