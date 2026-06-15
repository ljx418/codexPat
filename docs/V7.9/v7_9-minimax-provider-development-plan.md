# V7.9 MiniMax Provider Development Plan

status: planned
date: 2026-05-31

## Goal

Add a real, explicit-consent MiniMax image provider smoke path for personalized 2D cat action asset generation.

MiniMax is treated as an image generation / image-to-image provider. V7.9 does not claim GLB generation, provider ecosystem readiness, or automatic photo-to-3D readiness.

## Development Scope

- Add a MiniMax provider adapter boundary for tested image generation scenarios.
- Require explicit user consent before any photo or trait payload is sent.
- Read provider credentials only from an approved local secret source.
- Redact credentials, Authorization, prompt text, raw provider request, raw provider response, local paths, original photo bytes, EXIF/GPS, and workspace/config paths from logs and evidence.
- Stage generated outputs in app-managed storage before import validation.
- Route provider outputs through existing asset validation before runtime activation.

## Failure Modes

- Missing credential: `provider_credential_missing`.
- Missing upload consent: `upload_consent_required`.
- Provider unavailable: `provider_unavailable`.
- Provider returns unsafe or unusable output: `provider_output_rejected`.
- Validation failure: `asset_validation_failed`.

## Evidence

`docs/V7.9/evidence/v7_9-minimax-provider-smoke-YYYY-MM-DD.md`

## Allowed Claim

V7.9 MiniMax image provider consent boundary passed for tested explicit-consent local smoke scenario.
