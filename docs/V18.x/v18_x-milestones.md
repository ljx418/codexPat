# V18 Milestones

日期：2026-06-12  
状态：planned。

## Milestone A: Safe Reference Photo Entry

Target phases: V18.0-V18.1

Exit:

- V18 docs and claim boundaries accepted.
- local photo preview and consent boundary are clear.
- provider credential and terms not-ready states are explicit.

## Milestone B: Real Image-to-image Generation

Target phase: V18.2

Exit:

- a real provider reference-image job is attempted with explicit consent.
- job lifecycle is visible in UI/evidence.
- provider output is received or the branch is blocked with stable reasonCode.

## Milestone C: Multi-action Pack Assembly

Target phase: V18.3

Exit:

- provider output normalizes into one canonical identity source.
- all 8 core actions are locally derived from that same canonical source hash.
- app-managed `pet.json + frames` is produced.
- `identityLock.mode = single_canonical_source` is recorded.
- invalid output fails closed and preserves previous pack.

## Milestone D: Quality Gate

Target phase: V18.4

Exit:

- same-cat identity and continuity checks pass.
- same-cat source-hash identity gate passes.
- generated output is visible and stable.
- QA failed output cannot be applied.

## Milestone E: User-visible Product Flow

Target phases: V18.5-V18.6

Exit:

- in-app preview works.
- target-only apply works.
- rollback works.
- screenshot-backed HTML shows the full workflow.
