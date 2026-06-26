# V35.6 Final Route Decision Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.6 makes the final scoped route decision for the target-experience quality track. It must not enlarge the claim beyond named-sample evidence.

## Entry Criteria

V35.6 may start only when:

- V35.1 rubric evidence exists or has a stable blocked reason;
- V35.2 Route A2 quality evidence exists or has a stable blocked reason;
- V35.3 Route B source boundary evidence exists or has a stable blocked reason;
- V35.4 route comparison evidence exists or has a stable blocked reason;
- V35.5 product UX evidence exists or has a stable blocked reason;
- baseline commands pass or have stable blocked reasons.

## Required Reviews

- PRD review: `docs/active/agent_desktop_pet_prd_v35.md`
- Architecture review: `docs/V35.x/v35-target-architecture.md`
- Acceptance review: `docs/V35.x/v35-acceptance-plan.md`
- Claim review: `docs/V35.x/v35-claim-matrix.md`
- Security review: `docs/V35.x/v35-evidence-and-scan-checklist.md`

## Allowed Final Decisions

- `Route A2 target-experience scoped pass`
- `Route A2 engineering pass; Route B recommended`
- `Route B target-experience scoped pass`
- `V35 partial scoped`
- `V35 blocked scoped`
- `V35 failed`

## Required Final Report Sections

The final report must include:

- phase summary;
- route decision;
- sample and candidate table;
- target-experience rubric summary;
- visual evidence refs;
- product UX evidence refs;
- blocked/failed reasons;
- Route B source boundary summary if Route B is used;
- claim scan;
- security scan;
- narrow final claim;
- next-stage recommendation.

## Evidence

Future final report:

`docs/V35.x/v35-final-route-decision-report.md`

Future command/evidence log:

`docs/V35.x/evidence/v35_6-final-route-decision-YYYY-MM-DD.md`

## Exit Decision

V35.6 passes only if the final report gives an evidence-backed route decision and does not claim arbitrary-cat automation, provider verification, 3D readiness, production readiness, Windows readiness, or cross-platform readiness.
