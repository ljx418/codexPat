# V8.4 Development Plan

status: in-progress
date: 2026-06-02

## Objective

Build runtime visual QA harness for provider-output GLB pack. Capture evidence
that provider-output 3D renders correctly, all 8 core actions are visually
represented, scale/bounds/fallback are correct.

## Dependencies

- V8.2: Real Tripo3D GLB output (COMPLETED)
- V8.3: GLTF deep scanner + asset normalizer (COMPLETED)

## Scope

V8.4 adds runtime visual QA infrastructure:
- GLB runtime import harness (Tauri backend)
- Screenshot/evidence capture per action
- Nonblank check (canvas has content)
- Bounding box check (model is within viewport)
- Scale check (model visible at 1x and 0.75x)
- Fallback check (CSS cat renders when GLB fails)
- Provider-output pack evidence file output

## Components

### Runtime Visual QA Harness

`apps/desktop/src-tauri/src/asset_import.rs` already has:
- `runtime_personalized_asset_data` — reads GLB bytes for runtime
- `runtime_personalized_asset_pack` — reads pack metadata

Add:
- `visual_qa_capture(pack_id, action_id)` — renders GLB to canvas, returns screenshot as base64
- `visual_qa_check_pack(pack_id)` — runs all 8 action QA checks

### Evidence Collector

`apps/desktop/src/assets/visual-qa-collector.ts` (new):
- Captures per-action screenshots
- Records nonblank, bounding box, scale results
- Writes sanitized evidence JSON

### Visual QA Types

```typescript
export type VisualQACheckResult = {
  actionId: SafeActionId;
  nonblank: boolean;
  hasBoundingBox: boolean;
  scaleCorrect: boolean;
  reasonCode: string;
};

export type VisualQAPackResult = {
  packId: string;
  provider: "Tripo3D";
  checks: VisualQACheckResult[];
  anyFailed: boolean;
  evidenceFile: string | null;
};
```

## Acceptance Criteria

A1: Provider-output 3D pack visible at 1x and 0.75x scale
A2: Every core action (8 total) is visually represented or explicitly fallback-labeled
A3: Corrupt/deleted pack leaves visible safe cat
A4: Target PetInstance only changes; default/unrelated pets unchanged
A5: Evidence file has no token, Authorization, full path, raw payload, raw response
A6: V8.2 real provider output used for evidence (not fixture)

## Test Plan

1. Import provider GLB to app storage via existing Tauri backend
2. Run visual QA harness against provider pack
3. Verify all 8 actions have visual representation
4. Verify fallback works when pack is deleted
5. Scan evidence file for forbidden content
6. Run full regression suite

## Implementation Notes

- Use existing `runtime_personalized_asset_data` Tauri command
- GLB rendering via existing GltfRenderer mount flow
- Screenshot via canvas capture (HTMLCanvasElement.toDataURL)
- Evidence written to /tmp or docs/ with sanitized paths only