# V30 Target Architecture

文档状态：scoped passed target architecture；retained as V30 architecture contract and internal review map。
当前日期：2026-06-24。

## Architecture Goal

V30 将资产生产链路从“图片补帧 / 整图形变”升级为“动作语义驱动的角色动画资产生产与验收”。

目标架构要让人类审核者能快速回答四个问题：

- 当前弱点在哪里：哪些链路只能证明“图片动了”，不能证明“动作可读”。
- 目标层如何补上：语义规格、storyboard、候选帧、QA、预览、应用、回滚分别负责什么。
- 当前架构和目标架构如何关联：旧弱包仍可作为 baseline comparison，但不能作为通过证据。
- 完成后用户体验是什么：用户看到可解释、可对照、可应用、可回滚的语义动作包。

## Current Architecture Problem

```text
Source image / action sheet
  -> crop action cell
  -> scale / translate / rotate whole image
  -> frame delta / loop closure check
  -> preview / apply
```

这个链路能让图片动起来，但不能证明动作符合用户直觉。它会产生：

- running 像左右滑动；
- success 像上下缩放；
- error 像晃动；
- need_input 依赖提示符号而不是姿态；
- sleeping 坐姿下沉而非真正睡觉。

## Current To Target Gap

| 当前架构条目 | 当前作用 | V30 目标条目 | 目标补强 |
| --- | --- | --- | --- |
| Source image / action sheet | 提供图片或动作格子。 | Action Semantics Spec | 先定义每个动作应表达什么。 |
| crop action cell | 裁切已有帧。 | Storyboard / Key-pose Contract | 明确关键姿势、节奏和禁止捷径。 |
| scale / translate / rotate whole image | 让图片产生运动感。 | Weak baseline rejection + semantic candidate routes | 整图变形只能用于对照和拒绝证明；合格动作必须来自高质量帧包、2D 分层 rig 或 provider key-pose 候选并通过 QA。 |
| frame delta / loop closure check | 证明帧有变化、循环不崩。 | Motion Readability QA | 检查整图变形、姿态多样性、重心、轮廓、语义、同猫一致性。 |
| preview / apply | 展示并应用资产。 | Visual Review + Approved-only Apply | 先展示旧弱动作对照和 QA 结果，再只允许 approved pack target-only apply。 |
| manual rollback | 依赖操作者恢复。 | Rollback Controller | 保留上一套可见资产并可回滚。 |

## Target Architecture

```text
Action Semantics Spec
  -> Storyboard / Key-pose Contract
  -> Candidate Frame Route
      -> Manual high-quality frame import route
      -> Local 2D part rig route
          -> head / body / forelegs / hindlegs / tail / ears / eyes
          -> action key poses
          -> part motion curves
      -> Provider key-pose candidate route
      -> Existing weak-pack baseline route
  -> Frame Normalizer
  -> Motion Readability QA
      -> whole-image-transform detector
      -> key-pose diversity scorer
      -> center-of-mass / anchor drift check
      -> limb / silhouette change check
      -> action semantic checklist
      -> loop closure / adjacent delta
      -> same-cat consistency
  -> Visual Review Queue
  -> Isolated Action Preview
  -> Approved-only Target Apply
  -> Rollback Controller
  -> Runtime Sprite Renderer
```

## Human Review Architecture View

| 层级 | 负责内容 | 人类应看到的效果 |
| --- | --- | --- |
| 语义层 | 8 个 core actions 的动作含义、关键姿势、禁止 shortcuts。 | 不读代码也能知道 running、success、error、need_input 应该长什么样。 |
| 候选层 | manual high-quality frame import、local 2D part rig、provider key-pose candidate、weak baseline comparison。 | 短期可用高质量帧包证明体验；中期以分层 rig 提升自然度；provider 只做候选；弱 baseline 只能用于对照。 |
| 规格化层 | 统一 `pet.json + frames/<action>/frame-###.png`。 | 后续 QA、预览、应用都面对稳定格式。 |
| QA 层 | transform-only detector、key-pose diversity、center-of-mass、silhouette、semantic checklist、loop、same-cat。 | 差动作被拒绝有理由，好动作通过有证据。 |
| 预览层 | storyboard、contact sheet、animated playback、old-vs-new comparison、QA table。 | 用户能快速判断“像不像真正宠物动作”。 |
| 应用层 | approved-only target apply、failed apply block、rollback。 | 合格包只影响目标宠物，失败包不能应用，可恢复。 |

## Detailed Target Architecture Blueprint

| Target Component | Inputs | Internal Responsibility | Outputs | User / Reviewer Experience |
| --- | --- | --- | --- | --- |
| Action Semantics Spec | 8 core action IDs: idle, thinking, running, success, warning, error, need_input, sleeping | Defines required body meaning, emotional intent, forbidden shortcuts, and active vs subtle motion expectations. | Per-action semantic checklist. | Reviewer can understand the expected pet behavior before seeing frames. |
| Storyboard / Key-pose Contract | Semantic checklist, candidate pack metadata | Records key poses, timing, loop/transient model, action-specific must-have and must-not-have traits. | Storyboard evidence and key-pose acceptance contract. | User can see why each action should read as running, success, error, or need_input. |
| Candidate Frame Route | Manual import, local 2D part rig output, provider key-pose candidate, weak baseline pack | Produces candidate frames only; no route can bypass QA or become final evidence by itself. Whole-image transform output is marked comparison-only. | Candidate action frames in a normalized folder shape. | Candidate origin is clear; weak baseline is visibly marked as comparison-only. |
| Local 2D Part Rig | Layered cat parts, action key poses, motion curves | Animates head, body, legs, tail, ears, and eyes through action-specific pose changes instead of transforming the whole image. | Rig-generated semantic frames exported to the same normalized pack format. | Motions can show running stride, success anticipation, error collapse, and need_input attention without sticker-like stiffness. |
| Frame Normalizer | Candidate frames and metadata | Converts candidate output to stable `pet.json` plus `frames/<action>/frame-###.png`; rejects malformed action coverage. | Normalized 8-action pack or stable reasonCode. | Preview and QA use a predictable format instead of route-specific assumptions. |
| Motion Readability QA | Normalized pack, storyboard, semantic checklist | Runs transform-only detection, key-pose diversity, center-of-mass, anchor drift, silhouette, loop, adjacent delta, same-cat, background and off-canvas checks. | Safe scores, pass/fail, reasonCodes, rejected baseline proof. | Weak motion is rejected for visible reasons; accepted motion has reviewable evidence. |
| Visual Review Queue | QA result, storyboard, normalized frames | Builds contact sheets, animated playback, old-vs-new comparison, action rubric, and final visual review decision. | Embedded HTML evidence and operator pass/fail. | Human reviewer can inspect one report and understand the decision without reading code. |
| Isolated Action Preview | Approved or candidate pack, safe renderer payload | Renders action playback without mutating CatStateMachine or sending PetEvent. | Non-mutating preview of each action. | User can safely compare motions before applying. |
| Approved-only Target Apply | Approved pack, target PetInstance, previous visible pack | Blocks failed packs; applies only approved pack to the selected target; preserves unrelated pets. | Target pet updated, previous pack retained. | User sees only the selected pet change and can trust failed assets are blocked. |
| Rollback Controller | Target PetInstance and preserved previous pack | Restores previous visible pack and leaves default/unrelated pets unchanged. | Restored target pet state. | User can undo the visual change if the new pack is not desired. |
| Runtime Sprite Renderer | Safe action ID, renderer kind, pack ID, playback intent, scale, visibility | Plays the approved sprite frames under runtime constraints. | Visible desktop pet animation. | User experiences readable, stable semantic pet actions at 1x and 0.75x. |

## Current-To-Target Contract

The target architecture keeps useful current capabilities but changes what
counts as acceptance evidence:

| Current Capability | Kept As | New Contract |
| --- | --- | --- |
| Existing action sheets and generated frames | Candidate input or weak baseline comparison | They must pass storyboard, QA, preview, and apply gates before acceptance. |
| Crop and frame extraction utilities | Normalizer support | Cropping cannot imply semantic quality. |
| Frame delta and loop closure checks | Low-level QA checks | They are necessary but not sufficient. |
| Whole-image transform scripts | Rejectable weak baseline and regression comparison | They cannot produce an approved semantic pack. |
| Preview UI / HTML report | Human review surface | It must embed old-vs-new visual proof, contact sheets, animated playback, and QA result. |
| Target apply / rollback model | Safe activation mechanism | It may apply only approved packs and must preserve target isolation and rollback. |

## Technical Route Priority

| Priority | Route | Why It Exists | Target Experience |
| --- | --- | --- | --- |
| P0 | Manual high-quality frame import | Provides the fastest reliable way to prove semantic motion quality with real frames. | 用户能看到真正逐帧动作，并通过同一 QA/预览/应用/回滚闭环。 |
| P1 | Local 2D part rig / layered rig | Reduces stiffness by moving cat parts with action-specific poses instead of warping the whole image. | running 有步态，success 有蓄力和庆祝，error 有塌落，need_input 有面向用户的姿态。 |
| P2 | Provider key-pose candidate | Can supply candidate poses but is not trusted as final proof. | provider 输出必须被本地 QA 接管，用户不会直接拿到未验收结果。 |
| Reject-only | Whole-image transform | Kept only to compare against and prove rejection. | 用户能看到这种弱动作为什么不再被接受。 |

## Target Data Flow

```text
Action ID
  -> semantic requirement
  -> storyboard key poses
  -> candidate frames
  -> normalized pack
  -> motion readability result
  -> visual review decision
  -> isolated preview
  -> approved-only target apply
  -> rollback-capable runtime state
```

The user-facing outcome of this flow is:

```text
readable pet action
  + visible old-vs-new comparison
  + clear pass/fail reason
  + safe target-only apply
  + rollback
```

## Component Responsibilities

### Action Semantics Spec

- Defines required motion meaning for 8 core actions.
- Defines minimum key poses and forbidden shortcuts.
- Converts vague “动作好看” into checkable criteria.

### Storyboard / Key-pose Contract

- Records action intent, key poses, timing, and loop/transient behavior.
- Requires running/success/error/need_input to have strong semantic poses.
- Defines what a reviewer should see.

### Candidate Frame Route

Produces candidate frames from one or more routes:

- Manual high-quality import route: allow user/imported frame packs if they pass QA.
- Local 2D part rig route: build controlled part-based animation using head,
  body, forelegs, hindlegs, tail, ears, eyes, action key poses, and motion
  curves.
- Provider key-pose route: use provider output only as candidate, never final
  evidence by itself.
- Existing weak-pack baseline route: used only for comparison and regression, not V30 passed evidence.

### Local 2D Part Rig

The local rig route is the preferred medium-term production route because it
avoids whole-image stiffness while keeping identity and motion under local
control.

It should model at least:

- body mass and squash/stretch within safe limits；
- head tilt and attention direction；
- foreleg and hindleg pose changes；
- tail balance and emotion；
- ear/eye micro-expression；
- action-specific timing curves；
- loop or transient recovery poses。

Rig output still has to pass the same normalizer, motion readability QA,
visual review, approved-only apply, and rollback gates.

### Motion Readability QA

Rejects candidates when:

- motion is mostly whole-image scale/translate/rotate;
- key-pose diversity is too low;
- action does not match semantic checklist;
- silhouette changes are too small for active actions;
- center-of-mass jumps without physical logic;
- loop closure fails;
- frame-to-frame jumps cause flicker;
- same-cat identity drifts;
- background or off-canvas problems exist.

### Visual Review Queue

- Produces contact sheets, animated previews, side-by-side old/new comparison.
- Records operator pass/fail without exposing raw photo, token, prompt, provider payload, full path, or private filename.

### Approved-only Target Apply

- Applies only QA-approved semantic animation packs.
- Affects only selected PetInstance.
- Leaves default and unrelated pets unchanged.
- Supports rollback to previous visible pack.

## Safe Data Boundary

Allowed renderer payload:

- safe action ID；
- renderer kind；
- safe pack ID；
- playback intent；
- scale；
- visibility。

Forbidden in renderer / evidence:

- raw PetEvent；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- prompt private text；
- token；
- Authorization；
- full local path；
- workspace path；
- config path；
- shell command；
- Petdex asset copy。

## V30 Architecture Exit

V30 target architecture is met only when at least one semantic 8-action pack passes:

- storyboard evidence；
- motion readability QA；
- visual review；
- isolated preview；
- target-only apply；
- rollback；
- final HTML with embedded visual proof。
