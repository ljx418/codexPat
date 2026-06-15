# V8.x Development Plan

status: active
date: 2026-06-03

## Objective

Close the post-V7 gap for provider-backed photo-to-3D and productized 3D action
asset workflows without expanding claims beyond evidence.

## Phase Outline

| Phase | Development Scope | Output |
| --- | --- | --- |
| V8.0 | scope freeze, provider shortlist, claim matrix, no-go boundaries | V8 planning documents and go/no-go |
| V8.1 | provider consent + credential harness | redacted provider readiness diagnostics |
| V8.2 | real named-provider 3D smoke | provider output staging evidence or blocked report |
| V8.3 | GLTF normalization + action clip contract | normalized local pack with action coverage table |
| V8.4 | runtime 3D action visual QA | screenshots/recordings, nonblank, bounds, scale, fallback evidence |
| V8.5 | guided UX | Desktop Manager workflow for consent, generation/import, preview, activation |
| V8.6 | operational hardening | deletion, retention, diagnostics export, redaction, license scan |
| V8.7 | final gate | evidence-matched V8 final report |
| V8.8 | 3D rendering quality improvement | camera, lighting, viewport normalization, visual QA rerun |
| V8.9 | local animated 2D sprite pack assembler | local frame folder -> manifest -> importable animated sprite pack |
| V8.10 | AI-assisted animated sprite workflow | prompt/instruction generation and optional explicit-consent provider boundary |
| V8.11 | animated sprite visual QA gate | runtime screenshots/recordings, fallback, isolation, performance evidence |

## V8.0 Scope Freeze

Deliver:

- `docs/V8.x/v8_x-current-gap-analysis.md`
- `docs/V8.x/v8_x-target-architecture.md`
- `docs/V8.x/v8_x-development-plan.md`
- `docs/V8.x/v8_x-acceptance-plan.md`
- `docs/V8.x/v8_x-claim-matrix.md`
- `docs/V8.x/v8_x-remote-milestones.md`
- `docs/V8.x/v8_x-doc-audit-2026-06-01.md`

Gate:

- V7 scoped acceptance remains intact.
- no automatic photo-to-3D ready claim.
- no provider integration verified claim.
- no broad 3D ready claim.

## V8.1 Provider Consent And Credential Harness

Develop:

- provider config model with named provider, endpoint category, credential
  source state, cost/privacy/retention/license text.
- redacted diagnostics command or UI summary.
- no-upload dry run that proves all required consent fields are visible.
- stable reason codes:
  - `provider_not_selected`
  - `provider_credential_missing`
  - `provider_consent_required`
  - `provider_terms_unreviewed`
  - `provider_ready_redacted`

Acceptance:

- no provider upload occurs.
- credentials are never printed.
- output contains provider readiness state only.

## V8.2 Real Named-provider 3D Output Smoke

Develop:

- explicit-consent provider execution path for a named 3D-capable provider.
- quarantined output staging.
- provider job polling / timeout / cancellation reason codes.
- retention and attribution capture.

Acceptance:

- real photo or approved test photo is used only after consent.
- provider returns GLB/GLTF or V8.2 is blocked.
- raw provider response and credential are redacted.
- if provider output is image-only or missing, record:
  - `provider_output_missing`
  - `provider_output_not_3d`
  - `real_provider_3d_branch_blocked`

## V8.3 3D Normalization And Action Clip Contract

Develop:

- GLTF/GLB deep scanner for provider output.
- asset normalizer into local pack structure.
- action clip coverage table.
- fallback mapping editor/model.

Acceptance:

- reject unsafe URI/path/extension/complexity.
- accepted output imports into app-managed storage.
- all core actions have clip or explicit fallback coverage.
- invalid output preserves previous active pack.

## V8.4 Runtime 3D Action Visual QA

Develop:

- runtime QA harness for provider-output pack.
- screenshot/recording capture per core action.
- nonblank, bounding box, scale, fallback, and performance baseline checks.

Acceptance:

- provider-output 3D pack is visible at 1x and 0.75x.
- every core action is visually represented or explicitly fallback-labeled.
- corrupt/deleted pack leaves visible safe cat.
- target PetInstance only changes; default/unrelated pets unchanged.

## V8.5 Guided UX

Develop:

- Desktop Manager guided flow:
  - select photo / traits.
  - review safe traits.
  - choose provider or local import.
  - show consent terms.
  - run or import output.
  - preview.
  - activate to one PetInstance.
  - deactivate/delete.

Acceptance:

- user can complete the tested path without CLI-only steps.
- every upload/generation action requires explicit confirmation.
- unsupported provider path fails with stable reason code.

## V8.6 Operational Hardening

Develop:

- diagnostics export for provider workflow.
- deletion and retention explanation.
- license/attribution export.
- security scan harness for evidence and logs.
- artifact scan for generated outputs.

Acceptance:

- diagnostics export has no token, Authorization, raw payload, prompt, full
  path, raw photo, provider credential, or raw response.
- deletion removes local imported pack and records safe event.
- remote retention is documented and not overclaimed.

## V8.7 Productization Gate

Develop no new features. Run:

- V8.1-V8.6 final reports.
- provider smoke rerun if required.
- GLTF scan rerun.
- visual QA rerun.
- regression, security, claim, license, artifact scans.

Final claim must be the narrowest evidence-matched claim.

If V8.2 provider output is blocked, V8.7 cannot claim automatic photo-to-3D.

## V8.8 3D Rendering Quality Improvement

Status: accepted scoped.

Developed:

- improved GLTF camera, lighting, and model viewport normalization.
- static GLB fallback handling.
- runtime visual QA rerun for prototype GLB scenario.

Allowed claim:

```text
V8.8 3D rendering quality improvement passed for prototype GLB scenario.
```

## V8.9 Local Animated Sprite Pack Assembler

Develop:

- Desktop Manager local assembler for frame-sequence 2D sprite packs.
- folder scan for the eight core action frame groups:
  - `idle`
  - `thinking`
  - `running`
  - `success`
  - `warning`
  - `error`
  - `need_input`
  - `sleeping`
- manifest generation using existing sprite `frameFiles` and `fps` fields.
- import through existing app-managed local import validation.
- optional activation to one selected PetInstance after import.
- stable reason codes:
  - `animated_sprite_source_missing`
  - `animated_sprite_core_action_missing`
  - `animated_sprite_frame_count_invalid`
  - `animated_sprite_frame_name_invalid`
  - `animated_sprite_fps_invalid`
  - `animated_sprite_manifest_generated`
  - `animated_sprite_import_failed`
  - `animated_sprite_activation_failed`
  - `previous_pack_preserved`

Acceptance:

- valid local frame folder is accepted.
- missing core action is rejected.
- unsafe filename / path traversal / remote URL is rejected.
- too many frames and invalid fps fail safely.
- generated manifest contains only safe local file names, action IDs, `frameFiles`, and `fps`.
- invalid assembly/import preserves the previous active pack.
- no source folder path, token, Authorization, prompt text, provider payload, raw photo, workspace path, or config path appears in evidence.

Allowed claim:

```text
V8.9 local animated sprite pack assembler passed for tested local frame-sequence asset scenarios.
```

## V8.10 AI-assisted Animated Sprite Workflow

Develop:

- prompt/instruction generator for animated 2D action packs.
- action storyboard guidance for all core actions.
- manifest template and import checklist targeting V8.9.
- optional provider path only under explicit consent and existing provider credential redaction boundary.

Acceptance:

- local instruction generation covers every core action.
- generated prompts do not include local paths, tokens, credentials, raw provider response, or raw photo data.
- provider execution remains off unless separately consented and accepted.
- provider output, if used, must still go through V8.9 assembly and existing import validation.

Allowed claim when no provider smoke runs:

```text
V8.10 AI-assisted animated sprite prompt workflow passed for tested local instruction-generation scenarios.
```

Allowed claim only if a real provider smoke passes:

```text
V8.10 explicit-consent animated sprite provider smoke passed for tested named provider local scenario.
```

## V8.11 Animated Sprite Visual QA Gate

Develop no new generation features. Run runtime visual QA for accepted V8.9/V8.10 paths.

Acceptance:

- imported animated sprite pack is visible on the target PetInstance.
- all eight core actions visibly animate.
- default and unrelated pets remain unchanged.
- corrupt frame, missing frame, invalid fps, deleted pack, and deactivation leave a visible safe cat.
- 1x and 0.75x scale pass.
- animation switching does not leave the cat transparent, blank, or off-canvas.
- evidence includes screenshot/recording, safe renderer input snapshot, security scan, claim scan, and regression checks.

Allowed claim:

```text
V8.11 animated 2D sprite runtime visual QA passed for tested local imported multi-frame pack scenario.
```
