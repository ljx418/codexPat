# V9.4 Tripo3D Provider Smoke

status: blocked
date: 2026-06-03

## Scope

Tripo3D real provider 3D generation readiness for V9.4. The current official
contract is task based: submit a task with `POST /v2/openapi/task`, then poll
`GET /v2/openapi/task/{task_id}` until completion. This evidence does not
prove 3D generation, provider integration readiness, or broad 3D readiness.

Sources reviewed:
- https://docs.tripo3d.ai/get-started/quick-start.html
- https://docs.tripo3d.ai/model-generation/text-to-model-v3-0-v3-1.html

## Results

```json
[
  {
    "name": "Tripo3D credential preflight",
    "result": "blocked",
    "details": "reasonCode=provider_credential_missing"
  },
  {
    "name": "Tripo3D explicit upload consent preflight",
    "result": "blocked",
    "details": "reasonCode=provider_consent_required"
  },
  {
    "name": "Tripo3D terms/privacy preflight",
    "result": "blocked",
    "details": "reasonCode=provider_terms_unreviewed"
  },
  {
    "name": "Tripo3D endpoint contract",
    "result": "passed",
    "details": "endpointHost=api.tripo3d.ai; taskPattern=POST /v2/openapi/task then GET /v2/openapi/task/{task_id}"
  },
  {
    "name": "real provider 3D branch",
    "result": "blocked",
    "details": "reasonCode=provider_credential_missing"
  },
  {
    "name": "security redaction scan",
    "result": "passed",
    "details": "safe summaries only; no token, auth header, raw provider response, prompt text, full local path, workspace path, or config path"
  }
]
```

## Decision

V9.4 remains blocked. No real Tripo3D provider upload was performed and no GLB
provider output was accepted.
