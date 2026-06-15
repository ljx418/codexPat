# V10.x Target Architecture: Product-grade Animated Work Cat

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Target Flow

```text
PetEvent / UserInteraction
  -> CatStateMachine
  -> CatActionResolver / InteractionActionResolver
  -> AnimationPackAdapter
  -> AnimationCoverageResolver
  -> RuntimePlaybackController
  -> RendererRegistry
  -> SpriteRenderer
  -> RuntimePetWindow / ManagerPreviewPanel
```

V10.6-V10.10 strengthen the animation experience while preserving the existing
safe renderer boundary.

V10.11 adds a documentation, onboarding, and evidence layer around the accepted
runtime architecture:

```text
Accepted V10 Work-cat Runtime
  -> README / active docs current-state summary
  -> three-minute Codex work-cat onboarding copy
  -> real desktop screenshot evidence
  -> HTML evidence summary linked to screenshots
  -> claim scan / final report
```

V10.11 does not add another runtime data path. It documents and proves the
accepted local behavior without expanding provider, 3D, release, or Codex
monitoring claims.

## Current Architecture Gap

| Area | Current | V10 Target |
| --- | --- | --- |
| Default animation | `sprite-v3-animated` proves motion but remains visually rough | `work-cat-v1` is the daily-use default animated work cat |
| Asset format | V5 manifest and procedural SVG frames dominate | local `pet.json + spritesheet/png-sequence` adapter coexists with manifest |
| Playback | renderer swaps frames by action | `RuntimePlaybackController` manages loop, transient, priority, and micro-interaction |
| Interaction | pet mostly reflects agent state | click, drag, and idle random actions add companion behavior |
| Manager UX | preview metadata exists | user can understand active pack, preview all actions, restore default |
| 3D | static/partial GLTF labeling only | remains excluded unless real animated clips pass later |
| Product onboarding | capability spread across phase docs and evidence | README, active docs, settings evidence, and screenshot-backed report form one current V10 path |
| Premium pet library | one accepted default `work-cat-v1` | at least 6 premium bundled local cats exposed through `PetGalleryPack` |
| First-run setup | README/settings explain the path | `FirstRunWizard` creates visible pet and verifies Codex work-cat reaction |
| Gallery | Manager preview foundations exist | built-in local gallery with safe preview, activation, restore, and imported-pack deletion |
| Benchmark evidence | no selected benchmark scorecard | `BenchmarkScorecard` with screenshot/recording-backed visual and onboarding outcomes |

## V10.12-V10.16 Target Flow

```text
Premium bundled cat packs
  -> PetGalleryPack metadata
  -> GalleryPreviewPanel / FirstRunWizard
  -> safe activation for selected PetInstance
  -> RuntimePlaybackController
  -> SpriteRenderer
  -> VisualQualityReport + BenchmarkScorecard
  -> V10.16 final gate
```

The V10.12-V10.16 layer remains local and bundled. It does not add remote
gallery, remote asset loading, provider execution, 3D readiness, OS-level Codex
monitoring, or production release readiness.

## PetGalleryPack

```ts
type PetGallerySourceKind = "bundled" | "imported";
type PetGalleryQualityStatus = "premium" | "standard" | "fallback" | "invalid";

interface PetGalleryPack {
  packId: string;
  displayName: string;
  styleTags: string[];
  rendererKind: "sprite" | "css" | "gltf";
  sourceKind: PetGallerySourceKind;
  license: string;
  attribution: string;
  coreActionCoverage: Record<string, "animated" | "static" | "fallback" | "missing">;
  previewActionId: string;
  frameCount: number;
  fps: number | null;
  qualityStatus: PetGalleryQualityStatus;
  fallbackStatus: "available" | "missing" | "not_needed";
  canDelete: boolean;
}
```

`canDelete` is true only for user-imported packs in app-managed storage.
Bundled packs and fallback packs cannot be deleted.

## FirstRunWizardState

```ts
type FirstRunWizardStep =
  | "welcome"
  | "choose_pet"
  | "choose_mode"
  | "codex_command"
  | "test_reaction"
  | "done";

type FirstRunWizardMode = "desktop_pet" | "codex_work_cat";

interface FirstRunWizardState {
  step: FirstRunWizardStep;
  selectedPackId: string;
  mode: FirstRunWizardMode | null;
  createdInstanceId: string | null;
  testEventResult: "not_run" | "accepted" | "failed";
  unsupportedNoticesAccepted: boolean;
  completedAt: string | null;
}
```

The wizard completion flag stores only an ISO timestamp.

## VisualQualityReport and BenchmarkScorecard

`VisualQualityReport` records safe per-pack/action visual QA summaries:

- pack ID and action ID.
- frame count and unique pose count.
- nonblank, frame-difference, scale, and off-canvas results.
- operator verdict.

`BenchmarkScorecard` records only evidence-matched outcomes:

- `exceeded`.
- `matched`.
- `partial`.
- `blocked`.

Final V10.16 claim is allowed only if selected visual-quality and first-run
onboarding outcomes are both `exceeded`.

## AnimationPackAdapter

Responsibility:

- convert local `pet.json + spritesheet` or `pet.json + png sequence` packs into
  the existing internal safe action model.
- normalize fps, frame order, loop/transient flags, duration, and fallback
  action.
- preserve existing V5 manifest import support.

Allowed output:

- safe pack ID.
- safe action ID.
- renderer kind.
- frame count.
- fps.
- loop/transient metadata.
- fallback action ID.
- sanitized reasonCode.

Forbidden output:

- raw source path.
- full local path.
- remote URL.
- raw image payload.
- provider payload.
- prompt text.
- token.
- Authorization.
- shell command.
- script source.

## RuntimePlaybackController

Responsibility:

- play loop actions continuously.
- play transient actions and return to the correct base action.
- enforce priority rules for error and need_input.
- allow local user micro-interactions without mutating agent state.
- keep target PetInstance isolated.

Core rules:

- `success` returns to idle unless error or need_input is active.
- click feedback is local UI behavior, not a PetEvent.
- drag feedback is local UI behavior and must preserve persisted position.
- idle random micro-action must never hide the pet or change agent state.

## ManagerPreviewPanel

Responsibility:

- preview every core action for the active pack.
- show coverage state, frame count, fps, loop/transient label, fallback, and
  reasonCode.
- restore the default `work-cat-v1` pack.
- isolate preview from runtime state.

Preview forbidden behavior:

- no `notify`.
- no `CatStateMachine` write.
- no live PetInstance state mutation.
- no delete, rollback, or activation unless user explicitly chooses an
  activation action.

## Renderer Boundary

Renderer adapter receives only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

Renderer adapter never receives:

- raw PetEvent.
- raw Agent/Codex/terminal/MCP/HTTP payload.
- provider payload.
- prompt text.
- tool command text.
- token.
- Authorization.
- workspace path.
- config path.
- full local path.
- remote URL.
- shell command.
- script source.

## Final Architecture Decision

V10 remains a 2D-first product experience track. Animated GLTF and 3D remain
excluded from the final V10 claim unless a later accepted phase supplies real
animated GLTF playback evidence.
