# V7.9 MiniMax Provider Smoke

status: passed
date: 2026-05-31

## Scope

Explicit-consent MiniMax image generation smoke for one user-approved local cat action scenario.

This evidence does not claim provider integration verified, automatic photo-to-3D ready, GLB/GLTF generation, broad 3D readiness, or production release readiness.

## Provider Terms / Consent

- Provider: MiniMax image generation.
- Model: image-01.
- Endpoint host: api.minimaxi.com.
- Upload/provider execution consent: accepted for this smoke.
- Cost/privacy/retention/license review: accepted for this smoke.
- Credential source: MINIMAX_API_KEY, never written to evidence.

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
    "name": "missing credential preflight",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "missing consent preflight",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "live MiniMax provider smoke",
    "result": "passed",
    "details": "ok"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "summary contains no token, Authorization, raw prompt, raw provider response, local path, workspace path, config path, or api-token.json"
  }
]
```

## Security Scan

Passed for recorded summaries.

Evidence excludes token, Authorization, raw prompt, raw provider request, raw provider response, source photo, EXIF/GPS, full local path, workspace path, config path, and api-token.json.

## Final Decision

Passed for the scoped MiniMax image provider smoke.
