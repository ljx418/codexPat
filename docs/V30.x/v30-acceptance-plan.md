# V30 Acceptance Plan

文档状态：scoped passed acceptance；retained as V30 acceptance contract and internal review gate。
当前日期：2026-06-24。

## Acceptance Principle

V30 accepts semantic character animation, not motion effects. A candidate fails if it only scales, translates, rotates, jitters, or decorates a static image without readable action logic.

V30.0-V30.6 passed on 2026-06-17 for tested local action packs. This acceptance
plan remains the audit contract for that scoped pass.

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

## User-Visible Acceptance Gates

| Gate | User-visible function or experience | Pass Condition |
| --- | --- | --- |
| Storyboard gate | 用户能理解 8 个动作各自表达什么。 | 每个 action 有语义说明、关键姿势和禁止捷径。 |
| Candidate route gate | 用户知道动作来自逐帧、部件 rig 或 provider 候选，而不是整图变形。 | manual import / local 2D part rig / provider key-pose candidate / weak baseline 的角色和边界被记录；whole-image transform 只能 reject-only。 |
| Candidate quality gate | 用户看到的不只是抖动、缩放、滑动。 | 候选包包含 8 actions，active actions 有真实姿态变化。 |
| QA gate | 差动作不能靠 frame delta 或 loop closure 混过。 | transform-only weak baseline 被拒绝，semantic candidate 有安全 reasonCodes。 |
| Preview gate | 用户能在一个页面里比较旧弱动作和新语义动作。 | HTML 嵌入 storyboard、contact sheet、animated playback、old-vs-new、QA table。 |
| Apply gate | 用户只能应用合格动作包。 | QA failed pack cannot apply；approved pack target-only apply。 |
| Rollback gate | 用户不满意能恢复。 | rollback restores previous visible pack；default/unrelated pets unchanged。 |
| Claim gate | 用户和维护者不会被过度承诺误导。 | forbidden claims only appear in forbidden / not-ready context。 |

Canonical route names for acceptance review:

- `manual high-quality frame import` is the short-term proof route.
- `local 2D part rig` is the recommended medium-term route.
- `provider key-pose candidate` is candidate-only input.
- `whole-image transform baseline` is reject-only comparison.

## Acceptance To Target Experience Matrix

| Acceptance Threshold | Function The Project Can Demonstrate | Target Experience It Supports |
| --- | --- | --- |
| Every action has storyboard and key poses. | The project can explain the intended action before frame review. | 用户理解动作语义，不把随机动效当角色动作。 |
| Route priority is explicit. | The project can distinguish short-term manual frame proof, medium-term local 2D part rig, provider candidate-only input, and reject-only whole-image baseline. | 用户和维护者不会把僵硬整图变形误认为主线，也不会把 provider 候选误认为 ready。 |
| Candidate pack has all 8 actions in normalized format. | The project can preview and QA one complete action set. | 用户看到完整宠物动作包，而不是零散帧。 |
| Transform-only weak baseline is rejected. | The project can prevent weak motion from passing. | 用户不会得到“图片扭动”式合格结果。 |
| Semantic candidate passes motion readability QA. | The project can identify readable action logic with evidence. | 用户看到 running / success / error / need_input 等动作可识别。 |
| Preview embeds visual proof. | The project can show contact sheet, animation, old-vs-new, and QA table together. | 用户或审核者快速理解为什么通过或失败。 |
| QA failed pack cannot apply. | The project can enforce quality before activation. | 用户不会误用失败动作包。 |
| Approved pack target-only applies. | The project can change only the selected PetInstance. | 用户能安全试用，不影响其他宠物。 |
| Rollback restores previous visible pack. | The project can recover from an unwanted visual change. | 用户可撤销并回到原状态。 |

## Semantic Action Criteria

### Hard Fail

Any approved candidate must fail if:

- it is produced only by whole-image transform without semantic pose changes；
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

## Exit Conditions

V30 can remain scoped passed only when all of the following stay true:

- V30.0-V30.5 evidence exists and maps to the PRD stages.
- At least one tested local 8-action pack has storyboard, contact sheets, animated playback, QA, preview, apply, and rollback evidence.
- Weak transform-only baseline remains rejected.
- QA failed assets cannot be applied.
- Target apply affects only the selected PetInstance.
- Rollback restores the previous visible pack.
- Final evidence is visual and embedded, not text-only or link-only.
- Security scan and claim scan remain clean.

V30 must be reopened, blocked, or narrowed if future edits break any of these
conditions.

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
