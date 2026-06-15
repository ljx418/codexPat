# V19 Implementation Contract

日期：2026-06-12  
状态：planned implementation boundary。

## Required Data Flow

```text
Photo / Motion Sheet Input
  -> ConsentLicenseGate
  -> ProviderMotionSheetAdapter or LocalMotionSheetImport
  -> MotionSheetValidator
  -> SheetCropNormalizer
  -> SafeAnimationPackAssembler
  -> MotionAmplitudeQA
  -> SameCatContinuityQA
  -> IsolatedPreview
  -> TargetApplyRollbackController
  -> Runtime Renderer
```

## Safe Inputs

Allowed:

- app-managed local sheet ID
- safe pack ID
- media type
- image dimensions
- size bucket
- safe action ID
- renderer kind
- consent status
- redacted provider job status
- redacted reasonCode

Forbidden:

- remote URL in pack metadata
- absolute path
- path traversal
- script field
- event handler
- external href
- shell command
- raw provider payload
- raw photo bytes
- prompt private text
- token
- Authorization
- full local path
- Petdex bundled asset without license evidence

## Motion Sheet Minimums

- Must map to 8 core actions:
  - idle
  - thinking
  - running
  - success
  - warning
  - error
  - need_input
  - sleeping
- Recommended sheet target: 8 rows x 9 columns.
- Minimum accepted frames per core action: 6 unless explicitly transient and documented.
- Accepted renderer kind: sprite / frameSequence.
- Output pack must remain under app-managed local boundary.
- Full format, reasonCode, and QA thresholds are defined in
  `docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md`.

## QA Result Contract

Each action must emit safe QA fields:

- actionId
- frameCount
- coverageState
- nonblank
- offCanvas
- closure
- meanFrameDelta
- maxFrameDelta
- amplitudeState
- sameCatState
- reasonCode

No raw image payload, raw provider payload, or local path may appear in evidence.

## Stable ReasonCode Requirement

Implementation must use stable reasonCodes from
`docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md` for validation, provider,
QA, preview, apply, and rollback failures. User-facing diagnostics may translate
them, but evidence must record the stable code.
