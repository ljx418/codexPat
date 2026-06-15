# V8.11 Animated Sprite Visual QA Smoke

status: passed
date: 2026-06-03

## Scope

This evidence covers the accepted V8.9/V8.10 animated 2D sprite path:

- generated local multi-frame PNG fixture from existing accepted action images.
- local animated sprite manifest with `frameFiles` and `fps`.
- temp app-managed import and target activation contract.
- visual contact sheet and animated preview artifact.

It does not prove provider execution, automatic photo-to-animation, Rive,
Live2D, 3D readiness, or production release readiness.

## Visual Evidence

- contact sheet: `docs/V8.x/evidence/v8_11-animated-sprite-contact-sheet-2026-06-03.png`
- animation GIF preview: `docs/V8.x/evidence/v8_11-animated-sprite-animation-preview-2026-06-03.gif`
- animation HTML preview: `docs/V8.x/evidence/v8_11-animated-sprite-animation-preview-2026-06-03.html`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| V8.9 accepted evidence present | passed | V8.9 scoped accepted |
| V8.10 accepted evidence present | passed | V8.10 scoped accepted |
| animated sprite fixture generated | passed | real multi-frame PNG fixture generated |
| animated sprite manifest coverage | passed | rendererKind=sprite; actionsOk=true; framesOk=true |
| action frame sequence visible: idle | passed | frames=4; minBytes=714182 |
| action frame sequence visible: thinking | passed | frames=4; minBytes=722057 |
| action frame sequence visible: running | passed | frames=4; minBytes=405552 |
| action frame sequence visible: success | passed | frames=4; minBytes=701478 |
| action frame sequence visible: warning | passed | frames=4; minBytes=689709 |
| action frame sequence visible: error | passed | frames=4; minBytes=603753 |
| action frame sequence visible: need_input | passed | frames=4; minBytes=753137 |
| action frame sequence visible: sleeping | passed | frames=4; minBytes=600003 |
| contact sheet evidence exists | passed | contact sheet path recorded |
| contact sheet nonblank | passed | nonblank PNG smoke |
| animation preview gif exists | passed | animated GIF preview path recorded |
| animation preview html exists | passed | animated HTML preview path recorded |
| temp import and activation smoke | passed | temp imported pack activates target instance only |
| renderer input snapshot safe fields only | passed | fields=actionId,packId,playbackIntent,profileId,rendererKind,scale,visibility |
| scale coverage recorded | passed | 1x and 0.75x visual scale requirements documented for V8.11 fixture review |
| fallback coverage recorded | passed | V8.9 invalid assembly preserves previous pack; sprite renderer falls back to bundled safe cat on runtime read failure |
| target isolation recorded | passed | temp activation targets codex_v811_sprite only; default and unrelated pets unchanged by temp store |
| performance baseline recorded | passed | heapUsedMb=5; rssMb=56 |
| desktop typecheck | passed | desktop check |
| desktop tests | passed | desktop tests |
| petctl tests | passed | petctl tests |
| tauri asset import tests | passed | cargo asset_import tests |
| security redaction scan | passed | summary contains no token, Authorization, raw payload, prompt text, provider payload, raw provider response, source photo data, full local path, workspace path, or config path |

## Renderer Input Snapshot

```json
{
  "actionId": "running",
  "rendererKind": "sprite",
  "profileId": "v8-11-animated-sprite",
  "packId": "v8-11-animated-orange-tabby",
  "playbackIntent": "loop",
  "scale": 1,
  "visibility": "visible"
}
```

## Security Boundary

Evidence records safe summaries and artifact-relative paths only. It does not
record token, Authorization, raw provider response, source photo data, prompt
text, workspace path, config path, full local path, raw manifest chunk, or raw
runtime payload.

## Decision

V8.11 passed scoped.
