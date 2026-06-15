# V8.3 Development Plan

status: in-progress
date: 2026-06-02

## Objective

Build GLTF/GLB deep scanner and asset normalizer that converts provider output
into an action-ready local pack, with explicit action clip coverage table.

## Dependencies

- V8.2 unblocked (real provider GLB output required for acceptance)
- V8.1 provider consent and credential harness (prerequisite boundary)

## Scope

V8.3 offline development may proceed now using fixture GLB files:
- `apps/desktop/public/assets/3d/agent-desktop-pet-cat-prototype.glb`
- `fixtures/manual/v5_12/gltf/cat.glb`

Full acceptance requires V8.2 real provider output.

## Components

### GLTFDeepScanner

Scan GLB/GLTF for:
- URI rejections: `http://`, `https://`, `file://`, `javascript:`, `data:`
- external `.bin` references
- absolute paths and path traversal (`..`, absolute `/`)
- unknown `extensionsRequired` not on allowlist
- size/complexity limits: max file size, mesh count, material count,
  texture count, animation count, animation duration, node count
- clip name validation against accepted action list

Output: `GLTFScanResult { ok: boolean, errors: string[], warnings: string[], stats: ... }`

### AssetNormalizer

Convert accepted provider output into local pack structure:
- copy GLB to safe app-managed storage path
- generate safe action ID mapping
- create manifest with sanitized fields only
- reject if any scan error

Output: `NormalizedAssetPack { id, actions, clipMap, manifest }`

### ActionClipMapper

Map core actions to clips or explicit fallbacks:
- Required actions: idle, thinking, running, success, warning, error,
  need_input, sleeping
- Coverage states: clip_present, fallback_clip, static_fallback,
  css_fallback, blocked
- Explicit fallback mapping required for any non clip_present action

## Acceptance Criteria

A1: Scanner rejects unsafe URI/path/extension/complexity
A2: Normalized output imports into app-managed storage
A3: All 8 core actions have clip or explicit fallback coverage
A4: Invalid output preserves previous active pack
A5: No forbidden content (URI, path, raw JSON) in evidence
A6: Scanner is runnable against fixture GLB now; real GLB after V8.2

## Test Plan

1. Run scanner against fixture GLB files — verify clean pass
2. Run scanner against artificially malformed GLB — verify rejections
3. Test normalizer round-trip: fixture → scan → normalize → verify manifest
4. Verify action coverage table for fixture pack
5. After V8.2 unblocks: repeat with real provider output
