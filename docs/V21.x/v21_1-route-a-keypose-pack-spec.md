# V21.1 Route A Key-pose to Local Animation Pack Spec

文档状态：planned route spec。  
当前日期：2026-06-14。

## Goal

Route A 尝试把 V20/MiniMax 或同类 provider 输出中的“可用关键姿势”转化为项目安全的 8 core action frameSequence pack。它不要求 provider 直接返回 8x9 sheet，而是由本地系统完成姿势筛选、裁切、对齐、动作映射和补帧。

## Accepted Inputs

- V20 provider output images under documented evidence/assets directory；
- new consented provider outputs with safe metadata；
- local app-managed test copies of provider outputs。

Forbidden inputs:

- raw provider response body；
- raw HTTP payload；
- full local path in evidence；
- private filename；
- token / Authorization；
- raw photo bytes；
- prompt private text。

## Processing Pipeline

```text
provider output image
  -> safe image metadata scan
  -> candidate pose detection / manual-safe region proposal
  -> crop candidates
  -> background safety check
  -> same-cat visual grouping
  -> action mapping
  -> alignment / anchor normalization
  -> frame interpolation or hold-frame expansion
  -> app-managed pet.json + frames pack
  -> common V21 QA
```

## Minimum Action Mapping

Route A must map or synthesize all 8 core actions:

- idle
- thinking
- running
- success
- warning
- error
- need_input
- sleeping

If fewer than 8 actions can be mapped, status must be blocked with `action_mapping_incomplete`.

## Stable ReasonCodes

- provider_output_missing
- output_not_keypose_material
- pose_detection_failed
- action_mapping_incomplete
- background_not_safe
- same_cat_failed
- alignment_failed
- interpolation_failed
- pack_assembly_failed
- qa_failed
- route_a_passed

## Acceptance

Route A passes only if:

- all 8 actions exist in an app-managed pack；
- no blank / transparent / off-canvas frames；
- same-cat grouping accepted；
- motion amplitude visibly exceeds static jitter；
- frame continuity and loop closure pass；
- isolated preview shows all actions；
- target-only apply and rollback pass if used for V21.6。

## Evidence

Evidence file:

`docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-YYYY-MM-DD.md`

Must include:

- safe input summary；
- pose/action mapping table；
- rejected/accepted crop summary；
- generated pack safe ID；
- QA summary；
- contact sheet or embedded preview screenshot；
- redaction scan；
- claim scan。
