# V40 Development And Acceptance Plan

Date: 2026-06-30

## Stage Objective

Build a no-WebUI local high-quality 2D action asset track after V39. The stage
must prove or honestly block the Direct Local Runner / Ollama route before making
quality claims. Development remains phase-by-phase and evidence-first.

## Phases

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V40.0 Documentation readiness | create and align PRD, architecture, milestones, acceptance, drawio, claim matrix | document audit, drawio page check, claim/security scan | `docs/V40.x/evidence/v40_0-documentation-readiness-YYYY-MM-DD.md` |
| V40.1 Local blocked baseline | record GPU/Ollama and ComfyUI blocked evidence | preserve V40.1 as historical blocked evidence | `v40_1-local-tool-smoke-YYYY-MM-DD.md` |
| V40.1A Direct Local Runner smoke | verify project-owned runner dependency summary, GPU/model summary, safe output directory, Ollama advisory boundary | run non-sensitive local smoke or record stable blocked reason | `v40_1a-direct-runner-smoke-YYYY-MM-DD.md` |
| V40.2 No-WebUI workflow contract | define safe run request, candidate summary, output refs, reason codes | unit tests reject raw paths, remote URLs, raw prompts, unsafe payloads | `v40_2-no-webui-workflow-contract-YYYY-MM-DD.md` |
| V40.3 Candidate generation/import | generate via Direct Local Runner or explicitly import high-quality candidates for at least two tested cat samples and one blocked/negative sample | evidence includes sanitized thumbnails and stable failure reasons | `v40_3-candidate-generation-YYYY-MM-DD.md` |
| V40.3R Recovery | after V40.3 failure, test direct img2img and identity-conditioned recovery inside V40 | explicit visual review or stable blocked reason | `v40_3r-*-2026-06-29.md` |
| V40.3R2 Identity repair result | repair identity-runner compatibility and run one bounded stylized retry | real candidates generated, but explicit visual review failed; V40.4 remains No-Go | `v40_3r2-identity-conditioned-repair-YYYY-MM-DD.md` |
| V40.3R3 Candidate source decision | choose accepted manual/import first, a materially different direct-runner route, or failed/blocked with V39 fallback | PRD/spec review, route audit, source/license/sample-binding rules, visual acceptance preconditions, claim/security scan | `v40_3r3-candidate-source-decision-YYYY-MM-DD.md` |
| V40.4 Normalization and action packaging | normalize accepted outputs to frameSequence/sprite manifest and action coverage | reject malformed/missing/unsafe outputs; compare against V39 baseline | `v40_4-normalization-action-packaging-YYYY-MM-DD.md` |
| V40.5 Product preview/apply/rollback | expose accepted candidate in settings/product path | target-only apply and rollback preserve previous active pack on failure | `v40_5-product-preview-apply-rollback-YYYY-MM-DD.md` |
| V40.6 Visual report | create Chinese HTML report with screenshots and same-sample V39/V40 comparison | report is not blank, shows accepted/blocked candidates, lists risks | `v40_6-visual-report-YYYY-MM-DD.html` |
| V40.7 Final gate | run full baseline, smoke, scans, PRD/spec review | decide passed scoped / blocked / failed | `v40_7-final-gate-YYYY-MM-DD.md` |

## Required Baseline Commands

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v39_8_final_gate_smoke.mjs
```

Future V40 implementation must add V40-specific smoke scripts only after this
no-WebUI documentation update is accepted. No V40 final gate may pass without
real Direct Local Runner/model evidence or a stable blocked reason.

Implementation details are controlled by:

- `docs/V40.x/v40-implementation-contract.md`
- `docs/V40.x/v40-phase-specs.md`

## Go / No-Go Rules

- Go to V40.1A only after no-WebUI docs and drawio pass.
- Go to V40.3 only after Direct Local Runner/model smoke passes or the route is
  explicitly narrowed to import-ready/manual assets.
- V40.3R2 was allowed because V40.3 failed, V40.3R img2img failed, and
  V40.3R identity-conditioned generation was blocked by runner compatibility.
- V40.3R2 repaired that compatibility and generated real candidates, then a
  bounded stylized retry, but both failed explicit visual review.
- Go to V40.3R3 only as an in-place candidate-source decision after V40.3R2
  failure; it must not start product code or claim asset success.
- Go to V40.4 only after a future approved route produces at least two
  same-sample candidates that pass explicit visual review.
- Go to V40.5 only after candidate assets pass normalization and visual gates.
- V40.7 is No-Go until every previous phase has passed, blocked, or failed
  evidence.

## Detailed Development And Acceptance Outline

This outline controls the remaining V40 work. It is intentionally ordered so
that implementation cannot silently skip audit, real data, visual evidence, or
failed-quality handling.

### V40.1A Direct Local Runner Smoke

Development plan:

- create `apps/desktop/src/assets/v40-direct-local-runner.ts` only for
  dependency/model/readiness summaries;
- create or update a smoke script that can run from the repo without WebUI or
  ComfyUI;
- collect safe GPU, dependency, model/checkpoint, output-directory, and Ollama
  advisory summaries;
- redact absolute paths, raw prompts, raw payloads, raw photos, raw image bytes,
  and terminal transcripts.

Acceptance plan:

- pass only if the direct runner boundary is reachable and can report a safe
  model/checkpoint summary;
- block if runner dependencies, local model, GPU access, or safe output contract
  are unavailable;
- fail if the smoke leaks sensitive values or claims quality without candidate
  evidence.

Evidence:

- `docs/V40.x/evidence/v40_1a-direct-runner-smoke-YYYY-MM-DD.md`.

### V40.2 No-WebUI Workflow Contract

Development plan:

- implement `V40NoWebUIRunRequest`, `V40HybridCandidateSummary`, and
  `V40ProductGateSummary`;
- implement reason-code validation and safe relative reference validation;
- add unit tests for accepted and rejected fixtures.

Acceptance plan:

- pass only if unsafe paths, remote URLs, raw prompts, raw runner payloads,
  malformed action coverage, and missing sample binding are rejected;
- block if V40.1A was blocked and the route is formally narrowed to manual or
  professional import;
- fail if unsafe candidate data can reach V40.3.

Evidence:

- `docs/V40.x/evidence/v40_2-no-webui-workflow-contract-YYYY-MM-DD.md`.

### V40.3 Candidate Generation Or Explicit Import

Development plan:

- use at least two tested cat samples and one negative or blocked sample;
- either generate candidates through the Direct Local Runner or import explicit
  source-bound high-quality candidate assets when local generation is blocked;
- keep V39 same-sample baseline references for every candidate;
- generate sanitized thumbnails/contact sheets for review.

Acceptance plan:

- pass only if at least two sample-bound candidates exist for review and one
  blocked/negative sample has a stable reason;
- block if the direct route was ready but cannot produce usable outputs and no
  accepted import assets exist;
- fail if candidates drift identity, bypass sample binding, or leak unsafe data.

Evidence:

- `docs/V40.x/evidence/v40_3-candidate-generation-YYYY-MM-DD.md`.

Current result:

- V40.3 failed on 2026-06-29. Real local prompt-only candidates were generated
  for tested samples, but visual review rejected them for same-cat identity and
  action consistency.

### V40.3R / V40.3R2 Recovery

Development plan:

- keep recovery inside the existing V40 stage;
- record V40.3R direct img2img as failed because explicit visual review rejected
  the generated candidates;
- record V40.3R identity-conditioned generation as initially blocked because
  the local runner stack was incompatible before candidate generation;
- record V40.3R2 as the compatibility-repair attempt that generated real
  same-sample candidates plus one bounded stylized retry;
- record V40.3R2 as failed because explicit visual review rejected both sets for
  photo-like backgrounds, artifacts, and weak eight-action semantics;
- allow accepted same-sample manual/import assets only in a future route when
  source, license, sample binding, and visual acceptance evidence already exist;
- keep V39 as the fallback unless a future route produces at least two accepted
  candidates.

Acceptance plan:

- pass implementation only if at least two same-sample candidates pass explicit
  visual review;
- fail implementation if real candidates are generated but visual review rejects
  them;
- fail documentation if it suggests V40.4 can start from V40.3R2 failed
  candidates or from smoke-only runner evidence.

Evidence:

- `docs/V40.x/evidence/v40_3r-recovery-decision-2026-06-29.md`.
- `docs/V40.x/evidence/v40_3r2-documentation-readiness-YYYY-MM-DD.md`.
- `docs/V40.x/evidence/v40_3r2-identity-conditioned-repair-2026-06-30.md`.
- `docs/V40.x/evidence/v40_3r2-identity-conditioned-repair-stylized-2026-06-30.md`.

### V40.3R3 Candidate Source Decision

Development plan:

- stay inside the existing V40 stage and do not create V41;
- audit the failed V40.3 prompt-only, V40.3R img2img, and V40.3R2
  identity-conditioned evidence before selecting any next route;
- prefer accepted same-sample manual/import assets only when source, license,
  sample binding, and visual acceptance evidence already exist;
- allow a new Direct Local Runner route only if the pre-development audit proves
  materially different identity controls, full-body action controls, and visual
  acceptance strategy from the failed routes;
- otherwise keep V40 failed/blocked and V39 fallback active.

Acceptance plan:

- pass documentation only if one route decision is recorded with exact
  pass/block/fail criteria and no false V40.4 unlock;
- block if no accepted assets and no materially different direct-runner route are
  available;
- fail if the decision repeats V40.3R2 failed outputs, hides quality failure, or
  implies high-quality generation is ready.

Evidence:

- `docs/V40.x/evidence/v40_3r3-candidate-source-decision-YYYY-MM-DD.md`.

### V40.4 Normalization And Action Packaging

Development plan:

- normalize accepted candidates into the existing safe frameSequence/sprite
  manifest shape;
- require the eight-action set: idle, walk, jump, sleep, eat, play, alert,
  celebrate;
- reject transform-only motion and malformed asset references;
- compute same-sample V39/V40 comparison status.

Acceptance plan:

- pass only if at least two candidates normalize into runtime-safe packs and
  score `better_than_v39` or pass documented human visual preference;
- block if output is visually promising but cannot be normalized safely;
- fail if actions are missing, motion is transform-only, or V40 is not better
  than V39.

Evidence:

- `docs/V40.x/evidence/v40_4-normalization-action-packaging-YYYY-MM-DD.md`.

### V40.5 Product Preview / Apply / Rollback

Development plan:

- expose only accepted V40 candidates through the settings/product path;
- show readiness, sample binding, V39 baseline, V40 preview, action evidence,
  blocked reasons, target-only apply, and rollback;
- preserve the previous active pack on failed apply.

Acceptance plan:

- pass only if accepted candidates preview, target-only apply, and rollback with
  screenshot or smoke evidence;
- block if UI automation cannot run in the current environment with a stable
  reason;
- fail if failed candidates can be applied or rollback corrupts the active pack.

Evidence:

- `docs/V40.x/evidence/v40_5-product-preview-apply-rollback-YYYY-MM-DD.md`.

### V40.6 Visual Evidence Report

Development plan:

- create a Chinese HTML report that shows source/sanitized sample refs, V39
  baseline visuals, V40 candidate visuals, action sheets, product path
  screenshots, accepted/blocked decisions, and residual risks;
- use automated screenshots when they do not disrupt the user environment.

Acceptance plan:

- pass only if the report is readable, nonblank, screenshot-backed, and honest
  about quality gaps;
- block if browser/screenshot tooling is unavailable but static artifacts are
  attached;
- fail if the report hides failures or presents weak assets as high quality.

Evidence:

- `docs/V40.x/evidence/v40_6-visual-report-YYYY-MM-DD.html`.

### V40.7 Final Scoped Gate

Development plan:

- run baseline tests, V40 smoke scripts, PRD/spec review, claim scan, security
  scan, and visual comparison review;
- write a final decision that is one of `passed scoped`, `blocked`, or `failed`.

Acceptance plan:

- pass only if two tested samples complete the full no-WebUI direct-runner or
  accepted import route, show same-sample improvement over V39, pass product
  preview/apply/rollback, and pass scans;
- block if local tools and accepted import/manual assets remain unavailable;
- fail if tools/assets are available but quality, safety, or product path does
  not meet V40 acceptance.

Evidence:

- `docs/V40.x/evidence/v40_7-final-gate-YYYY-MM-DD.md`.

## Pre-Phase Audit Loop

Before each implementation phase starts, create a short evidence note containing:

- controlling PRD/spec section;
- files in scope and out of scope;
- exact pass/block/fail criteria;
- real-data sample set or blocked reason;
- claim scan target;
- security scan target;
- open audit findings and their closure.

Implementation may start only when the pre-phase note has no fatal or major
spec deviation. If later acceptance fails, return to the relevant phase plan,
update the evidence with the failure reason, and rerun the phase instead of
promoting a false pass.
