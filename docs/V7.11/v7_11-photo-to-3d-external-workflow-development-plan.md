# V7.11 External GLB/GLTF Intake Contract Development Plan

status: implementation-ready
date: 2026-06-01

## Goal

Define and test the local intake contract for GLB/GLTF assets before any future
external photo-to-3D provider output can enter runtime.

V7.11 does not assume MiniMax provides GLB output and does not claim automatic
photo-to-3D readiness. If no real external provider GLB exists, V7.11 may only
claim local GLB/GLTF intake contract evidence against a real local GLB fixture.

## Development Scope

- Provide standardized external 3D generation instructions.
- Require license, attribution, and retention checklist for imported GLB/GLTF assets.
- Require GLB/GLTF deep scan before activation.
- Distinguish static 3D preview assets from action-ready 3D assets.
- Accept only core action clip names: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
- Record whether the tested asset is `local_fixture`, `external_provider_output`,
  or `blocked_no_external_output`.

## GLTF/GLB Deep Scan

Reject:

- `http://`, `https://`, `file://`, `javascript:`, and `data:` URI.
- External `.bin` references in local single-file mode.
- External image references in local single-file mode.
- Absolute paths and path traversal.
- Unknown `extensionsRequired` unless allowlisted.
- Oversized file, mesh, material, texture, animation count, or animation duration.
- Non-core action clip names for runtime mapping.

## Evidence

`docs/V7.11/evidence/v7_11-external-glb-intake-smoke-YYYY-MM-DD.md`

## Allowed Claim

V7.11 GLB/GLTF intake contract passed for tested local GLB/GLTF asset scenario.

If and only if a real external photo-to-3D provider output is tested later with
explicit consent, license/retention evidence, deep scan, and no leakage, the
claim may name that exact provider scenario. Otherwise, photo-to-3D remains
not-ready.
