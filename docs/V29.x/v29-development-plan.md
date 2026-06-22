# V29 Development Plan

文档状态：active development plan；planned。
当前日期：2026-06-16。

## Scope

V29 targets Petdex-level user experience for browsing and switching pets, plus
stable photo-to-animated-2D generation over a diverse cat photo benchmark.

V29 starts from V23-V28 scoped passed evidence and must not rewrite that history.

## Phase Plan

| Phase | Development Scope | Output |
| --- | --- | --- |
| V29.0 | Scope freeze, benchmark definition, Petdex UX checklist | scope evidence |
| V29.1 | Gallery browser UX: search, filter, favorites, preview, one-click switch | gallery smoke |
| V29.2 | Diverse photo benchmark harness and sample registry | benchmark smoke |
| V29.3 | Quality Gate V2 and candidate ranking | QA/ranking smoke |
| V29.4 | Productized generation wizard with progress, retry, failure guidance | wizard smoke |
| V29.5 | Asset polish: high-quality defaults, install history, rollback UX | polish smoke |
| V29.6 | Final gate with screenshots, benchmark results, claim/security scans | final report |

## Implementation Support Documents

V29 development is governed by:

- `docs/V29.x/v29-target-architecture.md`
- `docs/V29.x/v29-detailed-development-and-acceptance-plan.md`
- `docs/V29.x/v29-implementation-contract.md`
- `docs/V29.x/v29-evidence-index.md`
- `docs/V29.x/v29-acceptance-plan.md`
- `docs/V29.x/v29-claim-matrix.md`

These documents support phase-by-phase implementation. They do not allow V29.6
to start before V29.0-V29.5 have explicit evidence.

## V29.0 Scope Freeze

Tasks:

1. Confirm active PRD points to V29.
2. Confirm V23-V28 is accepted baseline, not reused as V29 passed evidence.
3. Define Petdex-level UX checklist.
4. Define diverse cat sample set requirements.
5. Freeze forbidden claims.

Evidence:

```text
docs/V29.x/evidence/v29_0-scope-freeze-YYYY-MM-DD.md
```

## V29.1 Gallery UX

Tasks:

1. Gallery index with local pet packs.
2. Search/filter by style, color, renderer, quality status.
3. Favorites.
4. Isolated 8-action preview.
5. One-click switch to selected target pet.
6. Rollback from install history.

Acceptance:

- preview does not send PetEvent；
- preview does not write CatStateMachine；
- one-click switch affects target pet only；
- default/unrelated pets unchanged；
- user can browse, filter, favorite, preview, switch in one flow。

## V29.2 Stable Photo Benchmark

Tasks:

1. Register at least 12 diverse local cat samples or mark sample gap blocked.
2. Include existing `docs/猫*.jpg` samples as part of the benchmark.
3. Run fixed-budget generation attempts without per-image hand tuning.
4. Record accepted/blocked/failed per sample.

Acceptance:

- 80%+ accepted candidate rate under fixed budget；
- every failure has actionable reasonCode；
- no raw photo bytes, source filename, full local path, EXIF/GPS in evidence。

## V29.3 Quality Gate V2

Tasks:

1. Same-cat scorer.
2. Motion amplitude scorer.
3. Background / alpha gate.
4. Loop closure and frame delta checks.
5. Aesthetic ranker for accepted candidates.

Acceptance:

- weak motion rejected；
- identity drift rejected；
- bad background rejected；
- flicker / jump / loop mismatch rejected；
- accepted candidates are ranked but hard QA failures cannot be overriden。

## V29.4 Productized Wizard

Tasks:

1. Single upload -> generate -> preview -> apply wizard.
2. Progress states: checking, generating, qa, preview_ready, blocked.
3. Retry guidance integrated.
4. Candidate comparison and selection.

Acceptance:

- user does not need shell, manifest, or provider raw output；
- QA failed candidates cannot apply；
- apply target-only；
- rollback restores previous visible pack。

## V29.5 Asset Polish

Tasks:

1. Improve default high-quality animated 2D packs.
2. Install history and recent packs.
3. Empty/error states for gallery and generator.
4. Performance and visual polish.

Acceptance:

- at least 12 high-quality gallery entries visible；
- all gallery packs have 8-action preview；
- no blank, transparent, off-canvas, or flash-frame in accepted packs；
- 1x and 0.75x readability。

## V29.6 Final Gate

Tasks:

1. Generate final HTML report with screenshots/contact sheets.
2. Record benchmark table.
3. Run regression/security/claim scans.
4. Record final decision.

Acceptance:

- V29.0-V29.5 evidence exists；
- Petdex-level UX checklist passed；
- photo benchmark meets stable threshold；
- gallery browse/filter/favorite/preview/switch passed；
- final HTML embeds real visual evidence。
