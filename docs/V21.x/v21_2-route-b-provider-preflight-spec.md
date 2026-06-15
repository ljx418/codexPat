# V21.2 Route B Alternate Provider Preflight Spec

文档状态：planned route spec。  
当前日期：2026-06-14。

## Goal

Route B 评估 MiniMax 之外是否存在更适合本项目的 provider 或 provider mode。它可以只做 capability review，也可以在 credential、consent、cost/privacy/license 边界齐全时做 scoped live smoke。

## Provider Capability Fields

Each provider candidate must record only safe fields:

- providerName；
- region / endpointHost；
- referenceImageSupported；
- imageToImageSupported；
- spriteSheetPromptSupported；
- imageEditingSupported；
- imageToVideoSupported；
- alphaOrTransparentBackgroundSupported；
- outputFormat；
- costDisclosureAvailable；
- privacyDisclosureAvailable；
- retentionDisclosureAvailable；
- licenseDisclosureAvailable；
- credentialPresent boolean；
- consentRequired boolean；
- verdict: candidate / blocked / excluded。

Forbidden fields:

- credential value；
- Authorization；
- raw request/response；
- raw photo bytes；
- private filename；
- full local path；
- prompt private text。

## Optional Live Smoke Gate

Live smoke is allowed only when:

- explicit provider selected；
- upload/generation consent checked；
- cost/privacy/retention/license shown；
- credential exists but is not printed；
- output can be stored only as safe app-managed artifact。

## Stable ReasonCodes

- provider_candidate_reviewed
- reference_image_not_supported
- image_to_video_not_supported
- sprite_sheet_not_supported
- alpha_not_supported
- credential_missing
- consent_required
- terms_disclosure_missing
- provider_unavailable
- live_smoke_excluded
- live_smoke_passed
- live_smoke_failed

## Acceptance

Route B passes as capability review if:

- at least MiniMax plus two alternative provider families are classified；
- each provider has a safe verdict；
- any live smoke is explicitly scoped and redacted。

Route B cannot alone satisfy V21 final passed unless it produces or enables a real route output that later passes common QA and preview/apply/rollback.

## Evidence

Evidence file:

`docs/V21.x/evidence/v21_2-route-b-provider-preflight-YYYY-MM-DD.md`

Must include:

- provider matrix；
- live smoke decision；
- safe credential boundary result；
- security scan；
- claim scan。
