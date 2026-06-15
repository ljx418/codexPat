# V7.12 Acceptance Plan

status: planned
date: 2026-05-31

## Required Checks

- GLTF canvas is nonblank in screenshot or recording evidence.
- Cat bounding box remains inside viewport at 1x and 0.75x scale.
- Core actions are mapped to clips or documented safe fallback.
- `success` does not override active `error` or `need_input` priority state.
- Corrupt GLB falls back to CSS or previous active pack.
- Target PetInstance changes; default and unrelated pets remain unchanged.
- Two pets using the same imported GLB/GLTF do not share mutable renderer state.

## Blocking Rule

If runtime 3D cannot be visually observed, V7.12 is blocked or failed. Do not mark passed based only on import validation.
