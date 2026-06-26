# V36.1 Visual Goldens Evidence

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.1 visual goldens.
- Spec: docs/V36.x/v36_1-visual-goldens-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_1-visual-goldens-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Visual Golden Samples
| sampleId | difficulty | intakeStatus | sourceKind | sourceRef | licenseOrPermissionSummary |
| --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | clear | passed | public_reference_metadata | commons_file_Orange_Tabby_Cat | CC BY-SA or compatible Commons file page reviewed |
| v36_calico_public | clear | passed | public_reference_metadata | commons_file_Calico_Cat | CC BY-SA or compatible Commons file page reviewed |
| v36_silver_tabby_public | clear | passed | public_reference_metadata | commons_category_Tabby_cats_reference | Commons category reference metadata only |
| v36_black_cat_public | partial | passed | public_reference_metadata | commons_file_Black_cat_in_repose | Commons file page reviewed_ metadata only |
| v36_siamese_public | clear | passed | public_reference_metadata | commons_file_Siamese_Cat | Commons file page reviewed_ metadata only |
| v36_longhair_public | occluded | failed | public_reference_metadata | commons_category_Long_haired_cats_reference | Commons category reference metadata only |
| v36_tail_hidden_public | occluded | failed | public_reference_metadata | commons_file_Black_cat_rolling_reference | Commons file page reviewed_ metadata only |
| v36_complex_background_public | complex_background | passed | public_reference_metadata | commons_file_Yawning_calico_cat_on_a_moped | Commons file page reviewed_ metadata only |

## Result
- Status: passed
- Sample count: 8
- Passed intake count: 6
- Source boundary status: complete
- Reason codes: some_samples_failed

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- passed scoped: visual goldens are ready for V36.2-V36.7 scoped testing.
