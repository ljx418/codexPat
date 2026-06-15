# V21 Target Architecture

文档状态：planned target architecture。  
当前日期：2026-06-14。

## Architecture Goal

V21 在 V20 provider motion-sheet blocked 的基础上增加 Route Orchestrator 和统一 QA/Preview/Apply 层。四条路线可以并行开发，但必须归一化到同一套安全动画包合同。

## Current Architecture

```text
User Cat Photos
  -> MiniMax Reference-image Provider
  -> Provider Image Output
  -> 8x9 Motion Sheet Normalizer
  -> Motion QA
  -> Preview / Apply / Rollback
```

V20 blocked point:

```text
Provider Image Output != valid 8x9 same-cat motion sheet
```

## V21 Target Architecture

```text
User Cat Photos
  -> Consent / Credential / Disclosure Gate
  -> Route Orchestrator
      -> Route A: Provider key-pose extractor
      -> Route B: Alternate provider probe / smoke
      -> Route C: Unified identity local rig generator
      -> Route D: Image-to-video frame extractor
  -> Safe Asset Candidate Store
  -> Common Normalizer
  -> Common Motion / Same-cat / Background QA
  -> Isolated Action Preview
  -> Target Apply / Rollback Controller
  -> Runtime Sprite Renderer
```

## Common Animation Pack Contract

Every route must output the same app-managed structure:

```text
pet.json
frames/
  idle/*.png
  thinking/*.png
  running/*.png
  success/*.png
  warning/*.png
  error/*.png
  need_input/*.png
  sleeping/*.png
LICENSE / attribution metadata if applicable
```

Allowed runtime renderer input:

- safe action ID；
- renderer kind；
- safe pack ID；
- playback intent；
- scale；
- visibility。

Forbidden runtime/preview payload:

- raw provider response；
- raw photo bytes；
- prompt private text；
- token；
- Authorization；
- full local path；
- workspace path；
- config path；
- shell command；
- raw HTTP payload。

## Route Responsibilities

| Route | Input | Output | Main Risk | Stop Condition |
| --- | --- | --- | --- | --- |
| A | V20/MiniMax key-pose images | frameSequence pack | 姿势不足、同猫漂移 | fewer than 8 actions or QA failed |
| B | provider matrix + optional smoke | capability decision / provider output | 费用/隐私/不可用 | no consent/credential/capability |
| C | canonical cat image | local rig-generated frames | 视觉僵硬 | action amplitude/readability failed |
| D | video output or fixture | extracted frames pack | 背景/漂移/循环失败 | stabilization/background/loop failed |

## Evidence Architecture

Each route must emit:

- route status: passed / blocked / failed / excluded；
- safe input summary；
- safe output metadata；
- QA score table；
- preview screenshot/contact sheet；
- apply/rollback result if route passed；
- redaction scan；
- claim scan。

V21 final must include side-by-side route comparison HTML so the operator can see actual results.
