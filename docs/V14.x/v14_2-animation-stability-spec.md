# V14.2 Animation Stability Spec

日期：2026-06-09  
状态：planned。  

## Objective

Prevent repeated 2D animation quality regressions: flicker, loop-open frames, fallback flashing, blank frames, transparent frames, off-canvas frames, sudden jumps, unsafe files, and confusing asset names.

## AnimationPackLinter Requirements

The linter must validate:

- core action coverage.
- frame count and fps.
- first/final rendered frame match for loop actions.
- frame dimensions are consistent.
- frames are nonblank.
- frames are not fully transparent.
- bounding box stays within canvas.
- file names are safe.
- no remote URL.
- no absolute path.
- no path traversal.
- no script or executable-like fields.
- no event handler.
- no external href.
- no token, Authorization, prompt text, provider payload, raw local path, workspace path, or config path.

## CLI

Planned command:

```bash
node packages/petctl/dist/cli.js asset lint --manifest <path> --json
```

Output must include only:

- `ok`
- `exitCode`
- `packId`
- `rendererKind`
- `coverageState`
- `reasonCodes`
- sanitized action summary

Output must not include raw SVG, raw GLTF JSON, full local path, raw provider payload, token, Authorization, prompt text, or script source.

## Runtime Stability

- renderer must use decoded frame cache.
- action switching must not display old pack or fallback for one frame.
- invalid activation preserves previous active pack.
- missing/corrupt runtime asset uses visible fallback.

## Acceptance Fixtures

Required rejected fixtures:

- remote URL
- absolute path
- path traversal
- script field
- event handler
- external href
- shell command
- raw provider payload
- prompt text
- token / Authorization
- raw local path
- loop-open frames
- mismatched dimensions
- blank frame
- fully transparent frame
- off-canvas frame
