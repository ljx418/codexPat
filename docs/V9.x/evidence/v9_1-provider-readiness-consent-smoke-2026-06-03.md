# V9.1 Provider Readiness Consent Smoke

status: blocked
date: 2026-06-03

## Scope

V9.1 checks local provider readiness and consent state without printing
credentials. It does not perform provider execution.

## Provider Summary

```json
[
  {
    "providerName": "MiniMax",
    "credentialState": "configured",
    "consent": true,
    "termsReviewed": true,
    "endpointHost": "api.minimaxi.com",
    "reasonCode": "provider_ready_redacted"
  },
  {
    "providerName": "Tripo3D",
    "credentialState": "missing",
    "consent": false,
    "termsReviewed": false,
    "endpointHost": "api.tripo3d.ai",
    "reasonCode": "provider_credential_missing"
  }
]
```

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| MiniMax readiness | passed | reasonCode=provider_ready_redacted; credentialState=configured; endpointHost=api.minimaxi.com |
| Tripo3D readiness | blocked | reasonCode=provider_credential_missing; credentialState=missing; endpointHost=api.tripo3d.ai |
| security redaction scan | passed | provider readiness summary contains no token, auth header, raw payload, prompt text, raw provider response, full local path, workspace path, or config path |

## Decision

V9.1 blocked for at least one provider; only providers with provider_ready_redacted may proceed to execution.
