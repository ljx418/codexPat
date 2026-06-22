# V29 Evidence Index

文档状态：active evidence index；planned。
当前日期：2026-06-16。

## Purpose

This index defines the evidence chain required before V29 claims can move from
planned to passed. Every phase must resolve to `passed`, `blocked`, or `failed`.
Silent pass is forbidden.

## Evidence Map

| Phase | Evidence File | Required Status Before Next Gate |
| --- | --- | --- |
| V29.0 | `docs/V29.x/evidence/v29_0-scope-freeze-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.1 | `docs/V29.x/evidence/v29_1-gallery-ux-smoke-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.2 | `docs/V29.x/evidence/v29_2-photo-benchmark-smoke-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.3 | `docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.4 | `docs/V29.x/evidence/v29_4-productized-wizard-smoke-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.5 | `docs/V29.x/evidence/v29_5-asset-polish-smoke-YYYY-MM-DD.md` | passed / blocked / failed |
| V29.6 | `docs/V29.x/v29-final-acceptance-report.md` and `docs/V29.x/evidence/v29_6-final-dashboard-YYYY-MM-DD.html` | final decision |

## V29.0 Scope Freeze Evidence

Must include:

- V29 PRD exists；
- target architecture exists；
- development / detailed development / acceptance plans exist；
- implementation contract exists；
- claim matrix exists；
- active docs point to V29；
- V23-V28 is recorded as scoped accepted baseline, not V29 evidence；
- drawio XML parse result；
- drawio PNG/SVG snapshot if available；
- forbidden claim scan result。

## V29.1 Gallery UX Evidence

Must include:

- screenshot or DOM capture of gallery；
- browse / filter / search result；
- favorite save/remove result；
- isolated 8-action preview result；
- target-only one-click switch result；
- rollback result；
- zero PetEvent from preview；
- default and unrelated pets unchanged；
- security scan。

## V29.2 Photo Benchmark Evidence

Must include:

- benchmark sample table；
- at least 12 sample categories or blocked sample gap；
- route budget summary；
- accepted / blocked / failed outcome per sample；
- accepted-candidate rate；
- repair guidance table；
- proof that existing `docs/猫*.jpg` samples were included when present；
- no raw photo bytes, full local path, EXIF/GPS, private filename, token, or
  Authorization in evidence。

## V29.3 Quality Gate V2 Evidence

Must include:

- same-cat score bucket table；
- motion amplitude table；
- background/alpha gate table；
- frame delta and loop closure table；
- 1x / 0.75x readability result；
- rejected-case table for weak motion, identity drift, bad background, flicker,
  off-canvas, and missing action；
- ranked accepted-candidate table；
- proof hard QA failures cannot be overridden by ranking。

## V29.4 Productized Wizard Evidence

Must include:

- screenshot or DOM capture of wizard states；
- upload / generate / QA / preview / apply / rollback path；
- blocked path with actionable guidance；
- QA failed candidate blocked from apply；
- target-only apply proof；
- rollback proof；
- proof that the user does not need shell, manifest editing, or provider raw
  output。

## V29.5 Asset Polish Evidence

Must include:

- at least 12 gallery entries visible or blocked gap；
- high-quality default pack contact sheets；
- all 8 core action preview；
- install history and recent packs；
- no blank / transparent / off-canvas / flash-frame accepted pack；
- 1x and 0.75x visual evidence；
- performance / responsiveness note。

## V29.6 Final Gate Evidence

Must include:

- final status: passed / blocked / failed；
- V29.0-V29.5 evidence status table；
- Petdex-level UX checklist；
- benchmark acceptance table；
- screenshots / contact sheets embedded in HTML, not only linked；
- regression results；
- security scan；
- claim scan；
- license / artifact scan；
- final allowed claim or blocked claim。

## Security Scan Terms

Evidence and generated reports must not contain:

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
- prompt private text；
- shell command；
- raw manifest payload；
- raw renderer payload。

## Claim Scan Terms

Forbidden claims may appear only in forbidden / not-ready / not-implied context:

- automatic photo-to-2D ready for all arbitrary cats；
- automatic photo-to-animation ready for all arbitrary cats；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved beyond tested standards；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- remote asset loading ready；
- asset marketplace ready；
- production signed release ready；
- notarized release ready；
- auto update ready；
- Windows ready；
- cross-platform ready。
