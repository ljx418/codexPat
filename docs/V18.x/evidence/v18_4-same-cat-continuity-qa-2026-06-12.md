# V18.4 Same-cat and Continuity QA

status: passed
date: 2026-06-12

## Scope

V18.4 verifies the V18.3 identity-locked MiniMax reference-image sprite pack
before any live preview/apply path. It checks action coverage, visibility,
first/final loop closure, 0.75x readability, one-canonical-source identity
hash stability, and safe metadata boundaries.

This is not the V18 final gate and does not claim arbitrary-cat generation,
Petdex parity, provider integration, or production release readiness.

## Results

```json
[
  {
    "name": "pack identity",
    "result": "passed",
    "details": "packId=v18-3-minimax-i2i-identity-locked-pack"
  },
  {
    "name": "renderer kind",
    "result": "passed",
    "details": "rendererKind=sprite"
  },
  {
    "name": "provider source",
    "result": "passed",
    "details": "source=provider:minimax:image-to-image + local identity-locked animation assembly"
  },
  {
    "name": "same-cat identity source hash",
    "result": "passed",
    "details": "identitySourceHash=40620ed30e01ce3c; actions=8"
  },
  {
    "name": "QA action idle",
    "result": "passed",
    "details": "frames=17/6; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action thinking",
    "result": "passed",
    "details": "frames=21/6; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action running",
    "result": "passed",
    "details": "frames=21/6; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action success",
    "result": "passed",
    "details": "frames=17/3; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action warning",
    "result": "passed",
    "details": "frames=17/3; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action error",
    "result": "passed",
    "details": "frames=17/3; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action need_input",
    "result": "passed",
    "details": "frames=17/3; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "QA action sleeping",
    "result": "passed",
    "details": "frames=17/6; providerVisible=true; visible=true; firstFinalClosed=true; scale075Readable=true"
  },
  {
    "name": "same-cat source continuity gate",
    "result": "passed",
    "details": "all actions derive from one canonical provider-generated identity source"
  },
  {
    "name": "manual visual acceptance boundary",
    "result": "passed",
    "details": "automated QA checks visibility/closure/readability; final human-readable report may still review generated style quality without broad arbitrary-cat claim"
  },
  {
    "name": "failed pack apply blocked",
    "result": "passed",
    "details": "V18.4 performs QA only; no apply attempted while QA failed"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "safe action/pack/frame counts only; no token, Authorization, provider response body, reference photo bytes, full local path, prompt text, workspace/config path"
  },
  {
    "name": "claim boundary",
    "result": "passed",
    "details": "V18.4 only proves QA gate for tested generated pack; V18.5 preview/apply remains not-run"
  }
]
```

## Action QA Summary

```json
[
  {
    "action": "idle",
    "frameCount": 17,
    "requiredFrameCount": 6,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": true,
    "transient": false
  },
  {
    "action": "thinking",
    "frameCount": 21,
    "requiredFrameCount": 6,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": true,
    "transient": false
  },
  {
    "action": "running",
    "frameCount": 21,
    "requiredFrameCount": 6,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": true,
    "transient": false
  },
  {
    "action": "success",
    "frameCount": 17,
    "requiredFrameCount": 3,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": false,
    "transient": true
  },
  {
    "action": "warning",
    "frameCount": 17,
    "requiredFrameCount": 3,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": false,
    "transient": true
  },
  {
    "action": "error",
    "frameCount": 17,
    "requiredFrameCount": 3,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": false,
    "transient": true
  },
  {
    "action": "need_input",
    "frameCount": 17,
    "requiredFrameCount": 3,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": false,
    "transient": true
  },
  {
    "action": "sleeping",
    "frameCount": 17,
    "requiredFrameCount": 6,
    "providerVisible": true,
    "visible": true,
    "firstFinalClosed": true,
    "scale075Readable": true,
    "loop": true,
    "transient": false
  }
]
```

## Evidence Attachments

- Identity-locked action preview HTML: `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-2026-06-12/contact-sheet.html`
- 0.75x scale probes: `docs/V18.x/evidence/assets/v18_4-same-cat-continuity-qa-2026-06-12/<action>-scale-075.png`

## PRD / Spec Review

V18.4 same-cat and continuity QA gate passed for the tested identity-locked MiniMax reference-image pack. V18.5 may proceed to isolated preview, target apply, and rollback.

## Allowed Claim

V18 same-cat and continuity QA gate passed for the tested generated 2D action pack scenario.

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- V18 final workflow passed
