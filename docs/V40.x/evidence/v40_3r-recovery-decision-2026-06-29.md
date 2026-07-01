# V40.3R Recovery Decision

Date: 2026-06-29

## Development And Acceptance Scope

- Active PRD: `docs/active/agent_desktop_pet_prd_v40.md`.
- Phase spec: `docs/V40.x/v40-phase-specs.md`.
- Recovery scope: continue the existing V40 plan without WebUI or ComfyUI runtime
  dependency, using real V38 sanitized public cat samples where generation is
  attempted.
- Entry reason: V40.3 prompt-only local checkpoint candidates failed visual
  target-experience review and could not enter V40.4 normalization.

## Executed Recovery Routes

| Route | Evidence | Real Data | Result |
| --- | --- | --- | --- |
| Direct img2img recovery | `docs/V40.x/evidence/v40_3r-img2img-recovery-2026-06-29.md` | V38 sanitized public cat samples | failed |
| Identity-conditioned direct runner | `docs/V40.x/evidence/v40_3r-identity-conditioned-recovery-2026-06-29.md` | V38 sanitized public cat samples as references | blocked |

## PRD / Spec Review

- V40 requires high-quality 2D action candidates that preserve visible
  source-bound identity, provide readable eight-action semantics, and can be
  normalized safely before product preview/apply.
- V40.3 direct prompt generation produced more attractive static images than
  V39 deterministic SVG/frameSequence output, but did not preserve same-cat
  identity and action consistency.
- V40.3R direct img2img preserved identity better, but outputs remained
  photo-like and lacked readable full-body action semantics.
- V40.3R identity-conditioned direct runner reached the local identity-adapter
  dependency path but is blocked by runner-stack compatibility before candidate
  generation.
- V40.4 normalization cannot start because no V40.3 or V40.3R candidate has
  passed explicit visual review.

## Audit Opinion

- No fatal documentation contradiction remains after updating the active PRD,
  development plan, acceptance plan, gap analysis, and phase specs.
- The current automated development line has reached a real quality/runner
  boundary. Continuing into V40.4 would create a false acceptance risk.
- Superseded route wording on 2026-06-30: the next development plan must use
  identity-conditioned direct runner compatibility repair as the default
  recovery route before implementation continues.
- Accepted same-sample manual/import assets are allowed only as a fallback when
  source, license, sample binding, and explicit visual acceptance evidence
  already exist before implementation starts.
- If neither route can produce at least two visually reviewed same-sample
  candidates, keep V39 as the active fallback and mark V40.3R2 blocked or failed
  instead of advancing to V40.4.

## Claim Scan

- Status: passed.
- Narrow allowed claim: V40.3R direct img2img failed visual target-experience
  review, and V40.3R identity-conditioned direct runner is blocked by stack
  compatibility.
- Not claimed: arbitrary-cat automatic generation, provider integration,
  Petdex parity, 3D readiness, production release readiness, Windows readiness,
  cross-platform readiness, WebUI readiness, or ComfyUI readiness.

## Security Scan

- Status: passed.
- Evidence uses safe relative references and stable reason codes.
- No token, Authorization value, raw prompt, raw payload, raw image bytes, raw
  photo bytes, EXIF/GPS, full local path, workspace path, config path, or local
  credential content is recorded here.

## Decision

- Status: failed/blocked scoped.
- V40.4-V40.7 remain No-Go.
- Reason: no generated/imported V40.3R candidate passed explicit visual review
  as safe to normalize.
