# V20 Claim Matrix

文档状态：planned claim matrix；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Allowed Claims

| Condition | Allowed Claim |
| --- | --- |
| V20.0 passed | V20 mainland provider motion-sheet scope frozen with MiniMax as P0 candidate and V19 local sheet as fallback baseline. |
| V20.1 passed | V20 provider consent, credential, disclosure, and redaction boundary passed for tested local provider setup scenarios. |
| V20.2 one-sample smoke passed | V20 MiniMax reference-image motion-sheet live smoke passed for the tested local cat photo scenario. Low-retry reliability is not claimed. |
| V20.2 benchmark passed with at least 3 samples | V20 MiniMax reference-image motion-sheet benchmark passed for the tested local cat photo sample set with bounded retries. |
| V20.2 blocked | V20 MiniMax provider motion-sheet branch blocked; no provider generation claim is made. |
| V20.3 passed | V20 provider motion-sheet output normalization and background gate passed for tested accepted output. |
| V20.4 passed | V20 motion amplitude, same-cat, loop closure, and readability QA passed for tested accepted output. |
| V20.5 passed | V20 provider-generated motion-sheet preview, target apply, and rollback passed for tested local scenario. |
| V20.6 passed | V20 mainland provider photo-to-motion-sheet workflow passed for the tested MiniMax reference-image motion-sheet scenario with QA, preview, target apply, and rollback. |

## Fallback Claim If Provider Branch Blocks

```text
V20 MiniMax provider motion-sheet branch blocked; V19 local motion-sheet workflow remains the accepted fallback baseline.
```

## Forbidden Claims

V20 must not claim:

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- automatic photo-to-2D ready for arbitrary cats
- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified
