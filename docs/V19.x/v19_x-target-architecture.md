# V19 Target Architecture

日期：2026-06-12  
状态：planned architecture。

## Architecture Goal

V19 adds a motion-sheet generation and validation layer between photo/provider output and the existing safe asset/runtime system.

```text
Photo / Motion Sheet Input
  -> ConsentLicenseGate
  -> MotionSheetProviderAdapter or LocalMotionSheetImport
  -> MotionSheetValidator
  -> SheetCropNormalizer
  -> SafeAnimationPackAssembler
  -> MotionAmplitudeQA
  -> SameCatContinuityQA
  -> IsolatedManagerPreview
  -> TargetApplyRollbackController
  -> Runtime Renderer
```

## Current vs Target

| Component | Current V18 | Target V19 |
| --- | --- | --- |
| Provider output | Canonical identity image | Single same-cat motion sheet or blocked decision |
| Normalization | Local transform-derived frames | Crop rows/columns into real frame sequences |
| QA | Nonblank/continuity/same source hash | Adds motion amplitude and sheet structure QA |
| Preview | Generated action grid/preview model | Sheet preview + per-action animation preview |
| Safety | Existing V5/V18 boundaries | Adds Petdex asset license boundary and sheet URI/path scan |

## Components

### ConsentLicenseGate

Responsibilities:

- Show provider, cost, privacy, retention, license, attribution notes.
- Confirm user consent before upload/generation.
- For external sheet import, show ownership/license confirmation.

Forbidden:

- token, Authorization, raw provider response, full local path, raw photo bytes in evidence.

### MotionSheetProviderAdapter

Responsibilities:

- Request a single same-cat motion sheet where the provider supports reference image + multi-pose output.
- Return safe job status, output type, action coverage summary, redacted reasonCode.

Forbidden:

- Logging raw prompts, raw provider payload, token, full path, or private photo data.

### LocalMotionSheetImport

Responsibilities:

- Accept app-managed local sheet input.
- Reject remote URL, absolute path, path traversal, scripts, event handlers, external hrefs.
- Preserve previous active pack on invalid import/activation.

### MotionSheetValidator

Responsibilities:

- Validate dimensions, frame grid, safe metadata, renderer kind, max file size, max frame count.
- Support Petdex-compatible 8-row sheet and project 8-core-action mapping.

### SheetCropNormalizer

Responsibilities:

- Crop rows/columns into frame sequences.
- Normalize action IDs to project core actions.
- Produce `pet.json + frames` under app-managed boundary.

### MotionAmplitudeQA

Responsibilities:

- Measure nonblank, off-canvas, frame delta, bounding box movement, closure, and scale readability.
- Compare against V18 transform baseline.
- Block apply if motion is too subtle or visually unstable.

### SameCatContinuityQA

Responsibilities:

- Ensure same visual identity across rows/actions.
- Combine automated hash/color/bbox heuristics with operator visual acceptance for final gate.

### IsolatedManagerPreview

Responsibilities:

- Preview sheet and per-action animations.
- Send zero PetEvent.
- Do not call notify.
- Do not write CatStateMachine.
- Do not mutate live PetInstance.

### TargetApplyRollbackController

Responsibilities:

- Apply only to selected PetInstance.
- Keep default/unrelated pets unchanged.
- Rollback previous active pack.

## Data Boundary

Renderer adapter may receive only:

- safe action ID
- renderer kind
- safe pack/profile IDs
- playback intent
- scale
- visibility

Renderer adapter must not receive:

- raw PetEvent
- provider payload
- prompt text
- photo metadata
- token
- Authorization
- full local path
- shell command
- script source
- remote URL
