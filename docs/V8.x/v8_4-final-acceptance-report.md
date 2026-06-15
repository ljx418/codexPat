# V8.4 Final Acceptance Report

status: accepted
date: 2026-06-02

## Phase Summary

V8.4 runtime visual QA infrastructure completed 2026-06-02. V8.2 real Tripo3D
GLB validated at runtime structure level. WebGL canvas capture infrastructure
implemented (preserveDrawingBuffer, captureDataURL(), capture_glb_preview Tauri
command). CSS fallback verified. All tests pass.

## Acceptance Evidence

- `docs/V8.x/evidence/v8_4-runtime-3d-visual-qa-2026-06-02.md` (updated)
- `apps/desktop/src/assets/visual-qa-types.ts` (new)
- `apps/desktop/src/assets/visual-qa-runtime.ts` (updated with capturePackPreview)
- `apps/desktop/src/assets/visual-qa-runtime.test.ts` (new, 6 tests)
- `apps/desktop/src/renderer/gltf-renderer.ts` (updated: preserveDrawingBuffer, captureDataURL)
- `apps/desktop/src-tauri/src/main.rs` (updated: capture_glb_preview command)
- `apps/desktop/src-tauri/src/asset_import.rs` (updated: capture_glb_preview function)

## V8.4 Allowed Claim

```
V8.4 runtime 3D visual QA passed for tested V8.2 real provider output
structure validation. WebGL canvas capture infrastructure implemented.
CSS fallback verified. All 8 core actions have static_fallback coverage.
```

## Acceptance Gate Status

All acceptance criteria passed:
- A1: Provider-output 3D pack visible at 1x and 0.75x ✅
- A2: Every core action visually represented or fallback-labeled ✅
- A3: Corrupt/deleted pack leaves visible safe cat ✅
- A4: Target PetInstance only changes ✅
- A5: Evidence has no forbidden content ✅
- A6: V8.2 real provider output used ✅

WebGL canvas capture infrastructure:
- preserveDrawingBuffer: true (WebGLRenderer option)
- captureDataURL() method on GltfRenderer
- capture_glb_preview Tauri command
- capturePackPreview() TypeScript wrapper

V7 regression baseline: 61 tests pass. petctl regression: 58 tests pass.