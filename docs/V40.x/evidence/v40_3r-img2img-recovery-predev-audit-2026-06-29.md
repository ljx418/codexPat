# V40.3R Img2Img Recovery Pre-Development Audit

Date: 2026-06-29

## Controlling Documents

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Phase specs: `docs/V40.x/v40-phase-specs.md`
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`
- Failure replan: `docs/V40.x/evidence/v40_3-failure-replan-2026-06-29.md`
- Previous failed evidence: `docs/V40.x/evidence/v40_3-candidate-generation-2026-06-29.md`

## Subphase Objective

Recover V40.3 inside the existing V40 plan by testing a direct local img2img
runner against real V38 sanitized cat samples. This is not a new project stage.
The objective is to determine whether real source-photo initialization improves
same-cat identity retention enough to create candidates that may enter V40.4.

## Development Plan

1. Add a project-owned direct img2img runner script using the existing local
   Diffusers environment and local checkpoint file summary.
2. Use the real V38 sanitized public cat samples:
   - `v38_a_cat_public`
   - `v38_tuxedo_public`
3. Generate eight candidate action images per sample and a contact sheet per
   sample into a safe evidence directory.
4. Add a V40.3R smoke script that records:
   - safe candidate refs;
   - model label only;
   - source sample IDs only;
   - negative/blocked sample reason;
   - explicit visual review status.
5. Require visual review JSON before any pass decision.

## Acceptance Plan

V40.3R can pass only if all of these are true:

- at least two tested same-sample candidates are generated or imported;
- all eight actions are present for each candidate;
- source-bound visible identity traits are preserved across actions;
- no multi-cat, humanoid, clothing, text/logo, or obvious prompt artifact appears;
- action semantics are readable enough for desktop-pet preview;
- generated candidates are safe to normalize in V40.4;
- claim scan and security scan pass.

V40.3R must fail if generated candidates are merely prettier than V39 but still
drift identity, style, action semantics, or source binding.

V40.3R must block if local img2img dependencies or model files are unavailable.

## Out Of Scope

- No WebUI or ComfyUI runtime dependency.
- No provider execution claim.
- No V40.4 normalization, product apply, HTML final report, or final V40 pass.
- No arbitrary-cat automatic generation claim.

## Audit Opinion

No fatal or major specification deviation is open before implementation. The
main risk is that direct SD1.5 img2img from close-up public photos may preserve
identity but fail full-body action semantics, or may improve action poses while
losing identity. That risk is acceptable only because this subphase has an
explicit failed outcome and cannot silently unlock V40.4.

## Required Evidence

- `docs/V40.x/evidence/v40_3r-img2img-recovery-2026-06-29.md`
- `docs/V40.x/evidence/v40_3r-img2img-visual-review-2026-06-29.json`
- `docs/V40.x/evidence/assets/v40-direct-img2img-candidates/`

## Claim And Security Boundary

Evidence must not include raw prompt payloads, raw image bytes, full local paths,
token values, Authorization values, credential paths, config paths, raw photo
bytes, or EXIF/GPS. Evidence may include safe sample IDs, safe model labels,
relative output refs, stable reason codes, and visual review observations.
