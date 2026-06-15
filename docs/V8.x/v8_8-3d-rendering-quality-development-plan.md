# V8.8 3D Rendering Quality Development Plan

status: planned
date: 2026-06-02

## Context

V8.7 productization gate passed for named Tripo3D/local explicit-consent scenario.
However, V8.4 visual QA identified that the rendered 3D quality is poor - the
Tripo3D GLB appears as a "blob" due to camera misalignment, poor lighting,
and no animations (the GLB has 0 animations).

## Problem Statement

Current rendering issues:
1. Camera position `(0, -5, 2.2)` + lookAt `(0, 0, 1)` is misaligned
2. No directional light — only hemisphere light (0xffffff, 0x99aabb, 2.2)
3. Tripo3D GLB has 0 animations, rendered as static pose
4. `normalizeModelForViewport` scales to fit but camera doesn't track model center properly
5. Background is transparent (alpha: true) but model appears washed out

## Goals

1. Improve 3D rendering quality for provider-imported GLBs
2. Make the cat model visible and properly lit from default camera angle
3. Handle static (no-animation) GLB gracefully with idle pose
4. Test with both prototype GLB (3 meshes, 8 animations) and Tripo3D GLB (1 mesh, 0 animations)

## Implementation Plan

### V8.8.1 Renderer Camera and Lighting Fix

- Adjust default camera position and FOV for better initial framing
- Add directional light with shadow support
- Improve hemisphere light setup for better ambient illumination
- Fix camera lookAt target to match model centroid after normalization

### V8.8.2 Static GLB Fallback Handling

- When GLB has 0 animations, use a gentle idle rotation instead of static display
- Consider using a subtle bobbing animation for static models
- Ensure CSS fallback is visually comparable in quality

### V8.8.3 Visual QA Integration Test

- Use `capturePackPreview()` to capture actual rendered frames
- Verify rendered output at 1x and 0.75x scale
- Compare prototype GLB vs Tripo3D GLB rendering quality

## Technical References

- `apps/desktop/src/renderer/gltf-renderer.ts` — GltfRenderer class
- `apps/desktop/src/assets/visual-qa-runtime.ts` — capturePackPreview function
- `apps/desktop/public/assets/3d/agent-desktop-pet-cat-prototype.glb` — prototype (3 meshes, 8 animations)
- `/tmp/v8_2_provider_output/tripo_pbr_model.glb` — Tripo3D GLB (1 mesh, 0 animations)

## Claim After Acceptance

```
V8.8 3D rendering quality improvement passed for prototype and Tripo3D
static-pose GLB scenarios. Camera framing, lighting, and static-model
handling improved.
```

## What V8.8 Does NOT Claim

- Animation quality for GLBs that already have animations
- Photo-to-3D ready (V8.7 final gate is the acceptance)
- Production release ready