# V10.9 Manager Preview and Activation UX Smoke

Date: 2026-06-04

Status: passed

Scope: validates Desktop Manager preview/activation polish using local safe view models and bundled `work-cat-v1` preview frames. This does not claim V10 product-grade final acceptance, Petdex parity, 3D readiness, provider integration, or production release readiness.

## Evidence Files

- Preview capture: `docs/V10.x/evidence/v10_9-manager-preview-activation-capture-2026-06-04.html`

## Summary

| Check | Result | Details |
| --- | --- | --- |
| preview all core actions | passed | all 8 core actions expose animated preview metadata |
| active pack display | passed | target instance shows imported active pack and restore default action |
| fallback pack display | passed | fallback/default work-cat-v1 remains visible and unrelated pets stay default |
| restore default result | passed | simulated restore default clears imported active mapping while preserving default work-cat-v1 |
| restart persistence result | passed | view model deterministically restores PetInstance active pack mapping from persisted activeInstances |
| zero accepted PetEvent | passed | Manager preview path is modeled as zero accepted PetEvent and does not call notify |
| live PetInstance unchanged by preview | passed | preview metadata creation does not mutate target, default, or unrelated PetInstance state |
| preview renderer safe input | passed | preview renderer input contains only safe pack/action/renderer/playback/scale fields |
| visible fallback for partial action | passed | partial action falls back to visible idle metadata instead of blank preview |
| security scan | passed | view model, renderer input, and capture frames contain safe fields only |
| claim scan | passed | V10.9 claims Manager preview/activation polish only; product-grade V10 remains pending V10.10 |

## Action Preview Coverage

| Action | Coverage | Reason Code | Renderer | Frame Count | FPS | Playback | Fallback |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| idle | animated | action_frames_present | sprite | 8 | 9 | loop |  |
| thinking | animated | action_frames_present | sprite | 8 | 9 | loop |  |
| running | animated | action_frames_present | sprite | 8 | 12 | loop |  |
| success | animated | action_frames_present | sprite | 4 | 10 | transient |  |
| warning | animated | action_frames_present | sprite | 4 | 9 | transient |  |
| error | animated | action_frames_present | sprite | 4 | 8 | urgent |  |
| need_input | animated | action_frames_present | sprite | 4 | 8 | urgent |  |
| sleeping | animated | action_frames_present | sprite | 8 | 7 | loop |  |

## Active / Fallback Pack Display

- Target active pack: `imported-orange-v10`
- Target fallback pack: `work-cat-v1`
- Default pet active pack: `work-cat-v1`
- Unrelated pet active pack: `work-cat-v1`
- Restore default result: `work-cat-v1`

## Preview Isolation

- `acceptedPetEvents=0`
- `notify=false`
- `CatStateMachine=false`
- `liveStateChanged=false`
- Preview renderer input fields: `packId`, `actionId`, `rendererKind`, `playbackIntent`, `scale`

## PRD / Spec Review

V10.9 matches `docs/V10.x/v10_9-manager-preview-ux-spec.md`: all core actions have preview metadata, active/fallback pack display is available, restore default is modeled, and preview remains isolated from live PetInstance state.

## Security Scan

- Evidence records safe IDs, sanitized reason codes, action coverage, and preview metadata only.
- No raw PetEvent, provider payload, prompt text, photo metadata, token, Authorization, shell command, remote URL, or local source path is recorded.

## Claim Scan

Allowed scoped claim:

```text
V10.9 Manager preview and activation UX polish passed for tested local bundled work-cat-v1 scenarios.
```

Forbidden claims remain not made:

```text
V10 product-grade animated 2D work-cat experience passed
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
marketplace ready
production signed release ready
cross-platform ready
Windows ready
```
