# V30 Development Plan

文档状态：scoped passed development plan；V30.0-V30.6 completed with evidence；retained as internal review development plan。
当前日期：2026-06-24。

## Scope

V30 fixes the gap between “animated frames exist” and “the pet performs intuitive, attractive character actions.” The phase does not claim Petdex parity, arbitrary-cat automation, or provider reliability.

V30 final acceptance passed on 2026-06-17 for tested local action packs. This
document is retained as the executed plan and claim boundary, not as an active
new provider/photo/3D/product release plan.

## Phase Plan

The V30 phase plan is ordered so each development step produces a user-visible
or reviewer-visible result before the next step can claim acceptance.

### V30.0 Scope Freeze

Development:

- Freeze V30 PRD, target architecture, acceptance plan, claim matrix, milestones, and drawio.
- Mark V29 as previous gallery/photo-generation baseline.
- Confirm weak transform-based assets cannot be used as V30 passed evidence.

Acceptance:

- V30 docs exist and active docs point to V30.
- Drawio parses and describes current-vs-target architecture, plan, milestones, gates.
- Forbidden claims only appear in forbidden / not-ready contexts.

Reviewer-visible outcome:

- The reviewer sees exactly why V30 exists and which claims remain forbidden.

### V30.1 Action Storyboard and Key-pose Contract

Development:

- Create action storyboard schema for 8 core actions.
- Define required key poses and timing per action.
- Define “whole-image transform only” as a reject condition.
- Add sample storyboard for current orange cat and at least one additional candidate.

Acceptance:

- All 8 actions have semantic storyboard.
- running/success/error/need_input have strong semantic key-pose requirements.
- idle/sleeping have appropriate low-motion requirements.
- Storyboard evidence is reviewable by non-developers.

Reviewer-visible outcome:

- The reviewer can read each action before seeing frames and know what the pet should be doing.

### V30.2 Semantic Frame Candidate Generation

Development:

- Implement route adapters for semantic candidates:
  - manual high-quality frame import;
  - local 2D part rig candidate generation;
  - provider key-pose candidate import;
  - existing weak-pack comparison.
- Treat manual high-quality import as the short-term proof path.
- Treat local 2D part rig as the medium-term recommended production route.
- Treat provider key-pose output as candidate-only until local QA passes.
- Keep whole-image transform output as reject-only weak baseline.
- Normalize output to `pet.json + frames/<action>/frame-###.png`.
- Preserve previous active pack after invalid generation.

Acceptance:

- At least one candidate pack produces 8 core actions.
- Candidate includes true pose changes, not only transform effects.
- Failed route returns stable reasonCode.
- Evidence includes contact sheet and animated preview.

Reviewer-visible outcome:

- The reviewer can compare candidate frames with the storyboard and see whether a real pose sequence exists.
- The reviewer can distinguish short-term imported frames, medium-term rig
  output, provider candidates, and rejected whole-image baseline.

### V30.3 Motion Readability QA

Development:

- Add QA checks:
  - whole-image transform detector;
  - action amplitude scorer;
  - key-pose diversity scorer;
  - center-of-mass / anchor drift check;
  - silhouette change check;
  - loop closure and adjacent delta;
  - same-cat consistency;
  - semantic checklist per action.
- Reject candidates that look like twisting, scaling, or sliding.

Acceptance:

- Weak V29/V16 transform-style candidate is rejected.
- Semantic candidate passes only if actions are readable.
- QA failed pack cannot be applied.
- Evidence records safe scores and reasonCodes only.

Reviewer-visible outcome:

- The reviewer sees the weak baseline rejected and can inspect the safe reason codes without sensitive data.

### V30.4 Preview UX and Evidence Page

Development:

- Add preview/report flow that shows:
  - original photo / source sheet;
  - storyboard;
  - contact sheet;
  - animated playback;
  - old weak asset vs new semantic asset comparison;
  - QA result table.
- Preview must not call notify or mutate live PetInstance.

Acceptance:

- HTML report embeds visual evidence, not link-only text.
- User can visually compare weak vs semantic actions.
- Preview sends zero PetEvent and writes no CatStateMachine state.

Reviewer-visible outcome:

- The reviewer can open one evidence page and see storyboard, contact sheets, animated playback, QA, and old-vs-new comparison.

### V30.5 Approved Apply and Rollback

Development:

- Apply only QA-approved semantic packs.
- Target PetInstance only.
- Preserve previous visible pack.
- Rollback restores previous pack.

Acceptance:

- Approved pack changes only target pet.
- Default and unrelated pets unchanged.
- QA failed pack cannot apply.
- Rollback restores previous visible pet.

Reviewer-visible outcome:

- The reviewer sees that passing quality gates leads to a safe target-only apply path, while failed assets are blocked.

### V30.6 Final Gate

Development:

- Generate final acceptance report and HTML dashboard.
- Run regression, security scan, claim scan.
- Record PRD/spec review.

Acceptance:

- V30.0-V30.5 evidence exists.
- At least one semantic 8-action pack passes QA, preview, apply, rollback.
- Final HTML embeds GIF/animated playback/contact sheets/screenshots.
- Forbidden claims remain forbidden.

Reviewer-visible outcome:

- The reviewer can tell what passed, what was rejected, which user-visible experience is supported, and which future capabilities remain not-ready.

## Development And Acceptance Summary

| Phase | Development Result | Acceptance Result | Target Experience After Phase |
| --- | --- | --- | --- |
| V30.0 | Scope, docs, drawio, claim boundary frozen. | Planning package can be audited. | 用户不会把 V30 误解成任意猫/provider/3D/发布能力。 |
| V30.1 | 8 actions storyboard and key-pose contract. | 每个动作有可读语义。 | 用户能理解每个动作应该表达什么。 |
| V30.2 | Semantic candidate routes and normalized frame pack; manual import short-term route, local 2D part rig medium-term route, provider candidate long-term route, whole-image baseline reject-only. | 至少一个 8-action candidate 可预览，且候选来源和验收边界清楚。 | 用户能看到候选动作来自逐帧/部件/候选关键姿势，而不是整图变形。 |
| V30.3 | Motion readability QA and rejection rules. | weak transform-only pack 被拒绝，semantic candidate 被接受。 | 差动画不会 silent pass。 |
| V30.4 | Old-vs-new preview UX and evidence page. | HTML embeds visual proof and does not mutate runtime. | 用户能直接比较旧弱动作和新语义动作。 |
| V30.5 | Approved-only target apply and rollback. | 只影响目标宠物，失败包不可应用，可回滚。 | 用户能安全试用合格动作包。 |
| V30.6 | Final report, checks, scans. | scoped passed with bounded claim. | 审核者能复核完整闭环。 |

## Completion Experience Map

| Development Objective | Completed Effect In The Product / Evidence | What The User Or Reviewer Can Do |
| --- | --- | --- |
| Define semantic requirements for 8 actions | Storyboard and key-pose contract exists for every action. | Read the expected behavior before looking at frames. |
| Establish route priority | Manual frame import proves the path first; local 2D part rig becomes the recommended medium-term production route; provider output remains candidate-only; whole-image transform is reject-only. | Understand which technical path can produce accepted evidence and which path is only comparison. |
| Normalize candidate frame packs | Candidate frames are presented as one predictable `pet.json + frames` pack. | Compare candidates without guessing which route produced them. |
| Reject transform-only weak motion | Motion readability QA records safe pass/fail scores and reasonCodes. | See why sticker-like scale/slide/rotate motion failed. |
| Show old-vs-new preview | HTML evidence embeds storyboard, contact sheets, animated playback, QA table, and weak baseline comparison. | Visually compare old weak actions and new semantic actions in one place. |
| Block failed apply | QA failed pack cannot reach target apply. | Trust that poor motion cannot silently become the active pet asset. |
| Apply approved pack only to target pet | Approved pack updates selected PetInstance only. | Try the semantic pack without changing default or unrelated pets. |
| Preserve rollback | Previous visible pack is retained and restored on rollback. | Undo the change if the new motion is not desired. |

## Development Constraints For Future Changes

Future code or documentation changes that touch V30 behavior must keep these
constraints intact:

- Do not replace semantic QA with frame-delta-only acceptance.
- Do not use whole-image transform as a final route for approved packs.
- Do keep manual high-quality import as the short-term proof route.
- Do keep local 2D part rig as the recommended medium-term route for less stiff motion.
- Do keep provider key-pose output candidate-only until local QA, preview, apply, and rollback pass.
- Do not allow candidate routes to bypass visual review.
- Do not apply any pack that failed QA.
- Do not remove target-only isolation or rollback preservation.
- Do not convert weak baseline comparison into passed evidence.
- Do not expand V30 into provider readiness, arbitrary-cat automation, Petdex
  parity, 3D readiness, platform readiness, or production release readiness.

## Go / No-Go

- V30.0: passed scoped.
- V30.1-V30.5: passed scoped after previous evidence.
- V30.6: passed scoped for tested local action packs.
