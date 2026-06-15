# V15.9-V15.13 Photo-To-2D Detailed Implementation Spec

日期：2026-06-10  
状态：implementation-ready planning spec；no runtime claim without evidence。  

## Purpose

This spec turns the V15.9-V15.13 photo-guided 2D action asset plan into
implementable contracts, UI states, reason codes, evidence fields, and smoke
script ownership.

V15.0-V15.8 remain the accepted scoped baseline. This document does not make
V15.9-V15.13 passed.

## Target User Experience

The user can:

1. choose one local cat photo.
2. see privacy and upload boundaries before any processing.
3. approve safe cat traits.
4. generate an 8-action prompt pack or run one explicitly consented provider
   branch.
5. import or receive generated frame assets.
6. assemble those assets into a safe local animated 2D pack.
7. preview all 8 actions in Desktop Manager.
8. apply the pack to one selected pet.

If provider generation is unavailable, the product must still provide a safe
import-ready workflow and must not claim automatic photo-to-2D readiness.

## Core Action Contract

Required actions:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

Minimum frames:

| Action | Minimum Frames | Type |
| --- | ---: | --- |
| idle | 6 | loop/base |
| thinking | 6 | loop/base |
| running | 6 | loop/base |
| sleeping | 6 | loop/base |
| success | 3 | transient |
| warning | 3 | transient |
| error | 3 | priority/base |
| need_input | 3 | priority/base |

Continuity:

- first and final rendered frames must close.
- adjacent-frame delta must stay under the V15.8 threshold.
- no blank, fully transparent, off-canvas, old-pack flash, fallback flash, or
  sudden vertical jump is accepted.
- invalid generated pack activation preserves the previous active pack.

## Data Contracts

### Photo Intake Session

Allowed fields:

```ts
type PhotoIntakeSession = {
  sessionId: string;
  status:
    | "photo_selected"
    | "consent_required"
    | "traits_ready"
    | "traits_approved"
    | "prompt_pack_ready"
    | "provider_ready"
    | "import_ready"
    | "frames_ready"
    | "pack_ready"
    | "preview_ready"
    | "applied"
    | "blocked"
    | "failed";
  sourceKind: "local_photo";
  sourceDigest: string;
  photoMetadata: {
    width?: number;
    height?: number;
    mimeType?: "image/png" | "image/jpeg" | "image/webp";
    hasExif: boolean;
    exifStripped: boolean;
  };
  consent: {
    providerUploadAllowed: boolean;
    providerName?: "minimax" | "manual-import";
    termsReviewed: boolean;
    consentedAt?: string;
  };
  reasonCode?: Photo2DReasonCode;
};
```

Forbidden fields:

```text
rawPhoto
sourceFileName
sourcePath
fullLocalPath
EXIF payload
GPS
rawProviderResponse
providerCredential
Authorization
token
prompt text unless explicitly exported by user action
```

### Safe Cat Traits

```ts
type SafeCatTraits = {
  traitId: string;
  coatColor: string;
  pattern: string;
  eyeColor?: string;
  faceShape?: string;
  bodyBuild?: string;
  tailNotes?: string;
  approved: boolean;
  approvedAt?: string;
};
```

Forbidden:

```text
owner identity
source filename
photo path
GPS
camera metadata
raw image payload
```

### Prompt Pack

```ts
type Photo2DPromptPack = {
  promptPackId: string;
  traitId: string;
  actionPrompts: Record<CoreActionId, {
    actionId: CoreActionId;
    promptDigest: string;
    safeSummary: string;
    frameIntent: "loop" | "transient" | "priority";
    expectedFrameCount: number;
  }>;
  createdAt: string;
};
```

Evidence records prompt digests and safe summaries by default. Full prompt text
may only be exported through an explicit user action and must not appear in
automated evidence.

### Generated Frame Asset

```ts
type Photo2DFrameAsset = {
  generatedPackId: string;
  actionId: CoreActionId;
  frameCount: number;
  frameDigestList: string[];
  rendererKind: "sprite";
  localManagedAssetBoundary: true;
};
```

No raw path or provider response may be exposed in renderer/evidence output.

## Stable Reason Codes

Required reason codes:

```text
photo_required
photo_mime_unsupported
photo_too_large
photo_decode_failed
exif_redacted
consent_required
provider_terms_required
provider_credential_missing
provider_output_missing
provider_output_rejected
provider_generation_failed
traits_approval_required
trait_schema_invalid
prompt_pack_generation_failed
import_ready_branch_selected
frame_folder_required
frame_count_insufficient
core_action_missing
frame_decode_failed
frame_blank
frame_transparent
frame_off_canvas
first_final_mismatch
adjacent_delta_exceeded
unsafe_svg_payload
manifest_import_failed
activation_failed
previous_pack_preserved
preview_only_no_live_mutation
target_pet_required
target_pet_not_found
default_pet_unchanged
unrelated_pets_unchanged
security_scan_failed
claim_scan_failed
```

## UI State Machine

Desktop Manager flow:

```text
start
  -> select_photo
  -> privacy_review
  -> trait_review
  -> generation_choice
      -> import_ready_prompts
      -> provider_consent
  -> frame_import_or_provider_output
  -> continuity_review
  -> preview_actions
  -> select_target_pet
  -> apply_pack
  -> result_summary
```

Hard UI rules:

- no provider action before `provider_consent`.
- trait approval is required before prompt/provider action.
- preview is isolated and cannot mutate live PetInstance.
- apply requires explicit target pet selection.
- apply failure preserves current visible pet.

## Provider Branch Contract

Real provider path may run only if:

- user consent exists.
- provider terms/cost/retention/attribution notes are shown.
- credential is available via approved local secret mechanism.
- credential is not logged or copied into evidence.
- provider response is reduced to safe output summary.
- raw provider response is not stored in evidence.

If any condition fails, use one of:

```text
provider_credential_missing
provider_terms_required
consent_required
provider_output_missing
provider_generation_failed
```

One named-provider smoke supports only a named-provider scoped claim, never
`provider integration verified`.

## Import-Ready Branch Contract

If provider generation is not available, V15.11 may pass an import-ready branch:

- generated 8-action prompt pack exists.
- import checklist exists.
- expected frame count and naming rules are shown.
- user/manual generated frames can be imported into V15.12.

Allowed claim:

```text
V15.11 photo-guided 2D action import-ready prompt workflow passed for tested local scenarios.
```

## Evidence Requirements

### V15.9 Evidence

File:

```text
docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-YYYY-MM-DD.md
```

Must include:

- status.
- date.
- tested input class, not raw filename.
- redacted photo metadata.
- consent state cases.
- no-upload-before-consent result.
- security scan.
- claim scan.

### V15.10 Evidence

File:

```text
docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-YYYY-MM-DD.md
```

Must include:

- approved trait table.
- 8 action prompt coverage.
- prompt digest list.
- full prompt not printed unless explicit user export test.
- security scan.

### V15.11 Evidence

File:

```text
docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-YYYY-MM-DD.md
```

Must include:

- selected branch: `provider` or `import-ready`.
- provider blocked reason if not run.
- generated/import-ready output summary.
- credential redaction result.
- provider output redaction result.
- allowed claim selected by branch.

### V15.12 Evidence

File:

```text
docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-YYYY-MM-DD.md
```

Must include:

- generated/imported pack ID.
- core action coverage.
- frame count table.
- continuity table.
- failed fixture table.
- previous active pack preservation result.
- safe renderer output fields.

### V15.13 Evidence

Files:

```text
docs/V15.x/v15_13-photo-2d-final-acceptance-report.md
docs/V15.x/evidence/v15_13-photo-2d-final-html-YYYY-MM-DD.html
```

Must include:

- status.
- scope.
- claim basis table.
- screenshots/contact sheets/runtime captures embedded or directly visible.
- target pet apply result.
- default/unrelated pet unchanged result.
- security scan.
- claim scan.
- regression result.

## Minimal Smoke Scripts

Expected scripts:

```text
scripts/v15_9_photo_intake_consent_smoke.mjs
scripts/v15_10_trait_prompt_pack_smoke.mjs
scripts/v15_11_photo_2d_provider_or_import_smoke.mjs
scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs
scripts/v15_13_photo_2d_final_gate_smoke.mjs
```

Each script must:

- emit a passed / blocked / failed evidence file.
- never print forbidden fields.
- set nonzero exit code for failed or blocked states where required.
- preserve previous accepted V15.0-V15.8 evidence.

## Product Acceptance Boundary

V15.13 can only claim:

```text
V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios.
```

V15.13 cannot claim:

```text
automatic photo-to-2D ready
automatic photo-to-animation ready
provider integration verified
photo customization ready for arbitrary cats
Petdex parity achieved
3D ready
automatic photo-to-3D ready
production signed release ready
cross-platform ready
Windows ready
```

## Implementation Readiness Decision

This spec supported V15.9-V15.13 phase-by-phase implementation. V15.9-V15.13
now have explicit scoped evidence. Post-V15 work requires a new scoped plan,
claim matrix, and evidence chain before implementation.
