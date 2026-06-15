# V8.8 3D Rendering Quality Smoke Evidence

status: passed
date: 2026-06-03

## Evidence Summary

V8.8 3D rendering quality smoke passed on 2026-06-03. Camera position,
lighting, and normalizeModelForViewport updated. Visual validation with
v5-12-runtime-gltf pack (prototype GLB). All regression tests passing.

## Test Results

### Type Check
```
pnpm --filter desktop check
# No errors
```

### Desktop Tests (61 tests, all passing)
```
pnpm --filter desktop test
ℹ tests 61
ℹ pass 61
ℹ fail 0
```

### Petctl Tests (58 tests, all passing)
```
pnpm --filter @agent-desktop-pet/petctl test
ℹ tests 58
ℹ pass 58
ℹ fail 0
```

### Rust Cargo Check
```
cargo check
# Finished `dev` profile
```

## V8.8 Implementation Changes

### Camera Fix (gltf-renderer.ts:41-43)
**Before:**
```typescript
camera.position.set(0, -5, 2.2);
camera.lookAt(0, 0, 1);
```

**After:**
```typescript
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);
```

### Lighting Fix (gltf-renderer.ts:50-59)
**Before:**
```typescript
scene.add(new THREE.HemisphereLight(0xffffff, 0x99aabb, 2.2));
```

**After:**
```typescript
// Hemisphere light for ambient base
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
// Directional light from upper-front for depth
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(1, 2, 2);
scene.add(dirLight);
// Soft fill light from opposite side
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
fillLight.position.set(-1, 0, -1);
scene.add(fillLight);
```

### Scale Fix (gltf-renderer.ts:290)
**Before:**
```typescript
model.scale.setScalar(1.75 / maxDimension);
```

**After:**
```typescript
model.scale.setScalar(1.4 / maxDimension);
```

### Normalize Camera Update (gltf-renderer.ts:293-297)
**Before:**
```typescript
camera.position.set(0, 3.8, 1.1);
camera.lookAt(0, 0, 0);
```

**After:**
```typescript
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);
```

## Visual Validation

Screenshot captured at position (100, 100) with size 220x220:
- Window visible with GLTF renderer
- Model centered in viewport
- Background transparent

Pack activated: v5-12-runtime-gltf (prototype GLB, 3 meshes, 8 animations)

## Acceptance Criteria Status

| Criterion | Status | Evidence |
|-----------|--------|----------|
| AC1: Camera framing centered | PASS | camera (0,0,3) lookAt (0,0,0) |
| AC2: Lighting improved | PASS | HemisphereLight + DirectionalLight + FillLight |
| AC3: Static GLB handling | PASS | normalizeModelForViewport updated |
| AC4: Scale 1x normal | PASS | 1.4/maxDimension scaling |
| AC5: Real data validation | PASS | v5-12-runtime-gltf prototype GLB (3 meshes, 8 anims) |
| AC6: No regression | PASS | 61 desktop + 58 petctl tests pass |

## V8.8 Claim Basis

V8.8 3D rendering quality improvement passed for prototype GLB scenario.
Camera centering, 3-light setup, and scale adjustment applied. Visual QA
shows proper rendering at 220x220 with centered model.