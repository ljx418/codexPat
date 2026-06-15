# V8.10 AI-assisted Animated Sprite Workflow Development Plan

status: accepted scoped
date: 2026-06-03

## Objective

Create an AI-assisted workflow that helps users produce consistent multi-frame
2D action sprite assets. V8.10 defaults to prompt/instruction generation only.
Provider execution is optional and requires explicit consent plus credential,
retention, license, and redaction evidence.

## Development Scope

Implement local workflow helpers:

- user-approved cat trait intake for animated sprite generation.
- action storyboard prompts for all eight core actions.
- transparent-background, frame-count, naming, and consistency instructions.
- V8.9 import checklist and manifest template.
- optional provider preflight that reuses existing consent and credential
  boundary.

## Provider Boundary

Provider calls are disabled by default. If a provider branch is later accepted,
it must show:

- explicit provider choice.
- explicit upload/generation consent.
- credential redaction.
- cost/privacy/retention/license disclosure.
- raw provider response redaction.
- generated outputs imported through V8.9 and existing validation.

## Allowed Claims

Prompt-only:

```text
V8.10 AI-assisted animated sprite prompt workflow passed for tested local instruction-generation scenarios.
```

Real provider smoke only:

```text
V8.10 explicit-consent animated sprite provider smoke passed for tested named provider local scenario.
```

## Forbidden Claims

- provider integration verified.
- automatic photo-to-animation ready.
- broad AI generation ready.
- remote asset loading ready.
- production signed release ready.

## Go / No-Go

V8.10 is accepted scoped for the prompt-only path. Provider execution remains
not-run and not claimed.
