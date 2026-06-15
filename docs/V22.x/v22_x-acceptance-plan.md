# V22 Acceptance Plan

文档状态：scoped accepted acceptance plan。  
阶段主题：Asset Quality Review & Rejection Gate。  
当前日期：2026-06-15。

## Acceptance Principle

V22 accepts rejection behavior, not asset generation intent. A generated pack can have 8 actions and still fail if it is visually bad, weak-motion, inconsistent, flickery, or unsuitable for a user-facing pet gallery.

## Phase Acceptance Matrix

| Phase | Gate | Required Evidence | Pass Condition |
| --- | --- | --- | --- |
| V22.0 | scope freeze | `docs/V22.x/evidence/v22_0-scope-freeze-YYYY-MM-DD.md` | V22 docs/drawio/claim boundary exist |
| V22.1 | quality schema | `docs/V22.x/evidence/v22_1-quality-schema-smoke-YYYY-MM-DD.md` | statuses and reasonCodes validate |
| V22.2 | technical QA | `docs/V22.x/evidence/v22_2-technical-qa-smoke-YYYY-MM-DD.md` | bad technical fixtures rejected |
| V22.3 | motion QA | `docs/V22.x/evidence/v22_3-motion-qa-smoke-YYYY-MM-DD.md` | weak/drifting/flicker fixtures rejected |
| V22.4 | visual review | `docs/V22.x/evidence/v22_4-visual-review-ux-smoke-YYYY-MM-DD.md` | ugly candidate can be rejected with reason |
| V22.5 | retry guidance | `docs/V22.x/evidence/v22_5-retry-route-guidance-smoke-YYYY-MM-DD.md` | repeated failures produce actionable guidance |
| V22.6 | apply enforcement | `docs/V22.x/evidence/v22_6-apply-enforcement-smoke-YYYY-MM-DD.md` | only approved candidate can apply target-only |
| V22.7 | final | `docs/V22.x/v22_7-final-acceptance-report.md` | all required gates resolved |

## Required Rejected Fixtures

V22 must reject:

- missing core action；
- blank frame；
- fully transparent frame；
- off-canvas frame；
- visible background/watermark；
- loop closure failure；
- adjacent frame delta too high；
- motion amplitude too low；
- identity drift；
- visually ugly candidate；
- unreviewed candidate；
- rejected candidate；
- candidate with forbidden URL/path/script fields。

## Required Approved Fixture

At least one approved test pack must:

- contain all 8 core actions；
- pass technical QA；
- pass motion QA；
- pass visual review；
- preview all actions；
- apply only to target PetInstance；
- preserve default and unrelated pets；
- rollback to previous visible pack。

## User Guidance Acceptance

After repeated failure, UI/evidence must show a specific message:

- what failed；
- why the current result cannot apply；
- whether to retry, switch route, or upload a better photo；
- what better photo means: clear front-facing single cat, not cropped, not occluded, no complex background。

## Security Scan

Evidence must not include:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- api-token.json；
- prompt private text；
- private filename。

## Claim Scan

Forbidden claims can appear only in forbidden / not-ready / not-implied contexts:

- Petdex parity achieved；
- provider integration verified；
- arbitrary cats automatic photo-to-animation ready；
- automatic photo-to-2D ready for arbitrary cats；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。
