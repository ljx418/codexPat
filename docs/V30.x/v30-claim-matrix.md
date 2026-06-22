# V30 Claim Matrix

文档状态：planned claim boundary。
当前日期：2026-06-17。

## Allowed Claims

| Scope | Allowed Claim | Evidence Required |
| --- | --- | --- |
| V30.0 | V30 semantic animation quality scope frozen with claim boundaries. | V30.0 evidence |
| V30.1 | V30 action storyboard and key-pose contract completed for 8 core actions. | V30.1 evidence |
| V30.2 | V30 semantic frame candidate generation produced tested local 8-action candidates. | V30.2 evidence |
| V30.3 | V30 motion readability QA rejected transform-only assets and accepted tested semantic candidates. | V30.3 evidence |
| V30.4 | V30 semantic animation preview passed for tested old-vs-new comparison scenarios. | V30.4 evidence |
| V30.5 | V30 approved semantic animation pack target apply and rollback passed for tested local scenario. | V30.5 evidence |
| V30.6 | V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence. | V30.0-V30.5 evidence + final gate |

## Blocked Claims

Use these when evidence fails:

```text
V30 semantic animation quality remains blocked because no tested candidate produced readable 8-action character animation.
```

```text
V30 candidate generation remains blocked because available outputs were motion effects rather than semantic character animation.
```

## Forbidden Claims

Do not claim:

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- automatic photo-to-2D ready for all arbitrary cats；
- provider integration verified；
- low-retry provider reliability；
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

## Anti-overclaim Rules

- Passing frame delta does not imply action readability.
- Passing loop closure does not imply semantic animation quality.
- A provider output cannot be called product-ready until V30 QA and visual review pass.
- Old transform-based V16/V29 packs may be used only as weak baseline comparison.
