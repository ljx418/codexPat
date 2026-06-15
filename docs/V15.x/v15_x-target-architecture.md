# V15 Target Architecture

日期：2026-06-09  
状态：V15.0-V15.13 passed scoped photo-guided 2D asset extension。  

## Current Architecture Baseline

```text
V14 Premium Pet Gallery Baseline
  -> FlagshipWorkCatV2
  -> AnimationPackLinter
  -> LocalPetGallery
  -> FavoriteStore
  -> PreviewSandbox
  -> OneClickActivationFlow
  -> VisualProductAcceptanceHTML
```

The V14 baseline proves local premium animated pet packs, gallery browsing, favorite persistence, isolated preview, one-click switching, and screenshot-backed final evidence.

## V15 Target Architecture

```text
V14 Premium Pet Gallery Baseline
  -> InteractionPriorityEngine
  -> LivingIdleScheduler
  -> DragPhysicsController
  -> PointerAwarenessController
  -> AutonomousWalkController
  -> EmotionActionComposer
  -> InteractionSettingsStore
  -> InteractionPreviewSandbox
  -> DesktopInteractionEvidenceHarness
  -> PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> Photo2DPromptPackGenerator
  -> ProviderOrImportBranch
  -> Photo2DContinuityAssembler
  -> GeneratedPackPreviewApplyFlow
```

The detailed photo-to-2D contracts for V15.9-V15.13 are frozen in
`docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md`.

## Component Responsibilities

| Component | Responsibility | Boundary |
| --- | --- | --- |
| InteractionPriorityEngine | Select the highest-priority visual intent across agent, drag, pointer, click, walk, and idle. | Cannot write CatStateMachine or emit PetEvent. |
| LivingIdleScheduler | Schedule blink, look, tail sway, stretch, nap, wake when allowed. | Blocked by priority states. |
| DragPhysicsController | Manage grabbed, dragging, release, land, settle, and persisted position. | No native image drag ghost; no raw pointer trace in evidence. |
| PointerAwarenessController | Detect pointer-near, hover, click, double-click. | Safe interaction events only; no screen text or clipboard. |
| AutonomousWalkController | Move within safe bounds with pause/turn/edge avoidance. | Configurable and bounded; no offscreen movement. |
| EmotionActionComposer | Compose state and interaction into safe action IDs. | Does not expose raw agent payloads. |
| InteractionSettingsStore | Persist user toggles and intensity presets. | Safe booleans/enums only. |
| InteractionPreviewSandbox | Preview interaction behavior in settings. | No live PetInstance mutation. |
| DesktopInteractionEvidenceHarness | Capture screenshots/captures and summarize acceptance. | Sanitized evidence only. |
| PhotoIntakeConsentBoundary | Select photo, explain privacy, strip EXIF/path, record explicit consent before upload. | No raw photo/path/EXIF/GPS in evidence. |
| CatTraitReviewModel | Collect or infer safe visual traits and require user approval. | Safe trait fields only; no raw image payload. |
| Photo2DPromptPackGenerator | Generate 8 core action prompts from approved traits. | Prompt evidence is redacted/summarized unless explicitly user-approved. |
| ProviderOrImportBranch | Run named provider under consent or output import-ready instructions. | No broad provider readiness claim. |
| Photo2DContinuityAssembler | Normalize generated/imported frames into safe local `pet.json + frames`. | Reuses V15.8 continuity guard; invalid pack preserves previous visible pack. |
| GeneratedPackPreviewApplyFlow | Preview generated pack and apply only to target pet. | No PetEvent, no live state mutation during preview. |

## Data Flow

```text
Agent State
Pointer / Drag / Click Signal
Idle / Walk Scheduler
  -> InteractionPriorityEngine
  -> EmotionActionComposer
  -> Safe Action Intent
  -> Renderer Adapter
```

Settings flow:

```text
Settings UI
  -> InteractionSettingsStore
  -> Controllers read safe toggles
  -> PreviewSandbox displays isolated simulation
```

Photo-to-2D flow:

```text
User Photo
  -> PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> Photo2DPromptPackGenerator
  -> ProviderOrImportBranch
  -> Photo2DContinuityAssembler
  -> AssetManifestRegistry
  -> GeneratedPackPreviewApplyFlow
  -> target PetInstance only
```

## Runtime Safety Boundary

Controllers may output:

- safe interaction kind.
- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.
- sanitized reasonCode.
- safe approved trait IDs / labels.
- safe generated pack ID.

Controllers must not output:

- raw PetEvent.
- raw Agent/Codex payload.
- raw pointer path.
- raw photo.
- EXIF / GPS.
- raw provider response.
- source filename.
- terminal payload.
- prompt text.
- tool command text.
- screen contents.
- clipboard contents.
- token.
- Authorization.
- workspace path.
- config path.
- full local path.

## Non-goals

V15 does not implement:

- Petdex parity.
- remote marketplace.
- 3D ready.
- automatic photo-to-3D ready.
- automatic photo-to-2D ready for arbitrary cats.
- provider integration verified.
- production signed release.
- Windows or cross-platform release.
- OS-level Codex window binding.
