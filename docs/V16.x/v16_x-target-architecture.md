# V16 Target Architecture

状态：planned architecture；not implementation evidence。  
日期：2026-06-10。

## Current Architecture

```text
PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> Photo2DPromptPackGenerator
  -> ProviderOrImportBranch(import-ready)
  -> Photo2DContinuityAssembler
  -> GeneratedPackPreviewApplyFlow
  -> target PetInstance
```

Current V15 gap:

- provider branch did not run.
- no real provider multi-frame output accepted.
- same-cat consistency is not productized.
- provider job lifecycle is not a Manager UX.

## Target Architecture

```text
Desktop Manager Photo-to-2D Wizard
  -> PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> ProviderDisclosureConsentModel
  -> ProviderCredentialBoundary
  -> Photo2DProviderAdapter
  -> ProviderJobStore
  -> ProviderOutputNormalizer
  -> SameCatConsistencyReviewer
  -> Photo2DContinuityAssembler
  -> AssetManifestRegistry
  -> GeneratedPackPreviewApplyFlow
  -> RendererRegistry
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| ProviderDisclosureConsentModel | show cost/privacy/retention/license before upload | silently upload |
| ProviderCredentialBoundary | read credential from approved env/secret source | write token to logs/evidence |
| Photo2DProviderAdapter | submit named provider job and poll safe status | expose raw provider response |
| ProviderJobStore | keep safe job summary and reasonCode | store raw photo/prompt/token |
| ProviderOutputNormalizer | turn output into local frame metadata | accept remote runtime URLs |
| SameCatConsistencyReviewer | detect identity drift and create contact sheet | auto-pass arbitrary mismatch |
| Photo2DContinuityAssembler | run V15.12 continuity and safety gates | activate invalid pack |
| GeneratedPackPreviewApplyFlow | preview/apply only target pet | emit PetEvent during preview |

## Data Boundary

Allowed provider evidence fields:

- provider name
- model family/version
- safe job id digest
- action id
- frame count
- output file digest
- byte size
- reasonCode
- license/attribution summary

Forbidden:

- raw photo bytes
- raw prompt text
- raw provider request/response
- token
- Authorization
- cookie/session
- full local path
- workspace/config path
- EXIF/GPS
- shell command
- remote runtime URL

## Runtime Boundary

Renderer adapter receives only:

- safe action ID
- renderer kind
- safe pack ID
- playback intent
- scale
- visibility

Renderer adapter never receives provider/photo/prompt payloads.

