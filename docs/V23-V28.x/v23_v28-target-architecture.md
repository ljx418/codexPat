# V23-V28 Target Architecture

文档状态：planned target architecture。  
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-15。

## Architecture Goal

V23-V28 adds the missing upstream generation and product UX layers before the
accepted V22 Quality Review Gate. V22 proves that poor candidates can be
rejected. V23-V28 must improve how candidates are created, scored, retried,
previewed, applied, and rolled back.

## Current Architecture

```text
V21 multi-route candidate generation
  -> V22 quality review gate
  -> approved-only target apply
```

This protects users from bad assets, but it does not yet give ordinary users a
stable “upload cat photo -> generate useful animated 2D pet” experience.

## Target Architecture

```text
Photo Intake UI
  -> PhotoSuitabilityGate
  -> CatTraitExtractor
  -> GenerationRouteOrchestrator
      -> Route A: provider key-pose -> local interpolation
      -> Route B: provider action sheet
      -> Route C: canonical identity image -> local 2D rig
      -> Route D: image-to-video -> frames
      -> Route E: style fallback local pack
  -> Candidate Asset Store
  -> MultiActionNormalizer
  -> SameCatContinuityQA
  -> MotionQualityQA
  -> V22 Quality Review Gate
  -> Isolated Action Preview
  -> Target Apply / Rollback
  -> Runtime Sprite Renderer
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| PhotoSuitabilityGate | classify clear / usable / risky / unsuitable photo | upload photo before consent |
| CatTraitExtractor | produce safe trait summary and prompt hints | persist EXIF/GPS/raw bytes |
| GenerationRouteOrchestrator | run route attempts under budget | claim provider reliability |
| MultiActionNormalizer | convert outputs into 8 core actions | accept missing actions silently |
| SameCatContinuityQA | compare visual identity across actions | rely on filenames or provider text only |
| MotionQualityQA | detect amplitude, drift, frame delta, loop closure | pass static jitter as action |
| V22 Quality Review Gate | reject bad results before apply | allow unreviewed apply |
| Preview/Apply Controller | preview isolated, apply target-only, rollback | mutate default/unrelated pets |

## Safe Data Boundary

Allowed evidence fields:

- safe photo sample ID；
- media type bucket；
- size bucket；
- dimensions；
- selected route；
- safe trait labels；
- action coverage summary；
- QA reasonCode；
- candidate status；
- safe pack ID；
- safe screenshot/contact sheet path。

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

## Target State

The user-facing target is a single wizard:

```text
Upload photo -> Check -> Generate -> Preview -> Apply -> Rollback
```

Internally, each failed route must produce actionable reasonCodes instead of
showing a broken or ugly pet.
