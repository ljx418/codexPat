# V31 Detailed Development and Acceptance Plan

文档状态：V31 total-control plan；partial scoped execution recorded；V31 continuation planning active。
当前日期：2026-06-24。

## Decision

This document is the total-control plan for V31. It links the PRD, target
architecture, per-stage specs, evidence names, pass/block/fail decisions, claim
boundaries, and final gate.

V31 can enter staged development after this document, the active PRD, target
architecture, acceptance plan, drawio, and execution specs pass doc audit,
claim scan, and security scan.

V31 must not skip directly to final acceptance. It must produce real evidence
phase by phase.

The V31 continuation stage extends the same control model to V31.8-V31.13.
Those phases are planned work, not passed evidence.

## Source Documents

- `docs/active/agent_desktop_pet_prd_v31.md`
- `docs/V31.x/v31-target-architecture.md`
- `docs/V31.x/v31-development-plan.md`
- `docs/V31.x/v31-acceptance-plan.md`
- `docs/V31.x/v31-milestones.md`
- `docs/V31.x/v31-claim-matrix.md`
- `docs/V31.x/v31-current-gap-analysis.md`
- `docs/V31.x/v31-doc-audit.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/V31.x/v31_1-art-quality-rubric-spec.md`
- `docs/V31.x/v31_2-flagship-asset-route-spec.md`
- `docs/V31.x/v31_3-visual-review-report-spec.md`
- `docs/V31.x/v31_4-layered-rig-route-spec.md`
- `docs/V31.x/v31_5-photo-to-character-route-spec.md`
- `docs/V31.x/v31_6-e2e-real-data-acceptance-spec.md`

## Current Truth

```text
V30 semantic gate passed scoped.
Current simplified SVG cat is an engineering placeholder.
V31 high-quality flagship 2D asset passed for one named tested local asset pack.
Arbitrary-cat automatic high-quality action generation is not ready yet.
Provider integration is not verified.
Production, Windows, cross-platform, MCP, Claude Code, OS-level binding, and
3D readiness are not part of V31 passed claims.
```

## Phase Control Table

| Phase | Entry Criteria | Development Action | Acceptance Action | Evidence | Decision |
| --- | --- | --- | --- | --- | --- |
| V31.0 scope freeze | PRD, target architecture, drawio, stage specs exist | verify docs align with V31 target experience and architecture | doc audit, drawio page check, claim/security scan | `docs/V31.x/evidence/v31_0-scope-freeze-YYYY-MM-DD.md` | pass/block/fail |
| V31.1 art rubric | V31.0 passed | execute `v31_1-art-quality-rubric-spec.md` | prove placeholder/simple SVG is rejected as target art | `docs/V31.x/evidence/v31_1-art-quality-rubric-YYYY-MM-DD.md` | pass/block/fail |
| V31.2 flagship route | V31.1 passed | execute `v31_2-flagship-asset-route-spec.md` | decide legal source, pack contract, QA, preview/apply/rollback path | `docs/V31.x/evidence/v31_2-flagship-asset-route-YYYY-MM-DD.md` | pass/block/fail |
| V31.3 visual report | V31.2 passed or blocked with repair path | execute `v31_3-visual-review-report-spec.md` | create visual report requirements and verify no text-only acceptance | `docs/V31.x/evidence/v31_3-visual-review-report-YYYY-MM-DD.html` | pass/block/fail |
| V31.4 layered rig route | V31.1 passed | execute `v31_4-layered-rig-route-spec.md` | prove route avoids whole-image transform and exports reviewable frames/payload | `docs/V31.x/evidence/v31_4-layered-rig-route-YYYY-MM-DD.md` | pass/block/fail |
| V31.5 photo route | V31.1 passed and privacy boundary clear | execute `v31_5-photo-to-character-route-spec.md` | define real sample classes, consent, safe traits, candidate-only handoff | `docs/V31.x/evidence/v31_5-photo-to-character-route-YYYY-MM-DD.md` | pass/block/fail |
| V31.6 real-data E2E | V31.2-V31.5 have pass/block/fail evidence | execute `v31_6-e2e-real-data-acceptance-spec.md` | run real flagship path, placeholder rejection, visual report, photo sample path, scans | `docs/V31.x/evidence/v31_6-e2e-real-data-acceptance-YYYY-MM-DD.md` | pass/partial/block/fail |
| V31.7 final gate | V31.1-V31.6 evidence exists | summarize all evidence, residual risks, user-visible status, architecture status | final PRD/spec review, regression commands, V31 visual evidence, claim/security scan | `docs/V31.x/v31-final-acceptance-report.md` | pass/partial/block/fail |
| V31.8 repeatable asset production | V31.7 partial scoped and continuation doc review passed | define repeatable candidate source, license, normalization, visual QA, semantic QA, and evidence requirements | prove at least two candidates can be evaluated with the same gates, or record stable blocked reason | `docs/V31.x/evidence/v31_8-repeatable-asset-production-YYYY-MM-DD.md` | pass/partial/block/fail |
| V31.9 layered rig runtime route | V31.8 has pass/block/fail evidence | produce normalized frames or supported runtime payload from layered rig/professional animation route, or document tooling blocker | run V30 semantic QA, V31 art QA, visual report, preview/apply/rollback where applicable | `docs/V31.x/evidence/v31_9-layered-rig-runtime-route-YYYY-MM-DD.md` | pass/partial/block/fail |
| V31.10 named photo sample set | privacy boundary clear and sample list approved by local consent rules | define named sample classes, redaction, suitability, blocked negative samples, and route expectations | prove sample metadata is safe and each sample has pass/block/fail intake status | `docs/V31.x/evidence/v31_10-photo-sample-set-YYYY-MM-DD.md` | pass/block/fail |
| V31.11 photo action closure | V31.10 passed or partially passed with repair path | generate or import photo-derived candidates for the named sample set | run visual QA, semantic QA, preview, target apply, rollback, and blocked-case reasonCodes | `docs/V31.x/evidence/v31_11-photo-action-preview-apply-rollback-YYYY-MM-DD.md` | pass/partial/block/fail |
| V31.12 continuation real-data E2E | V31.8-V31.11 have evidence | combine repeatable production, layered route, named sample set, photo action closure, and scans | produce user-visible report and scoped final readiness decision | `docs/V31.x/evidence/v31_12-real-data-e2e-YYYY-MM-DD.md` | pass/partial/block/fail |
| V31.13 continuation final gate | V31.8-V31.12 evidence exists | summarize all continuation evidence, residual risks, user-visible status, architecture status | final PRD/spec review, regression commands, claim scan, security scan, narrow final claim | `docs/V31.x/evidence/v31_13-continuation-final-gate-YYYY-MM-DD.md` | pass/partial/block/fail |

## Required Regression Commands

Minimum unchanged baseline commands:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Before V31.7, V31-specific smoke scripts or equivalent evidence commands must
exist for:

- art quality rubric evaluation;
- flagship asset pack validation;
- visual review report generation;
- placeholder/transform-only rejection;
- target-only apply and rollback;
- photo sample candidate workflow or stable blocked reason.

Before V31.13, continuation-specific commands or equivalent evidence must exist
for repeatable asset production, layered rig runtime output or stable blocker,
named sample-set intake, photo-to-action candidate closure, and real-data E2E.

## Development Loop

For each phase:

1. Read PRD, target architecture, the phase spec, and the previous phase
   evidence.
2. Write or update the development plan for the phase if implementation details
   changed.
3. Run implementation or evidence generation.
4. Run baseline regression commands or record stable blocked reason.
5. Create evidence with PRD/spec review.
6. Run claim scan and security scan.
7. If the phase fails, return to the phase plan and repair before proceeding.
8. If a major PRD deviation, false acceptance risk, licensing risk, private-data
   risk, or overclaim risk appears, stop and request human confirmation.

## Final V31 User Experience Target

At successful or partial V31 closure, a reviewer should see:

- a clear decision on whether one high-quality flagship 8-action cat asset
  exists;
- visual evidence for all eight actions;
- readable playback or frame sequences at 1x and 0.75x;
- old placeholder/whole-image transform assets rejected with visible reasons;
- approved-only target apply and rollback evidence;
- a real photo-to-character-to-action path that either passes for named sample
  sets or gives honest blocked/failed reasons;
- no misleading readiness claims.

## Final Architecture Target

V31 architecture is considered met only when the evidence shows:

- asset source layer records route and license boundary;
- production layer creates or imports a normalized pack or supported rig output;
- quality layer combines V30 semantic QA with V31 visual/art/identity/timing QA;
- experience layer renders visual evidence, preview, approved apply, rollback;
- claim/security boundary prevents overclaim and sensitive data exposure.

## Final Pass Conditions

V31 can pass scoped only if:

- at least one named high-quality flagship 8-action asset passes visual and
  semantic gates;
- evidence embeds screenshots/contact sheets/playback;
- failed placeholder and transform-only assets are blocked;
- target-only apply and rollback pass;
- photo route result is accurately scoped to named samples or blocked/failed;
- final report includes PRD/spec review, claim scan, and security scan.

V31 cannot pass if evidence is text-only, no flagship asset passes, failed
assets can apply, rollback fails, arbitrary-cat readiness is overclaimed, or
sensitive data appears in evidence.

## Allowed Final Claim If Passed

```text
V31 high-quality flagship 2D action asset passed for the named tested local
asset pack, with visual QA, semantic QA, preview, target apply, rollback,
claim scan, and security scan evidence.
```

Photo route claims must stay scoped to named samples and route evidence.

## Continuation Pass Conditions

V31 continuation can pass scoped only if:

- repeatable high-quality asset production is proven beyond the first named
  local asset, or explicitly marked partial/blocked;
- layered rig/professional animation route has runtime evidence or stable
  blocked reason;
- named real photo sample set includes accepted, difficult, blocked, and
  negative cases with safe redacted metadata;
- photo-derived candidates pass visual QA, semantic QA, preview, target apply,
  and rollback for the named passing samples;
- final evidence includes PRD/spec review, claim scan, and security scan.

V31 continuation cannot claim arbitrary-cat automatic animation ready unless a
future PRD defines and passes a broader benchmark than the named sample set.
