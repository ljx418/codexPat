# V29 Implementation Contract

文档状态：active implementation contract；planned。
当前日期：2026-06-16。

## Purpose

This contract turns the V29 PRD, target architecture, and acceptance plan into
implementation-facing data boundaries. V29 may implement phase-by-phase only.
This file does not mark any V29 phase as passed.

## Core Data Flow

```text
GalleryPack
  -> GalleryCard
  -> GalleryFilterResult
  -> FavoriteState
  -> PreviewSession
  -> TargetSwitchResult
  -> InstallHistoryEntry

ReferencePhoto
  -> BenchmarkSample
  -> PhotoSuitabilityResult
  -> CatTraitSummary
  -> RouteAttempt
  -> CandidatePack
  -> QualityGateV2Result
  -> RankedCandidate
  -> WizardSession
  -> ApplyRollbackResult
```

All runtime rendering continues to use the existing safe renderer boundary:

```text
safe action ID
renderer kind
safe profile / pack IDs
playback intent
scale
visibility
```

Renderer adapters must never receive raw photo bytes, raw provider payloads,
raw prompts, terminal payloads, HTTP payload bodies, shell commands, local
paths, tokens, or Authorization values.

## Safe Field Contract

Allowed fields in logs, evidence, UI diagnostics, and screenshots:

- safe sample ID；
- sample category bucket；
- media type bucket；
- file size bucket；
- dimension bucket；
- selected state；
- route ID；
- route family；
- attempt index；
- fixed budget summary；
- reasonCode；
- safe pack ID；
- renderer kind；
- action coverage summary；
- QA score buckets；
- candidate rank；
- preview state；
- target instance safe ID；
- rollback state；
- screenshot / contact sheet evidence path under `docs/V29.x/evidence/`。

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
- shell command；
- raw manifest payload；
- raw renderer payload；
- clipboard content；
- screen text content unrelated to the app evidence。

## Stable ReasonCodes

V29 implementations should use stable reasonCodes instead of raw errors.

Gallery and preview:

- `gallery_index_empty`
- `gallery_pack_missing`
- `gallery_pack_invalid`
- `preview_unavailable`
- `preview_action_missing`
- `favorite_saved`
- `favorite_removed`
- `target_switch_applied`
- `target_switch_failed`
- `rollback_restored_previous_pack`
- `rollback_unavailable`

Benchmark and generation:

- `benchmark_sample_missing`
- `benchmark_sample_invalid`
- `benchmark_threshold_failed`
- `photo_unsuitable`
- `photo_usable_with_risk`
- `route_unavailable`
- `route_budget_exhausted`
- `candidate_generation_failed`
- `candidate_pack_invalid`
- `candidate_pack_approved`

Quality Gate V2:

- `action_coverage_incomplete`
- `same_cat_score_too_low`
- `motion_amplitude_too_low`
- `background_not_clean`
- `blank_or_transparent_frame`
- `off_canvas_frame`
- `frame_delta_too_large`
- `loop_closure_failed`
- `aesthetic_score_too_low`
- `quality_gate_passed`
- `candidate_ranked`

Wizard and apply:

- `wizard_photo_required`
- `wizard_generation_ready`
- `wizard_generation_blocked`
- `wizard_preview_ready`
- `qa_failed_candidate_blocked`
- `apply_target_missing`
- `apply_target_only_passed`
- `apply_failed_previous_pack_preserved`
- `rollback_passed`

## Gallery Runtime Rules

- Browse, filter, search, and favorite must not mutate runtime pet state.
- Preview must use isolated preview renderer.
- Preview must send zero PetEvent.
- Preview must not call notify.
- Preview must not write CatStateMachine.
- Preview must not activate, delete, or rollback any pack.
- One-click switch must require a target PetInstance.
- One-click switch must affect the target PetInstance only.
- Failed switch must preserve previous active pack.
- Install history must store safe pack IDs and state only.

## Stable Photo Benchmark Rules

V29.2 is a benchmark gate, not a single-sample smoke.

Minimum benchmark:

- at least 12 diverse local cat photos or explicit `benchmark_sample_missing`
  blocked status；
- existing `docs/猫*.jpg` samples included when present；
- fixed budget: maximum 2 route families and maximum 2 repair retries per
  sample unless a later accepted plan narrows this further；
- no per-sample manual prompt tuning outside the fixed repair policy；
- accepted-candidate rate must be at least 80% to support the V29 stable photo
  claim；
- each rejected sample must produce user-facing repair guidance。

Failure behavior:

- if the sample count is insufficient, V29.2 is blocked；
- if accepted-candidate rate is below threshold, V29.2 is failed or blocked
  depending on environment/provider availability；
- if the benchmark fails, V29.6 must not use the V29 final allowed claim。

## Quality Gate V2 Contract

Hard rejection cannot be overruled by aesthetic rank.

Hard rejection cases:

- missing one or more of the 8 core actions；
- blank / fully transparent / off-canvas frame；
- same-cat score below threshold；
- action motion amplitude below threshold；
- unsafe or non-removable background；
- adjacent frame delta indicates flicker or sudden jump；
- loop closure fails for loop actions；
- 1x or 0.75x readability fails。

Aesthetic ranking may order candidates only after hard gates pass.

## Productized Wizard Rules

Wizard states:

- `idle`
- `photo_selected`
- `checking`
- `generating`
- `qa_running`
- `preview_ready`
- `apply_ready`
- `blocked`
- `applied`
- `rolled_back`

Wizard must:

- show progress without exposing raw provider/log payloads；
- show stable reasonCode and user-facing repair guidance；
- block apply for QA-failed candidates；
- preserve previous visible pack on failed apply；
- support rollback after successful apply；
- prove default and unrelated pets are unchanged。

## Phase Stop Rules

- V29.1 cannot pass without real gallery browse/filter/favorite/preview/switch
  evidence.
- V29.2 cannot pass without benchmark table evidence.
- V29.3 cannot pass if a hard QA failure can be ranked as accepted.
- V29.4 cannot pass if the user still needs shell commands, raw manifests, or
  provider raw output to complete the flow.
- V29.5 cannot pass with blank, transparent, off-canvas, or flash-frame accepted
  gallery packs.
- V29.6 cannot start until V29.0-V29.5 have explicit passed / blocked / failed
  evidence.

## Claim Boundary

The strongest V29 claim is allowed only if V29.1 gallery UX and V29.2 photo
benchmark both pass:

```text
V29 Petdex-level gallery and stable photo-to-animated-2D workflow passed for tested diverse local cat photo benchmark scenarios with preview, target apply, and rollback.
```

If the benchmark fails, use the blocked claim from `v29-claim-matrix.md`.

V29 must not claim all-cats automatic photo-to-2D readiness, provider
integration verified, Petdex asset reuse authorization, 3D readiness,
production signed release readiness, Windows readiness, or cross-platform
readiness.
