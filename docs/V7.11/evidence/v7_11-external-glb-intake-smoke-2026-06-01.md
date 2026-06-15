# V7.11 External GLB/GLTF Intake Smoke

status: passed
date: 2026-06-01

## Scope

This smoke validates the GLB/GLTF intake contract against one real local GLB fixture and unsafe local rejection fixtures.

It does not claim automatic photo-to-3D, provider integration, remote generation, broad 3D readiness, or production release readiness.

## Real Asset Summary

- source category: `local_fixture`
- classification: `action_ready`
- safe clip names: `idle, thinking, running, success, warning, error, need_input, sleeping`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| real GLB file exists | passed | real local GLB fixture is present |
| real GLB deep scan | passed | source=local_fixture; classification=action_ready; clipCount=8; meshCount=3; materialCount=5; textureCount=0 |
| real GLB action classification | passed | classification=action_ready; clips=idle,thinking,running,success,warning,error,need_input,sleeping |
| remote uri rejected | passed | gltf_external_resource_rejected |
| external bin rejected | passed | gltf_external_resource_rejected |
| data uri rejected | passed | gltf_external_resource_rejected |
| required extension rejected | passed | gltf_required_extension_rejected |
| unknown action clip rejected | passed | gltf_action_clip_rejected |
| missing clips classified static preview | passed | classification=static_preview |
| security redaction scan | passed | summary contains no token, Authorization, raw payload, local user path, workspace path, config path, or api-token.json |

## Security Redaction

Evidence records safe field names and decisions only. It excludes raw JSON chunks, token, Authorization, provider credential, raw provider response, full local user path, workspace path, config path, and api-token.json.

## Final Decision

Passed for local GLB/GLTF intake contract. External photo-to-3D provider output remains not-ready because no real external provider GLB/GLTF output was used.