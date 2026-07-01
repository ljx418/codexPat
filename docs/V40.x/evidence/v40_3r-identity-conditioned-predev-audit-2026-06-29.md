# V40.3R Identity-Conditioned Pre-Development Audit

Date: 2026-06-29

## Controlling Documents

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Phase specs: `docs/V40.x/v40-phase-specs.md`
- Previous V40.3 failure: `docs/V40.x/evidence/v40_3-candidate-generation-2026-06-29.md`
- Direct img2img failure: `docs/V40.x/evidence/v40_3r-img2img-recovery-2026-06-29.md`

## Subphase Objective

Try the remaining documented V40.3R recovery path: direct identity-conditioned
local generation using Diffusers IP-Adapter from the repo-owned runner
environment. This remains inside V40.3R and is not a new project phase.

## Development Plan

1. Use the existing direct local checkpoint and downloaded public IP-Adapter
   model cache through Diffusers APIs.
2. Use real V38 sanitized public cat samples as reference images.
3. Generate eight action candidates per tested sample and contact sheets.
4. Write safe candidate refs and a visual review requirement into evidence.
5. Do not enter V40.4 unless explicit visual review accepts at least two
   same-sample candidates as safe to normalize.

## Acceptance Plan

Pass only if:

- two tested sample-bound candidates are generated;
- reference identity is visibly retained across all eight actions;
- each action is readable at desktop-pet preview size;
- no multi-subject, humanoid, clothing, text/logo, or prompt artifacts appear;
- outputs are clearly better than V39 and safe for V40.4 normalization;
- claim/security scans pass.

Fail if:

- generated assets are attractive but not the same cat across actions;
- action semantics are weak or static;
- artifacts make the candidate unsuitable for product preview.

Block if:

- IP-Adapter weights or image encoder cannot be loaded in the current environment;
- GPU memory or dependency errors prevent generation.

## Audit Opinion

No fatal specification deviation is open before implementation. This route is
more promising than prompt-only and img2img because it can use the source image
as identity guidance while still allowing full-body generation. However, it
still has a high risk of generic stylization, action drift, or weak identity
locking. The pass bar remains visual evidence, not tool execution.

## Claim And Security Boundary

Evidence may mention safe model labels and relative candidate refs only. It must
not include raw prompt payloads, raw image bytes, full local paths, token values,
Authorization values, credential paths, config paths, raw photo bytes, or
EXIF/GPS.
