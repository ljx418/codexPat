# V20.3 Provider Output Normalization Evidence

status: blocked
date: 2026-06-14

## Scope

V20.3 validates whether the V20.2 MiniMax provider output can be normalized as a
single 8x9 same-cat motion sheet. It does not apply or activate any asset when
normalization fails.

## Results

| Check | Result | Details |
| --- | --- | --- |
| provider output files exist | passed | fileNames=sample_1-minimax-motion-sheet-1.jpeg, sample_2-minimax-motion-sheet-1.jpeg, sample_3-minimax-motion-sheet-1.jpeg |
| image dimensions readable | passed | sample_1-minimax-motion-sheet-1.jpeg:1024x1024; sample_2-minimax-motion-sheet-1.jpeg:1024x1024; sample_3-minimax-motion-sheet-1.jpeg:1024x1024 |
| 8x9 row coverage | blocked/failed | sample_1-minimax-motion-sheet-1.jpeg:rows=8/8; sample_2-minimax-motion-sheet-1.jpeg:rows=8/8; sample_3-minimax-motion-sheet-1.jpeg:rows=2/8 |
| all expected grid cells nonblank | blocked/failed | sample_1-minimax-motion-sheet-1.jpeg:cells=72/72; sample_2-minimax-motion-sheet-1.jpeg:cells=72/72; sample_3-minimax-motion-sheet-1.jpeg:cells=58/72 |
| background gate | blocked/failed | sample_1-minimax-motion-sheet-1.jpeg:alpha=false,white=0.0006; sample_2-minimax-motion-sheet-1.jpeg:alpha=false,white=0; sample_3-minimax-motion-sheet-1.jpeg:alpha=false,white=0.849 |
| safe generated file names only | passed | sample_1-minimax-motion-sheet-1.jpeg, sample_2-minimax-motion-sheet-1.jpeg, sample_3-minimax-motion-sheet-1.jpeg |
| operator visual review | blocked/failed | generated outputs are concept/multi-pose sheets or repeated-pose grids, not accepted 8x9 per-action motion sheets; sample 1 also shows different-cat identity drift |
| previous active pack preserved | passed | no activation attempted after provider output normalization failed |

## Provider Output Summary

| Field | Value |
| --- | --- |
| safeFileName | sample_1-minimax-motion-sheet-1.jpeg, sample_2-minimax-motion-sheet-1.jpeg, sample_3-minimax-motion-sheet-1.jpeg |
| dimensions | sample_1-minimax-motion-sheet-1.jpeg:1024x1024; sample_2-minimax-motion-sheet-1.jpeg:1024x1024; sample_3-minimax-motion-sheet-1.jpeg:1024x1024 |
| expectedGrid | 8 rows x 9 columns |
| nonblankCells | sample_1-minimax-motion-sheet-1.jpeg:72/72; sample_2-minimax-motion-sheet-1.jpeg:72/72; sample_3-minimax-motion-sheet-1.jpeg:58/72 |
| rowNonblankCounts | sample_1-minimax-motion-sheet-1.jpeg:9/9/9/9/9/9/9/9; sample_2-minimax-motion-sheet-1.jpeg:9/9/9/9/9/9/9/9; sample_3-minimax-motion-sheet-1.jpeg:7/7/7/8/7/7/8/7 |
| statusReason | provider_output_not_parseable_as_8x9_motion_sheet |

## PRD / Spec Review

The generated MiniMax image did not satisfy the V20 target architecture contract
for provider output normalization. V20.4 motion QA and V20.5 preview/apply are
No-Go until V20.3 receives an accepted normalized motion sheet.

## Allowed Claim

V20.3 provider output normalization is blocked because the tested MiniMax output
is not a valid 8x9 motion sheet.

## Forbidden Claims

- provider motion-sheet path passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
- production signed release ready
