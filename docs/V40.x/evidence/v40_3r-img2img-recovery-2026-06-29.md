# V40.3R Img2Img Recovery Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.3R img2img recovery inside the existing V40 plan.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_3r-img2img-recovery-predev-audit-2026-06-29.md.
- Development scope: test direct local img2img recovery on real V38 sanitized samples without WebUI/ComfyUI runtime dependency.

## PRD / Spec Review
- V40.3 failed because prompt-only checkpoint generation did not preserve same-cat identity/action consistency.
- V40.3R may pass only if explicit visual review accepts at least two same-sample candidates as safe to normalize.
- Selected model summary: dreamshaper-8-local-checkpoint; used as a local checkpoint file only.

## Real Candidate Results
- Generation status: generated.
- Generated candidate count: 2.
- Candidate refs: docs/V40.x/evidence/assets/v40-direct-img2img-candidates/v38-a-cat-public-contact-sheet.png, docs/V40.x/evidence/assets/v40-direct-img2img-candidates/v38-tuxedo-public-contact-sheet.png.
- Negative/blocked sample: v38-negative-non-cat; reasons negative_non_cat_rejected.
- Visual review ref: docs/V40.x/evidence/v40_3r-img2img-visual-review-2026-06-29.json.

## Validation Results
- Candidate 1: accepted; reasons v40_no_webui_contract_passed.
- Candidate 2: accepted; reasons v40_no_webui_contract_passed.


## Visual Quality Review
- Candidate 1: failed; reasons visual_review_failed, action_semantics_unclear, target_experience_quality_failed.
  - Observations: source identity is preserved better than prompt-only generation; candidate remains close-up photo-like output rather than full-body desktop-pet action sprites; walk, jump, play, alert, and celebrate are not readable as distinct action assets; background and photo composition remain dominant; candidate is not safe to normalize for product preview.
- Candidate 2: failed; reasons visual_review_failed, action_semantics_unclear, target_experience_quality_failed.
  - Observations: source identity is preserved better than prompt-only generation; candidate remains photo-like and mostly upright/static across actions; walk, sleep, play, alert, and celebrate do not provide a usable eight-action desktop-pet pack; background and lighting drift across frames; candidate is not safe to normalize for product preview.


## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: failed.
- Reason: img2img_visual_target_experience_failed_or_missing.
