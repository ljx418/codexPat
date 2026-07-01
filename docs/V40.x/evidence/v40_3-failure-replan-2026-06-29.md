# V40.3 Failure Replan

Date: 2026-06-29

## Current Decision

V40.3 remains failed. The Direct Local Runner can produce local candidate images,
but the generated outputs do not satisfy the V40 target-experience requirement
for source-bound, same-cat, high-quality 2D action assets.

Do not enter V40.4 normalization, V40.5 product preview/apply/rollback, V40.6
visual report, or V40.7 final gate until V40.3 has at least two visually reviewed
same-sample candidates that are safe to normalize.

## Real Attempts

- `anything-v5` local checkpoint: generated candidates had multi-subject frames,
  humanoid/anime drift, text/logo-like artifacts, and unreadable action semantics.
- `dreamshaper-8` local checkpoint file: produced more attractive single-action
  images, but still failed same-cat identity stability and source-photo binding.
- Prompt fixes applied:
  - real V38 sample IDs restored;
  - prompt shortened to avoid CLIP token truncation;
  - black-white sample wording changed away from clothing-triggering terms;
  - single-cat and sleep-alone constraints strengthened.

## PRD / Spec Review

The V40 PRD requires a maintainer to compare V39 and V40 for the same tested
cat samples and quickly decide whether V40 is better. The current answer is:

- visual polish is better than V39;
- source-bound identity and action consistency are not good enough;
- final product experience is not ready;
- V40 cannot claim photo-to-action asset generation readiness.

## Risk Closure Plan

1. **Direct checkpoint prompt-only route**
   - Current result: insufficient.
   - Advantage: already runs locally on the project-owned runner.
   - Cost: low.
   - Risk: high identity drift; unlikely to satisfy V40 alone.

2. **Direct img2img / identity-conditioned route without WebUI or ComfyUI**
   - Required work: add direct Diffusers img2img and, if needed, direct IP-Adapter
     or ControlNet model loading under repo scripts.
   - Advantage: can keep all execution inside project-owned Python scripts and
     avoid WebUI/ComfyUI service dependency.
   - Cost: medium to high because model downloads, cache hygiene, consent, and
     GPU memory need real evidence.
   - Risk: medium; best next technical route if automatic generation remains the
     goal.

3. **Manual/import same-sample high-quality source-bound assets**
   - Required work: import supplied professional or externally generated action
     sheets with license/source boundary evidence.
   - Advantage: highest chance of target visual quality.
   - Cost: requires external asset creation or user-supplied material.
   - Risk: does not prove automatic generation.

4. **Fallback to V39 characterized local rig**
   - Required work: keep V39 as the honest current product fallback.
   - Advantage: already evidence-backed and scoped.
   - Cost: no V40 quality leap.
   - Risk: does not meet the user-visible target for high-quality generated assets.

## Next Recommended Subphase

Open V40.3R as a recovery subphase inside the existing V40 plan, not a new
project stage:

- implement direct img2img candidate generation against the real V38 sanitized
  input photos;
- verify local model availability with safe model summaries only;
- generate at least two same-sample candidate sheets;
- require explicit visual review JSON before V40.3 can pass;
- keep WebUI and ComfyUI as non-active dependencies.

## Claim And Security Scan

- Claim scan: passed. No final V40, arbitrary-cat, Petdex parity, provider,
  production, Windows, cross-platform, WebUI-ready, or ComfyUI-ready claim is
  made.
- Security scan: passed. This document records safe model labels, sample IDs,
  and relative evidence references only; it does not include raw prompt payloads,
  raw photo bytes, full local paths, token values, Authorization values, config
  paths, or credential paths.
