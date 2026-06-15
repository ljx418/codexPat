# V20 Development Plan

文档状态：planned development；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Scope

V20 turns the V19 local motion-sheet workflow into a tested mainland-provider generation path, with MiniMax as the P0 provider candidate.

V20 does not attempt broad provider integration. It must make a clear evidence-backed decision:

```text
MiniMax generates accepted motion sheet -> V20 provider path passed scoped
MiniMax cannot generate accepted motion sheet -> V20 provider branch blocked, V19 local sheet remains fallback
```

## Phase Plan

| Phase | Goal | Status |
| --- | --- | --- |
| V20.0 | Scope freeze and mainland provider candidate matrix | passed |
| V20.1 | Provider consent / credential / disclosure UX model | passed |
| V20.2 | MiniMax reference-image motion sheet benchmark | passed 3-sample provider output benchmark; 8x9 normalization still blocked |
| V20.3 | Provider output normalization and background gate | blocked |
| V20.4 | Same-cat / amplitude / loop QA | blocked by V20.3 |
| V20.5 | Manager preview / target apply / rollback | blocked by V20.3/V20.4 |
| V20.6 | Final evidence-matched gate | No-Go until V20.0-V20.5 evidence |

## V20.0 Scope Freeze

Deliver:

- Mainland provider candidate matrix.
- MiniMax P0 decision.
- Petdex resource boundary retained from V19.
- V19 local motion-sheet evidence marked as fallback baseline only.

Evidence:

- `docs/V20.x/evidence/v20_0-scope-freeze-YYYY-MM-DD.md`

## V20.1 Consent and Provider Boundary

Implement or verify:

- provider selector defaults to MiniMax.
- upload/generation consent required.
- cost/privacy/retention/license/attribution visible before provider call.
- credential presence check without printing credential.
- provider status and stable reasonCode.

Evidence:

- `docs/V20.x/evidence/v20_1-provider-consent-boundary-YYYY-MM-DD.md`

## V20.2 MiniMax Live Motion Sheet Smoke

Attempt real MiniMax reference-image generation with user-provided cat photo samples and prompts requesting a single 8x9 motion sheet.
The request, prompt, output, redaction, and evidence contract is frozen in
`docs/V20.x/v20_x-minimax-live-smoke-request-spec.md`.
The sample count, prompt variants, attempt budget, and reasonCode-driven repair
loop are frozen in `docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md`.

Pass only if:

- real provider call succeeds.
- output is one generated image suitable for sheet parsing.
- output passes safe metadata scan.
- benchmark meets sample and retry thresholds if reliability is claimed.

Blocked if:

- credential missing.
- provider unavailable.
- reference image unsupported.
- output is separate images only.
- output is missing/unusable.
- sample count is insufficient for reliability claim.

Evidence:

- `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-YYYY-MM-DD.md`

## V20.3 Normalize and Background Gate

Convert accepted provider sheet into local pack candidate.

Pass only if:

- 8 rows x expected frame columns recognized.
- all core actions cropped.
- no full background remains or background-removal path produces safe transparent frames.
- pack is app-managed and path-redacted.

Evidence:

- `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-YYYY-MM-DD.md`

## V20.4 Motion Quality QA

Pass only if:

- all 8 actions visible.
- same-cat consistency accepted.
- motion amplitude sufficient.
- adjacent frames not jumpy.
- loop actions first/final frame close.
- 1x and 0.75x readable.

The concrete thresholds are defined in
`docs/V20.x/v20_x-motion-quality-qa-thresholds.md`.

Evidence:

- `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-YYYY-MM-DD.md`

## V20.5 Preview / Apply / Rollback

Pass only if:

- preview sends zero PetEvent.
- preview does not write CatStateMachine.
- QA failed pack cannot apply.
- accepted pack applies only to target PetInstance.
- default and unrelated pets unchanged.
- rollback restores previous active pack.

Evidence:

- `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-YYYY-MM-DD.md`

## V20.6 Final Gate

No-Go until V20.0-V20.5 evidence exists and is passed/blocked/failed.

Final report:

- `docs/V20.x/v20_6-final-acceptance-report.md`
- `docs/V20.x/evidence/v20_6-provider-motion-sheet-html-YYYY-MM-DD.html`

Final claim must match evidence. If V20.2 is blocked, final must be blocked or scoped to fallback-not-provider.
