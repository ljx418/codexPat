# V17 Current Gap Analysis

状态：V17.0-V17.7 scoped passed；MiniMax text-to-image action-sheet API passed scoped；local photo upload/provider integration readiness remain not-ready。  
日期：2026-06-11。

## Current Baseline

V16 passed scoped for one tested host-image-tool scenario. It proves the pipeline
can work with accepted output, but the user experience is still too manual.

## Main Gap

```text
V16 evidence pipeline
  -> user must understand prompt / output / packaging / evidence
V17 target
  -> user follows one guided modal and sees progress, preview, apply, rollback
```

## Gap Table

| Gap | Current | Target | V17 Owner |
| --- | --- | --- | --- |
| User entry | scattered personalization panels | one photo-to-2D wizard entry | V17.1 passed scoped |
| Photo preview | privacy summary exists | visible image preview + safe metadata | V17.1 passed scoped |
| Generation mode | prompt/provider concepts split | host/manual/provider/import choice | V17.2 passed scoped |
| Loading state | no product job state | clear progress/reasonCode | V17.2 passed scoped |
| Action sheet intake | external result is not a UI first-class input | upload 4x2 sheet, auto crop | V17.3 passed scoped |
| Packaging | V16 script is scenario-specific | parameterized pack generation | V17.3 passed scoped |
| QA preview | evidence exists but not one modal | 8-action preview + pass/fail | V17.4 passed scoped |
| Apply | model exists | target picker + apply/rollback UX | V17.5 passed scoped |
| Final proof | V16 final evidence | screenshot-backed product UX HTML | V17.6 passed scoped |
| Provider API action sheet | provider API previously not-ready | MiniMax text-to-image API generated one 4x2 sheet and entered V17 packaging | V17.7 passed scoped |

## Still Not Ready

- automatic photo-to-2D readiness for arbitrary cats.
- direct provider API integration verified.
- local cat photo upload to provider.
- 3D/photo-to-3D.
- remote marketplace.
- production signed release.
- Windows/cross-platform.

## Product Experience Target

After V17, a user can make a personalized 2D work-cat through the tested local
photo + 4x2 action-sheet path without reading development docs or running smoke
scripts. V17.7 additionally proves a scoped MiniMax text-to-image provider API
path that generates one 4x2 action sheet and feeds it into the same local
packaging flow. Local cat photo upload to provider and arbitrary-cat automatic
generation remain not-ready.

## Current Evidence

- `docs/V17.x/evidence/v17_0-scope-freeze-2026-06-11.md`: V17 scope and claim boundary frozen.
- `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-2026-06-11.md`: tested local photo intake shell, safe metadata, consent/traits state, zero PetEvent and no CatStateMachine mutation.
- `docs/V17.x/evidence/v17_2-generation-mode-loading-2026-06-11.md`: tested host/manual mode, loading state, action-sheet output state, and provider-not-ready state.
- `docs/V17.x/evidence/v17_3-action-sheet-packaging-2026-06-11.md`: tested local 4x2 action sheet crop and safe frameSequence pack generation.
- `docs/V17.x/evidence/v17_4-modal-preview-qa-2026-06-11.md`: tested isolated in-modal 8-action preview QA and QA-failed apply blocking.
- `docs/V17.x/evidence/v17_5-apply-rollback-2026-06-11.md`: tested target-only apply and rollback model.
- `docs/V17.x/v17_6-final-acceptance-report.md`: final scoped acceptance with regression/security/claim/PRD scans.
- `docs/V17.x/v17_7-provider-api-addendum-report.md`: scoped MiniMax provider API addendum.
- `docs/V17.x/evidence/v17_7-minimax-provider-api-action-sheet-2026-06-11.md`: real MiniMax provider API action-sheet generation evidence.
- `docs/V17.x/evidence/v17_7-provider-output-packaging-2026-06-11.md`: provider output entered V17 crop/package path.

V17 does not claim arbitrary-cat automatic photo-to-2D, local photo upload to
provider, provider integration verified, Petdex parity, 3D readiness, or
production release readiness.
