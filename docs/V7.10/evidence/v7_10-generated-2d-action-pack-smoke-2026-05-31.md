# V7.10 Generated 2D Action Pack Smoke

status: passed
date: 2026-05-31

## Scope

Generate a full MiniMax-based 2D action image set, convert it to PNG sprite frames, and assemble a local asset pack manifest.

This evidence does not claim runtime activation, automatic photo-to-3D, broad 3D readiness, provider integration verified, or production release readiness.

## Results

```json
[
  {
    "name": "desktop MiniMax boundary tests",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "desktop typecheck",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "generate idle",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert idle to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature idle",
    "result": "passed",
    "details": "{\"fileName\":\"idle.png\",\"byteLength\":754415,\"sha256\":\"aa9dca8d7bc25eec\"}"
  },
  {
    "name": "generate thinking",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert thinking to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature thinking",
    "result": "passed",
    "details": "{\"fileName\":\"thinking.png\",\"byteLength\":761277,\"sha256\":\"e8589ced6af6e6f9\"}"
  },
  {
    "name": "generate running",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert running to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature running",
    "result": "passed",
    "details": "{\"fileName\":\"running.png\",\"byteLength\":444964,\"sha256\":\"260ae3a0e35a770d\"}"
  },
  {
    "name": "generate success",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert success to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature success",
    "result": "passed",
    "details": "{\"fileName\":\"success.png\",\"byteLength\":745141,\"sha256\":\"ef77a3a78d4a2281\"}"
  },
  {
    "name": "generate warning",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert warning to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature warning",
    "result": "passed",
    "details": "{\"fileName\":\"warning.png\",\"byteLength\":746503,\"sha256\":\"2dcba5fbf5c8f8a1\"}"
  },
  {
    "name": "generate error",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert error to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature error",
    "result": "passed",
    "details": "{\"fileName\":\"error.png\",\"byteLength\":673895,\"sha256\":\"a1c0c130e9513ce0\"}"
  },
  {
    "name": "generate need_input",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert need_input to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature need_input",
    "result": "passed",
    "details": "{\"fileName\":\"need_input.png\",\"byteLength\":806339,\"sha256\":\"028b729fb7ab8b12\"}"
  },
  {
    "name": "generate sleeping",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "convert sleeping to png",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "png signature sleeping",
    "result": "passed",
    "details": "{\"fileName\":\"sleeping.png\",\"byteLength\":649136,\"sha256\":\"0a813fa4224cf5c3\"}"
  },
  {
    "name": "manifest core action coverage",
    "result": "passed",
    "details": "{\"packId\":\"v7-10-minimax-orange-tabby-actions\",\"rendererKind\":\"sprite\",\"actionCount\":8,\"missing\":[]}"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "summary contains no token, Authorization, raw prompt, raw provider response, local path, workspace path, config path, or api-token.json"
  }
]
```

## Output

- Pack directory: `fixtures/manual/v7_10/minimax_action_pack`
- Manifest: `fixtures/manual/v7_10/minimax_action_pack/manifest.json`

## Security Scan

Passed for recorded summaries.

Evidence excludes token, Authorization, raw prompt, raw provider request, raw provider response, source photo, EXIF/GPS, full local path, workspace path, config path, and api-token.json.

## Final Decision

Passed for generated 2D action pack assembly. Runtime activation remains V7.12/V7.13 scope unless separately accepted.
