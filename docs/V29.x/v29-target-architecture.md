# V29 Target Architecture

文档状态：active target architecture；planned。
当前日期：2026-06-16。

## Architecture Goal

V29 upgrades the project from a strong engineering workflow into a user-facing animated pet product:

```text
V23-V28 scoped workflow closure
  -> Petdex-level gallery UX
  -> stable benchmarked photo-to-2D generation
  -> stricter quality/ranking gate
  -> productized wizard
  -> final user-ready scoped gate
```

## Current Architecture

```text
PhotoSuitabilityGate
  -> CatTraitExtractor
  -> GenerationRouteOrchestrator
  -> SameCat / Motion QA
  -> V22 Quality Review Gate
  -> Preview / Apply / Rollback
```

Current gap:

- Gallery exists as engineering asset manager, not high-quality pet browsing product.
- Photo-to-2D generation has scoped evidence but not diverse benchmark reliability.
- Generated visual quality can still be inconsistent, weak-motion, or visually unappealing.
- User does not yet get a Petdex-like browse/preview/favorite/install experience.

## Target Architecture

```text
Pet Gallery UX
  -> GalleryIndex
  -> Search / Filter / Favorites
  -> Isolated Action Preview
  -> One-click Target Switch

Photo Generation Wizard
  -> Photo Intake
  -> Photo Suitability
  -> Trait Extraction
  -> Route Planner
  -> Provider / Local Route Runner
  -> Candidate Store
  -> Quality Gate V2
      -> SameCatScorer
      -> MotionAmplitudeScorer
      -> BackgroundAlphaGate
      -> LoopClosureGate
      -> FrameDeltaGate
      -> AestheticRanker
  -> Candidate Ranking
  -> User Preview
  -> Target Apply / Rollback
  -> Install History
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| GalleryIndex | expose local pet packs with safe metadata | show full paths or raw manifest payload |
| Search / Filter / Favorites | help users browse and save preferred pets | mutate runtime pet state during browse |
| Isolated Action Preview | preview 8 actions before install | send PetEvent or write CatStateMachine |
| One-click Target Switch | apply selected pack to target pet only | fallback to default silently |
| Route Planner | choose provider/local routes within budget | claim provider reliability |
| Candidate Store | store safe candidate metadata and generated frames | store raw provider response or raw photo bytes in evidence |
| Quality Gate V2 | reject bad visuals before preview/apply | pass weak motion or inconsistent cats |
| AestheticRanker | rank acceptable candidates for user selection | overrule hard QA failure |
| Install History | support rollback and recent packs | leak source filename or local path |

## Quality Gate V2

Every generated candidate must pass:

- 8 core action coverage；
- same-cat score above threshold；
- visible action amplitude；
- no background or safe transparent background；
- no blank / transparent / off-canvas frame；
- adjacent frame delta within threshold；
- first/final loop closure；
- 1x and 0.75x readability；
- operator or automated aesthetic pass。

## Safe Data Boundary

Allowed evidence fields:

- safe sample ID；
- sample category bucket；
- media type bucket；
- dimensions bucket；
- route ID；
- attempt count；
- reasonCode；
- safe pack ID；
- action coverage；
- QA score buckets；
- screenshot/contact sheet path。

Forbidden fields:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- private filename；
- full local path；
- workspace path；
- config path；
- api-token.json；
- prompt private text；
- shell command。

## Target User Experience

```text
Browse pet gallery
  -> preview animations
  -> favorite
  -> one-click switch

or

Upload cat photo
  -> generate in fixed budget
  -> inspect ranked candidates
  -> preview 8 actions
  -> apply to selected pet
  -> rollback if dissatisfied
```
