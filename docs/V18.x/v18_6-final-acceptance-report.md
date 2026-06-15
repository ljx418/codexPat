# V18.6 Final Acceptance Report

status: passed
date: 2026-06-12

## Scope

V18 closes the tested local workflow:

```text
user-provided cat photo
  -> explicit provider consent and disclosure
  -> MiniMax image-to-image/reference-image canonical identity generation
  -> identity-locked 8-action 2D sprite pack
  -> same-cat/continuity QA
  -> in-app preview model
  -> target-only apply
  -> rollback
```

This remains a tested local MiniMax scenario. It does not claim arbitrary-cat
automation, provider integration readiness, Petdex parity, 3D readiness, or
production release readiness.

## Evidence Gate

- V18.0: docs/V18.x/evidence/v18_0-scope-freeze-2026-06-12.md
- V18.1: docs/V18.x/evidence/v18_1-reference-photo-consent-2026-06-12.md
- V18.2: docs/V18.x/evidence/v18_2-provider-capability-preflight-2026-06-12.md
- V18.3: docs/V18.x/evidence/v18_3-multi-action-normalizer-2026-06-12.md
- V18.4: docs/V18.x/evidence/v18_4-same-cat-continuity-qa-2026-06-12.md
- V18.5: docs/V18.x/evidence/v18_5-preview-apply-rollback-2026-06-12.md

## Final HTML

- docs/V18.x/evidence/v18_6-photo-to-2d-html-2026-06-12.html

## Results

```json
[
  {
    "name": "V18.0 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_0-scope-freeze-2026-06-12.md"
  },
  {
    "name": "V18.1 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_1-reference-photo-consent-2026-06-12.md"
  },
  {
    "name": "V18.2 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_2-provider-capability-preflight-2026-06-12.md"
  },
  {
    "name": "V18.3 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_3-multi-action-normalizer-2026-06-12.md"
  },
  {
    "name": "V18.4 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_4-same-cat-continuity-qa-2026-06-12.md"
  },
  {
    "name": "V18.5 evidence passed",
    "result": "passed",
    "details": "docs/V18.x/evidence/v18_5-preview-apply-rollback-2026-06-12.md"
  },
  {
    "name": "desktop check",
    "result": "passed",
    "details": "pnpm --filter desktop check"
  },
  {
    "name": "desktop test",
    "result": "passed",
    "details": "pnpm --filter desktop test"
  },
  {
    "name": "generated visual assets",
    "result": "passed",
    "details": "actions=8/8"
  },
  {
    "name": "security scan",
    "result": "passed",
    "details": "V18 text evidence/report/scripts do not contain token, Authorization header, provider response body, reference photo bytes, full local path, workspace/config path, or API token file contents"
  },
  {
    "name": "claim scan",
    "result": "passed",
    "details": "forbidden claims are not used as ready/passed claims in V18 final report context"
  },
  {
    "name": "license/attribution scan",
    "result": "passed",
    "details": "generated pack manifest records provider:minimax:image-to-image attribution"
  }
]
```

## Allowed Claim

V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local MiniMax image-to-image provider scenario with in-app preview, target apply, and rollback.

## Forbidden Claims

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
- OS-level Codex window binding ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified

## Final Decision

Passed for the scoped tested local MiniMax image-to-image workflow. Continue to future product hardening only if broader provider coverage, arbitrary-cat quality, and real GUI screenshots are separately planned and evidenced.
