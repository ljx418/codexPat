# V40.3R Identity-Conditioned Recovery Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.3R identity-conditioned recovery inside the existing V40 plan.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_3r-identity-conditioned-predev-audit-2026-06-29.md.
- Development scope: test direct local IP-Adapter identity conditioning on real V38 sanitized samples without WebUI/ComfyUI runtime dependency.

## PRD / Spec Review
- V40.3 prompt-only generation failed visual target-experience review.
- V40.3R direct img2img preserved identity but failed action semantics.
- This route may pass only if explicit visual review accepts at least two same-sample candidates as safe to normalize.
- Selected model summary: dreamshaper-8-local-checkpoint; IP-Adapter model cache used locally.

## Real Candidate Results
- Generation status: blocked.
- Generated candidate count: 0.
- Candidate refs: none.
- Negative/blocked sample: v38-negative-non-cat; reasons negative_non_cat_rejected.
- Visual review ref: docs/V40.x/evidence/v40_3r-identity-conditioned-visual-review-2026-06-29.json.

## Validation Results
- Candidate validation: none.

## Visual Quality Review
- Visual review: none.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: blocked.
- Reason: identity_conditioned_runner_incompatible.
