# V22 Target Architecture

文档状态：scoped accepted target architecture。  
阶段主题：Asset Quality Review & Rejection Gate。  
当前日期：2026-06-15。

## Architecture Goal

V22 adds a mandatory review gate between generated candidate assets and user-visible application. The system must reject poor results before they enter the installable gallery, live pet runtime, or final acceptance evidence.

## Current Architecture Gap

V21 target architecture:

```text
User Cat Photos / Provider Outputs
  -> Route Orchestrator
  -> Safe Asset Candidate Store
  -> Common Normalizer
  -> Common Motion / Same-cat / Background QA
  -> Isolated Action Preview
  -> Target Apply / Rollback Controller
```

Observed gap after user visual review:

```text
Technical candidate pack exists
  !=
Product-quality lovable pet asset
```

The V21 premium pixel output had eight GIF actions and drift controls, but the user rejected it as visually ugly. Therefore V22 introduces quality rejection as architecture, not a manual afterthought.

## V22 Target Flow

```text
Photo / Provider / Local Route Output
  -> Candidate Asset Store
  -> Normalization
  -> Technical QA Gate
  -> Motion QA Gate
  -> Visual Quality Review Gate
  -> Approved Asset Registry
  -> Isolated Preview
  -> Target Apply / Rollback
```

## Gate Responsibilities

| Gate | Responsibility | Blocks |
| --- | --- | --- |
| Candidate Asset Store | stores raw candidate metadata and safe asset copies | direct runtime mutation |
| Normalization | converts output to app-managed action pack | raw provider/runtime payload |
| Technical QA | frame/action/security/integrity checks | blank, off-canvas, missing action, path/URL/script |
| Motion QA | action readability and continuity checks | weak motion, flicker, drift, loop break |
| Visual Review | operator/user acceptance and appeal threshold | ugly, inconsistent, not installable |
| Approved Registry | only approved packs become installable | unreviewed pack activation |

## Status Model

```text
generated
normalized
technical_failed
motion_failed
visual_review_required
visual_rejected
approved
applied
rollback_available
```

Only `approved` can apply to a PetInstance.

## Retry and Route Switch Model

```text
candidate rejected
  -> reasonCode classification
  -> repair prompt / local repair / route switch decision
  -> retry budget check
  -> retry or show user guidance
```

Default budget:

- per route: 2 attempts；
- total candidate attempts: 6；
- same reason repeated twice: repair strategy required；
- repeated failure after budget: stop and ask user for better photo or different route。

## Safe Data Boundary

Allowed evidence fields:

- safe candidate ID；
- safe route name；
- action coverage summary；
- frame count bucket；
- QA score bucket；
- reasonCode；
- approved/rejected status；
- sanitized user guidance；
- safe screenshot/contact sheet path in project evidence。

Forbidden evidence/runtime fields:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- prompt private text；
- private filename；
- workspace path；
- config path；
- api-token.json；
- shell command。

## Runtime Safety Rule

The live renderer must never receive rejected candidates. Renderer input remains:

- safe action ID；
- renderer kind；
- safe pack ID；
- playback intent；
- scale；
- visibility。

## Architecture Exit Condition

V22 architecture is accepted only if final evidence proves:

- a known ugly candidate is rejected；
- a known broken/weak-motion candidate is rejected；
- an approved candidate can preview/apply target-only；
- rejected candidates cannot apply；
- rollback preserves previous visible pack。
