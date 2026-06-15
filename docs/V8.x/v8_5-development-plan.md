# V8.5 Development Plan

status: in-progress
date: 2026-06-02

## Objective

Create Desktop Manager guided flow that wires V8.1-V8.4 components into an
end-to-end user-facing provider-backed photo-to-3D activation workflow.
Every upload/generation action requires explicit confirmation.

## Dependencies

- V8.1: Provider consent and credential harness (COMPLETED)
- V8.2: Real Tripo3D GLB output (COMPLETED)
- V8.3: GLTF deep scanner + asset normalizer (COMPLETED)
- V8.4: Runtime visual QA infrastructure (COMPLETED)

## Scope

V8.5 builds the guided UX layer on top of existing infrastructure:

### Desktop Manager Integration

Existing files to extend:
- `apps/desktop/src/assets/provider-consent-dryrun.ts` — consent flow
- `apps/desktop/src/assets/asset-normalizer.ts` — provider output normalization
- `apps/desktop/src/assets/visual-qa-runtime.ts` — runtime validation

New components:
- `provider-consent-ui.ts` — consent form UI state machine
- `guided-provider-flow.ts` — orchestrates V8.1-V8.4 into guided steps
- `provider-upload-session.ts` — manages upload/generation lifecycle

### Guided Flow Steps

1. **Select Photo / Traits** — user picks cat image reference or enters traits
2. **Review Safe Traits** — safe trait display (no raw photo, no EXIF/GPS)
3. **Choose Provider or Local Import** — Tripo3D or local GLB import
4. **Show Consent Terms** — V8.1 consent disclosures (cost, privacy, retention, license)
5. **Run or Import Output** — trigger V8.2 provider call or local import
6. **Preview** — V8.4 visual QA preview of generated GLB
7. **Activate** — activate to one PetInstance via asset import
8. **Deactivate/Delete** — V8.6 deletion flow (stub here, full in V8.6)

### Consent Flow Requirements

Per V8.1, consent disclosures must include:
- Cost (Tripo3D credit cost per generation)
- Privacy (what data is sent to provider)
- Retention (how long provider keeps output)
- License (who owns generated output)

Consent must be recorded before any provider call.

## Components to Build

### 1. Consent Disclosure Display

```typescript
export type ConsentDisclosureCategory =
  | "cost"
  | "privacy"
  | "retention"
  | "license";

export type ConsentDisclosure = {
  category: ConsentDisclosureCategory;
  label: string;
  text: string;
  visible: boolean;
};
```

Display all 4 categories. Upload/generation blocked until all visible.

### 2. Guided Provider Flow State Machine

```typescript
export type GuidedFlowStep =
  | "idle"
  | "select_photo_or_traits"
  | "review_traits"
  | "choose_provider_or_import"
  | "show_consent"
  | "waiting_for_consent"
  | "running_generation"
  | "preview_output"
  | "activating"
  | "complete"
  | "error";

export type GuidedFlowState = {
  step: GuidedFlowStep;
  reasonCode: string | null;
  consentGiven: boolean;
  uploadedAssetPath: string | null;
  activatedPackId: string | null;
};
```

### 3. Provider Generation Session

```typescript
export type ProviderGenerationRequest = {
  providerName: "Tripo3D";
  inputType: "photo" | "traits";
  consentGiven: boolean;
  consentTimestamp: string;
};

export type ProviderGenerationResult = {
  ok: boolean;
  glbPath: string | null;
  reasonCode: string;
  normalizationResult: NormalizationResult | null;
  visualQAResult: GLBRuntimeCheck | null;
};
```

## Acceptance Criteria

A1: User can complete tested path without CLI-only steps
A2: Every upload/generation action requires explicit consent confirmation
A3: Unsupported provider path fails with stable reason code
A4: Consent disclosures visible before any provider call
A5: Generated output passes V8.3 scan and V8.4 runtime check
A6: No forbidden content in evidence/logs (token, Authorization, raw photo, path)

## Test Plan

1. Consent dry run: verify consentRequired until all disclosures visible
2. Provider call blocked until consentGiven: true
3. Provider generation produces valid GLB path
4. GLB passes V8.3 scan after normalization
5. GLB passes V8.4 runtime check
6. Activation creates pack and returns pack_id
7. Evidence file has no forbidden content