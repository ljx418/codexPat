# V13 Exit Criteria

日期：2026-06-08  
状态：passed scoped。  

## Hard Gates

V13 passed scoped because all hard gates below have evidence:

1. V13.1-V13.6 have final evidence with passed/blocked/failed status.
2. Packaging smoke passes or V13 final status is blocked.
3. First-run user journey evidence contains real screenshots.
4. Diagnostics export redaction scan passes.
5. Stability/performance baseline is recorded.
6. Artifact/license/claim hygiene passes.
7. Final HTML report embeds evidence and states exact scope.
8. PRD/spec review finds no High deviation.
9. Security scan finds no sensitive leakage.
10. Forbidden claims are not used as ready claims.
11. `docs/V13.x/v13_x-implementation-contract.md` requirements are satisfied for every passed phase.

## Beta User Experience Threshold

After V13, a beta user should be able to:

- open the local macOS beta app.
- see a visible living desktop pet.
- find settings and onboarding without reading internal phase docs.
- understand the reliable Codex work-cat path.
- export a safe diagnostics bundle.
- share a final HTML evidence page for review.

## Block Conditions

V13 must be blocked if:

- local packaging cannot launch.
- first-run screenshots do not show the app/pet.
- diagnostics export leaks sensitive fields.
- artifact scan shows generated build output staged for commit.
- final report implies production release readiness.

## Out-of-scope Exit Conditions

V13 does not require:

- notarization.
- production signing.
- auto-update.
- Windows packaging.
- cross-platform release.
- provider generation readiness.
- Petdex parity.
- 3D readiness.
