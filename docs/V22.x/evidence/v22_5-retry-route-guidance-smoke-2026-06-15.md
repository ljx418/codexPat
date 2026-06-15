# V22.5 Retry and Route Guidance

status: passed
date: 2026-06-15

| Check | Result |
| --- | --- |
| retry status | budget_exhausted |
| reasonCodes | retry_budget_exceeded, cat_not_cute_enough, provider_output_unusable |
| guidance | 多次失败：请上传单猫、正脸、清晰、无遮挡、背景简单的照片。 / 视觉吸引力不足：请换风格模板、换路线，或重新选择更清晰的猫图。 / 当前 provider 输出不可用：建议切换 provider、local rig 或 motion sheet 路线。 |

## Security

Evidence contains no token, Authorization header, raw provider response, raw
HTTP payload, raw photo bytes, EXIF/GPS, private filename, full local path,
workspace path, config path, or api-token.json.

## Claim Boundary

This evidence does not claim Petdex parity, provider integration verified, or
arbitrary cats automatic photo-to-animation ready.
