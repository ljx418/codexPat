# V23-V28 Detailed Development and Acceptance Plan

文档状态：planned detailed implementation package。  
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-15。

## Execution Rule

Run phase by phase. V28 final gate must not start until V23-V27 have explicit
passed / blocked / failed evidence.

## V23 Photo Suitability & Cat Trait Extraction

### Development Tasks

1. Add photo intake quality model: `clear`, `usable_with_risk`, `unsuitable`.
2. Add safe metadata model: media type, size bucket, dimensions, selected state, safe sample ID.
3. Add suitability checks: blur, low resolution, cropped cat, occlusion, multi-cat ambiguity, complex background.
4. Add trait summary contract: coat color, pattern, face shape, eye color bucket, ear shape, tail visibility, body pose.
5. Add user guidance for rejected photos.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-YYYY-MM-DD.md`

Must prove:

- at least one clear local cat photo is accepted；
- blurry or unsuitable fixture is blocked；
- safe trait summary is produced；
- raw photo bytes, EXIF/GPS, private filename, and full local path are absent。

## V24 Multi-route Generation Orchestrator

### Development Tasks

1. Define route registry:
   - Route A provider key-pose；
   - Route B provider action sheet；
   - Route C canonical identity image + local rig；
   - Route D image-to-video frames；
   - Route E local fallback style pack。
2. Define route capability preflight.
3. Define attempt budget: per-route max 2, total max 6.
4. Add route result states: unavailable, queued, running, output_received, candidate_created, blocked, failed.
5. Preserve V22 candidate boundary.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-YYYY-MM-DD.md`

Must prove:

- all five routes are represented；
- unsupported provider route becomes `route_unavailable`；
- at least one local route can create a candidate or all routes are honestly blocked；
- no route mutates live pet directly。

## V25 Same-cat & Motion QA

### Development Tasks

1. Add same-cat consistency score from safe trait / feature summaries.
2. Add motion amplitude score per action.
3. Add adjacent frame delta and flicker checks.
4. Add loop closure check for base loop actions.
5. Add anchor drift check.
6. Add QA result aggregation for V22 review.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-YYYY-MM-DD.md`

Must prove:

- identity drift fixture rejected；
- weak motion fixture rejected；
- high frame delta fixture rejected；
- loop closure failure rejected；
- accepted candidate proceeds to V22 visual review required / approved path。

## V26 Auto Pack + Preview + Target Apply

### Development Tasks

1. Assemble `pet.json + frames/` from approved candidate output.
2. Generate preview model for 8 core actions.
3. Add isolated preview session.
4. Add user approval state per candidate.
5. Apply only to target PetInstance.
6. Add rollback record and restore action.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-YYYY-MM-DD.md`

Must prove:

- all 8 actions preview；
- preview sends zero PetEvent；
- preview does not write CatStateMachine；
- QA failed candidate cannot apply；
- approved candidate applies only to target pet；
- default/unrelated pets unchanged；
- rollback restores previous visible pack。

## V27 Retry / Cost / Failure Guidance

### Development Tasks

1. Add retry policy engine.
2. Add route switch recommendation from reasonCode.
3. Add cost/time disclosure model.
4. Add retry history summary.
5. Add user-facing failure guidance: upload clearer photo, crop less, choose different style, switch route, stop and keep current pet.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-YYYY-MM-DD.md`

Must prove:

- retry budget enforced；
- repeated same reason does not blindly repeat；
- provider route does not start without consent/credential/cost disclosure；
- after exhausted budget, user sees actionable next step；
- previous visible pet remains unchanged。

## V28 Productized Workflow Gate

### Development Tasks

1. Build final user workflow dashboard.
2. Embed screenshots/contact sheets/preview captures.
3. Record V23-V27 evidence summary.
4. Run minimum regression:
   - `pnpm --filter desktop check`
   - `pnpm --filter desktop test`
   - `pnpm --filter @agent-desktop-pet/petctl test`
   - latest relevant runtime smoke when desktop is available
5. Run security scan.
6. Run claim scan.

### Acceptance

Files:

- `docs/V23-V28.x/v28-final-acceptance-report.md`
- `docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-YYYY-MM-DD.html`

Final report must include status, date, commit, scope, V23-V27 evidence results,
security scan, claim scan, allowed claim, forbidden claims, and final decision.

## No-false-green Rules

- If no candidate is approved, V28 is blocked.
- If QA failed candidate can apply, V28 failed.
- If provider output is unavailable, provider route is blocked, not passed.
- If final HTML has no real visual evidence, V28 is blocked.
- If forbidden claims appear as ready claims, V28 failed.
