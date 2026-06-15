# V20 Target Architecture

文档状态：planned target architecture；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Target Flow

```text
Desktop Manager Provider Wizard
  -> LocalReferencePhotoIntake
  -> MainlandProviderSelection
  -> ConsentDisclosureGate
  -> ProviderCapabilityPreflight
  -> ProviderBenchmarkOrchestrator
  -> PromptRepairLoop
  -> MiniMaxReferenceImageMotionSheetAdapter
  -> ProviderOutputStore
  -> MotionSheetNormalizer
  -> BackgroundAndTransparencyGate
  -> MotionAmplitudeSameCatQA
  -> SafeAnimationPackAssembler
  -> IsolatedActionPreview
  -> TargetApplyRollbackController
  -> Runtime Sprite Renderer
```

## Component Responsibilities

### MainlandProviderSelection

Allows the user to choose or inspect:

- MiniMax / 海螺 as V20 P0.
- Alibaba Tongyi Wanxiang, Volcengine Seedream/Jimeng, Kling, Baidu, Tencent as non-active candidates.

It must not imply those candidates are integrated or verified.

### ConsentDisclosureGate

Requires explicit confirmation for:

- upload/generation consent.
- cost disclosure.
- privacy disclosure.
- retention disclosure.
- license/attribution disclosure.
- provider terms.
- credential availability.

### ProviderCapabilityPreflight

Returns one of:

- `image_to_image_supported`
- `single_motion_sheet_supported`
- `text_to_image_only`
- `provider_credential_missing`
- `provider_terms_required`
- `provider_unavailable`
- `provider_output_missing`
- `provider_output_rejected`

V20 cannot proceed to provider job without supported reference-image capability and explicit consent.

### MiniMaxReferenceImageMotionSheetAdapter

V20 P0 adapter. It may submit a reference image and a prompt requesting one 8x9 action sheet.

Allowed output summary:

- providerName
- endpointHost
- model
- capability
- reasonCode
- imageCount
- outputKind
- safeOutputFileNames
- promptHash
- promptLength

Forbidden output:

- raw provider response
- raw request body
- token
- Authorization
- raw photo bytes
- full local path
- prompt private text

### ProviderBenchmarkOrchestrator

Runs V20.2 across multiple user-provided cat photo samples when available.

Responsibilities:

- track sample count.
- run prompt variants.
- enforce attempt budget.
- collect safe reasonCodes.
- compute accepted output count and median accepted-attempt count.

### PromptRepairLoop

Maps QA failure reasonCodes to the next prompt repair instruction. It must not
blindly retry the same prompt. It must not increase provider call count beyond
the V20 attempt budget.

### MotionSheetNormalizer

Converts accepted provider sheet into project-safe pack:

```text
provider sheet image
  -> validate dimensions/layout
  -> crop rows/columns
  -> normalize transparent/background-safe frames
  -> generate pet.json + frame sequence or spritesheet pack
```

### BackgroundAndTransparencyGate

Blocks or marks for future remediation when:

- background is visible.
- alpha coverage is unsafe.
- subject is not isolated.
- provider output is not suitable for desktop overlay.

V20 may record blocked reason; it must not apply bad output.

### MotionAmplitudeSameCatQA

Checks:

- 8-action coverage.
- same-cat identity.
- no blank/off-canvas frames.
- adjacent-frame delta.
- first/final loop closure.
- action amplitude.
- 1x and 0.75x readability.

### TargetApplyRollbackController

Applies accepted pack only to selected PetInstance. Failed QA or failed apply preserves previous active pack.

## Data Boundary

Renderer receives only:

- safe action ID
- renderer kind
- safe pack ID
- playback intent
- scale
- visibility

Renderer never receives:

- raw provider response
- provider credential
- raw photo
- prompt text
- path
- HTTP payload
- token
- Authorization
