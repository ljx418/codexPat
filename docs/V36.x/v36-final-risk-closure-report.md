# V36.8 Final Risk Closure Report

Date: 2026-06-26

## Phase Development And Acceptance Plan
- Phase: V36.8 final risk closure gate.
- Spec: docs/V36.x/v36_8-final-risk-closure-spec.md.
- Development plan: execute the scoped V36 phase only, using safe public metadata or stable blocked reasons.
- Acceptance plan: require PRD/spec review, real evidence summary, claim scan, security scan, and scoped decision.
- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v36.md reviewed.
- Spec: docs/V36.x/v36_8-final-risk-closure-spec.md reviewed and mapped to this evidence.
- Boundary: tested named/public metadata samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.

## Phase Summary
- V36.1 visual goldens: passed
- V36.2 Route A2 ceiling: route_a2_continue
- V36.3 Route B real assets: blocked_scoped
- V36.4 same-sample comparison: blocked_scoped
- V36.5 generalization matrix: partial_scoped
- V36.6 human visual review: partial_scoped
- V36.7 product UX report: partial_scoped

## PRD Target Mapping
- 8+ visual goldens: 8
- 2 same-sample Route A2 / Route B comparisons: 0; Route B unavailable, so this remains blocked.
- Generalization samples: 20
- Human review target-experience count: 4
- Product path: preview ready, apply applied, rollback rolled_back

## Visual Goldens
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

## Route A2 Ceiling
| sampleId | candidateId | difficulty | status | templateSimilarity | identityDifferentiation | localMotionCeiling | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | v36_orange_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.62 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_calico_public | v36_calico_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.655 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_silver_tabby_public | v36_silver_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.69 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_black_cat_public | v36_black_cat_public_v34_character_asset_v35_route_a2_uplift_pack | partial | blocked | 0.805 | 0.88 | 0.787 | action_target_experience_thresholds_met, route_a2_template_similarity_high, v34_qa_blocked |
| v36_siamese_public | v36_siamese_public_v34_character_asset_v35_route_a2_uplift_pack | clear | target_experience | 0.76 | 0.88 | 0.787 | action_target_experience_thresholds_met |
| v36_complex_background_public | v36_complex_background_public_v34_character_asset_v35_route_a2_uplift_pack | complex_background | blocked | 0.875 | 0.76 | 0.787 | action_target_experience_thresholds_met, complex_background_requires_manual_review, route_a2_template_similarity_high, v34_qa_blocked |

## Route B
| sampleId | status | rubricStatus | assetProvenance | reasonCodes |
| --- | --- | --- | --- | --- |
| v36_orange_tabby_public | blocked_not_executed | blocked | not_available | route_b_real_asset_not_available |
| v36_calico_public | blocked_not_executed | blocked | not_available | route_b_real_asset_not_available |

## Same-Sample Comparison
| sampleId | routeA2CandidateId | routeA2Status | routeBCandidateId | routeBStatus | winner | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | v36_orange_tabby_public_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v36_orange_tabby_public_route_b | blocked | route_b_blocked | route_b_blocked |
| v36_calico_public | v36_calico_public_v34_character_asset_v35_route_a2_uplift_pack | target_experience | v36_calico_public_route_b | blocked | route_b_blocked | route_b_blocked |

## Generalization Matrix
| sampleId | difficulty | routeId | rubricStatus | humanReviewStatus | productPathStatus | reasonCodes |
| --- | --- | --- | --- | --- | --- | --- |
| v36_orange_tabby_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_calico_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_silver_tabby_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_black_cat_public | partial | route_a2_quality_uplift | engineering_only | engineering_only | not_attempted | sample_intake_passed |
| v36_siamese_public | clear | route_a2_quality_uplift | target_experience | target_experience | preview_apply_rollback_ready | sample_intake_passed |
| v36_longhair_public | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_tail_hidden_public | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_complex_background_public | complex_background | route_a2_quality_uplift | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, sample_intake_passed |
| v36_public_ginger_profile | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_calico_yawning | complex_background | not_attempted | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_black_portrait | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_siamese_pose | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_tortoiseshell | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_white_cat | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_bicolor | clear | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_kitten | partial | not_attempted | engineering_only | engineering_only | not_attempted | not_in_route_a2_ceiling_set, sample_intake_passed |
| v36_public_cropped_face | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_multi_cat | multi_cat | not_attempted | failed | failed | not_attempted | multi_subject, not_in_route_a2_ceiling_set |
| v36_public_longhair_gray | occluded | not_attempted | failed | failed | not_attempted | insufficient_body_visibility, not_in_route_a2_ceiling_set, occlusion_generalization_risk |
| v36_public_outdoor_shadow | complex_background | not_attempted | engineering_only | engineering_only | not_attempted | complex_background_generalization_risk, not_in_route_a2_ceiling_set, sample_intake_passed |

## Final Decision
- Decision: V36 partial scoped
- Route recommendation: continue_route_a2_with_route_b_blocked
- Narrow final claim: V36 may claim scoped risk-closure evidence for tested named/public metadata samples; Route B remained blocked and arbitrary-cat automatic generation is not ready.
- Remaining risks: Route B requires real source-bound professional assisted assets before recommendation. / Generalization remains limited to tested named/public metadata samples. / Human visual review remains required for target-experience claims. / No provider, production, Windows, cross-platform, 3D, or arbitrary-cat readiness is claimed.

## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed

## Scoped Decision
- partial scoped: V36 has scoped Route A2 and generalization evidence, but Route B real assets remain blocked.
