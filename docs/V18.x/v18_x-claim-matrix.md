# V18 Claim Matrix

日期：2026-06-12  
状态：V18.0-V18.6 passed scoped。

## Allowed Claims

| Phase | Allowed Claim |
| --- | --- |
| V18.0 | V18 user-photo-to-multi-action 2D workflow scope frozen with claim boundaries. |
| V18.1 | V18 reference photo consent and provider boundary passed for tested local UI scenarios. |
| V18.2 | V18.2 MiniMax reference-image provider capability and one tested local reference-image job passed. |
| V18.3 | V18 identity-locked multi-action 2D pack assembly passed for the tested local MiniMax image-to-image scenario. |
| V18.4 | V18 same-cat source-hash and continuity QA gate passed for the tested identity-locked 2D action pack scenario. |
| V18.5 | V18 in-app action preview, target apply, and rollback passed for the tested identity-locked 2D action pack scenario. |
| V18.6 | V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local image-to-image provider scenario with in-app preview, target apply, and rollback. |

## Conditional / Blocked Claims

| Situation | Required Wording |
| --- | --- |
| Provider does not support reference image | V18 image-to-image provider branch blocked because provider reference-image capability was not available. |
| Provider output missing | V18 final blocked on provider_output_missing. |
| Same-cat QA fails | V18 final failed on same-cat continuity QA; generated pack was not applied. |
| Identity lock missing or inconsistent | V18 final failed on identity-lock QA; generated pack was not applied. |
| Only V17 action-sheet import works | V18 remains blocked; V17 action-sheet import cannot substitute for V18 local photo generation evidence. |

## Forbidden Claims

The following claims must only appear in forbidden / not-ready / not-implied contexts:

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- cross-platform ready
- Windows ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified
