# V21.3 Route C Unified Character Local 2D Rig Spec

文档状态：planned route spec。  
当前日期：2026-06-14。

## Goal

Route C 用一张统一猫身份图作为源，走本地可控的 2D rig/procedural animation。它优先保证同猫、透明背景、首尾闭合和动作连续性，再追求自然程度。

## Rig Model

The local rig must define safe parts:

- body；
- head；
- leftEar / rightEar；
- tail；
- frontPaws；
- rearPaws；
- eyes；
- mouth / expression layer；
- optional whiskers。

No arbitrary script, shader, shell command, remote URL, or runtime code can be embedded in the pack.

## Action Template Requirements

| Action | Required Motion |
| --- | --- |
| idle | breathing, blink or tail sway |
| thinking | head tilt / eye focus / tail pause |
| running | paw cycle and body lean |
| success | bounce / happy tail |
| warning | ears back / alert pose |
| error | slump / shake / red-safe accent if available |
| need_input | look up / paw raise |
| sleeping | curled/settled breathing |

## Frame Rules

- base/loop actions: at least 6 frames；
- transient actions: at least 3 frames；
- first/final frame closure for loop actions；
- no abrupt anchor jump；
- no frame exceeds canvas boundary；
- no transparent-only frame。

## Stable ReasonCodes

- source_identity_missing
- segmentation_failed
- rig_anchor_missing
- action_template_missing
- motion_amplitude_too_low
- frame_delta_too_high
- loop_closure_failed
- off_canvas_frame
- pack_assembly_failed
- qa_failed
- route_c_passed

## Acceptance

Route C passes only if:

- one local identity source produces all 8 core actions；
- generated pack passes common V21 QA；
- route comparator shows visibly stronger result than previous static/local transform baseline；
- preview/apply/rollback can use the pack without live state mutation before apply。

## Evidence

Evidence file:

`docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-YYYY-MM-DD.md`

Must include:

- source identity safe summary；
- rig part list；
- action template table；
- generated contact sheet；
- QA result；
- redaction scan；
- claim scan。
