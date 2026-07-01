# V40.3R4 Route Decision And Predev Audit

Date: 2026-07-01

## Decision

V40.3R4 selects `new_direct_runner_route_allowed` as the only documented next
route for the current V40 stage.

This decision does not approve assets, start product code, unlock V40.4, or
claim image-to-action quality. It only freezes the next technical path so later
automation can be audited before implementation.

## Hard Constraints

- Do not use WebUI as a project dependency.
- Do not use ComfyUI as a project dependency.
- Do not use cloud provider output as pass evidence.
- Do not use Ollama as an image or animation generator. Ollama is advisory only
  for prompt/rubric text and sanitized review notes.
- Do not reuse failed V40.3 prompt-only, V40.3R img2img, V40.3R2
  identity-conditioned, or host synthetic template GIF outputs as accepted
  candidates.

## Selected Technical Route

The selected route is a project-owned direct local runner that must create a
source-bound action candidate through explicit identity and action controls:

```text
real tested cat photo or accepted source-bound sample
  -> PhotoSafetyIntake
  -> SourceAndLicenseRecord
  -> SubjectMaskAndCropPlan
  -> IdentityAnchorPack
  -> ActionPoseConditionPack
  -> DirectDiffusersFrameRunner
  -> CandidateFrameSequence
  -> CandidateQualityReview
  -> V39SameSampleComparison
  -> accepted candidate or stable failed/blocked reason
```

## Human-Readable Development Intent

The intent is to stop treating a cat photo as one flat sticker. Later
implementation must first describe the cat and the intended motion before asking
the local model to produce frames.

The route is expected to work like this:

1. Start from a real tested cat photo or an explicitly accepted local sample.
   The project records only safe source and sample references.
2. Isolate the cat body with a crop/mask plan so the model is guided by the cat,
   not by the full background image.
3. Build identity anchors from the sample: main colors, markings, face/body
   proportions, tail/ear traits, and the sample ID. These anchors are the
   contract that later frames must still look like the same cat.
4. Build action pose conditions for at least eight desktop-pet actions. Each
   action needs its own semantic/pose intent instead of reusing one static image
   with scale, rotation, or translation. The V40 asset action names are `idle`,
   `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, and `celebrate`; product
   runtime state names must map onto these actions instead of replacing them.
5. Run a direct local model wrapper from the repo boundary. The wrapper may use
   local model components, but it must not call WebUI or ComfyUI and must not
   write raw prompts, raw image bytes, or local absolute paths into evidence.
6. Review generated candidate frame sequences. A pretty single image is not
   enough. The candidate must remain the same cat, read as an action at desktop
   size, avoid photo-card output, avoid artifacts, and beat the same-sample V39
   baseline.
7. Only after at least two same-sample candidates pass explicit visual review can
   later phases package assets for preview/apply/rollback.

In short: the route is `photo -> cat understanding -> identity anchors -> action
pose controls -> generated frame sequence -> visual comparison`, not `photo ->
whole-image transform`.

## Required Intermediate Artifacts

Later automation must produce auditable intermediate artifacts before it can ask
for V40.4 entry:

| Artifact | What A Human Should See | Why It Matters |
| --- | --- | --- |
| source/license record | sanitized sample ID, source/permission summary, retention rule | proves the photo or sample can be used |
| mask/crop plan | safe crop/mask summary or redacted thumbnail reference | prevents full-background image warping |
| identity anchor pack | listed color/marking/proportion traits for the same cat | prevents generated frames becoming a different cat |
| action pose pack | eight named V40 asset actions with pose/semantic controls and product-state mapping | prevents transform-only motion and action-name drift |
| candidate frame sequence | safe refs/thumbnails for each action candidate | proves output is animation-ready, not one still image |
| quality review | pass/fail reasons for identity, action readability, artifacts, appeal | prevents weak assets entering product UI |
| V39 comparison | same-sample V39 vs V40 evidence | proves the route improved over the current fallback |

The future implementation must map these route entities to concrete project
files before product code starts. The planned file-level boundary is:

| Route Entity | Planned Code/Evidence Entity | Responsibility |
| --- | --- | --- |
| `PhotoSafetyIntake` | existing V39/V40 safe sample intake contracts | accept only tested images or explicitly accepted source-bound samples |
| `SourceAndLicenseRecord` | new V40.3R4 evidence section, not runtime UI | record sample source, license/permission, retention, and sanitized file refs |
| `SubjectMaskAndCropPlan` | future direct-runner predev script/evidence | produce subject crop/mask summary without writing raw photo bytes to evidence |
| `IdentityAnchorPack` | future direct-runner predev script/evidence | preserve visible markings, face/body proportions, color palette, and sample ID |
| `ActionPoseConditionPack` | future direct-runner predev script/evidence | define eight V40 asset actions and product-state mapping as pose/semantic controls before generation |
| `DirectDiffusersFrameRunner` | future in-repo Python/Node runner wrapper | run local model pipelines directly, without WebUI/ComfyUI server dependency |
| `CandidateFrameSequence` | future V40 candidate output directory | store only safe relative refs, thumbnails, and manifest summaries |
| `CandidateQualityReview` | future V40 acceptance evidence | reject identity drift, photo-card output, weak action semantics, artifacts, unsafe output |
| `V39SameSampleComparison` | existing V39 baseline evidence shape | compare each candidate against same-sample V39 before any scoped quality claim |

## Why This Is Not A Repeat Of Failed Routes

| Failed Route | Failure | V40.3R4 Control Added |
| --- | --- | --- |
| V40.3 prompt-only | attractive but weak same-cat identity and action consistency | identity anchors and source-bound masks become required pre-generation inputs |
| V40.3R direct img2img | preserved identity better but stayed photo-like and action semantics were weak | action pose controls and desktop-pet stylization gates become required |
| V40.3R2 identity-conditioned | generated candidates but failed for photo-like output, artifacts, and weak eight-action semantics | candidate must be generated as action-frame sequence and pass eight-action readability before normalization |
| host synthetic template GIF probe | proved process only, no image understanding | cannot be accepted as V40 candidate; only useful as evidence-format sanity check |

## Predev Audit Required Before Implementation

Before any code implementation resumes, the next evidence must prove or block:

1. Local model inventory: which direct local model/checkpoint/control components
   are available without WebUI/ComfyUI.
2. Runner feasibility: the repo can call the local runner through a controlled
   CLI/API wrapper without leaking raw prompts, raw image bytes, full local
   paths, or terminal transcripts.
3. Sample binding: at least two tested cat samples and one blocked/negative
   sample are identified by sanitized IDs.
4. Identity controls: each tested sample has a planned mask/crop/identity anchor
   contract.
5. Action controls: the route has explicit pose/action conditions for at least
   eight desktop-pet actions.
   V40.3R5 must record the action-name mapping boundary: V40 asset candidates
   use `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, `celebrate`.
   Product state actions such as `thinking`, `running`, `success`, `warning`,
   `error`, `need_input`, and `sleeping` must map onto those asset actions
   instead of replacing them.
6. Visual review rubric: the pass/fail rubric rejects photo-card output,
   identity drift, low action readability, artifacts, unsafe content, and outputs
   not preferred over same-sample V39.
7. Exit condition: if any required model/control/sample evidence is unavailable,
   the route must be blocked or failed, not silently downgraded to template GIFs
   or prompt-only generation.

## Residual Risk

This route still has high quality risk because local direct generation may fail
to produce appealing, same-cat, eight-action desktop-pet assets. The risk is
reduced by explicit identity/action controls and hard No-Go gates, but it cannot
be eliminated by documentation. If the predev audit cannot prove the required
local model/control components, V40 must remain failed or blocked with V39
fallback.

## Development Support Conclusion

With this decision, the current documents can support the next automated
development attempt only if the implementation follows the selected direct
runner route and stops at the documented failed/blocked reasons. The documents
do not support manual route improvisation, WebUI/ComfyUI revival, provider
claims, or direct entry into V40.4.
