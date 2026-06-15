# V20.6 Final Acceptance Report

status: blocked
date: 2026-06-14

## Scope

V20 attempted to validate a mainland provider, with MiniMax as the P0 candidate,
for the user flow:

```text
real cat photo
  -> consent / disclosure / credential boundary
  -> MiniMax reference-image provider generation
  -> provider output normalization as 8x9 motion sheet
  -> motion/same-cat/loop QA
  -> preview
  -> target apply
  -> rollback
```

V20 final acceptance is blocked because the real MiniMax provider output was not
an accepted 8x9 motion sheet. V19 local motion-sheet remains the fallback
baseline.

## Evidence Gate

| Phase | Evidence | Status | Decision |
| --- | --- | --- | --- |
| V20.0 | `docs/V20.x/evidence/v20_0-scope-freeze-2026-06-14.md` | passed | scope, docs, claim boundary frozen |
| V20.1 | `docs/V20.x/evidence/v20_1-provider-consent-boundary-2026-06-14.md` | passed | provider consent/credential/disclosure boundary passed without provider call |
| V20.2 | `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-2026-06-14.md` | passed 3-sample provider output benchmark | MiniMax returned outputs for 3/3 real cat photos; output existence benchmark passed, but 8x9 normalization failed |
| V20.3 | `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-2026-06-14.md` | blocked | output was not a valid 8x9 motion sheet |
| V20.4 | `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-2026-06-14.md` | blocked | no normalized provider pack to QA |
| V20.5 | `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-2026-06-14.md` | blocked | no QA-passed pack to preview/apply |

## Provider Output Result

The tested MiniMax outputs were 1024x1024 JPEG concept or repeated-pose sheets, not accepted 8x9 per-action motion sheets. V20.3 detected:

- expected grid: 8 rows x 9 columns
- sample 1 nonblank cells: 72/72, but visual review found concept-sheet layout and identity drift
- sample 2 nonblank cells: 72/72, but visual review found concept-sheet layout
- sample 3 nonblank cells: 58/72 and only 2/8 rows had enough cells
- background/alpha gate did not produce accepted transparent/background-safe sheet
- no activation was attempted
- previous active pack was preserved

## PRD / Spec Review

V20 PRD required a provider-generated same-cat 8x9 motion sheet before QA,
preview, target apply, or rollback. The tested provider output did not meet that
normalization gate, so V20 cannot complete the final user experience.

No major documentation drift was found after the blocked decision. The blocked
status matches the V20 claim matrix and acceptance plan.

## Security / Redaction

Evidence and summaries do not contain:

- token
- Authorization
- raw provider response
- raw HTTP payload
- raw photo bytes
- EXIF/GPS
- full local path
- workspace path
- config path
- private filename
- prompt private text

## Claim Basis Table

| Claim Candidate | Evidence Basis | Decision |
| --- | --- | --- |
| MiniMax reference-image calls executed | V20.2 returned outputs for 3/3 samples | allowed scoped at provider-output level |
| MiniMax output-existence benchmark | 3/3 samples returned images, median accepted-attempt count 1 | allowed scoped for output existence only |
| Provider 8x9 motion-sheet path passed | V20.3 blocked | not claimed |
| Preview/apply provider-generated pack | V20.5 blocked | not claimed |
| V19 local motion-sheet fallback | V19 final evidence | remains fallback baseline |

## Allowed Statement

V20 MiniMax provider motion-sheet branch is blocked because the tested
reference-image output was not a valid 8x9 same-cat motion sheet; V19 local
motion-sheet workflow remains the accepted fallback baseline.

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- automatic photo-to-2D ready for arbitrary cats
- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified

## Final Decision

V20 final acceptance is blocked.

The next viable plan is not to force V20 passed. The project should either:

1. add more real cat photo samples and run the documented MiniMax repair-loop
   benchmark, or
2. evaluate another provider that can produce a strict 8x9 same-cat motion
   sheet, or
3. define a new stage that accepts provider multi-pose concept sheets and uses a
   local layout/segmentation pipeline to assemble the final motion sheet.
