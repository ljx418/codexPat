# V8.9 Final Acceptance Report

status: passed
date: 2026-06-03

## Scope

V8.9 implements and accepts the local animated 2D sprite pack assembler.

Accepted flow:

```text
local frame folder -> validated frame groups -> generated sprite manifest -> app-managed import -> optional selected PetInstance activation
```

V8.9 does not generate assets, does not call a provider, does not prove runtime
visual QA, and does not prove 3D readiness.

## Evidence Gate

- `docs/V8.x/evidence/v8_9-animated-sprite-assembler-smoke-2026-06-03.md`

## Implementation Result

| Area | Result |
| --- | --- |
| Desktop Manager assembler UI | passed |
| Tauri assembler command | passed |
| Local PNG frame folder validation | passed |
| Generated manifest with `frameFiles` / `fps` | passed |
| App-managed local import reuse | passed |
| Optional target PetInstance activation | passed |
| Missing core action rejection | passed |
| Previous active pack preserved after invalid assembly | passed |
| Stable reason codes | passed |

## Checks

| Command | Result |
| --- | --- |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml asset_import` | passed |
| `pnpm --filter desktop check` | passed |

## PRD / Claim Review

V8.9 matches the V8 PRD extension for local animated 2D sprite assembly. It
does not change V3/V4 Codex monitoring semantics and does not replace V8.10
prompt workflow or V8.11 visual QA.

## Allowed Claim

```text
V8.9 local animated sprite pack assembler passed for tested local frame-sequence asset scenarios.
```

## Forbidden Claims

- AI asset generation ready.
- automatic photo-to-animation ready.
- provider integration verified.
- Live2D ready.
- Rive ready.
- 3D ready.
- production signed release ready.

## Drift / False-green Risk

Risk level: Medium.

Reason: V8.9 proves local frame-sequence assembly and import only. Runtime
visual animation acceptance still belongs to V8.11. This is not a blocker for
entering V8.10 because no High risk or claim expansion remains after the scoped
claim boundary above.

## Final Decision

V8.9 accepted scoped.
