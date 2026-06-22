# V29.3 Quality Gate V2 Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V29.3 verifies Quality Gate V2 for tested same-cat, motion, background,
continuity, readability, and aesthetic ranking scenarios. It does not prove the
V29.2 diverse photo benchmark and does not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
| accepted candidate passes all hard gates | passed | candidate_ranked, quality_gate_passed |
| missing action coverage rejected | passed | action_coverage_incomplete |
| weak motion rejected | passed | motion_amplitude_too_low |
| identity drift rejected | passed | same_cat_score_too_low |
| bad background rejected | passed | background_not_clean |
| flicker and loop failures rejected | passed | frame_delta_too_large, loop_closure_failed |
| aesthetic ranking cannot override hard rejection | passed | same_cat_score_too_low |
| quality gate target test passed | passed | quality-gate-v2.test.ts passed |
| security scan | passed | safe QA snapshot only |
| claim scan | passed | no forbidden ready claim |

## Scenario Table

| Scenario | Status | Rank | Hard rejected | Reason codes |
| --- | --- | --- | --- | --- |
| accepted | accepted | A | false | candidate_ranked, quality_gate_passed |
| missing | rejected | rejected | true | action_coverage_incomplete |
| weakMotion | rejected | rejected | true | motion_amplitude_too_low |
| identityDrift | rejected | rejected | true | same_cat_score_too_low |
| badBackground | rejected | rejected | true | background_not_clean |
| flicker | rejected | rejected | true | frame_delta_too_large, loop_closure_failed |
| prettyBad | rejected | rejected | true | same_cat_score_too_low |

## PRD / Spec Review

V29.3 satisfies the PRD requirement that bad generated assets are rejected before
preview/apply. Aesthetic ranking is available only after hard gates pass and
cannot override missing action coverage, weak motion, identity drift, bad
background, flicker, off-canvas, or loop closure failures.

V29.2 remains blocked until the benchmark has enough diverse samples. Therefore
V29.6 remains No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Pretty but wrong cat gets accepted | High | same_cat_score_too_low hard rejects |
| Static frames pass as motion | High | motion_amplitude_too_low hard rejects |
| Flicker or jump accepted | High | frame_delta_too_large / loop_closure_failed hard reject |
| Aesthetic score overrides QA | High | candidate_ranked absent for hard rejected cases |

## Allowed Claim

V29 quality gate v2 passed for tested same-cat, motion, background, continuity, and aesthetic rejection scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
- 3D ready
- production signed release ready
