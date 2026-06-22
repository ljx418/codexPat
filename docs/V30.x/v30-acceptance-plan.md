# V30 Acceptance Plan

文档状态：planned acceptance。
当前日期：2026-06-17。

## Acceptance Principle

V30 accepts semantic character animation, not motion effects. A candidate fails if it only scales, translates, rotates, jitters, or decorates a static image without readable action logic.

## Required Evidence

| Evidence | Required Content |
| --- | --- |
| Scope freeze | docs, claim boundary, drawio sync |
| Storyboard evidence | 8 action storyboards and key-pose expectations |
| Candidate generation evidence | real frames, contact sheet, animated preview |
| Motion QA evidence | semantic scores, reject/pass reasonCodes |
| Preview evidence | old-vs-new visual comparison, zero PetEvent proof |
| Apply evidence | target-only apply, failed apply blocked, rollback |
| Final dashboard | embedded visual evidence and final decision |

## Semantic Action Criteria

### Hard Fail

Any approved candidate must fail if:

- running has no clear locomotion / forward energy；
- success has no anticipation / celebration / recovery；
- error is visually similar to warning or idle；
- need_input is only a symbol overlay without body attention；
- sleeping is a sitting pose moved downward；
- active actions are mostly whole-image scale/translate/rotate；
- loop closure visibly flashes；
- frame-to-frame jumps break continuity；
- same-cat identity drifts；
- background residue or off-canvas frame appears。

### Pass Criteria

At least one accepted pack must prove:

- 8 core actions exist；
- each action has storyboard；
- each action has contact sheet；
- each action has runtime or HTML animated playback；
- active actions have visible semantic pose changes；
- idle/sleeping are stable and alive without excessive drift；
- all loops close；
- 1x and 0.75x readable；
- QA failed candidates cannot apply；
- target-only apply and rollback pass。

## Manual Visual Acceptance Rubric

Operator answers for each action:

| Question | Pass Requirement |
| --- | --- |
| Can I name the action without reading the label? | yes for running/success/warning/error/need_input/sleeping |
| Does the cat look like the same cat? | yes |
| Does it move like a pet, not like a dragged sticker? | yes |
| Is the motion pleasant enough to ship as default/gallery candidate? | yes |
| Does the loop avoid visible snap/flicker? | yes |

If any active action fails two or more questions, V30.3/V30.6 must be blocked or failed.

## Regression Checks

Minimum checks:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v29_6_final_gate.mjs
```

If a V30-specific script is added, V30.6 must run it before final.

## Security Scan

Evidence must not contain:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- private filename；
- full local path；
- workspace path；
- config path；
- api-token.json；
- prompt private text；
- Petdex copied assets。

## Claim Scan

Forbidden claims may only appear in forbidden / not-ready / not-implied contexts:

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- low-retry provider reliability；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。
