# V11.6 First-run Living Pet Delight Smoke

status: passed
date: 2026-06-07

## Scope

Validates the first-run living pet path and local safe demo model. This is
tested local source/runtime-model evidence and does not claim production release
readiness or V11 final acceptance.

## Evidence Files

- capture: `docs/V11.x/evidence/v11_6-first-run-delight-capture-2026-06-07.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| first-run UI present | passed | first-run UI ids found |
| living pack default option | passed | living-work-cat-v1 is first bundled option and safe fallback |
| visible default pet path | passed | default path activates safe pack and shows default pet |
| Codex work-cat path | passed | work-cat path creates visible target pet with selected pack |
| safe demo mode | passed | demo datasets are local, zero PetEvent, and no agent-state mutation |
| demo states | passed | thinking/running/success/need_input/error demo states render controlled living frames |
| app-start visible cat model | passed | living-work-cat-v1 idle frame is visible for first app experience model |
| click feedback from first-run pack | passed | first-run pack has click feedback frame and local controller reports zero mutation |
| zero PetEvent and state mutation | passed | demo and click feedback are visual-only |
| unsupported already-open boundary | passed | first-run copy preserves unsupported already-open boundary |
| security scan | passed | no token, Authorization, raw payload, prompt, command, provider payload, full local path, workspace path, or config path in V11.6 inputs |
| claim scan | passed | V11.6 scoped claim only; no final V11 overclaim |

## Demo State Snapshot

| Demo State | Safe Action | Reason Code | Accepted PetEvents | Mutates Agent State |
| --- | --- | --- | --- | --- |
| thinking | thinking | demo_started | 0 | false |
| running | running | demo_state_preview | 0 | false |
| success | success | demo_state_preview | 0 | false |
| need_input | need_input | demo_state_preview | 0 | false |
| error | error | demo_state_preview | 0 | false |

## PRD / Spec Review

Matches `docs/active/agent_desktop_pet_prd_v11.md` and
`docs/V11.x/v11_6-v11_7-first-run-and-qa-spec.md`: first-run exposes a living
cat path, safe local demo states, Codex work-cat setup, and unsupported
already-open Codex boundary.

## Allowed Claim

```text
V11.6 first-run living pet delight passed for tested local first-open scenarios.
```

## Forbidden Claims

```text
V11 living work-cat interaction experience passed
production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
```
