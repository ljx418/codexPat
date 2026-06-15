# V10.11 Product Experience Rebaseline

status: passed-scoped
date: 2026-06-05

## Goal

V10.11 turns the accepted V10 animated work-cat baseline into a clearer local
developer experience. It does not add new renderer, provider, 3D, Codex
monitoring, or release-signing capabilities.

The three owned gaps are:

1. Public README and active docs must explain the current product in user terms.
2. A new local developer must understand the recommended Codex work-cat path in
   about three minutes.
3. V10 evidence must include real desktop screenshots; HTML pages may summarize
   evidence but must not replace screenshots.

## Target Architecture Delta

Current V10 accepted architecture:

```text
PetEvent / local state -> CatStateMachine -> RuntimePlaybackModel
  -> work-cat-v1 sprite renderer -> visible desktop work-cat
```

V10.11 adds a product-experience documentation and evidence layer:

```text
accepted local capability
  -> README / active docs current-state summary
  -> settings/onboarding copy and screenshot evidence
  -> HTML report that links real screenshots
  -> claim scan and final acceptance report
```

This layer is descriptive and evidentiary. It must not bypass renderer safety,
send PetEvent during preview, parse terminal text, or create new provider /
photo-to-3D claims.

## Development Plan

| Step | Work | Output |
| --- | --- | --- |
| V10.11.1 | Correct wrong non-V10 active-stage wording | README and active docs say V10.11 active |
| V10.11.2 | Update current gap and drawio | V10 architecture/gap/plan/milestone/gate diagram |
| V10.11.3 | Strengthen three-minute Codex work-cat onboarding | README and settings-facing docs show wrapper JSONL path and unsupported already-open note |
| V10.11.4 | Capture real desktop evidence | settings screenshot, runtime work-cat screenshot, HTML evidence summary |
| V10.11.5 | Close with regression and claim scan | final report with scoped allowed claim and forbidden claims |

All V10.11 steps are complete for the tested local desktop-pet documentation,
onboarding, settings, and screenshot evidence scenarios. There is no remaining
V10.11 feature implementation work.

## Acceptance Plan

V10.11 passes only if all of the following are true:

- `README.md`, `docs/active/development-plan.md`,
  `docs/active/acceptance-plan.md`, and
  `docs/active/current-vs-target-gap.md` agree that V10.11 is the active
  product-experience rebaseline.
- No active document treats any non-V10 phase as the current desktop-pet phase.
- `docs/active/current-vs-target-gap.drawio` includes current architecture,
  target architecture delta, development and acceptance plan, milestones,
  acceptance gates, and exit conditions.
- Real desktop screenshots exist under `docs/V10.x/evidence/`.
- HTML reports link real screenshots and are not used as mock proof.
- Regression checks pass:
  - `pnpm --filter desktop check`
  - `pnpm --filter desktop test`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - `node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs`
- Security and claim scans find no token, Authorization header, raw payload,
  full `/Users/...` path, workspace path, config path, or forbidden ready claim
  outside a forbidden / not-ready context.

Acceptance status: passed scoped on 2026-06-05. See
`docs/V10.x/v10_11-final-acceptance-report.md`.

## Allowed Claim

Allowed only after V10.11 final acceptance passes:

```text
V10.11 product experience rebaseline passed for tested local desktop-pet documentation, onboarding, settings, and screenshot evidence scenarios.
```

## Forbidden Claims

V10.11 must not claim:

- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- provider integration verified
- OS-level Codex window binding ready
- all Codex workflows verified
- Rive ready
- Live2D ready
- asset marketplace ready
- production signed release ready
- cross-platform ready
- Windows ready
