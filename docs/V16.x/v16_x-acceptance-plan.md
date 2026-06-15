# V16 Acceptance Plan

状态：passed scoped；V16 Product Gate passed for the tested host image tool / local cat-photo scenario。  
日期：2026-06-11。

## Evidence Map

| Phase | Required Evidence | Status |
| --- | --- | --- |
| V16.0 | `docs/V16.x/evidence/v16_0-scope-freeze-2026-06-11.md` | passed |
| V16.1 | `docs/V16.x/evidence/v16_1-provider-boundary-2026-06-11.md` | passed |
| V16.2 | `docs/V16.x/evidence/v16_2-provider-multi-action-generation-2026-06-11.md` | passed |
| V16.3 | `docs/V16.x/evidence/v16_3-same-cat-consistency-2026-06-11.md` | passed |
| V16.4 | `docs/V16.x/evidence/v16_4-auto-packaging-continuity-2026-06-11.md` | passed |
| V16.5 | `docs/V16.x/evidence/v16_5-manager-preview-apply-rollback-2026-06-11.md` | passed |
| V16.6 | `docs/V16.x/v16_6-final-acceptance-report.md` and `docs/V16.x/evidence/v16_6-provider-photo2d-final-html-2026-06-11.html` | passed |

## V16.1 Provider Boundary Gate

Must pass:

- missing credential returns `provider_credential_missing`.
- missing consent returns `provider_consent_required`.
- missing terms/cost/retention/license acknowledgements block request.
- no provider call before all explicit acknowledgements.
- logs/evidence contain no token, Authorization, raw prompt, raw photo, raw provider response, full local path, workspace path, config path, or api-token.json.

## V16.2 Real Generation Gate

Must pass or block explicitly:

- named provider is recorded.
- model/version or endpoint family is recorded with safe summary.
- at least one local cat-photo scenario runs with explicit consent.
- all 8 core actions have generated frames or final status is blocked.
- each action meets minimum frame count.
- output files are stored in app-managed local asset area.
- raw provider response is not persisted in evidence.

## V16.3 Consistency Gate

Must pass:

- same-cat visual traits reviewed across all 8 actions.
- contact sheet exists.
- manual review result is recorded.
- inconsistent output is rejected before activation.
- rejection preserves previous visible pack.

## V16.4 Packaging Gate

Must pass:

- provider output normalizes to `pet.json + frame sequence`.
- V15.12 continuity assembler passes.
- first/final closure passes.
- adjacent frame delta passes.
- blank/transparent/off-canvas frames are rejected.
- unsafe filenames, remote URL, path traversal, script-like fields are rejected.

## V16.5 Manager UX Gate

Must pass:

- user can see provider job state.
- user can preview all 8 actions.
- preview creates zero accepted PetEvent.
- preview does not write CatStateMachine.
- target-only apply changes selected PetInstance only.
- rollback/delete returns to visible safe pack.
- default and unrelated pets remain unchanged.

## V16.6 Final Gate

May pass only if:

- V16.0-V16.5 evidence exists and passed.
- real provider output is accepted.
- security scan passed.
- claim scan passed.
- license/attribution scan passed.
- regression passed.
- final HTML embeds screenshot/contact/runtime evidence.

V16.6 passed only for the tested host ChatGPT/Codex image tool scenario. It does not claim automatic photo-to-2D readiness for arbitrary cats.
