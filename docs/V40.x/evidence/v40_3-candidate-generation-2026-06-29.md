# V40.3 Candidate Generation Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.3 Candidate generation/import.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_3-candidate-generation-predev-audit-2026-06-29.md.
- Development scope: generate or block Direct Local Runner candidates for real tested samples.

## PRD / Spec Review
- V40.1A Direct Local Runner smoke passed scoped.
- V40.2 No-WebUI workflow contract passed scoped.
- This phase creates review candidates only; V40.3 can pass only after the generated candidates have explicit visual review records.
- Selected model summary: dreamshaper-8-local-checkpoint; used as a local checkpoint file only, not as a WebUI/ComfyUI runtime service.

## Real Candidate Results
- Generation status: generated.
- Generated candidate count: 2.
- Candidate refs: docs/V40.x/evidence/assets/v40-direct-runner-candidates/v38-a-cat-public-contact-sheet.png, docs/V40.x/evidence/assets/v40-direct-runner-candidates/v38-tuxedo-public-contact-sheet.png.
- Negative/blocked sample: v38-negative-non-cat; reasons negative_non_cat_rejected.
- Visual review ref: docs/V40.x/evidence/v40_3-visual-review-2026-06-29.json.

## Validation Results
- Candidate 1: accepted; reasons v40_no_webui_contract_passed.
- Candidate 2: accepted; reasons v40_no_webui_contract_passed.


## Visual Quality Review
- Candidate 1: failed; reasons visual_review_failed, action_semantics_unclear, target_experience_quality_failed.
  - Observations: candidate is visually better than the V39 deterministic SVG baseline, but identity is not stable enough across actions; source sample is a real tabby photo and the candidate keeps broad tabby traits, but the generated character becomes a generic stylized cat rather than a source-bound same cat; play frame includes an accessory-like collar artifact; celebrate frame is mostly a static sitting pose and does not clearly communicate the action; candidate is not ready for normalization or product apply.
- Candidate 2: failed; reasons visual_review_failed, action_semantics_unclear, target_experience_quality_failed.
  - Observations: candidate is visually better than the V39 deterministic SVG baseline, but same-cat identity is not preserved across actions; walk frame drifts into a mostly white cat and loses the source sample black-white facial pattern; eye color, face shape, tail shape, and rendering style vary between actions; celebrate frame becomes a simplified chibi character that does not match idle, walk, jump, or sleep; candidate is not ready for normalization or product apply.


## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: failed.
- Reason: visual_target_experience_quality_failed_or_missing.
