# V30 Development Plan

文档状态：planned。
当前日期：2026-06-17。

## Scope

V30 fixes the gap between “animated frames exist” and “the pet performs intuitive, attractive character actions.” The phase does not claim Petdex parity, arbitrary-cat automation, or provider reliability.

## Phase Plan

### V30.0 Scope Freeze

Development:

- Freeze V30 PRD, target architecture, acceptance plan, claim matrix, milestones, and drawio.
- Mark V29 as previous gallery/photo-generation baseline.
- Confirm weak transform-based assets cannot be used as V30 passed evidence.

Acceptance:

- V30 docs exist and active docs point to V30.
- Drawio parses and describes current-vs-target architecture, plan, milestones, gates.
- Forbidden claims only appear in forbidden / not-ready contexts.

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

### V30.2 Semantic Frame Candidate Generation

Development:

- Implement route adapters for semantic candidates:
  - manual high-quality frame import;
  - provider key-pose candidate import;
  - local 2D rig candidate generation;
  - existing weak-pack comparison.
- Normalize output to `pet.json + frames/<action>/frame-###.png`.
- Preserve previous active pack after invalid generation.

Acceptance:

- At least one candidate pack produces 8 core actions.
- Candidate includes true pose changes, not only transform effects.
- Failed route returns stable reasonCode.
- Evidence includes contact sheet and animated preview.

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

## Go / No-Go

- V30.0: Go after document review.
- V30.1-V30.5: Conditional Go after previous evidence.
- V30.6: No-Go until V30.0-V30.5 evidence exists.
