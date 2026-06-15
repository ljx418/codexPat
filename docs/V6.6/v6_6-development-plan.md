# V6.6 Development Plan: Provider Feasibility / Consent

status: planning-ready

date: 2026-05-30

## Scope

V6.6 freezes the consent and disclosure boundary required before any future external provider generation work.

This phase may implement:

- provider feasibility status UI.
- explicit consent checklist.
- cost / privacy / retention / license disclosure copy.
- credential redaction rules.
- provider response redaction rules.
- imported output validation requirement.

This phase must not implement unless separately accepted:

- real provider upload.
- provider API call.
- provider credential input.
- remote generation.
- automatic photo-to-3D.
- provider adapter readiness.

## Product Requirements

V6.6 maps to PRD V6.6:

- explicit provider consent.
- credential redaction.
- cost / retention / license disclosure.
- optional provider smoke only if separately accepted.
- imported output validation.

## Required Checks

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

## Allowed Claim

```text
V6.6 provider feasibility completed with explicit consent boundary.
```

## Forbidden Claims

```text
provider integration verified
remote generation ready
photo customization ready
automatic photo-to-3D ready
provider adapter ready
production signed release ready
```
