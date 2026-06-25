# V31.4 Layered 2D Rig Route Spec

文档状态：planned execution spec；V31.4 entry document。
当前日期：2026-06-24。

## Purpose

V31.4 defines a reusable 2D animation route that avoids stiff whole-image
transforms. The route may use a Spine-like, Live2D-like, or local layered-part
workflow, but final acceptance still requires normalized frames or a supported
runtime payload plus the same V31 QA.

## Rig Parts

Minimum recommended parts:

- body;
- head;
- front legs;
- back legs;
- tail;
- ears;
- eyes;
- mouth;
- optional markings or accessories.

## Motion Contract

Each action must describe which parts move and why:

| Action | Expected Motion |
| --- | --- |
| idle | subtle breathing, blink, tail/ear micro-motion |
| thinking | head tilt, eyes, ear attention, small body pause |
| running | leg cycle, body bob, tail counter-motion |
| success | anticipation, upward pose, expression change |
| warning | alert posture, ears/tail tension, visible caution |
| error | collapse/flinch/recovery, clear negative expression |
| need_input | direct attention, paw/head cue toward user |
| sleeping | breathing loop, closed eyes, relaxed posture |

## Export Contract

The route must export one of:

- normalized PNG frames matching the V31.2 pack contract;
- a supported runtime payload with a deterministic renderer and screenshot
  evidence;
- a blocked reason explaining why export cannot be validated.

## Development Tasks

1. Choose rig route: professional tool export, local layered renderer, or
   hybrid manual route.
2. Define part naming, pivots, anchor, canvas, and timing.
3. Define action storyboard and per-action motion curves.
4. Export to normalized frames or supported runtime payload.
5. Run semantic QA, visual QA, identity QA, timing QA, and small-scale
   readability review.

## Output Evidence

Create:

```text
docs/V31.x/evidence/v31_4-layered-rig-route-YYYY-MM-DD.md
```

Required sections:

- PRD/spec review.
- Rig route decision.
- Part inventory.
- Per-action motion table.
- Export result.
- QA and visual evidence.
- Claim/security scan.

## Pass / Block / Fail

- Pass: rig route is implementation-ready and can produce reviewable frames or
  a validated runtime payload.
- Blocked: required art parts or export tooling are unavailable.
- Failed: route depends primarily on whole-image transforms, cannot preserve
  identity, or cannot produce visual evidence.
