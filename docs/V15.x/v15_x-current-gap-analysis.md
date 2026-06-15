# V15 Current Gap Analysis

日期：2026-06-10  
状态：V15.0-V15.13 passed scoped。  

## Current Status

V15.0-V15.13 have passed scoped for living interaction, bundled/gallery 2D
animation continuity, the photo intake consent boundary, and safe trait
approval / 8-action prompt pack generation, and the import-ready provider/import
branch, local continuity assembly, and the photo-guided preview/apply final gate. V14 remains the premium gallery baseline.

Closed V15.0-V15.8 interaction capabilities:

- drag behavior must feel like moving a living pet, not dragging an image.
- pointer-near, hover, click, and double-click feedback needs richer visible response.
- autonomous walking must be bounded, natural, and configurable.
- idle actions must coexist with work states without priority inversion.
- settings must let ordinary users control interaction intensity and quiet mode.

Closed V15.13 product gap:

- target-only preview/apply must become a safe ordinary-user workflow, not only
  provider smoke, prompt documentation, or local assembly evidence.

## Gap Table

| Gap | Current | V15 Target | Status |
| --- | --- | --- | --- |
| Scope freeze | V15 docs were planned | V15 PRD, architecture, claim, evidence, drawio frozen | passed V15.0 |
| Interaction priority model | priority model existed from V10/V11 but lacked V15 evidence | V15 priority order, required safe actions, safe renderer snapshot, zero PetEvent / CatStateMachine writes | passed V15.1 |
| Drag interaction | pet could move but drag feel was not product-grade | grabbed/dragging/release/land with no image ghost and persisted position path | passed V15.2 |
| Pointer awareness | living idle exists but pointer feedback was limited | pointer-near, hover, click, double-click responses | passed V15.3 |
| Autonomous movement | idle random actions exist | bounded walk, pause, turn, edge avoidance | passed V15.4 |
| Priority composition | state mapping and living actions exist | one priority-safe composer for agent + user + idle/walk | passed V15.5 |
| User controls | settings exist but interaction controls were incomplete | toggles, intensity presets, quiet mode, preview | passed V15.6 |
| Final proof | V14 final HTML proves gallery/switching | V15 final HTML proves interaction experience on real desktop | passed V15.7 |
| 2D animation continuity | core assets had coverage and loop closure, but adjacent-frame delta was not a hard gate | default flagship and bundled gallery 2D core actions have first/final closure and bounded adjacent-frame delta | passed V15.8 |
| Photo intake privacy | prior phases had privacy boundaries and provider smoke | user selects one photo with consent, EXIF/path redaction, and no default upload | passed V15.9 |
| Cat trait approval | prompts existed but were not an ordinary-user review step | approved safe trait model drives 8 action prompt pack | passed V15.10 |
| Photo-guided 2D generation | MiniMax static/dynamic smokes existed but not an integrated user workflow | import-ready branch produces local 8-action frame plan; real provider branch remains not-run | passed V15.11 import-ready |
| Generated pack continuity | V15.8 covers bundled assets only | generated/imported frames pass same continuity and safety gates | passed V15.12 |
| Preview/apply workflow | Manager can preview/apply existing packs | generated pack preview and target-only apply final gate | passed V15.13 |

## Main Risk Areas

| Risk | Level | Mitigation |
| --- | --- | --- |
| Drag creates image ghost or dragged asset | High | disable native drag/select behavior and verify with screenshot evidence. |
| Autonomous walk hides cat offscreen | High | safe bounds, edge avoidance, position clamp, screenshot gate. |
| Idle/click overrides error or need_input | High | strict priority model and regression tests. |
| Pointer tracking records sensitive desktop data | High | no screen text, clipboard, raw pointer trace, or local path in evidence. |
| Raw photo/provider data leaks | High | consent boundary, no raw photo in evidence, redacted provider summaries only. |
| Generated actions do not resemble same cat | High | trait approval, same-cat prompt constraints, operator review, contact sheet evidence. |
| Generated animation flickers | High | V15.8 continuity guard reused for generated/imported packs. |
| Interaction becomes distracting | Medium | quiet mode and intensity controls. |

## Active Claim Boundary

V15 can only pass with:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

Additional scoped asset-continuity claim:

```text
V15.8 bundled default and gallery 2D animation continuity passed for tested local sprite scenarios.
```

Additional scoped claim after V15.13 evidence:

```text
V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios.
```

V15 cannot claim Petdex parity, 3D readiness, automatic photo-to-2D readiness,
provider readiness, production release readiness, Windows support, or
cross-platform support.
