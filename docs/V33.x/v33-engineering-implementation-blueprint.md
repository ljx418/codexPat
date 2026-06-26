# V33 Engineering Implementation Blueprint

文档状态：planned implementation blueprint；用于把 V33 PRD 和目标架构落到具体代码、数据、脚本和验收。
当前日期：2026-06-25。

## Implementation Decision

V33 不先做“任意猫照片全自动生成”。V33 先实现一条可真实验收、可失败、可回滚的 named sample set 本地闭环：

```text
named real sample metadata / safe visual hints
  -> V33 sample intake record
  -> V33 identity and character design contract
  -> project-authored or approved imported frameSequence candidate
  -> V30 semantic QA
  -> V31 art QA
  -> V32 measured frame QA
  -> V33 identity QA
  -> in-app preview / target-only apply / rollback
  -> HTML evidence report
```

这条实现路径的关键取舍：

- 自动化先负责安全记录、合同、标准化、质量门禁、产品闭环和 evidence；
- 高质量动作帧先采用项目自有人工/工具辅助产物或已授权导入产物，不把 provider 作为前置依赖；
- provider candidate route 只作为未来候选导入接口，不能绕过本地 QA；
- 如果没有足够高质量帧资产，则 V33.3 必须 `blocked scoped`，不能用整图变形或线条占位猫 silent pass。

## Concrete Code Plan

| Phase | New or Updated Code | Reused Code | Output |
| --- | --- | --- | --- |
| V33.1 sample intake | `apps/desktop/src/assets/v33-sample-intake.ts` and test | `photo-intake-privacy-boundary.ts`, `photo-suitability-traits.ts` | `V33SampleIntakeRecord[]` with safe sample id, suitability, privacy boundary, reasonCodes |
| V33.2 identity contract | `apps/desktop/src/assets/v33-identity-contract.ts` and test | `CatTraitSummary` from `photo-suitability-traits.ts` | `V33IdentityContract` and `V33CharacterDesignContract` |
| V33.3 local candidate production | `apps/desktop/src/assets/v33-photo-action-pipeline.ts`, `v33-action-candidate-gate.ts`, tests | `photo-to-2d-continuity-assembler.ts`, `semantic-animation-quality.ts`, `v31-art-quality.ts`, `v32-quality-rescue.ts` | `V33ActionCandidateManifest`, contact sheet/GIF evidence, QA result |
| V33.4 rig/frame runtime route | `apps/desktop/src/assets/v33-rig-frame-runtime-route.ts` and test | `v31-continuation.ts`, `animation-pack-adapter.ts`, `asset-pack-validator.ts` | runtime-compatible normalized frameSequence or stable blocked reason |
| V33.5 product path | `apps/desktop/src/assets/v33-productized-photo-flow.ts` and test | `pack-preview-apply-rollback.ts`, `photo-to-2d-preview-apply-flow.ts`, `asset-manager-view-model.ts` | preview/apply/rollback result with target isolation |
| V33.6 report | `scripts/v33_6_real_data_e2e_report_smoke.mjs` | existing HTML evidence report patterns under `scripts/` and `docs/V*.x/evidence` | Chinese HTML report with screenshots/contact sheets/playback evidence |

## Data and Asset Layout

V33 should use explicit, reviewable local data:

```text
apps/desktop/src/assets/generated/v33-photo-samples/
  sample-set.safe.json
  sample-001/
    character-contract.json
    candidate-local-frame-sequence/
      pet.json
      idle/frame-001.png
      ...
      sleeping/frame-012.png
    evidence/
      contact-sheet.png
      preview.gif
```

Rules:

- `sample-set.safe.json` may contain safe metadata and safe visual hints only;
- raw user photos, EXIF/GPS, full local paths, source filenames, provider raw payloads and raw prompts must not be committed or written into evidence;
- each candidate pack must be project-authored, licensed import, or approved candidate with local QA evidence;
- every pack must use the existing 8 core action ids: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.

## V33.1 Sample Intake Implementation

Create `v33-sample-intake.ts`:

```text
input:
  safeSampleId
  mediaType / size / dimensions
  localReferenceConsent
  qualitySignals
  safe visual hints

process:
  createPhotoIntakePrivacySession()
  evaluatePhotoSuitability()
  merge privacy result + suitability result
  reject unsafe metadata

output:
  V33SampleIntakeRecord
```

Acceptance:

- at least one clear real sample, one difficult sample, one blocked sample, and one negative sample are represented by safe records;
- raw photo bytes and full paths are absent from records and evidence;
- blocked samples produce reasonCodes and cannot enter candidate production.

## V33.2 Identity Contract Implementation

Create `v33-identity-contract.ts`:

```text
input:
  V33SampleIntakeRecord with clear or usable_with_risk status
  CatTraitSummary

process:
  normalize trait anchors
  define allowed stylization
  define disallowed identity drift
  define required visible features per action pack

output:
  V33IdentityContract
  V33CharacterDesignContract
```

The first implementation uses safe visual hints and reviewer-approved trait anchors. It does not claim computer-vision-grade automatic feature extraction.

Acceptance:

- each passing sample has explicit identity anchors, allowed stylization, disallowed drift, and reviewer status;
- low-confidence traits block candidate generation or mark the candidate as risk;
- contract evidence contains no raw image data or sensitive metadata.

## V33.3 Local FrameSequence Candidate Implementation

Create `v33-photo-action-pipeline.ts` and `v33-action-candidate-gate.ts`.

The initial production route is `local_frame_sequence`:

```text
V33CharacterDesignContract
  -> load project-authored / approved imported frameSequence candidate
  -> assemblePhoto2DContinuityPack()
  -> runV30MotionReadabilityQA()
  -> runV31ArtQualityGate()
  -> runV32QualityRescueGate()
  -> runV33IdentityGate()
  -> V33ActionCandidateManifest
```

This route does not generate final frames by translating, scaling, rotating or jittering one whole photo. It only accepts a candidate if the frames show local pose, silhouette, expression, tail, ear, limb or symbol changes and pass existing gates.

Pipeline stage handling for the first slice:

- `subjectDetectionStatus` is produced from safe sample suitability, cat count, visibility signals and reviewer-approved sample class;
- `segmentationStatus` may be `reviewed` or `not_automated` when the first slice uses an approved transparent frameSequence candidate instead of automatic mask generation;
- `poseEstimateStatus` may be `reviewed` when pose coverage is validated from the frameSequence actions and contact sheet;
- `identityAnchorStatus` and `characterDesignStatus` must be explicit contract checks, not inferred from final images alone;
- `rigOrFrameSeedStatus` is `passed` only when a local frameSequence seed or normalized imported pack exists;
- `actionSynthesisStatus` is `passed` only when all 8 action frame folders and manifest entries exist.

This makes the first implementation honest: it can pass a named local frameSequence route without claiming automatic computer vision segmentation, automatic pose estimation or arbitrary-cat automation.

Acceptance:

- 8 actions are present;
- active actions have stronger local motion than idle/sleeping;
- transform-only and weak-motion candidates fail;
- contact sheet and GIF or equivalent playback evidence exists;
- candidate manifest contains source boundary and route id.
- technical pipeline status is recorded for every stage, including `reviewed`, `not_automated`, `blocked` or `failed` where applicable.

## V33.4 Rig / Imported Frame Runtime Implementation

Create `v33-rig-frame-runtime-route.ts`.

Implementation:

- accept professional rig export only after it has been normalized to the same frameSequence pack contract;
- preserve existing renderer contract and `pet.json` action mapping;
- if rig runtime payload cannot be rendered safely, convert approved output to normalized frames or record `rig_export_blocked`;
- reuse V31 layered rig gate to keep prior blocked risks visible.

Acceptance:

- route either produces runtime-compatible normalized frames that pass V30/V31/V32/V33 gates, or records stable blocked reason;
- no new renderer contract is introduced unless separately approved.

## V33.5 Productized App Path Implementation

Create `v33-productized-photo-flow.ts`.

Implementation:

```text
approved V33ActionCandidateManifest
  -> build Photo2DActionFrameSet[]
  -> runV26PackPreviewApplyRollback()
  -> asset manager preview state
  -> target-only apply
  -> rollback snapshot
```

Acceptance:

- failed or blocked candidates cannot be applied;
- approved candidate applies only to target pet;
- default pet and unrelated pets remain unchanged;
- rollback restores the previous visible pack;
- diagnostics and evidence are sanitized.

## Scripts

Add one smoke script per phase:

```text
scripts/v33_1_real_sample_intake_smoke.mjs
scripts/v33_2_trait_identity_contract_smoke.mjs
scripts/v33_3_photo_action_candidates_smoke.mjs
scripts/v33_4_rig_frame_runtime_route_smoke.mjs
scripts/v33_5_in_app_preview_apply_rollback_smoke.mjs
scripts/v33_6_real_data_e2e_report_smoke.mjs
```

Each script must:

- run only against local safe sample data or locally approved imported candidates;
- emit evidence under `docs/V33.x/evidence/`;
- include PRD/spec review, claim scan, security scan;
- fail if expected visual evidence is missing;
- fail if a forbidden ready claim appears outside claim-boundary context.

## First Development Slice

The first real implementation slice should be:

```text
V33.1 + V33.2 + one V33.3 local_frame_sequence candidate
```

Files:

- `apps/desktop/src/assets/v33-sample-intake.ts`
- `apps/desktop/src/assets/v33-identity-contract.ts`
- `apps/desktop/src/assets/v33-photo-action-pipeline.ts`
- `apps/desktop/src/assets/v33-action-candidate-gate.ts`
- matching `*.test.ts`
- `scripts/v33_1_real_sample_intake_smoke.mjs`
- `scripts/v33_2_trait_identity_contract_smoke.mjs`
- `scripts/v33_3_photo_action_candidates_smoke.mjs`

Exit:

- real safe sample records exist;
- one local frameSequence candidate is associated with one sample identity contract;
- transform-only negative candidate fails;
- high-quality candidate passes scoped gates or the phase is honestly blocked.

## Explicit Non-Goals

This implementation does not claim:

- arbitrary-cat automatic photo-to-2D ready;
- provider integration verified;
- Petdex parity;
- 3D ready;
- production release ready;
- Windows ready;
- cross-platform ready.
