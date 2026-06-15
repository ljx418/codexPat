# V8.10 AI Animated Sprite Prompt Smoke

status: passed
date: 2026-06-03

## Scope

This evidence covers the V8.10 prompt-only animated 2D sprite workflow:

```text
user-approved traits -> multi-frame action prompts -> manifest template -> V8.9 import checklist
```

No provider execution occurred. This evidence does not prove provider
integration, automatic photo-to-animation, Rive, Live2D, 3D readiness, or
production release readiness.

## Automated Smoke

Command:

```bash
node scripts/v8_10_ai_animated_sprite_prompt_smoke.mjs
```

Result: passed.

Covered cases:

- desktop unit coverage passed.
- desktop typecheck passed.
- real local prompt workflow generated 8 action storyboards.
- manifest template used sprite `frameFiles` with accepted fps.
- evidence summary remained prompt-only.
- provider execution remained false.
- security redaction scan passed.

## Security / Redaction

Smoke output records only:

- status
- reasonCode
- actionCount
- frameCount
- fps
- providerExecution flag

It does not record token, Authorization, raw payload, raw provider response,
source photo data, EXIF/GPS, workspace path, config path, full local path, or
api-token.json.

## Allowed Claim

```text
V8.10 AI-assisted animated sprite prompt workflow passed for tested local instruction-generation scenarios.
```

## Forbidden Claims

- V8.10 explicit-consent animated sprite provider smoke passed.
- provider integration verified.
- automatic photo-to-animation ready.
- broad AI generation ready.
- remote asset loading ready.
- production signed release ready.

## Decision

V8.10 prompt-only path passed scoped. Provider branch remains not-run and is not
claimed.
