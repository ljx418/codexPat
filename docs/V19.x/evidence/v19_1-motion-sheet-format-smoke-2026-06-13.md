# V19_1 Evidence

status: passed
date: 2026-06-13

## Scope

Petdex-compatible motion sheet validation and rejected fixture matrix.

## Evidence Assets

- source photo: `docs/cat image`
- motion sheet: `docs/V19.x/evidence/assets/v19-motion-sheet-2026-06-13/motion-sheet.png`

## Results

| Check | Result | Details |
| --- | --- | --- |
| valid motion sheet accepted | passed | reasonCode=accepted |
| rejected fixture table covered | passed | fixtures=10 |
| previous active pack preserved after invalid activation | passed | activePack=css-default |
| safe output field list only | passed | packId, rendererKind, actions.actionId, actions.assetId, actions.frameCount, actions.fps, actions.loop, actions.transient, actions.durationMs, actions.fallbackActionId |

## Security / Claim Boundary

Evidence records safe pack/action/QA fields and sanitized relative evidence paths only. It does not record token, Authorization, raw provider payload, raw photo bytes, full local path, workspace path, config path, or private prompt text.
