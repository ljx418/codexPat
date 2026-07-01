# V40.3R2 Final Implementation Gate Evidence

Date: 2026-06-30

## Scope

- Phase: V40.3R2 identity-conditioned Direct Local Runner repair.
- Controlling PRD: `docs/active/agent_desktop_pet_prd_v40.md`.
- Architecture docs: `docs/V40.x/v40-target-architecture.md`,
  `docs/V40.x/v40-development-and-acceptance-plan.md`.
- This remains inside the existing V40 no-WebUI/no-ComfyUI stage.
- Human audit package:
  `docs/V40.x/evidence/v40_3r2-human-audit-package-2026-06-30.md`.

## Development Result

- Repaired the project-owned IP-Adapter Direct Local Runner path enough to
  generate real same-sample candidates from V38 sanitized public cat samples.
- Added a V40.3R2 smoke wrapper that records safe candidate summaries, visual
  review status, claim scan, security scan, and pass/fail decision.
- Ran one bounded stylized retry after the first candidate set failed visual
  review.
- Did not start WebUI or ComfyUI.
- Did not claim product readiness, arbitrary-cat automation, provider
  integration, or Petdex parity.

## Real Data Used

- Tested cat sample: `v38-a-cat-public`.
- Tested cat sample: `v38-tuxedo-public`.
- Negative sample: `v38-negative-non-cat`.
- Candidate evidence:
  - `docs/V40.x/evidence/v40_3r2-identity-conditioned-repair-2026-06-30.md`
  - `docs/V40.x/evidence/v40_3r2-identity-conditioned-repair-stylized-2026-06-30.md`
  - `docs/V40.x/evidence/v40_3r2-identity-conditioned-visual-review-2026-06-30.json`
  - `docs/V40.x/evidence/v40_3r2-identity-conditioned-stylized-visual-review-2026-06-30.json`

## Visual Review Result

V40.3R2 failed.

- The first identity-conditioned candidate set preserved partial cat identity
  but remained photo-like, background-heavy, cropped, and artifact-prone.
- The stylized retry improved some visual style but still contained artifacts
  and did not provide readable eight-action desktop-pet semantics.
- The generated outputs are not safe to normalize into V40.4 action packages.
- The generated outputs are not enough to support a target user experience
  claim.

## PRD / Spec Review

- V40 requires at least two same-sample candidates to pass explicit visual
  review before V40.4 normalization can start.
- V40.3, V40.3R img2img, and V40.3R2 identity-conditioned routes have all failed
  the visual target-experience gate.
- Continuing to V40.4 would be a false acceptance risk.
- V39 remains the product fallback.

## Command Results

- `pnpm --filter desktop test`: passed, 356 tests.
- `pnpm --filter desktop check`: passed.
- `pnpm --filter @agent-desktop-pet/petctl test`: passed, 71 tests.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs`: passed.
- `pnpm --filter desktop exec node --import tsx ../../scripts/v39_8_final_gate_smoke.mjs`: passed scoped.
- V40.3R2 default repair smoke with existing generated candidates: failed as
  expected because visual review rejected both candidates.
- V40.3R2 stylized retry smoke with existing generated candidates: failed as
  expected because visual review rejected both candidates.

## Claim Scan

- Status: passed for evidence boundary.
- Forbidden ready claims appear only in forbidden, not-ready, or No-Go contexts.
- No new positive claim was made for arbitrary-photo automation, provider
  integration, Petdex parity, WebUI, ComfyUI, production release, platform
  readiness, or 3D readiness.

## Security Scan

- Status: passed for evidence boundary.
- Evidence uses relative artifact references.
- No token, authorization value, raw prompt, raw payload, raw photo bytes, or
  credential content is included.

## Decision

- V40.3R2 status: failed.
- V40.4 normalization: No-Go.
- V40.5 product preview/apply/rollback: No-Go.
- V40.6 visual report: No-Go for success evidence.
- V40.7 final V40 pass: No-Go.

## Remaining Development Plan

No further V40 implementation may continue automatically from the failed
V40.3R2 outputs.

The next approved work must begin with a new candidate-source decision inside
the same V40 stage. Acceptable options are:

- a stronger local direct route with explicit identity, mask, pose, and action
  controls;
- source-bound same-sample manual/import assets with license and visual
  acceptance evidence;
- keeping V39 as fallback and recording V40 as failed until better source assets
  or a better local route exists.
