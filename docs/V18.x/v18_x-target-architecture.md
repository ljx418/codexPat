# V18 Target Architecture

日期：2026-06-12  
状态：planned architecture。

## Architecture Goal

V18 adds a productized image-to-image generation path on top of the accepted V17 wizard:

```text
Desktop Manager Wizard
  -> ReferencePhotoIntake
  -> ConsentCredentialGate
  -> ImageToImageActionProviderAdapter
  -> ProviderJobStore
  -> CanonicalIdentityGenerator
  -> MultiActionOutputNormalizer
  -> SafeAnimationPackAssembler
  -> SameCatContinuityQA
  -> IsolatedActionPreview
  -> TargetApplyRollbackController
  -> Runtime Renderer
```

## Current Architecture

V17 currently supports:

- local photo preview and consent states.
- host/manual/provider/import mode UI.
- 4x2 action-sheet intake.
- crop/package to frame sequence.
- modal preview QA.
- target apply/rollback model.
- MiniMax text-to-image action-sheet smoke.

V17 does not support:

- provider reference image upload based on user cat photo.
- image-to-image job lifecycle.
- canonical identity lock across generated actions.
- final claim that arbitrary user cat photo can generate actions.

## Target Components

### ReferencePhotoIntake

Responsibilities:

- local file selection and drag/drop.
- object URL or app-managed preview.
- media type / dimensions / size bucket.
- consent state.

Forbidden:

- full local path display.
- original filename if revealing private data.
- EXIF/GPS persistence.
- raw photo bytes in evidence.

### ConsentCredentialGate

Responsibilities:

- provider name and model display.
- upload consent.
- cost/privacy/retention/license disclosure.
- credential presence check.
- provider not-ready display.

Forbidden:

- token or Authorization display.
- writing credentials to manifest/evidence.

### ImageToImageActionProviderAdapter

Responsibilities:

- send approved reference image to selected provider.
- request one canonical cat identity image for the approved reference photo.
- receive provider job output.
- return a safe canonical output handle and metadata.

Adapter output must be sanitized:

- provider name
- job status
- output kind
- action coverage summary
- redacted reasonCode

Adapter output must not include raw response, raw payload, token, Authorization, full path, prompt private data, or raw provider files outside app-managed storage.

### CanonicalIdentityGenerator

Responsibilities:

- convert the accepted provider output into one app-managed canonical identity image.
- record only a safe source hash.
- reject missing, blank, or invalid provider output.
- never expose raw provider payload, raw HTTP payload, full local path, prompt text, token, or Authorization.

### MultiActionOutputNormalizer

Responsibilities:

- derive all 8 core actions from the same canonical source image.
- preserve the same source hash across every action frame sequence.
- validate frame count and dimensions.
- produce app-managed `pet.json + frames`.
- annotate the pack with `identityLock.mode = single_canonical_source`.

### SameCatContinuityQA

Responsibilities:

- visible same-cat review table.
- hard source-hash identity gate for all action source images.
- nonblank and off-canvas check.
- first/final closure.
- adjacent-frame delta.
- 1x / 0.75x readability.

### IsolatedActionPreview

Responsibilities:

- preview 8 actions.
- display QA result and reasonCode.
- never send PetEvent.
- never write CatStateMachine.
- never mutate live pet state.

### TargetApplyRollbackController

Responsibilities:

- apply only to selected PetInstance.
- preserve previous active pack.
- rollback on demand.
- fail closed.

## Data Boundaries

Renderer receives only:

- safe action ID
- renderer kind
- safe profile/pack IDs
- playback intent
- scale
- visibility

Renderer must not receive:

- raw provider payload
- raw local path
- photo metadata beyond safe summary
- prompt text
- token
- Authorization
- shell command
- HTTP payload
- raw Agent/Codex/MCP payload

## Target Allowed Claim

After evidence only:

```text
V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local image-to-image provider scenario with in-app preview, target apply, and rollback.
```
