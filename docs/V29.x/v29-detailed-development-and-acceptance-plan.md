# V29 Detailed Development And Acceptance Plan

文档状态：active detailed plan；planned。
当前日期：2026-06-16。

## Execution Rule

V29 must run phase-by-phase. V29.6 is No-Go until V29.0-V29.5 have explicit
evidence. No V29 phase may be marked passed without runtime, DOM, screenshot, or
smoke evidence matching its scope.

## V29.0 Scope Freeze

Development tasks:

1. Confirm V29 PRD, architecture, plans, claim matrix, implementation contract,
   and evidence index exist.
2. Confirm active docs point to V29.
3. Confirm V23-V28 is only the scoped baseline.
4. Confirm Petdex is used as UX/quality reference only, not asset source.
5. Validate drawio XML.
6. Export or screenshot drawio when tooling permits.

Acceptance:

- all required docs exist；
- active docs point to V29；
- forbidden claims appear only in forbidden / not-ready / not-implied context；
- drawio parse passes；
- V29.0 evidence written。

No-false-green risks:

- treating V23-V28 final report as V29 evidence；
- treating Petdex comparison as asset reuse authorization；
- treating planned benchmark as passed benchmark。

## V29.1 Gallery Browser UX

Development tasks:

1. Build or refine gallery data model for local pet packs.
2. Add gallery list/grid with style, color, renderer, quality, and favorite
   metadata.
3. Add search/filter/sort/favorite interactions.
4. Add isolated 8-action preview panel.
5. Add target PetInstance selector.
6. Add one-click switch and install history rollback.
7. Add empty, loading, invalid-pack, and fallback states.

Acceptance:

- user can browse gallery without reading technical manifests；
- user can filter/search；
- user can favorite and unfavorite；
- user can preview all 8 core actions before applying；
- preview sends zero PetEvent；
- preview does not write CatStateMachine；
- one-click switch affects only the selected target PetInstance；
- default and unrelated pets unchanged；
- rollback restores previous visible pack；
- evidence contains screenshot or DOM capture。

Stop conditions:

- preview mutates live pet；
- one-click switch falls back to default target silently；
- full local path or raw manifest appears in UI/evidence；
- missing/corrupt pack creates blank preview instead of visible fallback。

## V29.2 Stable Photo Benchmark Harness

Development tasks:

1. Build benchmark sample registry.
2. Include existing local `docs/猫*.jpg` samples when present.
3. Require at least 12 diverse samples or mark `benchmark_sample_missing`.
4. Run fixed-budget routes over all samples.
5. Collect accepted / blocked / failed result per sample.
6. Generate benchmark table and repair guidance.

Acceptance:

- at least 12 samples are present, or phase is blocked with sample gap；
- fixed budget is enforced；
- no per-sample manual tuning outside accepted repair policy；
- accepted-candidate rate is at least 80% for stable workflow claim；
- each failed sample has actionable guidance；
- no raw photo bytes, EXIF/GPS, private filename, full local path, token, or
  Authorization in evidence。

Stop conditions:

- benchmark uses fewer than required samples but claims stability；
- single-sample smoke is treated as benchmark；
- provider/local route raw payload appears in evidence；
- failed samples do not produce user-facing guidance。

## V29.3 Quality Gate V2 And Ranking

Development tasks:

1. Implement or refine same-cat consistency scoring.
2. Implement motion amplitude thresholds.
3. Implement background/alpha gate.
4. Implement frame delta and loop closure checks.
5. Implement 1x / 0.75x readability checks.
6. Add aesthetic ranking only after hard gates pass.
7. Produce rejected-case fixtures and accepted-case fixtures.

Acceptance:

- missing action rejected；
- weak motion rejected；
- identity drift rejected；
- unsafe background rejected；
- blank/transparent/off-canvas frame rejected；
- flicker or sudden jump rejected；
- loop mismatch rejected；
- aesthetic ranking cannot override hard failure；
- accepted candidates are ranked with safe score buckets。

Stop conditions:

- duplicated idle frames pass as action coverage；
- weak motion passes because same-cat score is high；
- a high aesthetic score overrides a hard QA failure；
- QA evidence lacks visual/contact-sheet proof。

## V29.4 Productized Upload/Generate Wizard

Development tasks:

1. Build wizard flow: upload, check, generate, QA, preview, apply, rollback.
2. Add visible progress states.
3. Add candidate comparison and selected candidate state.
4. Add blocked state with next-step guidance.
5. Integrate Quality Gate V2 results.
6. Block apply for QA-failed candidates.

Acceptance:

- user can complete tested upload -> generate -> preview -> apply -> rollback
  without shell commands；
- user can inspect all 8 actions before applying；
- QA-failed candidate cannot apply；
- apply affects target PetInstance only；
- rollback restores previous visible pack；
- default and unrelated pets unchanged；
- raw provider output, raw photo bytes, full path, prompt private text, token,
  and Authorization absent from evidence。

Stop conditions:

- wizard requires manual manifest editing；
- wizard exposes provider raw output；
- failed candidate can apply；
- apply changes default/unrelated pets；
- rollback loses previous visible pack。

## V29.5 Asset Polish And Install History

Development tasks:

1. Improve default high-quality animated 2D gallery entries.
2. Ensure at least 12 quality gallery entries or block with explicit gap.
3. Add install history and recent packs.
4. Add visual QA for gallery packs.
5. Add polished empty/error/loading states.
6. Record performance and responsiveness notes.

Acceptance:

- at least 12 gallery entries visible or explicit blocked gap；
- each accepted gallery pack has 8-action preview；
- no blank, transparent, off-canvas, or flash-frame accepted pack；
- 1x and 0.75x readability passes；
- install history supports rollback；
- user-facing copy is product-level, not engineering jargon。

Stop conditions:

- gallery still feels like raw asset manager；
- accepted pack flickers or blanks；
- install history stores raw path/private filename；
- rollback has no visible previous pack。

## V29.6 Final Gate

Development tasks:

1. Collect V29.0-V29.5 evidence.
2. Generate HTML report with embedded screenshots/contact sheets.
3. Run regression checks selected for touched packages.
4. Run security scan.
5. Run claim scan.
6. Run artifact/license scan.
7. Write final acceptance report.

Acceptance:

- all V29.0-V29.5 phases have explicit evidence；
- gallery UX gate passed；
- photo benchmark gate passed；
- Quality Gate V2 passed；
- wizard/apply/rollback gate passed；
- final HTML embeds real visual evidence；
- security scan passed；
- claim scan passed；
- final claim matches evidence。

Stop conditions:

- benchmark threshold fails；
- final HTML has no screenshots/contact sheets；
- forbidden claims appear as ready；
- evidence contains private data；
- V29.6 starts before V29.0-V29.5 evidence exists。

## Minimum Regression Set

The exact regression set may expand when code changes touch shared areas.
Minimum expected checks:

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v23_photo_suitability_trait_smoke.mjs
node scripts/v24_multi_route_generation_smoke.mjs
node scripts/v25_same_cat_motion_qa_smoke.mjs
node scripts/v26_pack_preview_apply_smoke.mjs
node scripts/v27_retry_cost_guidance_smoke.mjs
node scripts/v28_productized_workflow_gate.mjs
```

If any legacy smoke is environment-blocked, evidence must record the exact
blocking reason and V29.6 must decide whether it is blocking for the touched
scope.
