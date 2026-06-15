# V7.9 MiniMax Provider Preflight

status: blocked
date: 2026-05-31

## Scope

Preflight for V7.9 MiniMax explicit-consent image provider smoke.

## Result

Blocked before implementation / real smoke.

## Findings

- V7.8 is accepted, so V7.9 planning audit may begin.
- Repository initially had only provider feasibility-only boundary code and smoke.
- V7.9 now includes a MiniMax execution adapter and redacted smoke script.
- The current execution environment still has no `MINIMAX_API_KEY` environment variable available to the process.
- No real provider smoke can be run by this process without local environment credential injection, explicit consent flags, provider cost/privacy/retention/license notes, and network access approval.

## Blocking Conditions

- Missing MiniMax API credential.
- Missing explicit upload / provider execution consent for the test scenario.
- Missing provider terms evidence for cost, privacy, retention, and license/attribution.
- Missing local shell environment variables for the live smoke:
  - `MINIMAX_API_KEY`
  - `MINIMAX_PROVIDER_SMOKE_CONSENT=yes`
  - `MINIMAX_PROVIDER_TERMS_ACCEPTED=yes`

## No-False-Green Decision

V7.9 must remain blocked. Do not mark V7.9 passed with mock output, existing V7.4 feasibility boundary, or externally prepared images.

## Next Required Inputs

- MiniMax credential configured in a redacted local secret source as `MINIMAX_API_KEY`.
- Confirmation via `MINIMAX_PROVIDER_SMOKE_CONSENT=yes` that one user-approved trait set may be sent to MiniMax for the smoke.
- Confirmation via `MINIMAX_PROVIDER_TERMS_ACCEPTED=yes` that cost/privacy/retention/license terms are accepted for the smoke.
- Provider model / endpoint selection for image generation or image-to-image.
- Cost/privacy/retention/license notes suitable for evidence.

## Forbidden Claims

- V7.9 MiniMax image provider consent boundary passed.
- provider integration verified.
- automatic photo-to-3D ready.
- 3D ready.
