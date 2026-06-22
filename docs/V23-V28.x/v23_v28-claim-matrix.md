# V23-V28 Claim Matrix

文档状态：V23-V28 accepted scoped claim matrix。
当前日期：2026-06-16。

## Allowed Claims

The claims below are accepted only at their evidence-matched scoped boundaries.
They must not be expanded beyond the matching phase evidence.

| Stage | Allowed Claim | Required Evidence |
| --- | --- | --- |
| V23 | V23 photo suitability and safe trait extraction passed for tested local photo fixtures. | V23 evidence |
| V24 | V24 multi-route generation orchestration passed for tested local route scenarios. | V24 evidence |
| V25 | V25 same-cat and motion QA passed for tested candidate assets. | V25 evidence |
| V26 | V26 auto-pack, preview, target apply, and rollback passed for tested approved candidate assets. | V26 evidence |
| V27 | V27 retry, cost, and route guidance passed for tested repeated-failure scenarios. | V27 evidence |
| V28 | V23-V28 photo-to-animated-2D workflow passed for tested local photo intake, multi-route candidate generation, QA rejection, preview, target apply, and rollback scenarios. | `docs/V23-V28.x/v28-final-acceptance-report.md` |

## Blocked Claims

If no route produces an approved candidate:

```text
V23-V28 photo-to-animated-2D workflow remains blocked because no tested route produced an approved candidate; rejected candidates were preserved and not applied.
```

If provider capability is unavailable:

```text
Provider-backed route remains blocked; local/fallback routes remain available for tested scenarios.
```

## Forbidden Claims

Do not claim:

- automatic photo-to-2D ready for arbitrary cats；
- arbitrary cats automatic photo-to-animation ready；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- remote asset loading ready；
- asset marketplace ready；
- production signed release ready；
- notarized release ready；
- auto update ready；
- Windows ready；
- cross-platform ready；
- OS-level Codex window binding ready；
- all Codex workflows verified；
- MCP ready；
- Third-party agent integration verified；
- Claude Code integration verified。
