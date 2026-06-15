# V20 Detailed Development and Acceptance Plan

文档状态：planned detailed plan；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Phase-by-phase Rule

V20 must run phase-by-phase. V20.6 cannot start until V20.0-V20.5 each has
passed / blocked / failed evidence. V19 local motion-sheet evidence is a fallback
baseline, not V20 provider evidence.

V20.2 is no longer a single-output smoke. It must follow
`docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md` when multiple
real cat photos are available. A one-sample run is allowed only as scoped smoke
and cannot support low-retry reliability claims.

## V20.0 Scope Freeze

Development:

- Confirm V20 PRD, architecture, development, acceptance, claim, exit, contract,
  provider matrix, and drawio exist.
- Confirm active docs point to V20 planned.
- Confirm V19 is marked local motion-sheet scoped passed and provider branch blocked.
- Confirm Petdex remains a format/UX reference only.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_0-scope-freeze-YYYY-MM-DD.md`.
- Drawio XML parses.
- Forbidden claims only appear in forbidden/not-ready/not-implied contexts.

Stop if:

- Active docs still imply V19 provider branch passed.
- V20 final claim appears as passed before evidence.

## V20.1 Provider Consent Boundary

Development:

- Add or verify provider selector model with MiniMax as default P0.
- Require user consent before provider upload/generation.
- Require provider cost/privacy/retention/license/attribution disclosure.
- Check credential presence without printing credential.
- Show stable reasonCode for missing consent, terms, cost/privacy/retention/license, credential.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_1-provider-consent-boundary-YYYY-MM-DD.md`.
- Consent unchecked blocks provider call.
- Missing credential shows `provider_credential_missing`.
- Evidence contains no token, Authorization, raw photo bytes, raw provider response, full local path, or private filename.

Stop if:

- Provider call can start without explicit consent.
- Credential value appears in logs/evidence/UI.

## V20.2 MiniMax Motion Sheet Live Smoke

Development:

- Use real local test cat image only after consent.
- Call MiniMax reference-image/image-to-image path.
- Prompt asks for one 8-row x 9-column transparent motion sheet, with rows mapped to 8 core actions.
- Follow `docs/V20.x/v20_x-minimax-live-smoke-request-spec.md` for prompt,
  request, redaction, output, and evidence rules.
- Follow `docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md` for
  sample count, prompt variants, attempt budget, and QA-driven prompt repair.
- Save provider output only into documented evidence asset path.
- Record only safe provider summary fields.
- Evidence must include `reference_image_attached=true`,
  `provider_capability=reference_image_supported`, and
  `text_to_image_only=false` for any reference-image passed claim.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-YYYY-MM-DD.md`.
- If benchmark passes: status may proceed to V20.3 with provider benchmark evidence.
- If only one sample passes: status is scoped smoke only and must not claim low-retry reliability.
- If live output is one parseable image: status may pass to V20.3 for that sample.
- If output is missing, unavailable, separate images only, or unusable: status blocked/failed with reasonCode.

Stop if:

- Provider output is text-to-image only but claim says reference-image passed.
- Raw provider response or credential leaks.

## V20.3 Provider Output Normalization

Development:

- Parse provider image into 8 x 9 motion sheet candidate.
- Crop frames by safe grid.
- Detect visible background or unsafe alpha.
- Generate app-managed `pet.json + frames` candidate only if background gate passes.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-YYYY-MM-DD.md`.
- All 8 core action rows are detected.
- No background/alpha hard failure.
- App-managed pack contains only safe relative asset references.

Stop if:

- Output has unremovable background.
- Sheet cannot be parsed reliably.

## V20.4 Motion Quality QA

Development:

- Run nonblank, off-canvas, same-cat, motion amplitude, adjacent delta, loop closure, and 1x/0.75x readability checks.
- Use `docs/V20.x/v20_x-motion-quality-qa-thresholds.md` as the acceptance threshold source.
- Produce contact sheet and action summary.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-YYYY-MM-DD.md`.
- All 8 actions visible.
- Running/success/warning/error/need_input show meaningful motion difference.
- Loop actions do not visibly snap from final to first frame.
- QA failed pack cannot proceed to apply.

Stop if:

- Any action is transparent/blank/off-canvas.
- Cat identity changes between rows.
- Motion amplitude is too small for the target experience.

## V20.5 Preview / Apply / Rollback

Development:

- Show isolated preview for all 8 actions.
- Apply only accepted pack to selected PetInstance.
- Preserve default and unrelated pets.
- Rollback to previous active pack.

Acceptance:

- Evidence exists at `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-YYYY-MM-DD.md`.
- Preview sends zero PetEvent and writes no CatStateMachine.
- Target apply only changes target instance.
- Rollback restores previous active pack.

Stop if:

- Preview mutates live pet state.
- QA failed pack can apply.
- Default/unrelated pets change.

## V20.6 Final Gate

Development:

- Summarize V20.0-V20.5 evidence.
- Generate final report and HTML evidence page.
- Run regression, security scan, claim scan, and artifact scan.

Acceptance:

- Final report exists at `docs/V20.x/v20_6-final-acceptance-report.md`.
- HTML exists at `docs/V20.x/evidence/v20_6-provider-motion-sheet-html-YYYY-MM-DD.html`.
- Final claim is evidence-matched.

If provider branch blocks:

```text
V20 MiniMax provider motion-sheet branch blocked; V19 local motion-sheet workflow remains the accepted fallback baseline.
```

If provider branch passes:

```text
V20 mainland provider photo-to-motion-sheet workflow passed for the tested MiniMax reference-image motion-sheet scenario with QA, preview, target apply, and rollback.
```
