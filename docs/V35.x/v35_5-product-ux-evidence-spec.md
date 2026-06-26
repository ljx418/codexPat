# V35.5 Product UX Evidence Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.5 defines how target-experience candidates must be proven in the product path. This phase verifies what a user can experience: preview, target-only apply, rollback, failed-candidate blocking, and understandable failure reasons.

## Inputs

- V35.1 rubric evidence.
- V35.4 route comparison evidence or blocked reason.
- Existing product entity: `apps/desktop/src/assets/v33-productized-photo-flow.ts`.
- Existing QA entity: `apps/desktop/src/assets/v34-generation-quality-gate.ts`.

## Required Product Evidence

Each accepted candidate must have:

- `sampleId`
- `characterAssetId`
- `candidateId`
- route label: Route A2 or Route B
- rubric status
- QA status
- preview result
- target-only apply result
- rollback result
- blocked failed-candidate result
- visual evidence refs

## User-Visible Scenarios

The future E2E report must show:

- successful preview of a target-experience candidate;
- target-only apply to the intended pet;
- rollback to the previous state;
- failed candidate blocked from preview/apply;
- visible reasonCodes for blocked/failed candidates;
- route and source boundary shown without leaking sensitive values.

## Non-Pass Criteria

- failed or blocked candidate can apply;
- route label is missing;
- source boundary missing for Route B;
- product path evidence lacks visual refs;
- user cannot distinguish target-experience pass from engineering-only pass;
- evidence contains sensitive values.

## Evidence

Future evidence path:

`docs/V35.x/evidence/v35_5-product-ux-evidence-YYYY-MM-DD.md`

Evidence must include PRD/spec review, user-visible scenario table, visual refs, product path summary, failed-candidate blocked result, claim scan, security scan, and scoped decision.

## Exit Decision

V35.5 passes only if a human reviewer can understand what users would actually see and which candidates are safe to apply.
