# V14 Target Architecture

日期：2026-06-09  
状态：planned。  

## Current Architecture Baseline

```text
V13 Beta-ready Desktop App
  -> PetWindowLifecycleController
  -> CatStateMachine
  -> CatActionResolver
  -> RendererRegistry
  -> AssetManifestRegistry
  -> Safe Diagnostics / Evidence Harness
```

The V13 baseline proves local beta usability, screenshot-backed acceptance, safe diagnostics, and scoped user-ready closure.

## V14 Target Architecture

```text
V13 Beta-ready Desktop App
  -> FlagshipWorkCatV2
  -> AnimationPackLinter
  -> LocalPetGallery
  -> FavoriteStore
  -> PreviewSandbox
  -> OneClickActivationFlow
  -> AIAssetGuideBoundary
  -> VisualProductAcceptanceHTML
```

## Component Responsibilities

| Component | Responsibility | Boundary |
| --- | --- | --- |
| FlagshipWorkCatV2 | Higher-quality default animated 2D cat. | Local bundled safe frames only. |
| AnimationPackLinter | Detect unsafe or unstable animation packs before activation. | No raw SVG/GLTF/path in output. |
| LocalPetGallery | Browse/filter local bundled and imported packs. | Local packs only; no remote marketplace. |
| FavoriteStore | Persist favorite pack IDs. | Store safe pack IDs only. |
| PreviewSandbox | Preview actions without live state mutation. | No PetEvent, no notify, no CatStateMachine writes. |
| OneClickActivationFlow | Apply selected pack to target PetInstance. | Target-only mutation; preserve previous pack on failure. |
| AIAssetGuideBoundary | Explain prompt/provider/import paths and consent. | No default upload, no ready claim without evidence. |
| VisualProductAcceptanceHTML | Summarize screenshots, captures, scans, and final decision. | Embedded sanitized evidence only. |

## Data Flow

```text
Gallery Pack
  -> AnimationPackLinter
  -> Gallery ViewModel
  -> PreviewSandbox
  -> OneClickActivationFlow
  -> Target PetInstance Active Pack
  -> Runtime Renderer
```

AI-assisted assets must flow through:

```text
User-approved Traits
  -> AI Asset Guide / Provider Boundary
  -> Generated Output
  -> AnimationPackLinter
  -> Local Import Validation
  -> Gallery Pack
```

## Public Interface Additions

Planned interfaces:

- `GalleryPackViewModel`
- `GalleryFilter`
- `FavoriteStore`
- `AnimationPackLinter`
- `petctl asset lint --manifest <path> --json`

These interfaces must only expose safe pack IDs, renderer kind, coverage state, tags, favorite state, active state, and sanitized reasonCodes.

## Non-goals

V14 does not implement:

- remote asset loading.
- asset marketplace.
- broad Petdex parity.
- 3D ready.
- automatic photo-to-3D ready.
- provider integration verified.
- production signed release.
- Windows or cross-platform release.
- OS-level Codex window binding.
