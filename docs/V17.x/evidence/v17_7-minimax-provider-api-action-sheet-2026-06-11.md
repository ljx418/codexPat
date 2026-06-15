# V17.7 MiniMax Provider API Action-Sheet Smoke

status: passed
date: 2026-06-11

## Scope

Direct MiniMax provider API smoke for generating one 4x2 action-sheet image and
feeding it into the V17 local action-sheet packaging path.

This is an addendum to V17. It proves only the tested MiniMax text-to-image
action-sheet path when status is passed. It does not prove arbitrary local cat
photo upload, automatic photo-to-2D readiness for arbitrary cats, broad provider
integration, Petdex parity, 3D readiness, or production release readiness.

## Results

```json
[
  {
    "name": "MiniMax provider API action-sheet generation",
    "result": "passed",
    "details": "provider output accepted"
  },
  {
    "name": "provider output image exists",
    "result": "passed",
    "details": "safe generated filename only"
  },
  {
    "name": "provider output image dimensions",
    "result": "passed",
    "details": "dimensions=1024x1024"
  },
  {
    "name": "V17 action-sheet packaging from provider output",
    "result": "passed",
    "details": "packaging smoke accepted provider output"
  },
  {
    "name": "provider output action coverage assumption",
    "result": "passed",
    "details": "fixed 4x2 order expected: idle,thinking,running,success,warning,error,need_input,sleeping"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "safe summaries only; no key, Authorization, raw prompt, raw provider response, raw photo bytes, or full local path"
  },
  {
    "name": "claim boundary",
    "result": "passed",
    "details": "scoped provider API action-sheet smoke only; no arbitrary photo-to-2D/provider integration claim"
  }
]
```

## Security Boundary

- Credential source: MINIMAX_API_KEY, never written to evidence.
- Provider request prompt is not written verbatim to evidence.
- Raw provider response is not written to evidence.
- Output evidence records safe filename, dimensions, provider/model/host summary, and packaging result only.

## Packaging Evidence

Provider output packaging evidence:
`docs/V17.x/evidence/v17_7-provider-output-packaging-2026-06-11.md`

## Allowed Claim

V17.7 MiniMax provider API action-sheet generation passed for the tested explicit-consent local scenario.

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- local cat photo upload to provider ready
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- cross-platform ready
- Windows ready
