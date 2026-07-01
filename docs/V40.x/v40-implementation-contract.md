# V40 Implementation Contract

Date: 2026-06-29

## Purpose

This contract turns the V40 no-WebUI local route into implementation-ready
interfaces. It prevents the next code phase from inventing new product scope,
claim boundaries, workflow semantics, or evidence shape.

## Implemented And Remaining Modules

Future implementation should keep V40 asset logic under the desktop asset
boundary and avoid changing bridge/runtime contracts unless a later PRD approves
it.

- `apps/desktop/src/assets/v40-local-hybrid-generation.ts`
  - keeps historical V40.1 local tool readiness and blocked-route summaries;
  - must not be used to claim ComfyUI readiness.
- `apps/desktop/src/assets/v40-direct-local-runner.ts`
  - owns the current V40.1A scoped Direct Local Runner readiness contract;
  - verifies dependency, GPU, model, output directory, claim, and security
    boundaries;
  - does not prove generated candidate quality.
- `apps/desktop/src/assets/v40-no-webui-workflow-contract.ts`
  - owns the current V40.2 safe run request, candidate summary, visual review,
    product gate, claim scan, and security scan contracts.
- `apps/desktop/src/assets/v40-local-image-candidate-orchestrator.ts`
  - owns `LocalImageCandidateOrchestrator`;
  - builds the sample-bound no-WebUI route plan;
  - coordinates Direct Local Runner and Ollama adapters;
  - emits safe run summaries.
- `apps/desktop/src/assets/v40-direct-local-image-model.ts`
  - owns `DirectLocalImageModelAdapter`;
  - submits sanitized runner inputs;
  - returns only safe relative output references and stable reason codes.
- `apps/desktop/src/assets/v40-ollama-prompt-review.ts`
  - owns `OllamaPromptReviewAdapter`;
  - produces local prompt/rubric/review suggestions;
  - marks all output as advisory.
- `apps/desktop/src/assets/v40-hybrid-normalization.ts`
  - owns `HybridAssetNormalizationGate`;
  - normalizes accepted candidate files into the existing safe asset-pack shape.
- `apps/desktop/src/assets/v40-candidate-source-decision.ts`
  - owns `CandidateSourceDecisionGate`;
  - records the V40.3R3 route decision before more implementation;
  - cannot approve quality or bypass explicit visual review.
- `apps/desktop/src/assets/v40-hybrid-visual-preference.ts`
  - owns `HybridVisualPreferenceGate`;
  - compares same-sample V39 and V40 outputs.
- `apps/desktop/src/assets/v40-product-preview-apply-rollback.ts`
  - owns `HybridPreviewApplyRollbackGate`;
  - exposes accepted candidates to preview, target-only apply, rollback, and
    blocked reason.

## Core Data Contracts

### `V40LocalToolReadiness`

Required fields:

- `gpuStatus`: `available | unavailable | unknown`.
- `ollamaStatus`: `available | unavailable | blocked`.
- `ollamaModelSummary`: safe model name only, no full paths.
- `directRunnerStatus`: `ready | unavailable | blocked`.
- `directRunnerDependencySummary`: safe dependency names/status only, no full paths.
- `directModelSummary`: safe model/checkpoint name only, no full paths.
- `comfyStatus`: retained as historical `blocked | not_used`.
- `webuiStatus`: retained as historical `blocked | not_used`.
- `reasonCodes`: stable non-sensitive strings.

### `V40NoWebUIRunRequest`

Required fields:

- `sampleId`: existing tested sample ID.
- `sourceRef`: safe relative source reference or existing sample key.
- `baselineV39Ref`: safe relative V39 baseline evidence reference.
- `route`: must be `direct_local_runner_no_webui` or `manual_import_no_webui`.
- `actionSet`: exactly idle, walk, jump, sleep, eat, play, alert, celebrate.
- `consentBoundary`: `public_sample | explicit_local_user_sample`.

Action naming boundary:

- V40 asset action names are fixed as `idle`, `walk`, `jump`, `sleep`, `eat`,
  `play`, `alert`, and `celebrate`. These names are used for generated frame
  candidates, manifests, contact sheets, visual review, and V40.4 packaging.
- Product state action names such as `thinking`, `running`, `success`,
  `warning`, `error`, `need_input`, and `sleeping` belong to runtime state
  mapping. They must not replace the V40 asset action names inside candidate
  generation or V40.4 normalization.
- V40.3R5 evidence must decide and record the mapping from product states to V40
  asset actions before generation. The default mapping is:

| Product state | V40 asset action |
| --- | --- |
| `idle` | `idle` |
| `thinking` | `alert` |
| `running` | `walk` |
| `success` | `celebrate` |
| `warning` | `alert` |
| `error` | `alert` |
| `need_input` | `alert` |
| `sleeping` | `sleep` |

Forbidden fields:

- raw photo bytes;
- raw prompt text;
- absolute local paths;
- Authorization or token values;
- raw runner payload;
- raw generated image bytes.

### `V40HybridCandidateSummary`

Required fields:

- `candidateId`: stable safe ID.
- `sampleId`: source sample ID.
- `status`: `generated | imported | normalized | accepted | blocked | failed`.
- `route`: `direct_local_runner_no_webui | manual_import_no_webui`.
- `characterRef`: safe relative reference when available.
- `contactSheetRef`: safe relative reference when available.
- `animatedPreviewRef`: safe relative reference when available.
- `actionCoverage`: eight-action boolean map.
- `identityScore`: `pass | warn | fail`.
- `visualPreference`: `better_than_v39 | similar_to_v39 | worse_than_v39 | not_reviewed`.
- `reasonCodes`: stable non-sensitive strings.

### `V40ProductGateSummary`

Required fields:

- `previewReady`: boolean.
- `targetOnlyApplyReady`: boolean.
- `rollbackReady`: boolean.
- `activePackPreservedOnFailure`: boolean.
- `blockedReason`: stable non-sensitive string when not ready.

### `V40CandidateSourceDecision`

Required fields:

- `decision`: `accepted_manual_import_first | new_direct_runner_route_allowed | remain_failed_or_blocked`.
- `sampleSet`: at least two tested cat sample IDs or an empty list when blocked.
- `route`: `manual_import_no_webui | direct_local_runner_no_webui | none`.
- `predevAuditRef`: safe relative evidence reference.
- `sourceLicenseEvidenceRef`: safe relative reference when manual/import is chosen.
- `visualAcceptancePrecondition`: `required_before_v40_4`.
- `reasonCodes`: stable non-sensitive strings.

Forbidden fields:

- raw asset source files;
- full local paths;
- raw prompts;
- raw runner payloads;
- token or Authorization values.

## Stable Reason Codes

Minimum reason codes:

- `comfy_route_blocked_not_active`
- `webui_route_blocked_not_active`
- `direct_runner_dependency_missing`
- `direct_runner_unavailable`
- `direct_runner_model_missing`
- `direct_runner_generation_failed`
- `ollama_unavailable`
- `gpu_unavailable`
- `vram_exhausted`
- `manual_import_assets_missing`
- `candidate_generation_failed`
- `prompt_only_visual_target_experience_failed`
- `img2img_visual_target_experience_failed`
- `identity_conditioned_runner_incompatible`
- `v40_3r2_visual_review_failed`
- `v40_3r3_candidate_source_decision_ready`
- `manual_import_source_license_missing`
- `manual_import_visual_acceptance_missing`
- `new_direct_runner_route_not_materially_different`
- `v40_remains_failed_with_v39_fallback`
- `v40_3r2_documentation_ready`
- `unsafe_output_reference`
- `raw_prompt_leak_detected`
- `raw_payload_leak_detected`
- `raw_path_leak_detected`
- `identity_drift`
- `missing_core_action`
- `transform_only_motion`
- `visual_preference_not_better_than_v39`
- `product_preview_not_ready`
- `target_apply_failed`
- `rollback_failed`
- `v40_final_gate_passed_scoped`
- `v40_final_gate_blocked`
- `v40_final_gate_failed`

Current blocked/failed route codes:

- V40.3 prompt-only route must use
  `prompt_only_visual_target_experience_failed` or a more specific stable
  visual-review reason before any retry.
- V40.3R img2img route must use `img2img_visual_target_experience_failed` when
  generated candidates remain photo-like or action semantics are unreadable.
- V40.3R identity-conditioned route must use
  `identity_conditioned_runner_incompatible` until the runner-stack issue is
  repaired and candidate generation actually runs.

## UI Contract

V40 settings UI may be added only after V40.3 candidate summaries exist. It must
show:

- tool readiness status;
- sample list and same-sample V39 baseline;
- V40 candidate preview;
- eight-action evidence;
- preview/apply/rollback status;
- blocked and failed reason codes;
- final scoped/non-ready claim boundary.

The UI must not show raw prompts, raw API JSON, full local paths, config paths,
token values, or raw photo bytes.

## Evidence Contract

Each smoke script should output JSON to stdout with:

- `ok`: boolean;
- `phase`: V40 phase ID;
- `decision`: `passed scoped | blocked | failed`;
- `evidencePath`: safe relative evidence path;
- `reasonCodes`: stable strings;
- `claimScanStatus`;
- `securityScanStatus`.

HTML evidence must be Chinese, include screenshots or rendered visual artifacts,
and explicitly compare V39 and V40 for the same samples.
