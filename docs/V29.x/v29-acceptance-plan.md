# V29 Acceptance Plan

文档状态：active acceptance plan；planned。
当前日期：2026-06-16。

## Acceptance Principle

V29 accepts product experience, not just engineering components.

A phase passes only when evidence shows the user can complete the expected
workflow or the system blocks honestly with stable reasonCode.

## Evidence Map

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V29.0 | scope freeze | `docs/V29.x/evidence/v29_0-scope-freeze-YYYY-MM-DD.md` | planned |
| V29.1 | gallery UX | `docs/V29.x/evidence/v29_1-gallery-ux-smoke-YYYY-MM-DD.md` | planned |
| V29.2 | photo benchmark | `docs/V29.x/evidence/v29_2-photo-benchmark-smoke-YYYY-MM-DD.md` | planned |
| V29.3 | quality gate v2 | `docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-YYYY-MM-DD.md` | planned |
| V29.4 | productized wizard | `docs/V29.x/evidence/v29_4-productized-wizard-smoke-YYYY-MM-DD.md` | planned |
| V29.5 | asset polish | `docs/V29.x/evidence/v29_5-asset-polish-smoke-YYYY-MM-DD.md` | planned |
| V29.6 | final gate | `docs/V29.x/v29-final-acceptance-report.md` + HTML dashboard | No-Go |

## Petdex-level UX Gate

Must prove:

- browse local pet gallery；
- filter/search；
- favorite；
- preview all 8 core actions without applying；
- one-click switch to target pet；
- rollback；
- default and unrelated pets unchanged；
- zero PetEvent from preview。

## Stable Photo-to-2D Gate

Must prove:

- benchmark uses at least 12 diverse cat photos or records blocked sample gap；
- no per-sample manual prompt tuning beyond allowed fixed repair policy；
- at least 80% samples produce approved 8-action pack under fixed budget；
- accepted packs pass V29 quality gate；
- rejected samples show actionable guidance。

## Quality Gate

Each accepted pack must pass:

- 8 actions visible；
- same-cat score above threshold；
- motion amplitude above threshold；
- adjacent frame delta under threshold；
- loop closure；
- no blank / transparent / off-canvas frames；
- no unsafe background；
- 1x and 0.75x readability。

## Security Scan

Evidence must not contain:

- token；
- Authorization；
- raw provider response；
- raw HTTP payload；
- raw photo bytes；
- EXIF/GPS；
- private filename；
- full local path；
- workspace path；
- config path；
- api-token.json；
- prompt private text。

## Claim Scan

Forbidden claims must appear only in forbidden / not-ready / not-implied context:

- automatic photo-to-2D ready for all arbitrary cats；
- provider integration verified；
- Petdex parity achieved beyond tested standards；
- Petdex asset reuse authorization；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## V29.6 Final Rule

If the benchmark fails the stability threshold, V29.6 must be blocked. It may
still keep V23-V28 scoped workflow as fallback baseline, but cannot claim stable
photo generation.
