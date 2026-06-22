# V23-V28 Acceptance Plan

文档状态：active acceptance plan；V23-V28 scoped passed。
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-16。

## Acceptance Principle

V23-V28 accepts a tested product workflow, not intent. A phase passes only when
real evidence shows the user can proceed safely or the system blocks with a
stable reasonCode.

## Phase Acceptance Matrix

| Stage | Gate | Required Evidence | Pass Condition |
| --- | --- | --- | --- |
| V23 | photo suitability and traits | `v23-photo-suitability-trait-smoke-2026-06-16.md` | passed scoped: clear tested local cat photos accepted; bad photo fixtures blocked with guidance |
| V24 | multi-route generation | `v24-multi-route-generation-smoke-2026-06-16.md` | passed scoped: route attempts recorded safely; local route candidates created; provider routes blocked/unavailable honestly |
| V25 | same-cat and motion QA | `v25-same-cat-motion-qa-smoke-2026-06-16.md` | passed scoped: identity drift / weak motion / frame delta / bad loops / invisible frames rejected |
| V26 | pack, preview, apply | `v26-pack-preview-apply-smoke-2026-06-16.md` | passed scoped: approved candidate previews 8 actions and applies target-only; rollback works |
| V27 | retry and cost controls | `v27-retry-cost-guidance-smoke-2026-06-16.md` | passed scoped: repeated failure stops under budget and shows actionable guidance |
| V28 | final productized workflow | `v28-final-acceptance-report.md` + dashboard HTML | passed scoped: tested workflow evidence summarized with embedded visual contact sheet |

## V23 Required Cases

- clear single cat photo accepted；
- blurry photo rejected；
- cropped / occluded cat rejected or marked risky；
- multi-cat image rejected or marked ambiguous；
- complex background marked as risk；
- safe trait summary contains no raw filename/path/EXIF。

V23 evidence:

```text
docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md
```

## V24 Required Cases

- route A / B / C / D / E registered；
- unsupported route produces stable `route_unavailable`；
- provider credential missing does not print credential；
- route output uses safe candidate metadata；
- failure does not mutate live pet。

V24 evidence:

```text
docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md
```

## V25 Required Cases

- same-cat drift rejected；
- weak motion rejected；
- large frame delta rejected；
- loop closure failure rejected；
- off-canvas / blank / transparent frame rejected；
- accepted candidate proceeds to V22 visual review。

V25 evidence:

```text
docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md
```

## V26 Required Cases

Evidence:

```text
docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md
```

Status: passed scoped. V26 proves approved-candidate packaging, isolated
8-action preview, target-only apply, and rollback. It does not prove V27 retry
guidance or V28 final productized acceptance.

- pet.json + frames assembled；
- all 8 actions preview；
- preview sends zero PetEvent；
- QA failed pack cannot apply；
- apply affects target PetInstance only；
- rollback restores previous visible pack。

## V27 Required Cases

Evidence:

```text
docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md
```

Status: passed scoped. V27 proves retry budget enforcement, repeated-failure
repair guidance, provider consent/credential/disclosure blocking, actionable
next steps, and previous visible pack preservation. It does not prove V28 final
productized acceptance.

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
