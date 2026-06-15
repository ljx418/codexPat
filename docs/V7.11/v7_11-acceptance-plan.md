# V7.11 Acceptance Plan

status: implementation-ready
date: 2026-06-01

## Required Checks

- At least one real local GLB/GLTF asset passes deep scan.
- Malicious or unsafe internal URI references are rejected.
- External `.bin` and external image dependencies are rejected in single-file local mode.
- Unknown required extensions are rejected unless allowlisted.
- Missing action clips are categorized as static preview only.
- Evidence records safe field names and decisions only, never raw JSON chunks or local paths.
- Evidence distinguishes local fixture intake from real external provider output.
- If no real external provider output exists, no photo-to-3D or provider claim is allowed.

## Failure Rules

If no real GLB/GLTF asset is available, V7.11 is blocked. Do not use a
manifest-only fixture to claim GLB intake passed.

If a real local GLB/GLTF asset is available but no real external photo-to-3D
provider output exists, V7.11 may pass only the local GLB/GLTF intake contract
claim and must explicitly keep photo-to-3D not-ready.
