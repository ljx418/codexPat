# V18.3 Multi-action Output Normalizer

status: passed
date: 2026-06-12

## Scope

V18.3 now uses an identity-locked generation strategy:

1. Use the real local cat photo as provider reference once.
2. Generate one canonical cat identity image.
3. Locally derive all 8 core action frame sequences from that same canonical
   source.
4. Reject identity drift by requiring every action source image to share the
   same canonical source hash.

This replaces the earlier per-action provider generation strategy because that
could create visually different cats across actions.

This does not apply the pack to a live pet. Same-cat/continuity QA remains
V18.4, and live target apply/rollback remains V18.5.

## Results

```json
[
  {
    "name": "provider canonical i2i output",
    "result": "passed",
    "details": "providerName=MiniMax; model=image-01; endpointHost=api.minimaxi.com; capability=image_to_image_supported; reasonCode=provider_capability_confirmed; imageCount=1; outputFiles=1; status=0; statusMessage=success"
  },
  {
    "name": "provider summary redaction",
    "result": "passed",
    "details": "safe summary fields only"
  },
  {
    "name": "canonical identity image dimensions",
    "result": "passed",
    "details": "dimensions=1024x1024"
  },
  {
    "name": "identity-locked action frames: idle",
    "result": "passed",
    "details": "intent=calm breathing idle pose; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: thinking",
    "result": "passed",
    "details": "intent=curious thinking mood; frames=21; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: running",
    "result": "passed",
    "details": "intent=energetic running mood; frames=21; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: success",
    "result": "passed",
    "details": "intent=happy success mood; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: warning",
    "result": "passed",
    "details": "intent=alert warning mood; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: error",
    "result": "passed",
    "details": "intent=sad error mood; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: need_input",
    "result": "passed",
    "details": "intent=attentive need input mood; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity-locked action frames: sleeping",
    "result": "passed",
    "details": "intent=sleeping mood; frames=17; sourceHash=40620ed30e01ce3c"
  },
  {
    "name": "identity source hash stability",
    "result": "passed",
    "details": "sourceHash=40620ed30e01ce3c; actions=8"
  },
  {
    "name": "transparent background assembly",
    "result": "passed",
    "details": "frames rendered on transparent canvas with chroma-key background removal; no scene background is intentionally preserved"
  },
  {
    "name": "continuity assembler",
    "result": "passed",
    "details": "status=accepted; reasonCode=accepted"
  },
  {
    "name": "8 core action manifest coverage",
    "result": "passed",
    "details": "8 actions with V18 minimum frame counts"
  },
  {
    "name": "previous active pack preserved",
    "result": "passed",
    "details": "normalization writes evidence pack only; no live activation attempted"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "no token, Authorization, provider response body, reference photo bytes, full local path, Data URL, prompt text, workspace/config path"
  },
  {
    "name": "claim boundary",
    "result": "passed",
    "details": "V18.3 now proves identity-locked provider-to-local action pack assembly; V18.4 QA and V18.5 preview/apply remain required"
  }
]
```

## Continuity Assembly Snapshot

```json
{
  "status": "accepted",
  "reasonCode": "accepted",
  "generatedPackId": "v18-3-minimax-i2i-identity-locked-pack",
  "coreActionCoverage": [
    "idle",
    "thinking",
    "running",
    "success",
    "warning",
    "error",
    "need_input",
    "sleeping"
  ],
  "frameCountTable": {
    "idle": 17,
    "thinking": 21,
    "running": 21,
    "success": 17,
    "warning": 17,
    "error": 17,
    "need_input": 17,
    "sleeping": 17
  },
  "continuityTable": {
    "idle": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 3
    },
    "thinking": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 3
    },
    "running": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 10
    },
    "success": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 7
    },
    "warning": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 3
    },
    "error": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 8
    },
    "need_input": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 5
    },
    "sleeping": {
      "firstFinalClosed": true,
      "maxAdjacentDelta": 8
    }
  },
  "issueTable": [],
  "preservedPreviousActivePack": false,
  "safeRendererOutputFields": [
    "packId",
    "rendererKind",
    "actions.actionId",
    "actions.assetId",
    "actions.frameCount",
    "actions.fps",
    "actions.loop",
    "actions.transient",
    "actions.durationMs",
    "actions.fallbackActionId"
  ]
}
```

## Generated Pack Boundary

- packId: v18-3-minimax-i2i-identity-locked-pack
- rendererKind: sprite
- identity mode: single canonical source
- expected actions: idle, thinking, running, success, warning, error, need_input, sleeping
- visual preview: `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-2026-06-12/contact-sheet.html`
- provider response body, credential, reference image bytes, encoded image input,
  prompt text, and full local paths are not written to evidence.

## PRD / Spec Review

V18.3 identity-locked provider output normalization and safe local pack assembly are accepted for the tested MiniMax reference-image scenario. V18.4 may proceed to same-cat and continuity QA.

## Allowed Claim

V18.3 identity-locked multi-action 2D pack assembly passed for the tested local MiniMax image-to-image scenario.

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
