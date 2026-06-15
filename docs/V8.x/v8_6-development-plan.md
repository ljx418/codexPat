# V8.6 Development Plan

status: in-progress
date: 2026-06-02

## Objective

Build operational hardening components: diagnostics export with redaction,
deletion flow with retention explanation, license/attribution export, and
security scan harness for evidence and generated artifacts.

## Dependencies

- V8.1: Provider consent and credential harness (COMPLETED)
- V8.2: Real Tripo3D GLB output (COMPLETED)
- V8.3: GLTF deep scanner + asset normalizer (COMPLETED)
- V8.4: Runtime visual QA infrastructure (COMPLETED)
- V8.5: Guided provider flow (COMPLETED)

## Scope

V8.6 builds on existing infrastructure:

### Existing Components

- `provider-consent-boundary.ts` already has:
  - `redactProviderSecret()` — redaction function
  - `providerConsentBoundaryHasForbiddenSecret()` — forbidden content scan
  - `providerFeasibilityStatus()` — feasibility boundary

- `asset-import.rs` already has:
  - `delete_personalized_asset_pack` — deletion
  - `runtime_personalized_asset_pack` — pack retrieval

### New Components

#### 1. Diagnostics Export

`diagnostics-export.ts`:
- Aggregate V8.1-V8.5 diagnostics into one export
- Redact all forbidden content before export
- Include only safe field names

#### 2. Deletion Flow

`deletion-flow.ts`:
- Delete pack via Tauri backend
- Record safe deletion event (no raw paths)
- Verify remote retention is documented

#### 3. License/Attribution Export

`license-export.ts`:
- Export license info from normalized manifest
- Sanitize attribution text

#### 4. Security Scan Harness

`security-scan-harness.ts`:
- `scanEvidenceForForbiddenContent()` — run forbidden content scan on any object
- `scanFileForForbiddenContent(path)` — scan file contents
- `scanArtifactOutput(glbPath)` — scan generated GLB

## Acceptance Criteria

A1: Diagnostics export has no token, Authorization, raw payload, prompt, full path, raw photo, provider credential, or raw response
A2: Deletion removes local imported pack and records safe event
A3: Remote retention is documented and not overclaimed
A4: License/attribution export sanitized
A5: Security scan harness detects forbidden content in evidence

## Test Plan

1. Export diagnostics → scan for forbidden content → pass
2. Delete pack → verify deletion event is safe (no paths)
3. Export license → verify sanitized
4. Run security scan on V8.2 evidence file → detect any issues
5. Run full regression suite