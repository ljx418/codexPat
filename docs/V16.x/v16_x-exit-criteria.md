# V16 Exit Criteria

状态：passed scoped。  
日期：2026-06-11。

## V16 May Pass Only If

- V16.0-V16.5 have explicit passed evidence.
- A named provider produced accepted multi-action 2D frames for one tested local cat-photo scenario.
- All 8 core actions meet frame-count requirements.
- Same-cat consistency review passed.
- V15.12 continuity assembly passed.
- Desktop Manager preview/apply/rollback passed.
- Default and unrelated pets were unchanged.
- Security, claim, license, and regression scans passed.
- Final HTML embeds real screenshots/contact/runtime evidence.

## Hard Fail

- provider output contains only static single image.
- any core action missing.
- first/final mismatch remains after assembly.
- adjacent-frame delta exceeds threshold.
- raw photo/prompt/provider/token/path leaks.
- invalid generated pack changes active pet.
- final report claims arbitrary automatic photo-to-2D readiness.

## Narrowed / Blocked Exit

If provider generation is unavailable or rejected, V16 may only produce a blocked
report or a narrowed local/import-ready claim. It cannot pass the provider-backed
final gate.

## V16.6 Exit Decision

V16.6 passed for the tested host ChatGPT/Codex image tool scenario. The exit
does not permit arbitrary-cat automatic readiness, broad provider integration,
3D readiness, production release readiness, Windows readiness, or cross-platform
readiness.
