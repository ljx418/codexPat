# V16.2 Provider Multi-action Generation Evidence

status: passed
date: 2026-06-11
phase: V16.2 Real Provider Multi-action Generation Smoke

## Provider Summary

| Field | Value |
| --- | --- |
| providerKind | host_image_tool |
| providerName | Host ChatGPT/Codex image tool |
| modelFamily | host image generation tool |
| sourceImageDigest | 7ddbce886748c69b |
| actionCount | 8 |
| totalFrameCount | 36 |
| contactSheetFile | v16_host_image_tool_orange_tabby_contact_sheet.png |

## Action Frame Summary

| actionId | frameCount | firstFinalDelta | maxAdjacentDelta | alphaCoverage |
| --- | ---: | ---: | ---: | ---: |
| idle | 6 | 0 | 4.9911 | 1 |
| thinking | 6 | 0 | 5.0365 | 1 |
| running | 6 | 0 | 5.5454 | 1 |
| success | 3 | 0 | 5.313 | 1 |
| warning | 3 | 0 | 5.2503 | 1 |
| error | 3 | 0 | 5.2078 | 1 |
| need_input | 3 | 0 | 5.2988 | 1 |
| sleeping | 6 | 0 | 4.3192 | 1 |

## Evidence Assets

- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_action_sheet.png
- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_contact_sheet.png
- docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_summary.json

## Security Boundary

The evidence stores safe file names, digests, frame counts, and action IDs only. It does not record raw provider payload, raw prompt, raw photo bytes, credential values, Authorization headers, config path, workspace path, or full local paths.

## Allowed Claim

V16 named-provider 2D multi-action generation smoke passed for the tested local cat-photo scenario using the host ChatGPT/Codex image tool.
