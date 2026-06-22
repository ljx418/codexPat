# V30 Target Architecture

文档状态：planned target architecture。
当前日期：2026-06-17。

## Architecture Goal

V30 将资产生产链路从“图片补帧 / 整图形变”升级为“动作语义驱动的角色动画资产生产与验收”。

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

## Target Architecture

```text
Action Semantics Spec
  -> Storyboard / Key-pose Contract
  -> Candidate Frame Route
      -> Provider key-pose route
      -> Local 2D rig route
      -> Manual high-quality frame import route
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

- Provider key-pose route: use provider output only as candidate, never final evidence by itself.
- Local 2D rig route: build controlled part-based animation when provider output is weak.
- Manual high-quality import route: allow user/imported frame packs if they pass QA.
- Existing weak-pack baseline route: used only for comparison and regression, not V30 passed evidence.

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
