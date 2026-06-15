# V6.6 Acceptance Plan: Provider Feasibility / Consent

status: planning-ready

date: 2026-05-30

## Entry Criteria

- V6.5 final acceptance passed.
- V6.6 plan audit has no unresolved Critical or High risk.

## Functional Acceptance

- provider status remains feasibility-only.
- upload is disabled.
- provider execution is disabled.
- provider credential input is not accepted.
- UI lists consent gates before any future provider smoke.
- UI shows cost, privacy, retention, license, attribution, credential, and output validation disclosure.
- UI says generated provider output must still pass local import validation.

## Security Acceptance

- no provider credential is accepted or persisted.
- no raw provider response is stored.
- no raw photo is uploaded.
- evidence does not include token, Authorization, API key, cookie, provider credential, raw response, raw payload, local full path, workspace path, config path, or `api-token.json`.

## Regression Acceptance

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

## Drift / False-Green Risk Gate

Stop before implementation or before V6.7 if any item is High:

- UI implies provider adapter readiness.
- UI accepts or stores provider credentials.
- evidence records provider response or credential material.
- wording implies remote generation ready or photo customization ready.
