# V18 Provider Capability Preflight

日期：2026-06-12  
状态：planned preflight；V18.2 implementation 前必须执行。

## Purpose

V18 的最终目标依赖真实 provider 支持 reference image / image-to-image。  
本文件把 provider 能力确认拆成可执行门禁，防止把 V17 text-to-image action sheet 冒充为 V18 local photo generation evidence。

## Required Decision

V18.2 开发前必须给出一个 provider decision：

| Decision | Meaning | V18.2 Result |
| --- | --- | --- |
| `image_to_image_supported` | provider 支持用户 reference image 输入并返回生成图 | may proceed |
| `text_to_image_only` | provider 只能按文本生成，不接收本地猫图 reference | V18.2 blocked for final claim |
| `credential_missing` | provider 可能支持，但缺 credential/consent/terms | V18.2 blocked |
| `terms_not_accepted` | 未完成费用/隐私/留存/授权说明 | V18.2 blocked |
| `provider_unavailable` | API/CLI/网络不可用 | V18.2 blocked or failed |

## Capability Checks

1. Identify provider and model.
2. Confirm whether provider accepts a reference image input.
3. Confirm input formats and size limits.
4. Confirm whether prompt + reference image can request multiple actions.
5. Confirm output format:
   - 4x2 action sheet.
   - multiple images.
   - frame sequence.
6. Confirm usage terms:
   - cost.
   - privacy.
   - retention.
   - license/attribution.
7. Confirm credential handling:
   - credential stored outside repo.
   - no token/Authorization in logs or evidence.
8. Run a minimal consent-gated smoke only after all above pass.

## Evidence Requirements

Evidence file:

```text
docs/V18.x/evidence/v18_2-provider-capability-preflight-YYYY-MM-DD.md
```

Evidence may include:

- provider name.
- model name.
- capability decision.
- safe input summary.
- safe output summary.
- redacted reasonCode.
- consent/terms status.

Evidence must not include:

- token.
- Authorization.
- raw provider response.
- raw HTTP payload.
- full local path.
- raw photo bytes.
- EXIF/GPS.
- prompt text containing private data.
- provider account data.

## Stable ReasonCodes

- provider_reference_not_supported
- provider_credential_missing
- provider_terms_required
- provider_cost_disclosure_required
- provider_privacy_disclosure_required
- provider_retention_disclosure_required
- provider_license_disclosure_required
- provider_unavailable
- provider_rate_limited
- provider_output_missing
- provider_output_rejected
- provider_capability_confirmed

## Go / No-go

V18.2 is Go only when:

- provider reference-image support is confirmed.
- credential is configured without leaking.
- consent/terms disclosures are visible.
- a real provider job can be attempted with safe evidence.

If any item fails, V18.2 must be `blocked` and V18.6 must remain No-Go.
