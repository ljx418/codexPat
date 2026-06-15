# PRD: Agent Desktop Pet V8 Provider-backed Photo-to-3D Productization

status: active
date: 2026-06-03

## Product Goal

V8 turns the V7 scoped personalized asset workflow into a provider-backed
photo-to-3D productization track. After V8.7 scoped acceptance, V8.9-V8.11 add
a separate animated 2D sprite extension track for local multi-frame asset
assembly and visual QA.

```text
user-approved cat photo / traits
  -> explicit provider consent and credential boundary
  -> real named-provider 3D output
  -> GLB/GLTF deep validation and normalization
  -> action clip / fallback mapping
  -> runtime visual QA
  -> user-facing guided activation
  -> evidence-matched productization gate
```

V8 must not reopen V3/V4 Codex monitoring, V5 renderer security contracts, V6
local productization, or V7 scoped acceptance. V7 remains accepted for tested
generated 2D and imported GLB/GLTF runtime scenarios. V8 exists because V7
explicitly left automatic photo-to-3D and provider integration not-ready.

V8.9-V8.11 do not replace the provider-backed 3D track. They add a productized
path for users who have or generate 2D action frames and want the current orange
cat-style assets to move with real frame animation.

## User Experience Target

The target user can:

1. choose a local cat photo or enter cat traits.
2. review safe traits and consent before any upload or provider call.
3. choose a named provider path with visible cost, privacy, retention, license,
   and attribution notes.
4. generate or import a provider-produced 3D asset.
5. validate and normalize the asset into a local pack.
6. map safe core actions to clips or fallback states.
7. preview the result at 1x and 0.75x scale.
8. activate the pack for exactly one PetInstance.
9. delete/deactivate the pack and return to a safe visible cat.

Additional animated 2D target:

1. choose a local folder of action PNG frames.
2. assemble those frames into a validated animated sprite pack.
3. optionally generate safe instructions/prompts for creating the frames.
4. activate the pack for exactly one PetInstance.
5. verify the animated cat stays visible and falls back safely.

## Non-goals

V8 does not claim:

```text
production signed release ready
cross-platform ready
Windows ready
provider integration verified
automatic photo-to-3D ready without a named accepted provider scenario
broad 3D ready
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
AI asset generation ready from prompt-only evidence
automatic photo-to-animation ready
broad animated sprite generation ready
MCP ready
Third-party agent integration verified
OS-level Codex window binding ready
all Codex workflows verified
```

## Privacy And Safety Boundary

Default behavior:

- no upload without explicit consent.
- no raw photo persistence by default.
- no EXIF/GPS persistence.
- no full local path in evidence, prompts, manifests, diagnostics, or renderer
  payloads.
- no provider credential in manifest, renderer, evidence, or logs.
- no raw provider response in evidence or renderer.
- no remote asset URL is used at runtime; provider output must be imported into
  local app-managed storage after validation.

Allowed evidence fields:

- provider name.
- consent decision.
- credential state: `configured`, `missing`, `not_used`, `redacted`.
- safe trait summary approved by the user.
- provider job status and stable reason code.
- generated asset type and sanitized metadata.
- GLTF scanner decision and safe field names checked.
- safe pack ID, renderer kind, action IDs, and target PetInstance ID.
- screenshots or recordings under evidence directories.

## Core Actions

V8-generated or provider-imported packs must target:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

If the provider output lacks per-action animation clips, V8 must map missing
actions to explicit fallback clips or fallback visual states and report the
fallback in evidence. Missing action coverage cannot be hidden.

Animated 2D sprite packs must use the same core action list. V8.9 local assembly
requires 2-48 PNG frames for each claimed action group and must not persist the
source folder path in diagnostics or evidence.

## V8 Roadmap

| Phase | Goal | Maximum Allowed Claim After Accepted Evidence |
| --- | --- | --- |
| V8.0 | scope freeze, provider decision, claim matrix | V8 provider-backed photo-to-3D productization scope frozen with explicit no-go boundaries. |
| V8.1 | provider credential and consent harness | V8.1 provider consent and credential harness passed for tested redacted local scenarios. |
| V8.2 | real named-provider 3D output smoke | V8.2 named-provider photo-to-3D output smoke passed for tested explicit-consent local scenario. |
| V8.3 | 3D asset normalization and action clip contract | V8.3 provider 3D asset normalization passed for tested local GLB/GLTF action contract scenarios. |
| V8.4 | runtime 3D action visual QA | V8.4 provider/imported 3D runtime visual QA passed for tested local provider-output scenario. |
| V8.5 | user-facing guided workflow | V8.5 guided photo-to-3D activation UX passed for tested local explicit-consent scenario. |
| V8.6 | operational hardening | V8.6 provider workflow diagnostics, deletion, retention, and redaction hardening passed for tested local scenarios. |
| V8.7 | V8 productization gate | V8 provider-backed personalized 3D cat workflow passed for named tested provider scenario only. |
| V8.8 | 3D rendering quality improvement | V8.8 3D rendering quality improvement passed for prototype GLB scenario. |
| V8.9 | local animated sprite pack assembler | V8.9 local animated sprite pack assembler passed for tested local frame-sequence asset scenarios. |
| V8.10 | AI-assisted animated sprite workflow | V8.10 AI-assisted animated sprite prompt workflow passed for tested local instruction-generation scenarios. |
| V8.11 | animated sprite visual QA gate | V8.11 animated 2D sprite runtime visual QA passed for tested local imported multi-frame pack scenario. |

## Productization Gate Rule

V8 Productization Gate may pass only if:

- V8.1 provider consent/credential boundary passes.
- V8.2 real provider 3D output exists and is accepted, or the gate narrows to a
  non-provider local-import-only claim.
- V8.3 GLTF/GLB deep scan and normalization pass.
- V8.4 runtime visual QA passes for all claimed action paths.
- V8.5 user workflow activation passes.
- V8.6 deletion, retention, diagnostics, and redaction pass.
- security, claim, license, artifact, and regression scans pass.

If real provider 3D output is missing, V8.7 must be `blocked` for automatic
photo-to-3D and may only close a narrower non-provider claim.

## Animated Sprite Extension Rule

V8.9-V8.11 may pass after V8.7 without reopening the provider-backed 3D
Productization Gate. Their evidence may support only animated 2D local assembly,
prompt/instruction, and visual QA claims.

V8.9-V8.11 must not claim:

- AI asset generation ready.
- automatic photo-to-animation ready.
- provider integration verified.
- 3D ready.
- Rive ready.
- Live2D ready.
- asset marketplace ready.
- production signed release ready.
