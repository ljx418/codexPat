# V29.1 Gallery UX Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V29.1 verifies the local pet gallery product UX for tested local pack browsing,
filtering, favorites, isolated preview, target-only switch semantics, and
rollback semantics. It does not prove V29.2 photo benchmark stability and does
not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
| curated gallery has at least 12 bundled packs | passed | 12 packs |
| search/filter returns expected pack | passed | orangeFilterCount=1 |
| favorite-only filter works with safe packId | passed | premium-orange-tabby |
| all gallery packs expose 8 core preview actions | passed | 8 core actions per pack |
| preview metadata covers 8 actions | passed | actionCount=8 |
| preview is isolated | passed | zero PetEvent / no notify / no CatStateMachine |
| target-only switch semantics | passed | target changed only |
| rollback restores previous visible pack | passed | rollback restored |
| desktop gallery view-model test passed | passed | asset-manager-view-model.test.ts and premium-cats-v1.test.ts passed |
| security scan | passed | safe metadata only |
| claim scan | passed | no forbidden ready claim |

## Gallery Summary

| Field | Value |
| --- | --- |
| totalPacks | 12 |
| bundledCount | 12 |
| importedCount | 0 |
| favoritePackId | premium-orange-tabby |
| orangeFilterCount | 1 |
| allPreviewActions | true |
| allCoverageComplete | true |

## Preview Safety

| Field | Value |
| --- | --- |
| actionCount | 8 |
| rendererKinds | sprite |
| coverageStates | animated |
| acceptedPetEvents | 0 |
| callsNotify | false |
| writesCatStateMachine | false |
| mutatesLivePetInstance | false |

## Target Switch And Rollback

Target-only switch changed the selected target pack while preserving default and
unrelated pack assignments. Rollback restored the previous visible target pack.

## PRD / Spec Review

V29.1 satisfies the PRD requirement for a tested local gallery flow:

- browse/filter/search model；
- favorite safe pack IDs；
- preview all 8 core actions；
- preview does not mutate runtime state；
- one-click switch semantics are target-only；
- rollback semantics preserve previous visible pack。

V29.2 remains responsible for stable photo-to-animated-2D benchmark evidence.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Gallery remains a technical asset manager | Medium | UI copy updated to product gallery language; V29.5 remains responsible for deeper polish |
| Preview mutates live pet state | High | preview safety snapshot is zero PetEvent / no notify / no CatStateMachine |
| Switch affects default/unrelated pets | High | target-only semantic snapshot passed |
| V29.1 mistaken for V29 final | High | V29.6 remains No-Go; benchmark not run |

## Allowed Claim

V29 gallery UX passed for tested browse, filter, favorite, preview, and target switch scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
