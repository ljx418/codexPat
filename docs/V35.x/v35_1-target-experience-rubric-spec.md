# V35.1 Target-Experience Rubric Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.1 定义目标体验级 2D 动作资产的验收 rubric。该阶段不生成新动作，不修改 runtime。它只冻结“什么样的动作资产可以被称为目标体验级”，避免后续用工程链路通过替代视觉质量通过。

## Inputs

- `docs/active/agent_desktop_pet_prd_v35.md`
- `docs/V35.x/v35-target-architecture.md`
- `docs/V35.x/v35-implementation-contract.md`
- V34 final evidence:
  - `docs/V34.x/v34-final-acceptance-report.md`
  - `docs/V34.x/evidence/v34_7-real-data-report-2026-06-25.html`
  - `docs/V34.x/evidence/v34_6-generation-product-e2e-2026-06-25.md`

## Required Rubric Fields

`V35TargetExperienceRubric` must define:

- `rubricId`
- `sampleScope`
- `identityCriteria`
- `motionReadabilityCriteria`
- `localPartMotionCriteria`
- `nonPlaceholderCriteria`
- `nonTransformOnlyCriteria`
- `actionCoverageCriteria`
- `productUsabilityCriteria`
- `statusScale`
- `reviewMethod`
- `requiredEvidenceRefs`

## Status Scale

Allowed statuses:

- `target_experience`: visual quality, identity stability, action readability, local motion, product path, and evidence all pass.
- `engineering_only`: generation and product path work, but visual quality is not yet acceptable as target user experience.
- `blocked`: input, evidence, environment, source, or route prerequisites are missing.
- `failed`: evidence exists and shows the candidate violates a hard non-pass criterion.

## Hard Non-Pass Criteria

The rubric must reject:

- simple line placeholder art;
- whole-image translate / scale / rotate / jitter only;
- same pack reused across different cat identities;
- missing V35 target actions;
- unreadable action intent;
- identity drift;
- failed candidate entering preview/apply;
- evidence without visual reference.

## Acceptance Actions

- Create a rubric table with target-experience, engineering-only, blocked, and failed examples.
- Map each rubric dimension to required evidence.
- Define whether a human reviewer is required, and what machine-checkable evidence can support the decision.
- Run claim/security scan on the rubric text.

## Evidence

Future evidence path:

`docs/V35.x/evidence/v35_1-target-experience-rubric-YYYY-MM-DD.md`

Evidence must include PRD/spec review, rubric table, non-pass examples, evidence requirements, claim scan, security scan, and scoped decision.

## Exit Decision

V35.1 may pass only if a later implementer can evaluate a candidate without inventing new quality standards. If rubric language remains subjective or lacks non-pass examples, V35.1 is blocked.
