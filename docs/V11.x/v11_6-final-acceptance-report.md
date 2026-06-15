# V11.6 Final Acceptance Report: First-run Living Pet Delight

status: passed
date: 2026-06-07

## Scope

V11.6 validates the first-run living pet path and local safe demo model for
tested local first-open scenarios. It does not claim production release
readiness or V11 final acceptance.

## Evidence

- `docs/V11.x/evidence/v11_6-first-run-delight-smoke-2026-06-07.md`
- `docs/V11.x/evidence/v11_6-first-run-delight-capture-2026-06-07.html`

## Result

| Gate | Result | Notes |
| --- | --- | --- |
| first-run UI present | passed | first-run wizard, default path, demo, work-cat path |
| living pack default | passed | `living-work-cat-v1` is the first bundled local pack |
| visible default pet path | passed | safe pack preference and visible default pet path |
| Codex work-cat path | passed | creates target work-cat with selected safe pack |
| safe demo mode | passed | local demo, zero PetEvent, no agent-state mutation |
| demo states | passed | thinking/running/success/need_input/error |
| click feedback | passed | local click feedback remains visual-only |
| unsupported boundary | passed | already-open Codex auto-monitoring remains unsupported |
| security scan | passed | no sensitive field leakage |
| claim scan | passed | V11.6 scoped claim only |

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

## Next Phase

V11.7 final interaction QA gate may start. It must not add new features.
