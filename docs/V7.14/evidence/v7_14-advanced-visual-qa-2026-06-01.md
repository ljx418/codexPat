# V7.14 Advanced Visual QA Smoke

status: passed
date: 2026-06-01

## Scope

This evidence covers only the V7.13 accepted paths:

- generated 2D local sprite action pack.
- external GLB/GLTF import runtime screenshots.

It does not cover or claim provider 3D visual QA because V7.13 recorded the real provider 3D branch as blocked.

## Visual Evidence

- generated 2D action contact sheet: `docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.png`
- generated 2D action contact sheet HTML: `docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.html`
- GLB 1x runtime screenshot: `docs/V7.12/evidence/v7_12-shared-gltf-1x-final-2026-06-01.png`
- GLB 0.75x runtime screenshot: `docs/V7.12/evidence/v7_12-shared-gltf-075-final-2026-06-01.png`
- corrupt GLB fallback screenshot: `docs/V7.12/evidence/v7_12-corrupt-gltf-fallback-2026-06-01.png`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| V7.13 accepted path evidence present | passed | V7.13 passed scoped and provider 3D branch is blocked |
| generated 2D action visible: idle | passed | fileName=idle.png; byteLength=754415; width=1024; height=1024 |
| generated 2D action visible: thinking | passed | fileName=thinking.png; byteLength=761277; width=1024; height=1024 |
| generated 2D action visible: running | passed | fileName=running.png; byteLength=444964; width=1024; height=1024 |
| generated 2D action visible: success | passed | fileName=success.png; byteLength=745141; width=1024; height=1024 |
| generated 2D action visible: warning | passed | fileName=warning.png; byteLength=746503; width=1024; height=1024 |
| generated 2D action visible: error | passed | fileName=error.png; byteLength=673895; width=1024; height=1024 |
| generated 2D action visible: need_input | passed | fileName=need_input.png; byteLength=806339; width=1024; height=1024 |
| generated 2D action visible: sleeping | passed | fileName=sleeping.png; byteLength=649136; width=1024; height=1024 |
| generated 2D action contact sheet html | passed | isolated local HTML evidence created |
| generated 2D action contact sheet screenshot | passed | screenshot captured |
| generated 2D screenshot nonblank | passed | nonblank PNG smoke |
| imported GLB/GLTF screenshot nonblank: v7_12-shared-gltf-1x-final-2026-06-01.png | passed | nonblank PNG smoke |
| imported GLB/GLTF screenshot nonblank: v7_12-shared-gltf-075-final-2026-06-01.png | passed | nonblank PNG smoke |
| imported GLB/GLTF screenshot nonblank: v7_12-corrupt-gltf-fallback-2026-06-01.png | passed | nonblank PNG smoke |
| renderer input snapshot safe fields only | passed | fields=actionId,packId,playbackIntent,profileId,rendererKind,scale,visibility |
| CPU/memory baseline recorded | passed | cpuBaseline=not-enforced; heapUsedMb=5; rssMb=41 |
| scale coverage | passed | 1x and 0.75x GLB runtime screenshots reviewed from V7.12 accepted evidence |
| fallback coverage | passed | corrupt GLB fallback screenshot reviewed from V7.12 accepted evidence |
| target isolation carried from V7.13 | passed | default and unrelated pets unchanged in V7.13 orchestration evidence |
| agent visual acceptance recorded | passed | isolated screenshots are nonblank; generated actions and GLB screenshots are retained for operator review |
| security redaction scan | passed | summary contains no token, Authorization, raw photo, raw provider response, prompt text, full local path, workspace path, config path, raw manifest chunk, or raw GLTF chunk |

## Renderer Input Snapshot

```json
{
  "actionId": "running",
  "rendererKind": "sprite",
  "profileId": "v7-13-generated-2d",
  "packId": "v7-10-minimax-orange-tabby-actions",
  "playbackIntent": "loop",
  "scale": 1,
  "visibility": "visible"
}
```

Renderer input contains safe fields only: safe action ID, renderer kind, safe profile/pack IDs, playback intent, scale, and visibility.

## Security Redaction

Evidence excludes raw photo bytes, prompt text, raw provider response, token, Authorization, full local path, workspace path, config path, raw manifest chunk, and raw GLTF chunk.

## Final Decision

Passed for V7.14 advanced visual QA on the V7.13 accepted generated 2D and external GLB import paths. Provider 3D visual QA remains not-run because the provider 3D branch is blocked.
