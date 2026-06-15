# V7 Remaining Target Architecture

status: V7.13-V7.15 accepted scoped
date: 2026-06-01

## Scope

This document defines the target architecture for the remaining V7.13-V7.15
advanced personalized cat asset work.

Diagram: `docs/V7.x/v7_remaining_target_architecture.drawio`.

Post-V7 work must build on the accepted scoped V7.0-V7.15 baseline. It must not
reopen V3/V4 Codex monitoring, V6 release workflow, or V5 asset contract
semantics.

## Target Data Flow

```text
Local Photo / User Traits
  -> PhotoPrivacyBoundary
  -> TraitApprovalSession
  -> PromptPack / ProviderConsentBoundary
  -> GeneratedAssetStaging
  -> ManifestValidator + GLTFDeepScanner
  -> AssetImportService
  -> PerPetInstanceActivation
  -> CatActionResolver
  -> RendererRegistry
  -> RuntimeVisualQA
  -> EvidenceCollector
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| PhotoPrivacyBoundary | accepts local photo selection and produces a consent state | persist raw photo bytes by default, upload by default, keep EXIF/GPS |
| TraitApprovalSession | stores user-approved safe traits | store full photo path, raw prompt history, provider payload |
| PromptPack | produces action-specific generation instructions | claim provider generation success |
| ProviderConsentBoundary | records explicit provider choice, upload consent, credential redaction status | hide upload/cost/privacy/retention terms |
| GeneratedAssetStaging | stages generated or user-supplied files for validation | route assets to runtime before validation |
| ManifestValidator | validates safe manifest fields and required actions | allow remote URLs, absolute paths, script-like fields |
| GLTFDeepScanner | scans GLTF/GLB internal resource references and size/complexity limits | log raw JSON chunks or local paths |
| AssetImportService | imports validated packs into app-managed storage | import partial or invalid packs |
| PerPetInstanceActivation | activates a pack only for the selected PetInstance | fallback to default route or mutate unrelated pets |
| CatActionResolver | maps PetState to safe action IDs | expose raw events or provider payloads to renderer |
| RendererRegistry | selects a renderer by safe renderer kind | load remote assets or arbitrary local paths |
| RuntimeVisualQA | captures nonblank, bounded, visible runtime evidence | treat fixture-only checks as product visual QA |
| EvidenceCollector | writes sanitized evidence and final reports | print secrets, full paths, raw provider response, raw photo data |

## Safe Data Fields

V7.13-V7.15 may persist or record:

- workflow ID.
- step status: `not_started`, `ready`, `blocked`, `running`, `passed`,
  `failed`.
- stable reason code.
- approved safe traits.
- provider name and consent decision.
- safe pack ID and renderer kind.
- target PetInstance ID.
- safe action ID.
- GLTF scanner decision and safe field names checked.
- screenshot/recording file names under evidence directories.
- redacted credential state: `configured`, `missing`, `not_used`.

## Forbidden Data

V7.13-V7.15 must not persist or print:

- raw photo bytes by default.
- EXIF/GPS.
- full source photo path.
- prompt text in renderer payload.
- raw provider response.
- provider credential.
- token.
- Authorization.
- full `/Users/...` path.
- workspace path.
- config path.
- `api-token.json`.
- raw manifest JSON chunks.
- raw GLTF JSON chunks.
- raw Agent/Codex/terminal/MCP/HTTP payload.
- shell command text.
- script source.

## Failure And Fallback Model

- A failed validation or activation step must preserve the previous active pack.
- Corrupt GLB/GLTF, corrupt sprite frames, renderer mismatch, or deleted asset
  must fall back to CSS or the previous safe pack.
- A blocked real provider 3D branch must be reported as blocked, not silently
  replaced with fixture success.
- A target PetInstance failure must not route to `default`.
- `success` states must not overwrite active `error` or `need_input` priority
  states in visual QA.

## Evidence Model

Each remaining phase must produce:

- phase smoke evidence.
- final acceptance report.
- security redaction scan.
- claim consistency scan.
- PRD/spec review note.
- drift and false-green risk assessment.

The evidence must include safe decisions and screenshots/recordings where
required, but not raw photos, raw provider payloads, raw GLTF chunks, local
paths, or credentials.

## Claim Boundary

Allowed future scoped claims are defined in:

- `docs/V7.13/v7_13-claim-matrix.md`
- `docs/V7.14/v7_14-claim-matrix.md`
- `docs/V7.15/v7_15-claim-matrix.md`

Still forbidden unless a later, separate accepted program proves them:

- production signed release ready.
- cross-platform ready.
- Windows ready.
- provider integration verified.
- remote generation ready.
- automatic photo-to-3D ready without the conditional evidence chain.
- broad 3D ready.
- marketplace ready.
- MCP ready.
- OS-level Codex window binding ready.
- all Codex workflows verified.
