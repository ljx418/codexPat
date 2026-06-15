# V7.12 True 3D Runtime Action Mapping Development Plan

status: planned
date: 2026-05-31

## Goal

Activate a deep-scanned local GLB/GLTF asset for one PetInstance and prove visible runtime 3D action mapping.

## Development Scope

- Use only GLB/GLTF assets accepted by V7.11 deep scan.
- Activate the asset for a target PetInstance.
- Map core actions to accepted clip names or safe fallback.
- Prevent arbitrary animation names from entering renderer input.
- Ensure two pets using the same GLB/GLTF do not share mutable renderer state.
- Fallback to CSS or previous active pack on corrupt or unsupported assets.

## Runtime Safety

Renderer adapter may receive only safe action ID, renderer kind, safe pack/profile IDs, playback intent, scale, and visibility.

Renderer adapter must not receive raw manifest path, prompt, provider payload, photo metadata, token, Authorization, workspace path, config path, shell command, or raw Agent/Codex/MCP/HTTP payload.

## Evidence

`docs/V7.12/evidence/v7_12-3d-runtime-action-mapping-smoke-YYYY-MM-DD.md`

## Allowed Claim

V7.12 3D runtime action mapping passed for tested local imported GLB/GLTF asset scenarios.
