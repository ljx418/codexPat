# V10.0 Animation Gap Audit

status: accepted-audit
date: 2026-06-04

## Current Implementation Facts

- `SpriteRenderer` supports imported multi-frame sprite playback through
  `frameFiles` and `requestAnimationFrame`.
- `GltfRenderer` supports `AnimationMixer` when a loaded GLB/GLTF contains
  matching animation clips.
- V9.2 generated a real MiniMax static 2D eight-action pack.
- V9.3 generated a real MiniMax two-frame dynamic 2D eight-action pack.
- V9.4 Tripo3D real 3D provider branch remains blocked.

## Current Product Gap

The product can display and import pets, but the default visible experience
does not yet match a modern animated pet catalog expectation:

- default pet motion is not a high-quality bundled animated 2D experience.
- Desktop Manager does not yet offer a clear action preview surface.
- runtime state-to-animation switching has not been accepted as a productized
  animation experience.
- static/procedural GLB paths are not valid animated 3D evidence.

## Target Experience

V10 targets:

- visible default animated 2D cat with all core actions.
- previewable actions from Desktop Manager.
- state-linked runtime animation for the target PetInstance.
- strict animated GLTF gate for real action clips only.

## False-green Risks

| Risk | Severity | Control |
| --- | --- | --- |
| Treating manifest `frameFiles` as runtime animation proof | High | require visual playback evidence |
| Treating static GLB as animated 3D | High | static/partial label and GLTF clip gate |
| Treating V9 provider generation as full animation UX | High | keep V9 generation and V10 runtime experience separate |
| Preview mutates live state accidentally | Medium | isolated preview renderer requirement |
| Transparent fallback hides cat | High | fallback visibility gate |

## Decision

This audit was accepted and led to V10.1-V10.10. V10.10 has now passed scoped
for the tested local bundled `work-cat-v1` product-grade animated 2D work-cat
experience. The blocked 3D/provider boundaries remain unchanged.
