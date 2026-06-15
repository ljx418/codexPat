# V17 Target Architecture

状态：V17.0-V17.7 scoped passed target architecture；MiniMax text-to-image action-sheet API passed scoped；not local photo upload/provider integration evidence。  
日期：2026-06-11。

## Current Architecture

```text
Settings Personalization Panels
  -> PhotoIntakePrivacyBoundary
  -> Prompt / provider boundary helpers
  -> V16 evidence scripts
  -> GeneratedPackPreviewApplyFlow
```

当前问题：

- UI 是说明型，不是可操作型。
- V16 打包脚本和 evidence 仍偏单场景和工程路径。
- 用户需要理解提示词、动作表、打包、preview/apply 多个分散概念。

## Target Architecture

```text
Desktop Manager Photo2D Wizard Modal
  -> PhotoSelectionPreview
  -> PhotoIntakeConsentBoundary
  -> TraitReviewForm
  -> GenerationModeSelector
      -> HostImageToolAssistedFlow
      -> ProviderApiJobFlow
      -> LocalActionSheetImportFlow
  -> ActionSheetIntake
  -> ActionSheetGridDetector
  -> ActionFrameNormalizer
  -> Photo2DContinuityAssembler
  -> SameCatReviewModel
  -> ModalActionPreviewQA
  -> TargetPetApplyRollbackController
  -> AssetManifestRegistry
  -> RendererRegistry
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| PhotoSelectionPreview | show selected image preview and safe metadata | display full path or EXIF/GPS |
| GenerationModeSelector | guide host/manual/provider/import branches | silently upload |
| ProviderApiJobFlow | run only when credential/consent/disclosure ready | log token or raw provider response |
| LocalActionSheetImportFlow | accept 4x2 external action sheet | accept remote runtime URL |
| ActionSheetGridDetector | crop 4x2 into ordered core actions | require manual crop for happy path |
| ActionFrameNormalizer | create loop-safe frame sequences | generate open-loop flicker frames |
| ModalActionPreviewQA | preview all actions and quality results | mutate live pet or send PetEvent |
| TargetPetApplyRollbackController | apply to selected target and rollback | fallback to default target silently |

## Data Flow

```text
user photo
  -> safe local preview metadata
  -> approved traits and consent
  -> action sheet output
  -> cropped cells
  -> generated local frames
  -> continuity + same-cat QA
  -> isolated preview
  -> target-only apply
```

## Runtime Renderer Boundary

Renderer receives only:

- safe action ID
- renderer kind
- safe pack ID
- playback intent
- scale
- visibility

Renderer never receives:

- raw photo
- raw prompt
- provider payload
- provider response
- token / Authorization
- full local path
- EXIF/GPS
- shell command
- raw HTTP body

## Target UX State Machine

```text
idle
  -> photo_selected
  -> consent_ready
  -> generation_mode_selected
  -> waiting_for_output
  -> output_ready
  -> packaging
  -> qa_ready
  -> apply_ready
  -> applied
  -> rolled_back
```

Failure states:

```text
consent_required
provider_not_ready
action_sheet_invalid
packaging_failed
qa_failed
apply_failed_previous_pack_preserved
```
