# V40 Document Audit

Date: 2026-06-30

## Audit Objective

Verify whether the V40 document set can guide the next no-WebUI implementation
phase after V40.1 proved ComfyUI blocked and historical V40.1A proved WebUI
blocked.

## Findings

- PRD defines the no-WebUI Direct Local Runner target and user experience.
- Target architecture names concrete code entities and separates external tools,
  project gates, product UI, and evidence.
- Development plan defines V40.1A-V40.7 phase order and evidence names.
- Acceptance plan keeps user-visible quality, product, claim, and security gates
  explicit.
- Current gap analysis records the exact delta from V39 prototype-quality assets
  to V40 no-WebUI quality goals.
- Risk matrix records ComfyUI blocked, WebUI blocked, Direct Local Runner,
  Ollama, GPU/model, and
  quality failure modes.
- Implementation contract defines safe summaries, run request shape, candidate
  summary shape, product gate summary, and stable reason codes.
- Evidence checklist defines required evidence, visual evidence, claim scan, and
  security scan.

## Audit Opinion

The revised document set is sufficient to guide V40.1A-V40.7 no-WebUI
implementation without requiring the implementer to choose the main route. It
does not prove that Direct Local Runner output will be attractive or better than
V39. Later implementation must generate real same-sample evidence or mark the
phase blocked/failed. If no-WebUI output still looks like prototype SVG art, final V40
must fail or block rather than pass.

The no-WebUI documentation readiness evidence exists at
`docs/V40.x/evidence/v40_0-no-webui-documentation-readiness-2026-06-29.md`.
The V40.3R2 route decision and documentation audit exists at
`docs/V40.x/evidence/v40_3r2-route-decision-and-doc-audit-2026-06-30.md`.
Earlier V40.0 local-hybrid documentation evidence remains historical and is
superseded for active route details by the no-WebUI in-place V40 revision and
the V40.3R2 default-route decision.

## Independent Audit Rounds

Round 1: PRD-to-architecture trace.

- Result: sufficient after the in-place no-WebUI update. The PRD target flow,
  target architecture chain, phase specs, and drawio all use Direct Local Runner
  as the active generation route.
- Required closure before code: evidence must quote the authoritative PRD as
  `docs/active/agent_desktop_pet_prd_v40.md`.

Round 2: architecture-to-code-entity trace.

- Result: sufficient for implementation planning. The architecture names the
  planned modules, adapters, gates, data contracts, reason codes, UI boundary,
  and evidence shape.
- Required closure before code: implementation must not create a WebUI or
  ComfyUI adapter as an active dependency.

Round 3: phase-to-acceptance trace.

- Result: sufficient after the detailed phase plan is followed. V40.1A-V40.7
  each have entry criteria, pass/block/fail rules, evidence names, claim scan,
  and security scan requirements.
- Required closure before code: each phase must create its own pre-development
  plan and audit note before implementation work starts.

Round 4: claim and safety trace.

- Result: sufficient. Forbidden claims are repeated in the PRD, acceptance plan,
  risk matrix, active docs, and evidence checklist.
- Required closure before final gate: final evidence must prove that forbidden
  claims only appear in forbidden/not-ready contexts.

## Current Execution Update

Historical V40.1A WebUI Aki smoke evidence exists at
`docs/V40.x/evidence/v40_1a-webui-aki-smoke-2026-06-29.md`. It is blocked, not
passed: GPU, Ollama, local checkpoint, and safe output directory are available,
but WebUI API is unavailable and the WebUI Python runtime is incompatible.
The active V40 route no longer attempts to fix this blocker. Later evidence
shows V40.1A Direct Local Runner smoke and V40.2 no-WebUI workflow contract have
passed scoped.

V40.3 generated real prompt-only local candidates but failed visual
target-experience review. V40.3R direct img2img used real V38 sanitized public
cat samples but also failed visual target-experience review. V40.3R
identity-conditioned generation reached the local adapter path but was blocked
by runner-stack compatibility before candidate generation.

V40.3R2 then repaired the identity-conditioned runner compatibility enough to
generate real same-sample candidates and one bounded stylized retry. Both sets
failed explicit visual review because they remained photo-like or
artifact-prone and did not show readable eight-action desktop-pet semantics.
Therefore V40.4-V40.7 remain No-Go.

The next document-supported step is not another silent retry inside V40.3R2.
Future implementation needs V40.3R3 candidate-source decision inside the same
V40 no-WebUI/no-ComfyUI boundary. V40.3R3 must choose accepted manual/import
first, a materially different Direct Local Runner route, or failed/blocked with
V39 fallback. An explicitly source/licensed same-sample import route still needs
visual acceptance evidence before development continues.

The V40.3R3 documentation support audit is recorded at
`docs/V40.x/evidence/v40_3r3-documentation-support-audit-2026-06-30.md`. Its
conclusion is intentionally narrow: the documents are sufficient for the next
candidate-source decision, but they cannot guarantee final high-quality asset
success without real accepted candidates.

The historical V40.3R3 execution and acceptance outline is recorded at
`docs/V40.x/v40_3r3-detailed-development-and-acceptance-plan.md`. Current
execution is controlled by V40.3R4/R5/R6: route freeze, direct-runner predev
audit, then controlled candidate frame generation and explicit visual review.
V40.4 remains locked until V40.3R5 passes and V40.3R6 has at least two
same-sample visual-review passes.

## External Audit Recommendation

External review is optional after the internal V40.3R3 audit. The highest-value
audit is to check whether the documents over-claim image-to-action readiness,
imply V40.4 can start without accepted visual candidates, repeat failed V40.3R2
outputs as accepted assets, or leave WebUI/ComfyUI as hidden active
dependencies.
