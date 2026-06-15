# V20 Document Audit

文档状态：self-audit；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Audit Result

Current V20 documents are sufficient to guide phase-by-phase development from
V20.0 through V20.6, including multi-sample provider benchmark and
reasonCode-driven prompt repair. They are not sufficient to skip directly to
V20.6 final gate.

## Coverage

| Area | Result |
| --- | --- |
| PRD | covered by `docs/active/agent_desktop_pet_prd_v20.md` |
| Target architecture | covered |
| Development phases | covered |
| Detailed development/acceptance plan | covered by `docs/V20.x/v20_x-detailed-development-and-acceptance-plan.md` |
| Acceptance gates | covered |
| Claim boundary | covered |
| Mainland provider matrix | covered |
| MiniMax P0 decision | covered |
| MiniMax request/prompt/evidence contract | covered by `docs/V20.x/v20_x-minimax-live-smoke-request-spec.md` |
| Provider benchmark and repair loop | covered by `docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md` |
| Motion quality thresholds | covered by `docs/V20.x/v20_x-motion-quality-qa-thresholds.md` |
| Reference-image evidence fields | covered by `reference_image_attached`, `provider_capability`, and `text_to_image_only` requirements |
| V19 fallback boundary | covered |
| Security and privacy boundary | covered |
| Drawio sync | updated in active gap diagram |

## Remaining Risks

| Risk | Severity | Plan |
| --- | --- | --- |
| MiniMax cannot output one 8x9 sheet | High | V20.2 blocked; no provider claim |
| Provider output has background | High | V20.3 blocks or requires future background-removal phase |
| Same-cat identity fails | High | V20.4 blocks apply |
| One lucky sample is overclaimed as reliable | High | Benchmark spec requires 3 samples and bounded retry statistics |
| Provider credentials unavailable | Medium | V20.2 blocked with credential reasonCode |
| Claim overreach | High | V20 claim matrix and final gate require evidence-matched claim |
| Active gap historical status ambiguity | Closed | Historical phases moved under Historical Baselines; only V20 is Current active status |

## Go / No-Go

- V20.0: Go.
- V20.1: Go after V20.0 evidence.
- V20.2: Conditional Go; requires real credential/consent/provider availability.
- V20.6: No-Go until evidence exists for V20.0-V20.5.
