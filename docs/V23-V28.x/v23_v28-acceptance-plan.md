# V23-V28 Acceptance Plan

文档状态：planned acceptance plan。  
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-15。

## Acceptance Principle

V23-V28 accepts a tested product workflow, not intent. A phase passes only when
real evidence shows the user can proceed safely or the system blocks with a
stable reasonCode.

## Phase Acceptance Matrix

| Stage | Gate | Required Evidence | Pass Condition |
| --- | --- | --- | --- |
| V23 | photo suitability and traits | `v23-photo-suitability-trait-smoke-YYYY-MM-DD.md` | clear cat photo accepted; bad photo blocked with guidance |
| V24 | multi-route generation | `v24-multi-route-generation-smoke-YYYY-MM-DD.md` | route attempts recorded safely; at least one route produces candidate or all routes blocked honestly |
| V25 | same-cat and motion QA | `v25-same-cat-motion-qa-smoke-YYYY-MM-DD.md` | identity drift / weak motion / flicker / bad loops rejected |
| V26 | pack, preview, apply | `v26-pack-preview-apply-smoke-YYYY-MM-DD.md` | approved candidate previews 8 actions and applies target-only; rollback works |
| V27 | retry and cost controls | `v27-retry-cost-guidance-smoke-YYYY-MM-DD.md` | repeated failure stops under budget and shows actionable guidance |
| V28 | final productized workflow | `v28-final-acceptance-report.md` + dashboard HTML | upload -> generate -> preview -> apply -> rollback path proven for tested scenarios |

## V23 Required Cases

- clear single cat photo accepted；
- blurry photo rejected；
- cropped / occluded cat rejected or marked risky；
- multi-cat image rejected or marked ambiguous；
- complex background marked as risk；
- safe trait summary contains no raw filename/path/EXIF。

## V24 Required Cases

- route A / B / C / D / E registered；
- unsupported route produces stable `route_unavailable`；
- provider credential missing does not print credential；
- route output uses safe candidate metadata；
- failure does not mutate live pet。

## V25 Required Cases

- same-cat drift rejected；
- weak motion rejected；
- large frame delta rejected；
- loop closure failure rejected；
- off-canvas / blank / transparent frame rejected；
- accepted candidate proceeds to V22 visual review。

## V26 Required Cases

- pet.json + frames assembled；
- all 8 actions preview；
- preview sends zero PetEvent；
- QA failed pack cannot apply；
- apply affects target PetInstance only；
- rollback restores previous visible pack。

## V27 Required Cases

- per-route attempt budget enforced；
- total attempt budget enforced；
- repeated reasonCode requires repair strategy；
- cost/time estimate shown before provider route；
- after budget exhausted, user sees better-photo or alternate-route advice。

## V28 Required Cases

- real local cat photo selected；
- wizard shows photo check, trait summary, generation status, QA status；
- final dashboard embeds screenshots/contact sheets/preview captures；
- security scan passed；
- claim scan passed；
- V22 gate remains enforced。

## Security Scan

Evidence must not include token, Authorization, raw provider response, raw HTTP
payload, raw photo bytes, EXIF/GPS, private filename, full local path, workspace
path, config path, api-token.json, or prompt private text.
