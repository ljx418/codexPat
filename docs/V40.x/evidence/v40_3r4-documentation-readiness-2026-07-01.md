# V40.3R4 Documentation Readiness Evidence - 2026-07-01

## Decision

Status: passed scoped for documentation readiness only.

This evidence only supports V40.3R4 candidate-source replan as a documentation-controlled gate. It records a constrained route decision for later pre-development audit. It does not prove V40 image-to-high-quality-action generation, arbitrary-cat photo automation, Petdex parity, provider execution, WebUI/ComfyUI integration, Route B execution, production release, Windows readiness, or cross-platform readiness.

## Current facts

- V40.3R3 is recorded as blocked scoped with decision `remain_failed_or_blocked`.
- V40.3R4 selects `new_direct_runner_route_allowed` under strict no-WebUI/no-ComfyUI constraints.
- The host-process synthetic cat image and deterministic template GIF probe is process evidence only. It is not accepted V40 image-to-action quality evidence.
- V40.4-V40.7 remain No-Go until a later accepted source route produces candidates that pass explicit visual review.
- This stage is documentation development only. No product code implementation is claimed by this evidence.

## Updated documents

- `docs/active/agent_desktop_pet_prd_v40.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/V40.x/v40-target-architecture.md`
- `docs/V40.x/v40-development-and-acceptance-plan.md`
- `docs/V40.x/v40-acceptance-plan.md`
- `docs/V40.x/v40-milestones.md`
- `docs/V40.x/v40-current-gap-analysis.md`
- `docs/V40.x/v40-risk-and-claim-matrix.md`
- `docs/V40.x/v40-evidence-and-scan-checklist.md`
- `docs/V40.x/v40-phase-specs.md`
- `docs/V40.x/v40_3r4-detailed-development-and-acceptance-plan.md`
- `docs/V40.x/v40_3r4-route-decision-and-predev-audit.md`

## PRD and Spec Review

The revised documents keep V40 inside the same stage rather than creating a new stage. V40.3R4 selects `new_direct_runner_route_allowed` as the only documented next route.

The selected route is a constrained project-owned direct local runner path:

```text
real tested cat photo or accepted source-bound sample
  -> PhotoSafetyIntake
  -> SourceAndLicenseRecord
  -> SubjectMaskAndCropPlan
  -> IdentityAnchorPack
  -> ActionPoseConditionPack
  -> DirectDiffusersFrameRunner
  -> CandidateFrameSequence
  -> CandidateQualityReview
  -> V39SameSampleComparison
  -> accepted candidate or stable failed/blocked reason
```

The documents reject using failed V40.3/V40.3R/V40.3R2 outputs or host synthetic template GIF probes as accepted V40 assets. They require route-specific predevelopment audit, real source samples, visual acceptance gates, claim/security scan, and drawio synchronization before any later implementation resumes.

## Drawio Review

`docs/active/current-vs-target-gap.drawio` was updated in Chinese and remains within the 8-page maximum:

1. V40目标体验与声明边界
2. 当前架构与目标差异
3. 目标架构分层
4. 单照片到动作资产技术路径
5. 代码实体与数据流
6. 开发及阶段验收计划
7. 项目里程碑与风险闭环
8. 验收门槛与出门条件

The drawio now states that V40.3R3 is blocked scoped, the host template GIF probe is process-only, V40.3R4 selects a constrained direct runner predev route, and V40.4-V40.7 are still No-Go.

## Command Results

| Check | Result | Notes |
| --- | --- | --- |
| drawio XML parse | pass | 8 pages parsed successfully. |
| stale next-planned scan | pass scoped | Current docs point to V40.3R4. One old V40.3R3 evidence file remains historical and was not rewritten. |
| git diff whitespace check | pass | No whitespace errors in the current diff. |
| hard secret scan | pass | No token, Authorization value, workspace path, or local user path secret found in the 16-file V40.3R4 document set. |
| claim boundary scan | pass scoped | Forbidden readiness phrases appear only in no-go, forbidden, not-ready, or anti-claim contexts in the 16-file V40.3R4 document set. |
| selected-route entity scan | pass | `new_direct_runner_route_allowed`, `SourceAndLicenseRecord`, `SubjectMaskAndCropPlan`, `IdentityAnchorPack`, `ActionPoseConditionPack`, `DirectDiffusersFrameRunner`, `CandidateQualityReview`, and `V39SameSampleComparison` are present. |

## Audit Notes

- The current documentation can guide V40.3R4, but it still cannot guarantee later V40 high-quality asset success.
- If the selected V40.3R4 direct runner route cannot prove source/license records, local model/control availability, subject mask/crop planning, identity anchors, action pose conditions, safe runner invocation, and visual pass gates, the correct result is to keep V40 as failed or blocked.
- V40.4 cannot start from this evidence alone. It requires V40.3R5 predev audit pass evidence and V40.3R6 controlled candidate frame generation evidence with at least two explicit visual passes.

## Claim Scan Result

Allowed scoped claim:

`V40.3R4 documentation readiness passed scoped; V40.3R4 selects constrained new_direct_runner_route_allowed for pre-development audit only.`

Forbidden claims remain false and must not be used:

- Petdex parity achieved
- arbitrary cat photo-to-high-quality action automation ready
- provider integration verified
- WebUI/ComfyUI route verified
- Route B verified
- V40 production release ready
- Windows ready
- cross-platform ready

## Final Decision

V40.3R4 documentation readiness is passed scoped. The next allowed work is predevelopment audit for the selected constrained direct runner route. It is not acceptable to proceed directly to V40.4-V40.7 or to claim V40 image-to-action quality completion.
