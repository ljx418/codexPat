# V35.4 Same-Sample Route Comparison Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.4 defines a fair comparison between Route A2 and Route B. The comparison must use the same named samples, the same V35.1 rubric, and the same product path requirements.

## Inputs

- V35.1 target-experience rubric evidence.
- V35.2 Route A2 quality uplift evidence or blocked reason.
- V35.3 Route B source boundary evidence or blocked reason.
- V34 sample and character asset evidence.

## Required Comparison Fields

`V35RouteComparisonResult` must include:

- `sampleId`
- `routeA2CandidateId`
- `routeBCandidateId`
- `rubricResult`
- `identityResult`
- `motionReadabilityResult`
- `visualEvidenceRefs`
- `productPathResult`
- `winner`
- `reasonCodes`
- `remainingRisks`

## Comparison Rules

- Compare only candidates bound to the same `sampleId`.
- Use the same V35.1 rubric for both routes.
- Use the same required actions and product path gates.
- Do not compare Route A2 evidence for one cat against Route B evidence for another cat.
- If Route B is not executed, record `Route B blocked/not executed`, not a pass.

## Allowed Decisions

- `route_a2_better`
- `route_b_better`
- `both_target_experience`
- `both_engineering_only`
- `route_a2_only_available`
- `route_b_blocked`
- `comparison_failed`

## Evidence

Future evidence path:

`docs/V35.x/evidence/v35_4-same-sample-route-comparison-YYYY-MM-DD.md`

Evidence must include route comparison table, visual refs, product path refs, PRD/spec review, claim scan, security scan, and scoped decision.

## Exit Decision

V35.4 passes only if the route comparison can drive a final route decision without hidden sample or standard mismatch. If either route lacks required evidence, the result must be partial or blocked.
