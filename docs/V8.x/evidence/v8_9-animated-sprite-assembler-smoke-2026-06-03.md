# V8.9 Animated Sprite Assembler Smoke

status: passed
date: 2026-06-03

## Scope

This evidence covers the V8.9 local animated 2D sprite assembler path:

```text
local frame folder -> generated manifest -> app-managed import -> optional PetInstance activation
```

It does not cover AI asset generation, provider execution, Rive, Live2D, 3D,
production release readiness, or broad photo-to-animation readiness.

## Runtime / Test Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Rust asset import and assembler tests | passed | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml asset_import` |
| Desktop typecheck | passed | `pnpm --filter desktop check` |

The Rust test suite includes V8.9-specific real temporary local frame-folder
cases:

- valid local PNG frame folder is assembled into a sprite manifest with
  `frameFiles` and `fps`.
- the assembled pack imports into app-managed storage.
- optional activation targets one selected PetInstance.
- missing core action is rejected with `animated_sprite_core_action_missing`.
- previous active pack remains active after invalid assembly.
- generated idle action omits null `durationMs`.

## Security / Redaction

Evidence records only stable reason codes, action counts, renderer kind, fps,
and pass/fail outcomes. It does not record:

- token
- Authorization
- raw provider response
- raw photo data
- prompt text
- tool command text
- workspace path
- config path
- full local path
- raw manifest JSON chunks

## Claim Scan

Allowed claim:

```text
V8.9 local animated sprite pack assembler passed for tested local frame-sequence asset scenarios.
```

Forbidden claims remain not made:

- AI asset generation ready
- automatic photo-to-animation ready
- provider integration verified
- Rive ready
- Live2D ready
- 3D ready
- production signed release ready

## Decision

V8.9 passed scoped for tested local frame-sequence asset scenarios.
