# V11.x Current Gap Analysis

status: active gap; V11.1-V11.7 passed scoped
date: 2026-06-07

## Active Gap

```text
V10 animated work-cat accepted
  -> V11 living interaction partially accepted through pointer-aware feedback
  -> target is a more lifelike daily desktop companion
```

## Gap Table

| Gap | Current | Target | Phase | Status |
| --- | --- | --- | --- | --- |
| Living idle | V10 had basic micro-interaction smoke | 3-minute varied idle with sleep/wake | V11.1 | passed scoped |
| Pointer awareness | V11.2 controller and runtime wiring passed scoped | hover, click, double-click, drag_start/dragging/drop feedback with isolation | V11.2 | passed scoped |
| Emotion continuity | V11.3 resolver and runtime wiring accepted scoped | distinct emotional expression and transitions for 8 states | V11.3 | passed scoped |
| Natural sequencing | V11.4 visual ActionComposer accepted scoped | enter/loop/exit/transient composition with priority | V11.4 | passed scoped |
| Flagship visual quality | V11.5 `living-work-cat-v1` accepted scoped | one first-run flagship living cat pack | V11.5 | passed scoped |
| First-run delight | first-run living pet path and local demo accepted scoped | visible living cat in <=10 seconds and safe demo | V11.6 | passed scoped |
| Evidence gate | V10 benchmark evidence exists | interaction QA recordings and scans | V11.7 | passed |

## Product Experience Gap

V10 can show animated pets and pass benchmark-style local onboarding evidence.
V11 must make the daily experience feel alive:

- no long static loops.
- user can interact without reading docs.
- state changes feel emotional, not just mechanical.
- first-run experience starts from a living pet, not from configuration.

## High Risks

| Risk | Level | Mitigation |
| --- | --- | --- |
| visual quality still feels rough | High | V11.5 operator rubric and side-by-side comparison block final claim |
| micro-interactions mutate agent state | High | V11.1-V11.4 require zero PetEvent and no CatStateMachine writes |
| action priority causes flicker | Medium | ActionComposer rapid-event smoke |
| first-run demo misread as real Codex state | Medium | visible demo label and no real state mutation |
| overclaim against Petdex | Medium | claim matrix keeps final claim scoped to tested local desktop scenarios |

## Go / No-Go

V11.1: passed scoped.

V11.2: passed scoped with pointer-aware interaction smoke and evidence.

V11.3: passed scoped with emotion-layer smoke and evidence.

V11.4: passed scoped with visual ActionComposer smoke and evidence.

V11.5: passed scoped with flagship living-cat pack smoke, contact sheet, and side-by-side evidence.

V11.6: passed scoped with first-run delight smoke and local demo capture.

V11.7: passed scoped with final interaction QA, regression, security, claim,
PRD/spec, and drawio sync evidence.
