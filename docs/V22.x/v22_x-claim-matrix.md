# V22 Claim Matrix

文档状态：scoped accepted claim matrix。  
当前日期：2026-06-15。

## Allowed Claims

| Scope | Allowed Claim | Required Evidence |
| --- | --- | --- |
| V22.0 | V22 asset quality review gate scope frozen with claim boundaries. | scope freeze evidence |
| V22.1 | V22 candidate quality schema passed for tested local fixtures. | schema smoke |
| V22.2 | V22 technical QA gate rejects unsafe or structurally invalid candidate packs. | technical QA evidence |
| V22.3 | V22 motion QA gate rejects weak, drifting, flickery, or unreadable action packs. | motion QA evidence |
| V22.4 | V22 visual review UX can reject visually unacceptable candidates before apply. | visual review evidence |
| V22.5 | V22 retry and route guidance passed for tested repeated-failure scenarios. | retry guidance evidence |
| V22.6 | V22 approved-only target apply and rollback enforcement passed for tested local candidates. | apply evidence |
| V22.7 | V22 asset quality review gate passed for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios. | final evidence |

## Conditional / Blocked Claims

If no candidate passes visual review:

```text
V22 asset quality review gate blocked because no candidate met product visual acceptance; rejected candidates were preserved as evidence and not applied.
```

If QA implementation exists but runtime apply enforcement fails:

```text
V22 quality review implementation failed because non-approved candidate apply was possible.
```

## Forbidden Claims

Do not claim:

- Petdex parity achieved；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- arbitrary cats automatic photo-to-animation ready；
- automatic photo-to-2D ready for arbitrary cats；
- automatic photo-to-3D ready；
- 3D ready；
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
