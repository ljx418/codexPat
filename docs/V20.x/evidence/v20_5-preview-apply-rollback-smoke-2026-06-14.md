# V20.5 Preview / Apply / Rollback Evidence

status: blocked
date: 2026-06-14

## Dependency

V20.3 provider output normalization is blocked. V20.4 and V20.5 do not run
motion QA, preview, apply, or rollback against a failed provider output.

## Results

| Check | Result | Details |
| --- | --- | --- |
| V20.4 QA passed | blocked | V20.4 blocked by V20.3 normalization failure |
| preview runnable | blocked | No QA-passed pack is available for isolated preview |
| apply runnable | blocked | QA failed/blocked pack must not be applied |
| rollback required | blocked | No apply was performed; previous active pack preserved |
| zero PetEvent | passed | No preview/apply execution occurred |
| default and unrelated pets unchanged | passed | No live PetInstance state was mutated |

## Decision

V20.5 remains blocked because V20.4 has no accepted QA output.

## Forbidden Claims

- provider motion-sheet path passed
- MiniMax benchmark reliability passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
- production signed release ready
