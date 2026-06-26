# V34.5 Rig/Frame Synthesis Preflight No-Go Evidence

Phase: V34.5 preflight
Date: 2026-06-25

## PRD / Spec Review

- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.
- Reviewed: `docs/V34.x/v34-target-architecture.md`.
- Reviewed: `docs/V34.x/v34-risk-burndown-and-route-decision.md`.
- Reviewed: `docs/V34.x/v34_5-rig-frame-synthesis-spec.md`.
- Audit opinion: V34.1-V34.4 inputs are ready for V34.5, but V34.5 has major false-pass risk if implemented as a text-only or weak-template pass.

## Current Passed Inputs

- V34.1 subject detection: passed scoped for named samples.
- V34.2 segmentation/mask records: passed scoped for named samples.
- V34.3 pose/part map records: passed scoped for named samples.
- V34.4 character asset contracts: passed scoped for named samples.

## No-Go Reasons

1. V34.5 action-set mismatch:
   - V34.5 spec requires `idle`, `walk`, `jump`, `sleep`, `eat`, `play`, `alert`, `celebrate`.
   - Current runtime/V30/V31/V32 gates use `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
   - Treating these as the same action set would create false acceptance risk.

2. Visual evidence risk:
   - V34.5 requires contact sheet, frame manifest summary, QA table, and playback evidence.
   - The current codebase can generate safe records and QA metadata, but it does not yet provide target-quality visual action frames for the V34 action set from the named photo chain.
   - Passing V34.5 without reviewable visual frames would violate the V34 acceptance plan.

3. Transform-only regression risk:
   - V30/V32 gates reject transform-only candidates.
   - A quick local template implementation could pass structure while still being visually weak or semantically wrong.
   - V34 risk plan requires blocking or fallback instead of false pass.

## Route Options

| Option | Description | Pros | Cons | Audit Decision |
| --- | --- | --- | --- | --- |
| Route A1 runtime-core aligned | Change V34.5 generated action set to current runtime core actions and keep V30/V31/V32 gates direct. | Lowest integration risk; product path easier. | Deviates from V34.5 spec target actions unless docs are revised. | Needs explicit spec revision before implementation. |
| Route A2 dual action contract | Keep V34 target actions and add an explicit runtime mapping layer to current core actions for product path. | Preserves V34 target experience and avoids hiding mismatch. | More code and QA; mapping must be independently tested. | Recommended if V34 target actions remain required. |
| Route B professional assisted import | Use professionally authored sample-bound frame sequences, then run V34/V30/V31/V32/V33 gates. | Best chance to reach target visual quality. | Not fully automatic; requires source boundary and human/professional asset input. | Recommended fallback for target-quality evidence. |
| Blocked scoped | Stop V34.5 until action set and visual asset route are clarified. | Avoids false pass. | V34 cannot proceed to V34.6 final product path yet. | Current decision. |

## Claim Scan

- Status: passed.
- Boundary: this evidence records V34.5 preflight No-Go only.
- No generated 8-action pack is claimed passed.

## Security Scan

- Status: passed.
- Boundary: this evidence contains only docs paths, safe action ids, phase statuses, and route options.

## Decision

V34.5 is No-Go for implementation as a passed phase in the original single-action-contract form.

User decision after preflight:

```text
Select Route A2 dual action contract.
Record Route B professional assisted import during development and compare at acceptance time whether Route B is more likely to reach better target experience.
```

## Route A2 Development Plan

Route A2 must implement two explicit action layers:

1. V34 target actions for user-visible goal:
   - `idle`
   - `walk`
   - `jump`
   - `sleep`
   - `eat`
   - `play`
   - `alert`
   - `celebrate`

2. Runtime core projection for current V30/V31/V32/V33 gates:
   - `idle`
   - `thinking`
   - `running`
   - `success`
   - `warning`
   - `error`
   - `need_input`
   - `sleeping`

Route A2 pass must prove:

- at least 2 different named samples have independent characterAssetId values;
- each V34 target action has frameSequence manifest records;
- each runtime core projection action has frameSequence metrics for current gates;
- target-to-runtime mapping is recorded as compatibility projection, not semantic equivalence;
- transform-only negative candidate is rejected;
- contact sheet/playback evidence refs are present;
- Route B remains recorded as fallback for target visual quality comparison.

Route A2 must not claim arbitrary-cat automation, provider verification, production readiness, Windows readiness, cross-platform readiness, or fully automatic target-quality visual art.

Allowed narrow claim:

```text
V34.5 preflight found a major action-contract and visual-evidence risk; Route A2 dual action contract is selected for implementation, with Route B retained as quality fallback for acceptance comparison.
```
