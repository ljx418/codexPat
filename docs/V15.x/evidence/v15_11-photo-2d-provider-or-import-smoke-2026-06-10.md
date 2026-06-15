# V15.11 Photo 2D Provider Or Import Smoke Evidence

status: passed
date: 2026-06-10

## Scope

V15.11 validates the import-ready branch for the photo-guided 2D action asset
workflow. The provider branch is not run in this evidence. This evidence does
not upload photos, does not call a provider API, does not store provider
response details, and does not claim provider integration or automatic
photo-to-2D readiness.

## Branch Decision

| Field | Value |
| --- | --- |
| status | accepted |
| branch | import-ready |
| reasonCode | import_ready_branch_selected |
| providerAttempted | false |
| providerReasonCode | provider_output_missing |
| uploadsByDefault | false |
| callsProviderApi | false |
| requiresLocalImportValidation | true |

## Import-Ready Action Plan

| Action | Prompt Digest | Frame Intent | Expected Frames | File Naming Rule |
| --- | --- | --- | ---: | --- |
| idle | prompt_47580e61 | loop | 6 | idle/frame-001.png ... frame-006.png |
| thinking | prompt_2aa98b5f | loop | 6 | thinking/frame-001.png ... frame-006.png |
| running | prompt_ff133dbc | loop | 6 | running/frame-001.png ... frame-006.png |
| success | prompt_19ae41ff | transient | 3 | success/frame-001.png ... frame-003.png |
| warning | prompt_8be6f956 | transient | 3 | warning/frame-001.png ... frame-003.png |
| error | prompt_bfaf4dd8 | priority | 3 | error/frame-001.png ... frame-003.png |
| need_input | prompt_efa86d91 | priority | 3 | need_input/frame-001.png ... frame-003.png |
| sleeping | prompt_a4c95aba | loop | 6 | sleeping/frame-001.png ... frame-006.png |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop test | passed | exit=0 |
| desktop check | passed | exit=0 |
| import-ready branch selected | passed | status=accepted; branch=import-ready; reasonCode=import_ready_branch_selected; actionCount=8 |
| 8 action import plan coverage | passed | actions=idle,thinking,running,success,warning,error,need_input,sleeping |
| provider branch not run by default | passed | attempted=false; reasonCode=provider_output_missing; callsProviderApi=false; uploadsByDefault=false |
| provider consent required | passed | status=blocked; reasonCode=consent_required |
| provider terms required | passed | status=blocked; reasonCode=provider_terms_required |
| provider secret unavailable | passed | status=blocked; reasonCode=provider_credential_missing |
| provider output missing | passed | status=blocked; reasonCode=provider_output_missing |
| trait prompt pack required | passed | status=blocked; reasonCode=trait_prompt_pack_invalid |
| security redaction scan | passed | safe import branch evidence contains no private data values or provider response details |
| claim scan | passed | V15.11 claim remains import-ready scoped and forbidden claims stay forbidden/not-ready |
| PRD/spec review | passed | active PRD, V15 plan, detailed spec, and acceptance plan align with V15.11 import-ready branch |

## Security Boundary

Evidence records only safe branch, action, digest, expected frame, checklist
count, and safety booleans. It excludes raw photo bytes, source filename, full
local path, EXIF/GPS payload, token, Authorization, full prompt text, raw
prompt text, provider request details, and provider response details.

## Allowed Claim

V15.11 photo-guided 2D action import-ready prompt workflow passed for tested local scenarios.

## Forbidden Claims

This evidence does not claim named-provider 2D generation smoke passed,
automatic photo-to-2D ready, automatic photo-to-animation ready, provider
integration verified, photo customization ready for arbitrary cats, Petdex
parity, 3D ready, automatic photo-to-3D ready, production signed release ready,
cross-platform ready, or Windows ready.
