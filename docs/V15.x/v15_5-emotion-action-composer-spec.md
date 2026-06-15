# V15.5 Emotion Action Composer Spec

日期：2026-06-09  
状态：planned。  

## Goal

Compose agent state, user interaction, idle behavior, and autonomous walk into one safe visual action without priority inversion or confusing state meaning.

## Inputs

| Input | Examples | Source |
| --- | --- | --- |
| Agent state | idle, thinking, running, success, warning, error, need_input, sleeping | CatStateMachine output |
| Interaction state | drag, pointer_near, click, double_click | interaction controllers |
| Ambient behavior | blink, tail sway, stretch, nap, walk | schedulers |
| Settings | quiet mode, intensity, frequency | InteractionSettingsStore |

## Output Contract

The composer outputs only:

- safe action ID.
- safe expression variant.
- renderer kind.
- safe pack ID.
- playback intent.
- priority source.
- sanitized reasonCode.

It must not output:

- raw PetEvent.
- raw Agent/Codex payload.
- raw pointer path.
- raw provider payload.
- screen contents.
- clipboard contents.
- prompt text.
- tool command text.
- token.
- Authorization.
- workspace path.
- config path.
- full local path.

## Composition Rules

Priority:

```text
error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random
```

State clarity rules:

- `error` must remain visibly error.
- `need_input` must remain visibly attention-seeking.
- `running` may allow subtle eye/tail variation but not playful idle override.
- `thinking` may allow subtle look/ponder variation.
- `success` is transient and returns to idle unless blocked by error/need_input.
- `warning` remains distinct from error and idle.
- quiet mode reduces intensity but does not hide critical states.

## Acceptance Evidence

Output:

```text
docs/V15.x/evidence/v15_5-emotion-composer-smoke-YYYY-MM-DD.md
```

Required matrix:

| Agent state | Interaction | Expected result |
| --- | --- | --- |
| error | click | error remains active |
| need_input | pointer_near | need_input remains active |
| running | pointer_near | running remains clear with optional subtle variation |
| thinking | idle random | thinking remains clear |
| success | idle | success transient then idle |
| idle | walk | walk allowed if enabled |
| idle | double_click | double_click visual |
| sleeping | pointer_near | wake or look if allowed |

## Failure Conditions

- lower-priority action overrides error or need_input.
- success transient overwrites active error/need_input.
- composer receives raw payloads or sensitive fields.
- renderer receives unsafe fields.
