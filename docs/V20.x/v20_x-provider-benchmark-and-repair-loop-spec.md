# V20 Provider Benchmark and Repair Loop Spec

文档状态：planned benchmark spec；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Why This Spec Exists

V20 cannot assume MiniMax will reliably generate high-quality same-cat motion
sheets from a single request. This spec changes V20.2 from a one-off smoke into
a small real-data benchmark with bounded retries and reasonCode-driven prompt
repair.

## Benchmark Dataset

Minimum dataset:

- At least 3 user-provided cat photos if available.
- If fewer than 3 are available, V20.2 must record `sample_size_limited` and
  cannot claim low-retry reliability.
- Each photo must pass V18/V20 local intake rules: safe media type, size bucket,
  dimensions, no EXIF/GPS persistence, no full local path in evidence.

Recommended sample diversity:

- One front-facing cat portrait.
- One side or three-quarter pose.
- One different fur pattern or color.

Evidence must record only:

- sampleId.
- media type.
- size bucket.
- dimensions.
- selected state.
- consent state.

Evidence must not record:

- original filename.
- full local path.
- raw photo bytes.
- EXIF/GPS.
- private prompt text.

## Prompt Variants

V20.2 must test at least 3 prompt variants before choosing a default:

1. `strict_grid_motion_sheet`
   - Exact 8 rows x 9 columns.
   - Transparent background.
   - No labels, no borders.

2. `character_animation_sheet`
   - Emphasizes same-cat identity, markings, face, proportions.
   - Still requests exact grid.

3. `high_amplitude_sprite_sheet`
   - Emphasizes visible motion, exaggerated but non-deforming action poses.
   - Still requests exact grid and transparent background.

## Attempt Budget

Default attempt budget:

- Max 2 attempts per prompt variant per sample.
- Max 6 provider calls per sample.
- Max total calls for V20.2 benchmark: 18 for 3 samples.

The implementation may lower the call count for cost reasons, but then evidence
must record `budget_limited` and must not claim low-retry reliability.

## QA-driven Repair Loop

The second attempt for a prompt variant must be based on the first attempt's
QA failure reasonCode. It must not blindly retry the same prompt.

Repair mapping:

| QA reasonCode | Repair instruction |
| --- | --- |
| `provider_output_not_single_sheet` | emphasize one single image, exact 8 rows x 9 columns, no separate panels |
| `background_gate_failed` | emphasize transparent background, isolated cat, no scene, no floor shadow |
| `same_cat_qa_failed` | emphasize preserve face, fur color, markings, eye shape, ear shape, body proportions |
| `motion_amplitude_too_low` | emphasize larger leg/body/head/tail pose differences and readable action silhouettes |
| `loop_closure_failed` | emphasize first and final frames of loop rows should match smoothly |
| `adjacent_frame_jump` | emphasize smooth in-between frames and stable body position |
| `off_canvas_frame` | emphasize centered subject and full body visible in every cell |
| `watermark_or_label_detected` | emphasize no labels, no text, no watermark, no row names, no borders |

## Success Metrics

V20.2 benchmark can claim provider candidate quality only if:

- At least 3 samples are attempted, unless explicitly limited.
- At least 2 of 3 samples produce an accepted sheet within max 6 calls per sample.
- Median accepted-attempt count is less than or equal to 4 provider calls.
- All accepted sheets pass V20.3/V20.4 gates before V20.5.

If fewer samples are available:

- 1 sample pass can support only a scoped smoke claim.
- It cannot support "low retry" or "reliable provider candidate" language.

## Final Decision Labels

V20.2 must output one of:

- `provider_benchmark_passed`
- `provider_smoke_passed_sample_limited`
- `provider_benchmark_blocked`
- `provider_benchmark_failed`
- `provider_budget_limited`

## Evidence Requirements

V20.2 evidence must include:

- sample count.
- prompt variants tested.
- attempt counts.
- reasonCode table.
- accepted output count.
- median accepted-attempt count if at least 2 accepted samples exist.
- rejected reason summary.
- security scan result.
- claim scan result.

