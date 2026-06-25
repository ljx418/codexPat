# V31 Development Plan

文档状态：development plan；V31 partial scoped execution recorded；V31 continuation execution blocked scoped。
当前日期：2026-06-24。

## Scope

V31 is the next development stage after V30/Post-V30. It targets high-quality
2D action assets and a real route toward arbitrary-cat photo-to-action
generation.

V31 starts from this truth:

```text
V30 semantic gate passed scoped.
Current simplified SVG cat visual quality failed / not accepted.
Arbitrary-cat automatic high-quality action generation is not ready.
```

V31 continuation starts from the V31.7 partial scoped decision. It does not
rerun or overwrite V31.0-V31.7; it adds the remaining development needed to
make high-quality production repeatable and to prove photo-to-action only for a
named real sample set.

Execution update: V31.8-V31.13 ran on 2026-06-24. The continuation final gate
is blocked scoped: V31.8 repeatability is partial, V31.9 layered rig runtime is
blocked, V31.10 named photo sample set is partial, V31.11 photo-action closure
is blocked, and V31.12 E2E is blocked. Claim and security scans passed.

## Phase Plan

| Phase | Development Work | Acceptance Output |
| --- | --- | --- |
| V31.0 | Freeze PRD, target architecture, acceptance plan, milestones, claim matrix, gap analysis, drawio. | Passed scoped: planning package and scope evidence exist. |
| V31.1 | Execute `v31_1-art-quality-rubric-spec.md`: define high-quality visual art rubric and placeholder rejection rule. | Passed scoped: current simplified SVG/placeholder baseline is rejected for target art quality. |
| V31.2 | Execute `v31_2-flagship-asset-route-spec.md`: validate one named high-quality 2D frame pack route. | Passed scoped for one named local flagship 8-action asset. |
| V31.3 | Execute `v31_3-visual-review-report-spec.md`: generate visual review report and screenshot evidence. | Passed scoped: HTML report, contact sheet, screenshots, and QA tables exist. |
| V31.4 | Execute `v31_4-layered-rig-route-spec.md`: specify layered 2D rig / Spine-like / Live2D-like production route. | Passed scoped as a route contract; not a runtime rig readiness claim. |
| V31.5 | Execute `v31_5-photo-to-character-route-spec.md`: specify and smoke photo-to-character-to-action route. | Candidate-only scoped: real photo samples produce suitability/candidate evidence, not arbitrary-cat ready. |
| V31.6 | Execute `v31_6-e2e-real-data-acceptance-spec.md`: run E2E acceptance with real data. | Partial scoped: flagship passed; photo route remains candidate-only. |
| V31.7 | Final gate. | Partial scoped final report with scans. |
| V31.8 | Define repeatable high-quality asset production beyond the first named pack. | Partial scoped: only one high-quality candidate passed; repeatability is not fully proven. |
| V31.9 | Convert layered rig / professional animation route into runtime evidence or stable blocked result. | Blocked scoped: route contract exists, but no accepted layered rig runtime payload or normalized frame export passed. |
| V31.10 | Define named real photo sample set and intake gates. | Partial scoped: real local cat photos covered positive/blocked cases; negative coverage is simulated metadata only. |
| V31.11 | Close photo-to-action candidate preview/apply/rollback. | Blocked scoped: preview/apply/rollback controls pass for tested local candidate, but no photo-derived action frames exist. |
| V31.12 | Run real-data E2E continuation acceptance. | Blocked scoped: HTML evidence generated; target experience remains incomplete. |
| V31.13 | Continuation final gate. | Blocked scoped: V31.8-V31.12 evidence exists, with claim/security scans passed. |

## Development Rules

- Do not treat the current simplified SVG cat as a V31 target asset.
- Do not accept whole-image transform as final animation.
- Do not accept provider output without local QA and visual review.
- Do not claim arbitrary-cat ready without a named tested sample set.
- Do not write text-only acceptance for visual quality.
- Every subphase must produce evidence, PRD/spec review, claim scan, and
  security scan.
- V31 continuation must not expand one flagship asset into repeatable
  production or arbitrary-cat automation without new evidence.

## Target Experience After Development

If V31 succeeds, the reviewer should see:

- one polished flagship 2D cat action pack that is good enough to represent the
  target product experience;
- all 8 actions shown as screenshots/contact sheets and playback;
- old placeholder or transform-only assets visibly rejected;
- preview/apply/rollback still target-only and safe;
- arbitrary-cat photo workflow either passing for named real samples or honestly
  marked blocked/failed with repair guidance.

## Evidence Naming

Expected future evidence files:

- `docs/V31.x/evidence/v31_0-scope-freeze-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_1-art-quality-rubric-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_2-flagship-asset-route-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_3-visual-review-report-YYYY-MM-DD.html`
- `docs/V31.x/evidence/v31_4-layered-rig-route-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_5-photo-to-character-route-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_6-e2e-real-data-acceptance-YYYY-MM-DD.md`
- `docs/V31.x/v31-final-acceptance-report.md`
- `docs/V31.x/evidence/v31_8-repeatable-asset-production-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_9-layered-rig-runtime-route-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_10-photo-sample-set-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_11-photo-action-preview-apply-rollback-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_12-real-data-e2e-YYYY-MM-DD.md`
- `docs/V31.x/evidence/v31_13-continuation-final-gate-YYYY-MM-DD.md`

## Execution Specs

- `docs/V31.x/v31-detailed-development-and-acceptance-plan.md`
- `docs/V31.x/v31_1-art-quality-rubric-spec.md`
- `docs/V31.x/v31_2-flagship-asset-route-spec.md`
- `docs/V31.x/v31_3-visual-review-report-spec.md`
- `docs/V31.x/v31_4-layered-rig-route-spec.md`
- `docs/V31.x/v31_5-photo-to-character-route-spec.md`
- `docs/V31.x/v31_6-e2e-real-data-acceptance-spec.md`

## Go / No-Go

V31.0-V31.7 have execution evidence. The final decision is partial scoped:
the named local flagship asset route passed, while arbitrary-cat automatic
high-quality action generation remains not ready.

V31.8-V31.13 now have pass/partial/block/fail evidence. The continuation final
decision remains blocked scoped until a second accepted high-quality asset
route, a real layered rig runtime payload or equivalent production route, and
real photo-derived high-quality action frames pass the same QA and runtime
controls.
