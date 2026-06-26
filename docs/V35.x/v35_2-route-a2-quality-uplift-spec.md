# V35.2 Route A2 Quality Uplift Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.2 defines how the existing local Route A2 generation path may be improved toward target-experience quality. This phase must not claim that Route A2 already reaches target quality.

## Inputs

- V35.1 target-experience rubric evidence.
- V34 Route A2 generated action packs and visual refs.
- Existing code entity: `apps/desktop/src/assets/v34-rig-frame-synthesis.ts`.
- Existing QA entity: `apps/desktop/src/assets/v34-generation-quality-gate.ts`.

## Required Plan Fields

`V35RouteA2QualityUpliftPlan` must include:

- `routeId`
- `baseCandidateIds`
- `targetSampleIds`
- `plannedQualityImprovements`
- `targetActions`
- `partMotionRequirements`
- `identityPreservationRequirements`
- `visualEvidenceRequired`
- `failureThresholds`
- `fallbackTrigger`
- `claimBoundary`

## Required Quality Improvements

The plan must specify concrete work items, such as:

- increasing local part motion for tail, ears, face, legs, or action symbols;
- improving pose readability for idle, walk, jump, sleep, eat, play, alert, celebrate;
- ensuring frames are not only whole-image transforms;
- keeping `characterAssetId` and identity anchors sample-bound;
- producing contact sheet and playback evidence for every tested sample.

## Acceptance Actions

- Use V35.1 rubric to define pass/fail thresholds.
- Define the minimum named sample count for Route A2 uplift acceptance.
- Define negative cases: placeholder art, transform-only, identity drift, missing action, failed product path.
- Define when Route A2 should continue and when Route B should be recommended.

## Evidence

Future evidence path:

`docs/V35.x/evidence/v35_2-route-a2-quality-uplift-YYYY-MM-DD.md`

Evidence must include PRD/spec review, input candidate refs, planned improvements, non-pass cases, visual evidence requirements, command results or blocked reason, claim scan, security scan, and scoped decision.

## Exit Decision

V35.2 passes only as a development-ready plan if Route A2 implementers can proceed without choosing new quality thresholds. If the plan still says “make it better” without concrete evidence and thresholds, it is blocked.
