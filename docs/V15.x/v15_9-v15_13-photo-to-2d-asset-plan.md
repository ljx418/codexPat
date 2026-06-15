# V15.9-V15.13 Photo-To-2D Action Asset Plan

日期：2026-06-10  
状态：V15.9-V15.13 passed scoped；V15.0-V15.8 remain passed scoped baseline。  

## Scope

V15.9-V15.13 extend V15 with an ordinary-user path from a user-provided cat
photo to a local animated 2D action asset pack.

Detailed implementation contracts are defined in:

```text
docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md
```

The target user outcome is:

```text
select cat photo
  -> review privacy / consent
  -> approve safe cat traits
  -> generate 8 core 2D action assets
  -> continuity-fix and package frames
  -> preview all actions
  -> apply to one selected pet
```

This track does not claim provider integration verified, automatic
photo-to-2D ready, automatic photo-to-3D ready, 3D ready, marketplace ready,
production signed release ready, Windows ready, or cross-platform ready until
matching evidence exists.

## Phase Plan

| Phase | Goal | Required Evidence |
| --- | --- | --- |
| V15.9 Photo Intake & Consent Boundary | Local photo selection, EXIF/path redaction, explicit consent, and no default upload. | `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-2026-06-10.md` |
| V15.10 Trait Review & Prompt Pack | Extract or collect safe cat traits, require user approval, generate 8 action prompts. | `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-2026-06-10.md` |
| V15.11 Provider 2D Generation Or Import Branch | Real provider branch if credentials/consent exist; otherwise import-ready prompt pack branch. | `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-2026-06-10.md` |
| V15.12 Continuity Assembly & Pack Validation | Assemble generated/imported frames into `pet.json + frames`, run V15.8 continuity guard. | `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-2026-06-10.md` |
| V15.13 Preview, Apply & Final Gate | Desktop Manager preview all 8 actions, one-click apply to target pet, screenshot-backed report. | `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md` |

## Development Requirements

### V15.9 Photo Intake & Consent

- user chooses one local cat photo.
- UI explains what stays local and what may be sent to a provider.
- no provider upload before explicit consent.
- strip or ignore EXIF/GPS.
- evidence must not record raw photo, source filename, full local path, EXIF,
  GPS, token, Authorization, raw provider payload, prompt text, shell history,
  clipboard, or screen text.

### V15.10 Trait Review & Prompt Pack

- produce safe trait fields only:
  - coat color.
  - pattern.
  - eye color.
  - face/body notes.
  - distinctive but non-identifying visual notes.
- user must approve traits before generation.
- generate prompts for:
  - idle.
  - thinking.
  - running.
  - success.
  - warning.
  - error.
  - need_input.
  - sleeping.
- prompts must request same-cat identity consistency, transparent/clean
  background or controlled local background, multi-frame-friendly poses, and
  no text/watermark.

### V15.11 Provider Or Import Branch

Two acceptable paths:

1. **Real provider path**: explicit consent, credential present, provider terms
   reviewed, real output generated, redaction scan passed.
2. **Import-ready path**: no upload; outputs a prompt pack and import checklist
   for the user to generate images externally and re-import locally.

If real provider output is unavailable, V15.11 status must be blocked or
passed only for the import-ready path. It must not claim automatic
photo-to-2D readiness.

### V15.12 Continuity Assembly

- accept generated/imported frame folders.
- normalize into local `pet.json + frames`.
- require 8 core actions.
- require minimum frame counts:
  - idle / thinking / running / sleeping: at least 6 frames.
  - success / warning / error / need_input: at least 3 frames.
- first and final rendered frames must close.
- adjacent-frame delta must stay under the continuity threshold.
- invalid pack activation preserves previous active pack.
- output must pass the same safety boundary as V15.8.

### V15.13 Preview & Final Gate

- Desktop Manager shows generated pack metadata with sanitized fields only.
- preview all 8 core actions.
- preview must not call notify, emit PetEvent, write CatStateMachine, or mutate
  live PetInstance state.
- apply only to the selected target pet.
- default and unrelated pets remain unchanged.
- final HTML embeds screenshots/contact sheets/runtime captures directly.

## Acceptance Gates

| Gate | Pass Condition |
| --- | --- |
| Privacy | no raw photo, EXIF/GPS, path, token, Authorization, prompt text, raw provider payload, or full local path in docs/evidence/logs. |
| User Consent | provider upload branch cannot run without explicit consent and provider terms acknowledgement. |
| Same-cat Consistency | operator review confirms the generated/imported actions visibly resemble the approved cat traits. |
| Action Coverage | 8 core actions present with required frame counts. |
| Continuity | first/final closure and adjacent-frame delta checks pass. |
| Runtime Safety | renderer receives only safe action ID, renderer kind, safe pack ID, playback intent, scale, and visibility. |
| Target Isolation | apply affects only selected pet; default/unrelated pets unchanged. |
| Fallback | invalid/corrupt/missing generated pack keeps previous visible cat. |

## Allowed Claims

| Phase | Allowed Claim |
| --- | --- |
| V15.9 | V15.9 photo intake and consent boundary passed for tested local scenarios. |
| V15.10 | V15.10 cat trait review and 8-action prompt pack generation passed for tested local scenarios. |
| V15.11 import-ready | V15.11 photo-guided 2D action import-ready prompt workflow passed for tested local scenarios. |
| V15.11 real provider | V15.11 named-provider 2D action generation smoke passed for tested explicit-consent local scenario. |
| V15.12 | V15.12 photo-guided 2D action pack continuity assembly passed for tested local frame assets. |
| V15.13 | V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios. |

## Forbidden Claims

```text
automatic photo-to-2D ready
automatic photo-to-animation ready
provider integration verified
photo customization ready for arbitrary cats
Petdex parity achieved
3D ready
automatic photo-to-3D ready
remote asset loading ready
asset marketplace ready
production signed release ready
cross-platform ready
Windows ready
```

## Minimum Regression

Before V15.13:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v15_7_final_interaction_gate_smoke.mjs
node scripts/v15_8_2d_animation_continuity_smoke.mjs
```

## Go / No-Go

- V15.9: Go after this plan is accepted.
- V15.10: No-Go until V15.9 has passed/blocked/failed evidence.
- V15.11: No-Go until V15.10 evidence exists and provider/import branch is selected.
- V15.12: No-Go until V15.11 produced real local frames or an explicit blocked result.
- V15.13: passed scoped after V15.9-V15.12 evidence, final preview/apply report, GUI screenshot evidence, runtime capture evidence, regression, security scan, claim scan, and PRD/spec review.
