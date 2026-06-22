# V23-V28 Detailed Development and Acceptance Plan

文档状态：active detailed implementation package；V23-V28 scoped passed。
阶段主题：Photo-to-Animated-2D Productization Track。  
当前日期：2026-06-16。

## Execution Rule

Run phase by phase. V28 final gate must not start until V23-V27 have explicit
passed / blocked / failed evidence.

## V23 Photo Suitability & Cat Trait Extraction

### Implementation Prompt

V23 has passed scoped evidence. Do not treat this as V24-V28 completion and do
not start V28 final gate from this evidence.

Implement / verify:

1. Local photo selector or fixture loader.
2. `PhotoSuitabilityResult`: `clear`, `usable_with_risk`, `unsuitable`.
3. Safe metadata: media type bucket, size bucket, dimensions, selected state, safe sample ID.
4. Quality checks: blur, low resolution, cropped cat, occlusion, multi-cat ambiguity, complex background.
5. `CatTraitSummary`: coat color, pattern, face shape, eye color bucket, ear shape, tail visibility, body pose.
6. Rejected-photo guidance for better-photo or crop/angle suggestions.

Generate evidence:

```text
docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md
```

V23 evidence must not include raw photo bytes, EXIF/GPS, private filename,
full local path, token, Authorization, raw provider response, or prompt private
text.

### Development Tasks

1. Add photo intake quality model: `clear`, `usable_with_risk`, `unsuitable`.
2. Add safe metadata model: media type, size bucket, dimensions, selected state, safe sample ID.
3. Add suitability checks: blur, low resolution, cropped cat, occlusion, multi-cat ambiguity, complex background.
4. Add trait summary contract: coat color, pattern, face shape, eye color bucket, ear shape, tail visibility, body pose.
5. Add user guidance for rejected photos.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md`

Must prove:

- at least one clear local cat photo is accepted；
- blurry or unsuitable fixture is blocked；
- safe trait summary is produced；
- raw photo bytes, EXIF/GPS, private filename, and full local path are absent。

Status: passed scoped for tested local photo samples and quality fixtures.

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

Evidence: `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md`

Must prove:

- all five routes are represented；
- unsupported provider route becomes `route_unavailable`；
- at least one local route can create a candidate or all routes are honestly blocked；
- no route mutates live pet directly。

Status: passed scoped with `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md`.
V24 candidates are safe orchestration metadata only. They are not QA approved,
preview-ready, or apply-ready until V25/V26 evidence passes.

## V25 Same-cat & Motion QA

### Development Tasks

1. Add same-cat consistency score from safe trait / feature summaries.
2. Add motion amplitude score per action.
3. Add adjacent frame delta and flicker checks.
4. Add loop closure check for base loop actions.
5. Add anchor drift check.
6. Add QA result aggregation for V22 review.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md`

Must prove:

- identity drift fixture rejected；
- weak motion fixture rejected；
- high frame delta fixture rejected；
- loop closure failure rejected；
- accepted candidate proceeds to V22 visual review required / approved path。

Status: passed scoped with `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md`.
V25 acceptance only means the candidate can proceed to V22 visual review. It
does not mean user visual approval, preview, apply, rollback, or V28 final
acceptance.

## V26 Auto Pack + Preview + Target Apply

### Development Tasks

1. Assemble `pet.json + frames/` from approved candidate output.
2. Generate preview model for 8 core actions.
3. Add isolated preview session.
4. Add user approval state per candidate.
5. Apply only to target PetInstance.
6. Add rollback record and restore action.

### Acceptance

Evidence: `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md`

Status: passed scoped with `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md`.
V26 proves approved-candidate pack assembly, isolated 8-action preview,
target-only apply, and rollback. It does not prove retry/cost/failure guidance,
final dashboard evidence, or V28 productized workflow acceptance.

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

Evidence: `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md`

Status: passed scoped with `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md`.
V27 proves retry budget enforcement, repeated-failure repair guidance, provider
consent/credential/disclosure blocking, actionable next steps, and previous
visible pack preservation. It does not prove final dashboard evidence or V28
productized workflow acceptance.

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

## Cross-phase Runtime Safety Rules

Preview must:

- send zero PetEvent；
- not call `notify`；
- not write `CatStateMachine`；
- not mutate live PetInstance state。

Apply must:

- affect exactly one target PetInstance；
- leave default and unrelated pets unchanged；
- support rollback to the previous visible pack。

## Provider Route Boundary

Provider-backed routes may resolve to `route_unavailable`, `provider_credential_missing`,
or `route_output_missing`. That is blocked evidence, not passed evidence.

Provider unavailable must not block local/fallback route evidence unless all
routes fail. Provider route success must not be expanded into provider
integration verified, low-retry reliability, or arbitrary-cat readiness claims.

## V28 Final Gate Prerequisites

V28 must not start until:

- V23 evidence exists；
- V24 evidence exists；
- V25 evidence exists；
- V26 evidence exists；
- V27 evidence exists；
- every phase has passed / blocked / failed status；
- at least one candidate reaches approved state；
- approved candidate previews all 8 core actions；
- approved candidate applies target-only；
- rollback restores the previous visible pack；
- final HTML embeds real visual evidence；
- security scan passes；
- claim scan passes。
