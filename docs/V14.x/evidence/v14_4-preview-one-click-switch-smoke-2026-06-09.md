# V14.4 Preview and One-click Switch Smoke Evidence

status: passed
date: 2026-06-09

## Scope

This evidence validates source-level preview isolation and target-scoped
activation/restoration for local gallery packs. It does not claim remote
marketplace readiness, provider integration, 3D readiness, production release
readiness, Windows readiness, cross-platform readiness, or Petdex parity.

## Snapshot

- default bundled candidate: `flagship-work-cat-v2`
- preview renderer input fields: `actionId, rendererKind, packId, playbackIntent, scale, visibility`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| isolated candidate preview | passed | candidate preview explicitly records no runtime mutation and zero accepted PetEvent |
| current target comparison preview | passed | preview panel compares current target pet with candidate pet |
| no notify in preview scope | passed | gallery preview does not call notify |
| target-scoped bundled activation | passed | bundled apply saves safe packId for selected target instance |
| target-scoped imported activation | passed | imported apply clears bundled preference and activates selected target only |
| restore visible flagship default | passed | restore clears target custom preference and returns visible flagship default |
| safe pack allowlist | passed | bundled activation is allowlisted |
| security scan | passed | no token, Authorization, full local path, raw provider payload, prompt text, or tool command text |
| claim scan | passed | V14.4 claims local preview/one-click switch only; no lifecycle, provider, 3D, marketplace, release, Windows, or cross-platform claim |
| safe preview renderer input | passed | actionId, rendererKind, packId, playbackIntent, scale, visibility |
| default candidate is flagship | passed | first bundled local candidate is flagship-work-cat-v2 |

## Allowed Claim

V14.4 isolated preview and one-click target switching passed for tested local source-level scenarios.

## Final Decision

V14.4 passed. V14.5 may proceed after phase-specific review.
