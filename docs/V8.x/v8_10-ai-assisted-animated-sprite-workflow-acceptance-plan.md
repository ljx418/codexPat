# V8.10 AI-assisted Animated Sprite Workflow Acceptance Plan

status: accepted scoped
date: 2026-06-03

## Acceptance Criteria

Prompt-only path passes when:

- all eight core actions receive action-specific multi-frame prompts.
- generated instructions include frame naming, frame count, transparent
  background, consistency, and V8.9 import checklist.
- prompt output contains no local path, token, Authorization, raw photo, EXIF,
  GPS, provider credential, raw provider response, workspace path, config path,
  or api-token.json.
- output explicitly says generated assets must pass V8.9 and existing import
  validation before runtime activation.

Provider path passes only when:

- explicit consent and provider credential boundaries pass.
- generated frames are real provider output for a named provider scenario.
- outputs are assembled and imported through V8.9.
- provider logs and evidence are redacted.

## Automated Smoke

Required prompt-only script:

```bash
node scripts/v8_10_ai_animated_sprite_prompt_smoke.mjs
```

Provider smoke is optional and must not run without explicit consent.

## Evidence

Required for prompt-only:

- `docs/V8.x/evidence/v8_10-ai-animated-sprite-prompt-smoke-YYYY-MM-DD.md`

Required if provider branch is claimed:

- named provider smoke evidence.
- consent / credential / retention / license evidence.
- V8.9 import evidence for provider outputs.

## Pass / Block / Fail Rules

- `passed`: prompt-only or provider-specific evidence matches the selected
  allowed claim.
- `blocked`: provider branch lacks consent, credential, output, or retention
  evidence.
- `failed`: prompt/provider output leaks sensitive data or bypasses V8.9 import
  validation.
