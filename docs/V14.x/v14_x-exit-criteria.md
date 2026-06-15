# V14 Exit Criteria

日期：2026-06-09  
状态：planned。  

## Hard Gates

V14 may pass only if:

1. V14.1-V14.5 have explicit passed evidence.
2. `flagship-work-cat-v2` passes visual QA and becomes the default target pack.
3. AnimationPackLinter blocks unsafe and unstable packs.
4. Gallery lists at least 12 local curated packs.
5. At least 8 gallery packs are animated 2D packs.
6. Favorites persist across restart.
7. Preview sends zero PetEvent and does not mutate live state.
8. One-click switching affects only the selected target PetInstance.
9. Deleted/corrupt/partial/invalid packs leave a visible fallback.
10. AI asset guide does not imply automatic photo-to-3D or provider readiness.
11. Security scan, claim scan, license scan, and regression pass.
12. Final HTML embeds screenshot/capture evidence.

## User Experience Threshold

After V14, a normal local macOS user should be able to:

- open the app and see a high-quality animated default cat.
- open Pet Gallery and understand available pets without reading internal docs.
- filter and favorite pets.
- preview actions before applying.
- apply a pet to default or a Codex work-cat with one click.
- recover safely from invalid or deleted user-imported assets.
- understand AI asset generation options and limits.

## Block Conditions

V14 must be blocked if:

- visual evidence shows flicker, blank, transparency, or off-canvas regression.
- preview mutates live state.
- one-click activation changes the wrong pet.
- favorite persistence fails.
- active imported pack deletion makes the cat disappear.
- AI guide or final report implies automatic photo-to-3D ready.
- any forbidden claim is used as ready.

## Out-of-scope Exit Conditions

V14 does not require:

- Petdex ecosystem-size parity.
- remote marketplace.
- production signing.
- notarization.
- auto-update.
- Windows or cross-platform release.
- broad 3D readiness.
- provider integration readiness.
